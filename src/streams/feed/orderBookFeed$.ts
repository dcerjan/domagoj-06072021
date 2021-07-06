import { Subject } from 'rxjs'
import { map, sampleTime, scan, shareReplay } from 'rxjs/operators'

import { BookVM } from '../../domain/BookVM'
import { KnownProduct } from '../../domain/KnownProduct'
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

export const bindOrderBookFeed = (
  subscribe$: typeof subscribeToOrderBookFeedIntent$,
  unsubscribe$: typeof unsubscribeToOrderBookFeedIntent$,
  close$: typeof closeFeedIntent$,
  open$: typeof openFeedIntent$,
  message$: typeof feedMessage$,
  error$: typeof feedError$,
) => {
  const broker = createWsFeedBroker(
    WS_ORDER_FEED_ENDPOINT,
    (message) => message$.next(message),
    (error) => error$.next(error)
  )

  subscribe$.subscribe((channel) => broker.subscribe(channel))
  unsubscribe$.subscribe((channel) => broker.unsubscribe(channel))
  close$.subscribe(() => broker.close())
  open$.subscribe(() => broker.open())
}

bindOrderBookFeed(
  subscribeToOrderBookFeedIntent$,
  unsubscribeToOrderBookFeedIntent$,
  closeFeedIntent$,
  openFeedIntent$,
  feedMessage$,
  feedError$,
)

const ltOrder = ([a,]: BookVM[0], [b,]: BookVM[0]) => a > b ? -1 : a < b ? 1 : 0
const gtOrder = ([a,]: BookVM[0], [b,]: BookVM[0]) => a > b ? 1 : a < b ? -1 : 0

const take = <T>(array: T[], count: number) => array.slice(0, count)

const calcLevelsWithTotals = (levels: BookVM) => {
  let total = 0
  // for-loop to avoid gc instead of reduce
  for (let i = 0; i < levels.length; ++i) {
    const level = levels[i]
    total += level[1]
    if (level[2] == null) {
      level.push(0)
    }
    level[2] = total
  }
  return levels
}

const mergeLevels = (levels: BookVM, deltas: BookVM = []) => {
  // Again, for-loop to avoid gc
  for (let level of levels) {
    for (let delta of deltas) {
      if (level[0] === delta[0]) {
        if (delta[1] === 0) {
          level[1] = 0 // mark for deletion
        } else {
          level[1] = delta[1]
          delta[1] = 0 // mark as processed so it is skipped when adding new levels
        }
        continue
      }
    }
  }
  // Add new levels
  for (let delta of deltas) {
    if (delta[1] !== 0) {
      levels.push(delta)
    }
  }
  // Even with mutations for performance reasons from the loop above,
  // thanks to this filter, new filtered array will be recreated, thus
  // React will know to re-render levels correctly
  return levels.filter(([,size]) => size !== 0)
}

export const createOrderBookFeed = (source$: Subject<MessageEvent>) => {
  const sink$ = source$.pipe(
    map((message: MessageEvent) => {
      try {
        const data = JSON.parse(message.data)
        switch (data.feed) {
          case 'book_ui_1_snapshot': return {
            type: 'snapshot',
            asks: data.asks as BookVM,
            bids: data.bids as BookVM,
            productId: data.product_id as KnownProduct
          } as const
          case 'book_ui_1': return {
            type: 'delta',
            asks: data.asks as BookVM,
            bids: data.bids as BookVM,
            productId: data.product_id
          } as const
          default: return {
            type: 'noop'
          } as const
        }
      } catch (error) {
        return { type: 'error' as const, error }
      }
    }),
    scan((state, message) => {
      switch (message.type) {
        case 'snapshot': return {
          productId: message.productId,
          asks: calcLevelsWithTotals(take(message.asks, 15).sort(ltOrder)),
          bids: calcLevelsWithTotals(take(message.bids, 15).sort(gtOrder)),
        }
        case 'delta': {
          return {
            ...state,
            asks: calcLevelsWithTotals(take(mergeLevels(state.asks, message.asks), 15).sort(ltOrder)),
            bids: calcLevelsWithTotals(take(mergeLevels(state.bids, message.bids), 15).sort(gtOrder)),
          }
        }
        default: return state
      }
    }, { productId: '', asks: [] as BookVM, bids: [] as BookVM }),
    shareReplay({refCount: true, bufferSize: 1})
  )

  sink$.subscribe()

  // Ensure UI updates no more than every 200 milliseconds
  return sink$.pipe(sampleTime(200))
}

export const orderBookFeed$ = createOrderBookFeed(feedMessage$)
