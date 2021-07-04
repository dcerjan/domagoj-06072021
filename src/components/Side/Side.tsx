import React from 'react'
import classnames from 'classnames'

import { Row } from './Row'
import { RowHeader } from './RowHeader'

import styles from './Side.module.css'

type SideProps = {
  side: 'buy' | 'sell'
}

const mockData = [
  [47377.50, 13056, 1],
  [47377.00, 13056, 2],
  [47376.50, 13056, 3],
  [47376.00, 13056, 4]
]

export const Side: React.FC<SideProps> = ({ side }) => {

  const maxOrders = Math.max(...mockData.map(([,,total]) => total))

  return (
    <div className={styles.Side}>
      <RowHeader side={side} />
      <div
        className={
          classnames(
            styles.SideBody,
            {
              [styles.BuySide]: side === 'buy',
              [styles.SellSide]: side === 'sell',
            }
          )
        }
      >
        { mockData.map(([price, size, total]) =>
          <Row
            side={side}
            key={`${price}`}
            price={price}
            size={size}
            total={total}
            maxOrders={maxOrders}
          />) }
      </div>
    </div>
  )
}
