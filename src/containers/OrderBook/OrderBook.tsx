import React from 'react'
import { useObservable } from 'react-use'

import { Side } from '../../components/Side'
import { Select } from '../../components/Select'
import { orderBookFeed$ } from '../../streams/feed/orderBookFeed$'
import { subscribeToOrderBookFeedIntent$, unsubscribeToOrderBookFeedIntent$ } from '../../streams/feed/intent$'
import { KnownProduct } from '../../domain/KnownProduct'

import styles from './OrderBook.module.css'


const mockOptions = [
  { label: 'Group 1', value: '1' },
  { label: 'Group 2', value: '2' },
  { label: 'Group 3', value: '3' },
]

type OrderBookProps = {
  productId: KnownProduct
}

export const OrderBook: React.FC<OrderBookProps> = ({ productId }) => {
  const [mockState, setMockState] = React.useState<string | null>(null)

  const feed = useObservable(orderBookFeed$)

  React.useEffect(() => {
    subscribeToOrderBookFeedIntent$.next(productId)
    return () => unsubscribeToOrderBookFeedIntent$.next(productId)
  }, [productId])

  const maxAsks = feed?.asks?.[feed?.asks?.length - 1]?.[2] ?? 0
  const maxBids = feed?.bids?.[feed?.bids?.length - 1]?.[2] ?? 0
  const maxOrders = Math.max(maxAsks, maxBids)

  return (
    <div className={styles.OrderBook}>
      <div className={styles.Header}>
        <h4>Order Book</h4>
        <Select
          value={mockState}
          options={mockOptions}
          onSelect={setMockState}
        />
      </div>
      <div className={styles.TradeSides}>
        <Side side='buy' orders={feed?.bids} maxOrders={maxOrders} />
        <Side side='sell' orders={feed?.asks} maxOrders={maxOrders} />
      </div>
    </div>
  )
}