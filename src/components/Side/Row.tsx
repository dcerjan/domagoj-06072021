import React from 'react'
import classnames from 'classnames'

import { LocaleCurrencyFormatter, LocaleAmountFormatter } from '../../utils/format'

import styles from './Row.module.css'

type RowProps = {
  side: 'buy' | 'sell'
  price: number
  size: number
  total: number
  maxOrders: number
}

const calcCellStyles = (side: RowProps['side'], style: string) =>
  classnames(
    styles.Cell,
    {
      [styles.BuySide]: side ==='buy',
      [styles.SellSide]: side ==='sell',
    },
    style,
  )

export const Row: React.FC<RowProps> = ({ price, size, total, maxOrders, side }) => {

  const localePrice = React.useMemo(() => LocaleCurrencyFormatter.format(price), [price])
  const localeSize = React.useMemo(() => LocaleAmountFormatter.format(size), [size])
  const localeTotal = React.useMemo(() => LocaleAmountFormatter.format(total), [total])

  const barSize = `${100 * total / maxOrders}%`

  return (
    <div
    className={
      classnames(
        styles.Row,
        {
          [styles.BuySide]: side ==='buy',
          [styles.SellSide]: side ==='sell',
        }
      )
    }>
      <div
        className={
          classnames(
            styles.Bar,
            {
              [styles.BuySide]: side === 'buy',
              [styles.SellSide]: side === 'sell',
            }
          )
        }
        style={{ width: barSize }}
      />
      <div className={calcCellStyles(side, styles.Total)}>{localeTotal}</div>
      <div className={calcCellStyles(side, styles.Size)}>{localeSize}</div>
      <div className={calcCellStyles(side, styles.Price)}>{localePrice}</div>
    </div>
  )
}
