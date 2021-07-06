import React from 'react'
import classnames from 'classnames'

import { MAX_LEVELS } from '../../streams/feed/constants'
import { BookVM } from '../../domain/BookVM'
import { Row } from './Row'
import { RowHeader } from './RowHeader'

import styles from './Side.module.css'

type SideProps = {
  side: 'buy' | 'sell'
  orders?: BookVM
  maxOrders: number
}

const EMPTY_ORDERS: BookVM = []

export const Side: React.FC<SideProps> = ({ side, maxOrders, orders = EMPTY_ORDERS }) => {

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
        { orders.slice(0, MAX_LEVELS).map(([price, size, total], index) =>
          <Row
            side={side}
            key={`${price}:${index}`}
            price={price}
            size={size}
            total={total}
            maxOrders={maxOrders}
          />) }
      </div>
    </div>
  )
}
