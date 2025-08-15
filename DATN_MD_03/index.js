/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {headlessTask} from './src/screens/Notification/services/NativeHeadless';

AppRegistry.registerComponent(appName, () => App);

// Register native Alarm-based headless task
AppRegistry.registerHeadlessTask('NotificationFetchTask', () => headlessTask);
