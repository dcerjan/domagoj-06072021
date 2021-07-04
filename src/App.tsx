import React from 'react';

import './App.css';
import { IconButton } from './components/IconButton';

import { OrderBook } from './containers/OrderBook';

function App() {
  return (
    <div className="App">
      <OrderBook />
      <div>
        <IconButton
          icon='fa-exchange-alt'
          label='Toggle Feed'
          onClick={() => console.log('on toggle feed')}
        />
        <IconButton
          icon='fa-exclamation-circle'
          label='Kill Feed'
          onClick={() => console.log('on kill feed')}
          color='danger'
        />
      </div>
    </div>
  );
}

export default App;
