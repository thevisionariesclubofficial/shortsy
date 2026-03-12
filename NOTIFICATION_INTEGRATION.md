# Notification System Integration Guide for React Native

This guide shows how to integrate the Shortsy notification system into the React Native app.

## 1. Setup: Request Permission & Get FCM Token

Create a notification service file in your app:

### File: `src/services/notificationService.ts`

```typescript
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissionsAndGetToken(): Promise<string> {
  // Only works on physical devices
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return '';
  }

  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission to receive notifications was denied');
      return '';
    }

    // Get FCM token
    const projectId = 'shortsy-7c19f'; // Your Firebase project ID
    const fcmToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    console.log('FCM Token:', fcmToken.data);
    return fcmToken.data;
  } catch (error) {
    console.error('Failed to get notification permission:', error);
    return '';
  }
}

export async function registerDeviceToken(userId: string): Promise<boolean> {
  try {
    const fcmToken = await requestNotificationPermissionsAndGetToken();
    
    if (!fcmToken) {
      console.warn('Could not get FCM token');
      return false;
    }

    // Store locally
    await SecureStore.setItemAsync('fcmToken', fcmToken);

    // Send to backend
    const response = await api.post('/v1/users/me/device-token', {
      fcmToken,
      userId,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });

    console.log('Device token registered:', response.success);
    return response.success;
  } catch (error) {
    console.error('Failed to register device token:', error);
    return false;
  }
}

export async function getStoredFCMToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('fcmToken');
  } catch (error) {
    console.error('Failed to retrieve stored FCM token:', error);
    return null;
  }
}

export async function unregisterDevice(userId: string): Promise<boolean> {
  try {
    const fcmToken = await getStoredFCMToken();
    
    if (!fcmToken) return true;

    await api.delete('/v1/users/me/device-token', {
      data: { fcmToken, userId },
    });

    await SecureStore.deleteItemAsync('fcmToken');
    console.log('Device token unregistered');
    return true;
  } catch (error) {
    console.error('Failed to unregister device token:', error);
    return false;
  }
}

// Listen to incoming notifications
export function setupNotificationListener(
  onNotificationReceived?: (notification: Notifications.Notification) => void
) {
  const subscription = Notifications.addNotificationResponseListener(
    (response) => {
      const notification = response.notification;
      console.log('Notification tapped:', notification.request.content);

      const data = notification.request.content.data;

      // Handle different notification types
      if (data.contentId) {
        // Navigate to content
        console.log('Opening content:', data.contentId);
        // navigation.navigate('Player', { contentId: data.contentId });
      }

      if (data.action === 'rental_expiring') {
        // Navigate to rentals
        console.log('Rental expiring:', data.rentalId);
      }

      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  return subscription;
}
```

## 2. Initialize in App Component

### File: `src/app/App.tsx`

```typescript
import { useEffect } from 'react';
import { registerDeviceToken, setupNotificationListener } from '../services/notificationService';

export default function App() {
  const [authState] = useAuth();

  useEffect(() => {
    // Register device when user logs in
    if (authState.user?.id) {
      registerDeviceToken(authState.user.id);
    }
  }, [authState.user?.id]);

  useEffect(() => {
    // Setup notification listener
    const subscription = setupNotificationListener((notification) => {
      console.log('User received notification:', notification);
      // You can refresh UI or navigate here
    });

    return () => subscription.remove();
  }, []);

  return (
    // Your app navigation and screens
  );
}
```

## 3. Backend Endpoint: Store Device Token

Add this endpoint to your backend handlers:

### File: `src/handlers/users.ts`

