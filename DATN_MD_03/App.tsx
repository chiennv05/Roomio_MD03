import React, {useEffect} from 'react';

import {Provider, useSelector} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './src/store';

import TabScreen from './src/navigation/TabScreen';
import {MenuProvider} from 'react-native-popup-menu';
import {scheduleNative} from './src/screens/Notification/services/NativeScheduler';
import {
  startPolling,
  stopPolling,
} from './src/screens/Notification/services/NotificationPoller';
import {RootState} from './src/store';

function Bootstrapper() {
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Schedule native alarm-based background task
    scheduleNative(15);
  }, []);

  useEffect(() => {
    // Start/stop foreground polling based on auth token
    if (token) {
      startPolling(token, 30_000); // poll every 30s
      return () => stopPolling();
    } else {
      stopPolling();
    }
  }, [token]);

  return <TabScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <Provider store={store}>
          <MenuProvider>
            <Bootstrapper />
          </MenuProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
