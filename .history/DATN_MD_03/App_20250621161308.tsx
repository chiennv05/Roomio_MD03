import React from 'react';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {store} from './src/store';
import TabScreen from './src/navigation/TabScreen';


export default function App() {
  return (
<<<<<<< HEAD
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <TabScreen />
      </Provider>
    </GestureHandlerRootView>
=======
    <Provider store={store}>


      <TabScreen />
    </Provider>
>>>>>>> origin/dev
  );
}

