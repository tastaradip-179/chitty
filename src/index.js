import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { legacy_createStore } from 'redux';
import {Provider} from 'react-redux'
import rootReducer from './components/reducer';

const store = legacy_createStore(rootReducer);
const container = document.getElementById('root');
const rootContainer = createRoot(container);
rootContainer.render(
  <Provider store={store}>    
    <App />
  </Provider>,
  
);