```typescript
import { APIGatewayProxyHandler } from 'aws-lambda';
import { z } from 'zod';
import { db } from '../services/database';

const UpdateDeviceTokenSchema = z.object({
  fcmToken: z.string().min(1, 'FCM token is required'),
  userId: z.string().optional(), // Optional, extracted from auth if available
  platform: z.enum(['ios', 'android']).optional(),
});

export const updateDeviceToken: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    // Validate input
    const validation = UpdateDeviceTokenSchema.safeParse(body);
    if (!validation.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        }),
      };
    }

    const { fcmToken, platform } = validation.data;
    // Use userId from auth context or body
    const userId = event.requestContext?.authorizer?.claims?.sub || body.userId;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'UNAUTHORIZED',
          message: 'User ID is required',
        }),
      };
    }

    // Store in database
    const result = await db.users.update(userId, {
      fcmToken,
      platform,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });

    // Also store mapping for easy lookup by token
    await db.deviceTokens.upsert({
      fcmToken,
      userId,
      platform: platform || 'unknown',
      registeredAt: new Date().toISOString(),
    });

    console.log(`Device token registered for user ${userId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Device token registered successfully',
        fcmToken,
      }),
    };
  } catch (error) {
    console.error('Failed to update device token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'SERVER_ERROR',
        message: 'Failed to register device token',
      }),
    };
  }
};

