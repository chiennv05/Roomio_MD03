import React from 'react';

import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './src/store';

import TabScreen from './src/navigation/TabScreen';
import {MenuProvider} from 'react-native-popup-menu';
import NotificationProvider from './src/providers/NotificationProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <Provider store={store}>
          <NotificationProvider>
            <MenuProvider>
              <TabScreen />
            </MenuProvider>
          </NotificationProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
