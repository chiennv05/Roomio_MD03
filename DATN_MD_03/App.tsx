import React from 'react';
import {Provider} from 'react-redux';
import {store} from './src/store';
import TabScreen from './src/navigation/TabScreen';

export default function App() {
  return (
    <Provider store={store}>
      <TabScreen />
    </Provider>
  );
}
