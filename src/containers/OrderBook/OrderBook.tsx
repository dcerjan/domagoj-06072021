import { Side } from '../../components/Side'

import styles from './OrderBook.module.css'

export const OrderBook: React.FC<{}> = () => {
  return (
    <div className={styles.OrderBook}>
      <Side side='buy' />
      <Side side='sell' />
    </div>
  )
}