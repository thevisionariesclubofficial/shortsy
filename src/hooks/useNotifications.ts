import { useEffect } from 'react';
import {
  registerDeviceToken,
  setupNotificationListener,
  subscribeToNotificationTopic,
  getDeviceTokenForTesting,
} from '../services/notificationService';

/**
 * Hook to manage FCM notifications in the app
 * Call this in your App.tsx root component
 */
export function useNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    // Register device when user is authenticated
    registerDeviceToken(userId).catch((error) => {
      console.error('[useNotifications] Failed to register device:', error);
    });

    // Setup notification listeners
    const unsubscribe = setupNotificationListener((data: any) => {
      console.log('[useNotifications] Notification data:', data);

      // Handle notification based on action
      switch (data?.action) {
        case 'open_content':
          console.log('Navigate to content:', data.contentId);
          // TODO: Add navigation logic
          break;

        case 'rental_expiring':
          console.log('Rental expiring:', data.rentalId);
          // TODO: Add navigation to rentals
          break;

        case 'promotional':
          console.log('Promotional offer:', data.couponCode);
          // TODO: Show offer or navigate to promotions
          break;

        default:
          console.log('Unknown notification type');
      }
    });

    // Subscribe to common topics
    subscribeToNotificationTopic('new_releases').catch(console.error);
    subscribeToNotificationTopic('special_offers').catch(console.error);

    // Cleanup
    return () => {
      unsubscribe?.();
    };
  }, [userId]);
}

/**
 * Hook to get device token for testing
 * Use in a settings screen or debug panel
 */
export function useDeviceTokenForTesting() {
  useEffect(() => {
    getDeviceTokenForTesting().then((token) => {
      if (token) {
        console.log('[DEBUG] Device FCM Token:', token);
      }
    });
  }, []);
}
