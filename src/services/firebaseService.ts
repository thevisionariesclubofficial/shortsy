/**
 * firebaseService.ts
 * Handles Firebase initialization and configuration
 * 
 * Uses React Native Firebase v22.4.0 with proper modular API
 * Gracefully handles cases where FCM initialization fails
 */

import { Platform, PushNotificationIOS } from 'react-native';

// Firebase modules
let messaging: any = null;
let isFirebaseReady = false;
let firebaseInitPromise: Promise<boolean> | null = null;
let fcmToken: string | null = null;

// Try to import messaging module
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (error) {
  console.warn('[Firebase] Failed to import messaging module');
}

/**
 * Initialize Firebase and get FCM token
 * The native Firebase SDK is auto-initialized from GoogleService-Info.plist (iOS) / google-services.json (Android)
 */
export const initializeFirebase = async (): Promise<boolean> => {
  // Return cached promise if already initializing
  if (firebaseInitPromise) {
    return await firebaseInitPromise;
  }

  firebaseInitPromise = (async () => {
    const platformStr = Platform.OS === 'ios' ? 'iOS' : 'Android';
    
    if (!messaging) {
      console.warn('[Firebase] Messaging module unavailable');
      return false;
    }

    try {
      console.log(`[Firebase] Initializing on ${platformStr}...`);
      
      // Request permissions (iOS and Android 13+)
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        console.log(`[Firebase] APNs permission status: ${authStatus}`);
      }
      
      // Get FCM token - this indicates Firebase is ready
      // Firebase auto-registers for remote messages on iOS by default
      const token = await messaging().getToken();
      
      if (token) {
        fcmToken = token;
        isFirebaseReady = true;
        console.log(`✅ [Firebase] Initialized successfully on ${platformStr}`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        return true;
      } else {
        throw new Error('Failed to obtain FCM token');
      }
    } catch (error: any) {
      console.warn(`[Firebase] Initialization failed on ${platformStr}`);
      console.warn(`   Error: ${error?.message || String(error)}`);
      console.warn('   App will continue without push notifications');
      isFirebaseReady = false;
      return false;
    }
  })();

  return firebaseInitPromise;
};

/**
 * Check if Firebase is initialized and ready
 */
export const isFirebaseInitialized = () => isFirebaseReady;

/**
 * Get the FCM token if available
 */
export const getFCMToken = () => fcmToken;