export const deleteDeviceToken: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { fcmToken } = body;

    if (!fcmToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'VALIDATION_ERROR',
          message: 'FCM token is required',
        }),
      };
    }

    const userId = event.requestContext?.authorizer?.claims?.sub || body.userId;

    // Remove from database
    await db.deviceTokens.delete(fcmToken);
    await db.users.update(userId, { fcmToken: null });

    console.log(`Device token unregistered for user ${userId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Device token unregistered successfully',
      }),
    };
  } catch (error) {
    console.error('Failed to delete device token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'SERVER_ERROR',
        message: 'Failed to unregister device token',
      }),
    };
  }
};
```

Add to `serverless.yml`:

```yaml
updateDeviceToken:
  handler: src/handlers/users.updateDeviceToken
  events:
    - http:
        path: v1/users/me/device-token
        method: post
        authorizer: ${self:custom.authorizer}

deleteDeviceToken:
  handler: src/handlers/users.deleteDeviceToken
  events:
    - http:
        path: v1/users/me/device-token
        method: delete
        authorizer: ${self:custom.authorizer}
```

## 4. Send Notifications from Backend

### Example: Notify When New Content is Released

```typescript
import { sendNotificationToMultiple, subscribeToTopic } from '../services/notification.service';

export async function notifyNewContent(content: Content) {
  try {
    // Option 1: Send to users who have subscribed to the topic
    const topicName = `new_releases_${content.genre}`;
    await sendNotificationToTopic(topicName, {
      title: 'New Content Available',
      body: `${content.title} is now available on Shortsy!`,
      data: {
        contentId: content.id,
        contentType: content.type,
        genre: content.genre,
      },
      image: content.thumbnailUrl,
    });

    // Option 2: Send to specific users
    const interestedUsers = await db.users.findMany({
      'preferences.notifyNewContent': true,
      'subscriptions.genre': content.genre,
    });

    const deviceIds = interestedUsers
      .map(u => u.fcmToken)
      .filter(Boolean);

    if (deviceIds.length > 0) {
      await sendNotificationToMultiple(deviceIds, {
        title: 'New Content Available',
        body: `${content.title} is now available!`,
        data: {
          contentId: content.id,
          contentType: content.type,
        },
        image: content.thumbnailUrl,
      });
    }

    console.log(`Notified ${deviceIds.length} users about new content`);
  } catch (error) {
    console.error('Failed to send new content notification:', error);
  }
}
```

### Example: Notify About Expiring Rentals

```typescript
export async function notifyExpiringRentals() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find rentals expiring tomorrow
    const expiringRentals = await db.rentals.findMany({
      expiresAt: {
        $gte: new Date(),
        $lte: tomorrow,
      },
    });

    // Group by user
    const userRentals = new Map<string, any[]>();
    for (const rental of expiringRentals) {
      if (!userRentals.has(rental.userId)) {
        userRentals.set(rental.userId, []);
      }
      userRentals.get(rental.userId)!.push(rental);
    }

    // Send notifications
    for (const [userId, rentals] of userRentals) {
      const user = await db.users.findById(userId);
      if (!user?.fcmToken) continue;

      const count = rentals.length;
      const title = count === 1 ? 'Rental Expiring Soon' : `${count} Rentals Expiring Soon`;
      const body = count === 1
        ? `Your rental of "${rentals[0].content.title}" expires tomorrow`
        : `${count} of your rentals expire tomorrow`;

      await sendNotification(user.fcmToken, {
        title,
        body,
        data: {
          action: 'rental_expiring',
          rentalIds: rentals.map(r => r.id).join(','),
        },
      });
    }

    console.log(`Notified ${userRentals.size} users about expiring rentals`);
  } catch (error) {
    console.error('Failed to send expiring rental notifications:', error);
  }
}
```

## 5. Subscribe Users to Topics

Let users subscribe to notification topics:

### File: `src/screens/SettingsScreen.tsx`

```typescript
import { subscribeToTopic } from '../services/notification.service';
import { getStoredFCMToken } from '../services/notificationService';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    newReleases: false,
    specialOffers: false,
    rentalReminders: true,
  });

  const handleToggle = async (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));

    const fcmToken = await getStoredFCMToken();
    if (!fcmToken) return;

    // Subscribe/unsubscribe from topics
    if (key === 'newReleases') {
      if (value) {
        await subscribeToTopic(fcmToken, 'new_releases');
      } else {
        // Implement unsubscribeFromTopic in notification service
        console.log('Unsubscribe from new_releases');
      }
    }

    if (key === 'specialOffers') {
      if (value) {
        await subscribeToTopic(fcmToken, 'special_offers');
      }
    }
  };

  return (
    <View>
      <SettingRow
        title="New Releases"
        description="Notify me when new content is released"
        value={preferences.newReleases}
        onToggle={(val) => handleToggle('newReleases', val)}
      />
      <SettingRow
        title="Special Offers"
        description="Notify me about special promotions and discounts"
        value={preferences.specialOffers}
        onToggle={(val) => handleToggle('specialOffers', val)}
      />
      <SettingRow
        title="Rental Reminders"
        description="Remind me when my rentals are about to expire"
        value={preferences.rentalReminders}
        onToggle={(val) => handleToggle('rentalReminders', val)}
      />
    </View>
  );
}
```

## 6. Testing

### Test with cURL

```bash
# Get a test device's FCM token
# First, run the app on a device and register it

# Send test notification
curl -X POST https://api.shortsy.app/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "your-fcm-token-from-app",
    "title": "Test Notification",
    "body": "This is a test from Shortsy!",
    "data": {
      "test": "true"
    }
  }'
```

### Test Topic Broadcast

```bash
# Subscribe device to topic
curl -X POST https://api.shortsy.app/v1/notifications/subscribe-topic \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "your-fcm-token",
    "topic": "test_topic"
  }'

# Send to topic
curl -X POST https://api.shortsy.app/v1/notifications/send-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test_topic",
    "title": "Topic Test",
    "body": "This is a topic broadcast test!"
  }'
```

## Notification Types

Define different notification types for better handling:

```typescript
type NotificationType = 
  | 'new_content'
  | 'rental_expiring'
  | 'payment_failed'
  | 'order_confirmed'
  | 'promotional'
  | 'system_alert';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  image?: string;
  action?: string;
  deeplink?: string;
}
```

## Best Practices

1. **Always request permission** before getting FCM token
2. **Store token securely** using SecureStore (not AsyncStorage)
3. **Handle token refresh** via listener
4. **Let users control** notification preferences
5. **Don't send spam** - follow platform guidelines
6. **Include relevant data** in notification payloads
7. **Test on real devices** - simulators don't receive push notifications
8. **Monitor delivery** - track which notifications were delivered
9. **Handle permission denial** - gracefully fallback if user denies

## Troubleshooting

**"Notifications not appearing"**
- Verify permission was granted: Settings → App → Notifications
- Check FCM token is valid and registered
- Verify notification payload is correct format
- Check that app is backgrounded (foreground notifications need special handling)

**"FCM token keeps changing"**
- This is normal behavior - tokens can refresh
- Use the token refresh listener to update backend
- Store old tokens briefly to avoid missing notifications

**"Different behavior between iOS and Android"**
- iOS uses APNs, Android uses FCM
- Some features may be platform-specific
- Always test on both platforms
