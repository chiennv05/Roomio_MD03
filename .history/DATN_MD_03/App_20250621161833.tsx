import React from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import TabScreen from './src/navigation/TabScreen';


export default function App() {
  return (

    <Provider store={store}>


      <TabScreen />
    </Provider>

  );
}

