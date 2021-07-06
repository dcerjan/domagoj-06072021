import React from 'react'
import { useObservable } from 'react-use'

import { Side } from '../../components/Side'
import { Select } from '../../components/Select'
import { orderBookFeed$, selectGrouping$ } from '../../streams/feed/orderBookFeed$'
import { subscribeToOrderBookFeedIntent$, unsubscribeToOrderBookFeedIntent$ } from '../../streams/feed/intent$'
import { KnownProduct, KnownProductGrouping } from '../../domain/KnownProduct'

import styles from './OrderBook.module.css'


type OrderBookProps = {
  productId: KnownProduct
}

const EMPTY_OPTIONS = [
  { label: 'Grouping -', value: '' }
]

export const OrderBook: React.FC<OrderBookProps> = ({ productId }) => {
  const feed = useObservable(orderBookFeed$)
  const selectedGroupIndex = useObservable(selectGrouping$, 0)

  React.useEffect(() => {
    subscribeToOrderBookFeedIntent$.next(productId)
    return () => unsubscribeToOrderBookFeedIntent$.next(productId)
  }, [productId])

  const productName = feed?.productId
    ? `(${feed.productId})`
    : ''

  const groupingOptions = React.useMemo(() => {
    if (feed?.productId == null) {
      return EMPTY_OPTIONS
    } else {
      return KnownProductGrouping[feed.productId as KnownProduct]
    }
  }, [feed?.productId])

  const selectedGroup = groupingOptions[selectedGroupIndex]

  const onSelectGroup = React.useCallback((newValue: string) => {
    selectGrouping$.next(groupingOptions.findIndex(({ value }) => value === newValue))
  }, [groupingOptions])

  return feed?.productId == null
    ? null
    : (
      <div className={styles.OrderBook}>
        <div className={styles.Header}>
          <h4>Order Book { productName }</h4>
          <Select
            value={selectedGroup.value}
            options={groupingOptions}
            onSelect={onSelectGroup}
          />
        </div>
        <div className={styles.TradeSides}>
          <Side
            side='buy'
            levels={feed.bids}
            group={selectedGroupIndex}
            product={feed.productId}
          />
          <Side
            side='sell'
            levels={feed.asks}
            group={selectedGroupIndex}
            product={feed.productId}
          />
        </div>
      </div>
    )
}
