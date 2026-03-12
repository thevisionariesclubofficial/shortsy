import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { apiClient } from './apiClient';

// @ts-ignore - Firebase packages
import messaging from '@react-native-firebase/messaging';

let messagingInitError: any = null;
let firebaseReady = false;

/**
 * Check if Firebase is ready and wait for it to initialize
 * Firebase auto-initializes from GoogleService-Info.plist (iOS) and google-services.json (Android)
 */
async function waitForFirebaseReady(maxWaitMs: number = 5000): Promise<void> {
  const startTime = Date.now();
  let lastError: any = null;
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      // Try to access messaging to see if Firebase is initialized
      if (messaging && typeof messaging === 'function') {
        try {
          const msg = messaging();
          if (msg) {
            firebaseReady = true;
            console.log('[Firebase] Firebase is ready');
            return;
          }
        } catch (err: any) {
          // Firebase not ready yet, save the error for logging
          lastError = err;
        }
      }
    } catch (error) {
      // Firebase not ready yet
      lastError = error;
    }
    
    // Wait a bit before retrying
    await new Promise((resolve: (value?: unknown) => void) => setTimeout(() => resolve(true), 300));
  }
  
  const totalTime = Date.now() - startTime;
  const errorMsg = lastError?.message || 'Unknown error';
  
  // Provide helpful error message
  if (errorMsg.includes("No Firebase App '[DEFAULT]'")) {
    console.error(
      '[Firebase] ERROR: Firebase not initialized.\n' +
      'CAUSE: GoogleService-Info.plist not bundled with app.\n' +
      'FIX: In Xcode:\n' +
      '  1. Open ios/shortsy.xcworkspace\n' +
      '  2. Select "shortsy" project → "shortsy" target\n' +
      '  3. Build Phases tab → "Copy Bundle Resources"\n' +
      '  4. Click "+" and add GoogleService-Info.plist\n' +
      '  5. Rebuild (Cmd+B)'
    );
  }
  
  throw new Error('Firebase initialization timeout - took longer than ' + maxWaitMs + 'ms');
}

/**
 * Helper function to retry an operation with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000,
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[notification] Attempt ${attempt}/${maxAttempts}...`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `[notification] Attempt ${attempt} failed: ${error?.message || error}. ` +
          `Retrying in ${delayMs}ms...`,
        );
        await new Promise((resolve: (value?: unknown) => void) => setTimeout(() => resolve(true), delayMs));
      }
    }
  }
  
  throw lastError;
}

/**
 * Get Firebase messaging instance
 */
async function getMessagingInstance(): Promise<any> {
  try {
    // Firebase messaging module is a function that needs to be called
    if (typeof messaging !== 'function') {
      throw new Error('Firebase messaging is not a function');
    }
    
    // Call the messaging function to get the actual messaging instance
    const msg = messaging();
    
    if (!msg) {
      throw new Error('Firebase messaging() returned null');
    }
    
    console.log('[notification] Firebase messaging instance obtained');
    return msg;
  } catch (error: any) {
    console.error('[notification] Failed to get Firebase messaging instance:', error?.message || error);
    throw error;
  }
}

/**
 * Request notification permissions and get FCM token
 * @returns FCM token string
 */
export async function requestNotificationPermissionsAndGetToken(): Promise<string> {
  try {
    // First, wait for Firebase to be ready
    console.log('[notification] Waiting for Firebase to be ready...');
    await waitForFirebaseReady(5000);
    console.log('[notification] Firebase is ready, proceeding with permission request');

    // Retry getting the messaging instance in case Firebase is not ready
    const msg = await retryWithBackoff(async () => {
      const instance = await getMessagingInstance();
      if (!instance) {
        throw new Error('Firebase messaging module is undefined after retry');
      }
      return instance;
    }, 3, 500);

    console.log('[notification] Requesting notification permission...');
    
    // Request permission from user with retry
    const authStatus = await retryWithBackoff(
      () => msg.requestPermission(),
      2,
      500,
    );
    console.log('[notification] Auth status:', authStatus);
    
    // AuthorizationStatus constants are on the messaging module, not the instance
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('[notification] Notification permission denied by user (status:', authStatus, ')');
      return '';
    }

    console.log('[notification] Permission granted, getting token...');
    
    // Get FCM token with retry
    const fcmTokenResult = await retryWithBackoff(
      () => msg.getToken(),
      3,
      500,
    );
    const fcmToken = String(fcmTokenResult);
    console.log('[notification] FCM Token obtained:', fcmToken.substring(0, 20) + '...');
    
    // Store it for later use
    await AsyncStorage.setItem('fcmToken', fcmToken);
    return fcmToken;
  } catch (error: any) {
    console.error('[notification] Failed to get notification permission:', error?.message || error);
    console.error('[notification] Full error:', error);
    
    // If error is SERVICE_NOT_AVAILABLE, provide helpful message
    if (error?.message?.includes('SERVICE_NOT_AVAILABLE')) {
      console.error(
        '[notification] ERROR: Firebase Cloud Messaging service not available.\n' +
        'SOLUTION: Your Android emulator needs Google Play Services.\n' +
        'See FIREBASE_FCM_EMULATOR_FIX.sh for instructions.',
      );
    }
    
    return '';
  }
}

/**
 * Register device token with backend
 * @param userId - User ID to associate with device
 * @returns Success status
 */
