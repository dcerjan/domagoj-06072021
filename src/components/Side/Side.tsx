import React from 'react'
import classnames from 'classnames'

import { MAX_LEVELS } from '../../streams/feed/constants'
import { calcLevelsWithTotals, groupBy, take, Levels } from '../../domain/Levels'
import { KnownProduct } from '../../domain/KnownProduct'
import { Row } from './Row'
import { RowHeader } from './RowHeader'

import styles from './Side.module.css'

type SideProps = {
  side: 'buy' | 'sell'
  levels?: Levels
  product: KnownProduct
  group: number
}

const EMPTY_LEVELS: Levels = []

export const Side: React.FC<SideProps> = ({ side, group, product, levels = EMPTY_LEVELS }) => {
  const groupedLevels = calcLevelsWithTotals(groupBy(levels, product, group))
  const maxOrders = groupedLevels[groupedLevels.length - 1][2]

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
        { take(groupedLevels, MAX_LEVELS).map(([price, size, total], index) =>
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
