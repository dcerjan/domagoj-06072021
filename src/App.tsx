import React from 'react'
import { useObservable } from 'react-use'

import './App.css';
import { IconButton } from './components/IconButton';

import { OrderBook } from './containers/OrderBook';
import { KnownProduct } from './domain/KnownProduct';
import { closeFeedIntent$, openFeedIntent$ } from './streams/feed/intent$';
import { feedStatus$ } from './streams/feed/orderBookFeed$';

function App() {
  const [productId, setProductId] = React.useState<KnownProduct>('PI_XBTUSD')

  const status = useObservable(feedStatus$, false)

  const toggleFeed = React.useCallback(() => {
    setProductId(productId === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD')
  }, [productId])

  const killOrRestartFeed = React.useCallback(() => {
    if (status) {
      closeFeedIntent$.next()
    } else {
      openFeedIntent$.next()
    }
  }, [status])

  return (
    <div className="App">
      <OrderBook productId={productId}/>
      <div>
        <IconButton
          icon='fa-exchange-alt'
          label='Toggle Feed'
          onClick={toggleFeed}
        />
        <IconButton
          icon='fa-exclamation-circle'
          label='Kill Feed'
          onClick={killOrRestartFeed}
          color='danger'
        />
      </div>
    </div>
  );
}

export default App;
