import React from 'react'
import classnames from 'classnames'

import styles from './Row.module.css'

type RowHeaderProps = {
  side: 'buy' | 'sell'
}

export const RowHeader: React.FC<RowHeaderProps> = ({ side }) => {
  return (
    <div
      className={
        classnames(
          styles.Row,
          styles.Header,
          {
            [styles.BuySide]: side ==='buy',
            [styles.SellSide]: side ==='sell',
          }
        )
      }>
      <div className={classnames(styles.Cell, styles.Total)}>total</div>
      <div className={classnames(styles.Cell, styles.Size)}>size</div>
      <div className={classnames(styles.Cell, styles.Price)}>price</div>
    </div>
  )
}
