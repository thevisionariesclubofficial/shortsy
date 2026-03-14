/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';
import '@react-native-firebase/app';
import '@react-native-firebase/messaging';

AppRegistry.registerComponent(appName, () => App);
