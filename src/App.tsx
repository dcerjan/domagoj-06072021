import React from 'react';

import './App.css';
import { IconButton } from './components/IconButton';

import { OrderBook } from './containers/OrderBook';
import { KnownProduct } from './domain/KnownProduct';
import { closeFeedIntent$ } from './streams/feed/intent$';

function App() {
  const [productId, setProductId] = React.useState<KnownProduct>('PI_XBTUSD')

  const toggleFeed = React.useCallback(() => {
    setProductId(productId === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD')
  }, [productId])

  const killFeed = React.useCallback(() => {
    closeFeedIntent$.next()
  }, [])

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
          onClick={killFeed}
          color='danger'
        />
      </div>
    </div>
  );
}

export default App;
