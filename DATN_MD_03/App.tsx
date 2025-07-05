import React from 'react';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './src/store';
import TabScreen from './src/navigation/TabScreen';
import MapScreen from './src/screens/ChuTro/AddRoom/MapScreen';
import MyRoomScreen from './src/screens/ChuTro/MyRoom/MyRoomScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <Provider store={store}>
          <MyRoomScreen />
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
