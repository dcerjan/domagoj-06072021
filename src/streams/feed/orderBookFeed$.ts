import { BehaviorSubject, connectable, Subject } from 'rxjs'
import { map, sampleTime, scan, tap } from 'rxjs/operators'

import {
  Levels,
  gtOrder,
  ltOrder,
  mergeLevels,
} from '../../domain/Levels'
import { KnownProduct, KnownProducts } from '../../domain/KnownProduct'
import { createWsFeedBroker } from '../../utils/wsFeedBroker'
import { WS_ORDER_FEED_ENDPOINT } from './constants'
import { feedError$ } from './feedError$'
import {
  closeFeedIntent$,
  openFeedIntent$,
  subscribeToOrderBookFeedIntent$,
  unsubscribeToOrderBookFeedIntent$,
} from './intent$'

const feedMessage$ = new Subject<MessageEvent>()
export const feedStatus$ = new BehaviorSubject<boolean>(false)
export const selectGrouping$ = new BehaviorSubject<number>(0)

export const bindOrderBookFeed = (
  subscribe$: typeof subscribeToOrderBookFeedIntent$,
  unsubscribe$: typeof unsubscribeToOrderBookFeedIntent$,
  close$: typeof closeFeedIntent$,
  open$: typeof openFeedIntent$,
  message$: typeof feedMessage$,
  status$: typeof feedStatus$,
  error$: typeof feedError$,
) => {
  const broker = createWsFeedBroker(
    WS_ORDER_FEED_ENDPOINT,
    (message) => message$.next(message),
    (error) => error$.next(error),
    (status) => status$.next(status),
  )

  subscribe$.subscribe((channel) => broker.subscribe(channel))
  unsubscribe$.subscribe((channel) => broker.unsubscribe(channel))
  close$.subscribe(() => broker.simulateError('Simulated WS error'))
  open$.subscribe(() => broker.open())
}

bindOrderBookFeed(
  subscribeToOrderBookFeedIntent$,
  unsubscribeToOrderBookFeedIntent$,
  closeFeedIntent$,
  openFeedIntent$,
  feedMessage$,
  feedStatus$,
  feedError$,
)

const NOOP = {
  type: 'noop'
} as const

export const createOrderBookFeed = (source$: Subject<MessageEvent>, error$: typeof feedError$, ) => {
  const sink$ = connectable(source$.pipe(
    map((message: MessageEvent) => {
      try {
        const data = JSON.parse(message.data)
        switch (data.feed) {
          case 'book_ui_1_snapshot': return {
            type: 'snapshot',
            asks: data.asks as Levels,
            bids: data.bids as Levels,
            productId: data.product_id as KnownProduct
          } as const
          case 'book_ui_1': return KnownProducts.includes(data.product_id)
            ? {
              type: 'delta',
              asks: data.asks as Levels,
              bids: data.bids as Levels,
              productId: data.product_id
            } as const
            : NOOP
          default: return NOOP
        }
      } catch (error) {
        return { type: 'error' as const, error }
      }
    }),
    // Doing side-effects in a pipe might be frowned upon but then again,
    // this is not Haskell, write the latest error onto the errorFeed$
    tap((message) => {
      if (message.type === 'error') {
        error$.next(message.error)
      }
    }),
    scan((state, message) => {
      switch (message.type) {
        case 'snapshot': return {
          productId: message.productId,
          asks: message.asks.sort(ltOrder),
          bids: message.bids.sort(gtOrder),
        }
        case 'delta': return {
          productId: message.productId,
          asks: mergeLevels(state.asks, message.asks).sort(ltOrder),
          bids: mergeLevels(state.bids, message.bids).sort(gtOrder),
        }
        default: return state
      }
    }, { productId: null as KnownProduct | null, asks: [] as Levels, bids: [] as Levels }),
  ))

  sink$.connect()

  // Ensure latest state is emitted no more than every 200 milliseconds
  const out$ = sink$.pipe(sampleTime(200))

  return out$
}

export const orderBookFeed$ = createOrderBookFeed(feedMessage$, feedError$)
