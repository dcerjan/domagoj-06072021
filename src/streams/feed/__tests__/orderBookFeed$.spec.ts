import { Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing'

import { createOrderBookFeed } from '../orderBookFeed$'

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
})

const SNAPSHOT = {
  numLevels: 25,
  feed: 'book_ui_1_snapshot',
  bids: [
    [100, 1200.0],
    [100.5, 2500.0],
    [200, 12018.0],
  ],
  asks: [
    [110, 7658.0],
    [110.5, 1597.0],
    [210.5, 1005.0],
  ],
  product_id: 'PI_XBTUSD'
}

const INITIAL_STATE = {
  productId: null,
  bids: [],
  asks:[],
}

const EXPECTED_STATE = {
  productId: 'PI_XBTUSD',
  bids: [
    [100.0, 1200.0],
    [100.5, 2500.0],
    [200.0, 12018.0],
  ],
  asks: [
    [210.5, 1005.0],
    [110.5, 1597.0],
    [110.0, 7658.0],
  ],
}

describe('createOrderBookFeed', () => {
  describe('returns an observable', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      testScheduler.frame = 0
    })
    describe('which when it receives a snapshot message', () => {
      it('should emit correct state', () => {
        testScheduler.run(({ hot, expectObservable }) => {
          const source$ = hot<MessageEvent<any>>('a 200ms |', {
            a: { data: JSON.stringify(SNAPSHOT) } as any
          })
          const error$ = hot<Error>('-')

          const feed$ = createOrderBookFeed(source$, error$)

          expectObservable(feed$).toBe('200ms a |', {
            a: EXPECTED_STATE,
          })
        })
      })
    })
    describe('which when it receives an unknown message', () => {
      it('should ignore unknown message and emit correct state', () => {
        testScheduler.run(({ hot, expectObservable }) => {
          const source$ = hot<MessageEvent<any>>('a 200ms b 200ms |', {
            a: { data: JSON.stringify(SNAPSHOT) } as any,
            b: { data: JSON.stringify({ bad: 'message '})} as any
          })
          const error$ = hot<Error>('-')

          const feed$ = createOrderBookFeed(source$, error$)

          expectObservable(feed$).toBe('200ms a 199ms a -|', {
            a: EXPECTED_STATE,
          })
        })
      })
    })
    // Etc - the rest of the combinations should be trivial to test also
  })
})
