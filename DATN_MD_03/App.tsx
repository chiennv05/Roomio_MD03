import React from 'react';
import LoginAndRegister from './src/screens/LoginAndRegister/LoginAndRegister';
import {Provider} from 'react-redux';
import {store} from './src/store';

export default function App() {
  return (
    <Provider store={store}>
      <LoginAndRegister />
    </Provider>
  );
}
