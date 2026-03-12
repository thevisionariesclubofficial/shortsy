/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

// Firebase auto-initializes from GoogleService-Info.plist (iOS) and google-services.json (Android)
// No explicit initialization needed here

AppRegistry.registerComponent(appName, () => App);