export async function registerDeviceToken(userId: string): Promise<boolean> {
  try {
    const fcmToken = await requestNotificationPermissionsAndGetToken();

    if (!fcmToken) {
      console.warn('[notification] Could not get FCM token, skipping registration');
      return false;
    }

    // Store locally for offline access
    await AsyncStorage.setItem('fcmToken', fcmToken);

    // Register with backend
    const response = await apiClient.post('/v1/users/me/device-token', {
      body: {
        fcmToken,
        userId,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('[notification] Device token registered successfully');
    return true;
  } catch (error) {
    console.error('[notification] Failed to register device token:', error);
    return false;
  }
}

/**
 * Get stored FCM token from async storage
 * @returns FCM token or null
 */
export async function getStoredFCMToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('fcmToken');
  } catch (error) {
    console.error('[notification] Failed to retrieve stored FCM token:', error);
    return null;
  }
}

/**
 * Unregister device from backend
 * @param userId - User ID
 * @returns Success status
 */
export async function unregisterDevice(userId: string): Promise<boolean> {
  try {
    const fcmToken = await getStoredFCMToken();

    if (!fcmToken) {
      console.warn('[notification] No stored FCM token to unregister');
      return true;
    }

    await apiClient.delete('/v1/users/me/device-token', {
      body: { fcmToken, userId },
    });

    await AsyncStorage.removeItem('fcmToken');
    console.log('[notification] Device token unregistered');
    return true;
  } catch (error) {
    console.error('[notification] Failed to unregister device token:', error);
    return false;
  }
}

/**
 * Setup listener for incoming notifications
 * @param onNotificationReceived - Callback when notification is received
 * @returns Subscription cleanup function
 */
export function setupNotificationListener(
  onNotificationReceived?: (data: any) => void,
) {
  // Setup listeners asynchronously
  console.log('[notification] Setting up notification listener...');
  
  // Wait for Firebase to be ready, then setup listeners
  waitForFirebaseReady(5000)
    .then(() => getMessagingInstance())
    .then((msg) => {
      if (!msg) {
        console.warn('[notification] Firebase messaging not available for listeners');
        return;
      }

      // Listen to notifications when app is in foreground
      const unsubscribeForeground = msg.onMessage(async (remoteMessage: any) => {
        const title = remoteMessage.notification?.title || 'Shortsy';
        const body = remoteMessage.notification?.body || '';
        const data = remoteMessage.data || {};

        console.log('[notification] Foreground notification received:', {
          title,
          body,
          data,
        });

        // Show alert to user in foreground
        Alert.alert(title, body, [
          {
            text: 'Dismiss',
            onPress: () => {
              console.log('[notification] Notification dismissed');
            },
          },
          {
            text: 'View',
            onPress: () => {
              console.log('[notification] Notification view tapped');
              if (onNotificationReceived) {
                onNotificationReceived(data);
              }
            },
          },
        ]);

        if (onNotificationReceived) {
          onNotificationReceived(data);
        }
      });

      // Listen to notification taps
      const unsubscribeNotificationOpened = msg.onNotificationOpenedApp(
        (remoteMessage: any) => {
          const data = remoteMessage?.data;

          console.log('[notification] Notification tapped:', {
            title: remoteMessage?.notification?.title,
            data,
          });

          // Handle different notification types based on action in data
          if (data?.action === 'open_content' && data?.contentId) {
            console.log('[notification] Opening content:', data.contentId);
            // TODO: Navigate to content - adjust based on your navigation setup
            // navigation.navigate('Player', { contentId: data.contentId });
          }

          if (data?.action === 'rental_expiring' && data?.rentalId) {
            console.log('[notification] Rental expiring reminder:', data.rentalId);
            // TODO: Navigate to rentals screen
            // navigation.navigate('Rentals');
          }

          if (data?.action === 'promotional') {
            console.log('[notification] Promotional offer received');
            // TODO: Navigate to offers/browse
          }

          if (onNotificationReceived) {
            onNotificationReceived(data);
          }
        },
      );

      // Check if app was opened from quit state by a notification
      msg
        .getInitialNotification()
        .then((remoteMessage: any) => {
          if (remoteMessage) {
            console.log('[notification] App opened from quit state:', remoteMessage.data);
            if (onNotificationReceived) {
              onNotificationReceived(remoteMessage.data);
            }
          }
        });
        
      console.log('[notification] Notification listeners set up successfully');
    })
    .catch((error) => {
      console.error('[notification] Failed to setup notification listener:', error?.message || error);
    });

  // Return cleanup function (with empty implementation for now)
  return () => {
    console.log('[notification] Cleaning up notification listeners');
  };
}

/**
 * Subscribe device to a notification topic
 * @param topic - Topic name
 * @returns Success status
 */
export async function subscribeToNotificationTopic(topic: string): Promise<boolean> {
  try {
    const fcmToken = await getStoredFCMToken();

    if (!fcmToken) {
      console.warn('[notification] No FCM token available for topic subscription');
      return false;
    }

    await apiClient.post('/v1/notifications/subscribe-topic', {
      body: { deviceId: fcmToken, topic },
    });

    console.log('[notification] Subscribed to topic:', topic);
    return true;
  } catch (error) {
    console.error('[notification] Failed to subscribe to topic:', error);
    return false;
  }
}

/**
 * Test function: Send notification to current device
 * @returns Success status
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const fcmToken = await getStoredFCMToken();

    if (!fcmToken) {
      console.warn('[notification] No FCM token available for test');
      return false;
    }

    await apiClient.post('/v1/notifications/send', {
      body: {
        deviceId: fcmToken,
        title: 'Test Notification',
        body: 'This is a test notification from Shortsy!',
        data: {
          test: 'true',
          timestamp: new Date().toISOString(),
        },
      },
    });

    console.log('[notification] Test notification sent successfully');
    return true;
  } catch (error) {
    console.error('[notification] Failed to send test notification:', error);
    return false;
  }
}

/**
 * Get current device token for debugging/manual testing
 * @returns Device token or null
 */
export async function getDeviceTokenForTesting(): Promise<string | null> {
  return await getStoredFCMToken();
}
