import React from 'react'
import classnames from 'classnames'

import { LocaleCurrencyFormatter, LocaleAmountFormatter } from '../../utils/format'

import styles from './Row.module.css'

type RowProps = {
  side: 'buy' | 'sell'
  price: number
  size: number
  total: number
}

const calcCellStyles = (side: RowProps['side'], style: string) =>
  classnames(
    styles.Cell,
    {
      [styles.BuySide]: side === 'buy',
      [styles.SelSide]: side === 'sell',
    },
    style,
  )

export const Row: React.FC<RowProps> = ({ price, size, total, side }) => {

  const localePrice = React.useMemo(() => LocaleCurrencyFormatter.format(price), [price])
  const localeSize = React.useMemo(() => LocaleAmountFormatter.format(size), [size])
  const localeTotal = React.useMemo(() => LocaleAmountFormatter.format(total), [total])

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
      <div className={calcCellStyles(side, styles.Total)}>{localeTotal}</div>
      <div className={calcCellStyles(side, styles.Size)}>{localeSize}</div>
      <div className={calcCellStyles(side, styles.Price)}>{localePrice}</div>
    </div>
  )
}
