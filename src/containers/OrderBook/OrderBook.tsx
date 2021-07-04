import React from 'react'

import { Side } from '../../components/Side'
import { Select } from '../../components/Select'

import styles from './OrderBook.module.css'


const mockOptions = [
  { label: 'Group 1', value: '1' },
  { label: 'Group 2', value: '2' },
  { label: 'Group 3', value: '3' },
]

export const OrderBook: React.FC<{}> = () => {

  const [mockState, setMockState] = React.useState<string | null>(null)

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
        <Side side='buy' />
        <Side side='sell' />
      </div>
    </div>
  )
}