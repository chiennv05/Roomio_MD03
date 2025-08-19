import React, {useEffect} from 'react';
import {LogBox} from 'react-native';

// Tắt tất cả warning trên màn hình
LogBox.ignoreAllLogs();

import {Provider, useSelector} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {persistor, store} from './src/store';
import {PersistGate} from 'redux-persist/integration/react';
import TabScreen from './src/navigation/TabScreen';
import {MenuProvider} from 'react-native-popup-menu';
import {scheduleNative} from './src/screens/Notification/services/NativeScheduler';
import {
  startPolling,
  stopPolling,
} from './src/screens/Notification/services/NotificationPoller';
import {RootState} from './src/store';

import AsyncStorage from '@react-native-async-storage/async-storage';

function Bootstrapper() {
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Schedule native alarm-based background task
    scheduleNative(15);
  }, []);

  useEffect(() => {
    // Start/stop foreground polling based on auth token & user preference
    (async () => {
      try {
        const enabled = (await AsyncStorage.getItem('notif:enabled')) === '1';
        if (token && enabled) {
          startPolling(token, 5_000); // poll every ~5s
          return () => stopPolling();
        } else {
          stopPolling();
        }
      } catch {
        if (token) {
          startPolling(token, 5_000);
        } else {
          stopPolling();
        }
      }
    })();
  }, [token]);

  return <TabScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <MenuProvider>
              <Bootstrapper />
            </MenuProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
