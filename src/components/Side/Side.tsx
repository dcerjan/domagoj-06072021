import classnames from 'classnames'

import { Row } from './Row'
import { RowHeader } from './RowHeader'

import styles from './Side.module.css'

type SideProps = {
  side: 'buy' | 'sell'
}

const mockData = [
  [47377.50, 13056, 245982],
  [47377.00, 13056, 245982],
  [47376.50, 13056, 245982],
  [47376.00, 13056, 245982]
]

export const Side: React.FC<SideProps> = ({ side }) => {
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
          />) }
      </div>
    </div>
  )
}
