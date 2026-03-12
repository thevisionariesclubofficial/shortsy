# Frontend Notification Integration Guide

## Installation

First, install Firebase messaging packages:

```bash
cd /Users/adarshchaudhary/Desktop/artisthub/Shortsy-App/shortsy

npm install @react-native-firebase/messaging @react-native-firebase/app
```

## Setup for React Native CLI

### Android Setup

1. Download `google-services.json` from Firebase Console
2. Place it in: `android/app/google-services.json`
3. Run: `npm run android` to rebuild

### iOS Setup

1. Run:
```bash
cd ios
pod install
cd ..
```

## Integration in App

### Step 1: Add Hook to Root App Component

Open `src/app/App.tsx` and add the notification hook:

```typescript
import { useNotifications } from '../hooks/useNotifications';

export default function App() {
  const [authState] = useAuth();
  
  // Initialize notifications
  useNotifications(authState.user?.id);

  return (
    // Your existing app content
  );
}
```

### Step 2: (Optional) Add Settings Screen

To allow users to manage notification preferences:

```typescript
import {
  subscribeToNotificationTopic,
  getStoredFCMToken,
} from '../services/notificationService';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    newReleases: false,
    specialOffers: true,
    rentalReminders: true,
  });

  const handleTopicToggle = async (topic: string, enabled: boolean) => {
    if (enabled) {
      await subscribeToNotificationTopic(topic);
    } else {
      console.log('TODO: Implement unsubscribe for topic:', topic);
      // You'd need to add an unsubscribe function to the notification service
    }
  };

  return (
    <View>
      <SettingRow
        title="New Releases"
        value={preferences.newReleases}
        onToggle={(val) => {
          setPreferences((prev) => ({ ...prev, newReleases: val }));
          handleTopicToggle('new_releases', val);
        }}
      />
      <SettingRow
        title="Special Offers"
        value={preferences.specialOffers}
        onToggle={(val) => {
          setPreferences((prev) => ({ ...prev, specialOffers: val }));
          handleTopicToggle('special_offers', val);
        }}
      />
      <SettingRow
        title="Rental Reminders"
        value={preferences.rentalReminders}
        onToggle={(val) => {
          setPreferences((prev) => ({ ...prev, rentalReminders: val }));
          // Rental reminders are automatic, no topic needed
        }}
      />
    </View>
  );
}
```

### Step 3: (Optional) Debug Panel

To view the device token for testing:

```typescript
import { getDeviceTokenForTesting } from '../services/notificationService';

export function DebugPanel() {
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    getDeviceTokenForTesting().then(setDeviceToken);
  }, []);

  return (
    <View>
      <Text>Device FCM Token:</Text>
      <Text selectable>{deviceToken}</Text>
      <Button
        title="Copy Token"
        onPress={() => {
          // Use react-native-clipboard or similar
          console.log('Token:', deviceToken);
        }}
      />
    </View>
  );
}
```

## Testing Notifications

### Method 1: Backend API

Get the device token from the debug panel, then call the API:

```bash
curl -X POST https://api.shortsy.app/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "YOUR_FCM_TOKEN_HERE",
    "title": "Test Notification",
    "body": "This is a test from Shortsy!",
    "data": {
      "action": "open_content",
      "contentId": "film-123"
    }
  }'
```

### Method 2: Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Create a new message
3. Paste the FCM token
4. Send

### Method 3: Test Function

Call the test function directly in the app:

```typescript
import { sendTestNotification } from '../services/notificationService';

// In a button handler or console:
await sendTestNotification();
```

## Notification Flow

1. **User Opens App** → `useNotifications` hook runs
2. **Hook Requests Permission** → User approves
3. **FCM Token Generated** → Stored in AsyncStorage
4. **Backend Registration** → Token sent to `/v1/users/me/device-token`
5. **Listener Setup** → App listens for notifications
6. **Topic Subscriptions** → Device subscribes to `new_releases`, `special_offers`
7. **Notification Received** → App handles based on action type

## Available Notification Actions

| Action | Payload | Handling |
|--------|---------|----------|
| `open_content` | `{ contentId }` | Navigate to Player screen |
| `rental_expiring` | `{ rentalId }` | Show expiry alert or navigate to Rentals |
| `promotional` | `{ couponCode }` | Show offer or navigate to Browse |
| `custom` | Any custom data | Handle in app logic |

## Notification Hooks Available

### `useNotifications(userId)`
Main hook that sets up permissions, token registration, and listeners.

```typescript
useNotifications(authState.user?.id);
```

### `useDeviceTokenForTesting()`
Logs device token for debugging. Use in development only.

```typescript
if (__DEV__) {
  useDeviceTokenForTesting();
}
```

## Services Available

### `requestNotificationPermissionsAndGetToken()`
Requests user permission and retrieves FCM token.

```typescript
const token = await requestNotificationPermissionsAndGetToken();
```

### `registerDeviceToken(userId)`
Registers device with backend.

```typescript
await registerDeviceToken(userId);
```

### `getStoredFCMToken()`
Gets the stored FCM token from AsyncStorage.

```typescript
const token = await getStoredFCMToken();
```

### `setupNotificationListener(callback)`
Sets up listeners for incoming notifications. Returns cleanup function.

```typescript
const unsubscribe = setupNotificationListener((data) => {
  console.log('Notification received:', data);
});

// Cleanup when needed:
unsubscribe();
```

### `subscribeToNotificationTopic(topic)`
Subscribe device to a topic.

```typescript
await subscribeToNotificationTopic('new_releases');
```

### `sendTestNotification()`
Send a test notification to this device.

```typescript
await sendTestNotification();
```

### `getDeviceTokenForTesting()`
Get current device token for testing.

```typescript
const token = await getDeviceTokenForTesting();
```

### `unregisterDevice(userId)`
Unregister device when user logs out.

```typescript
// In logout handler:
await unregisterDevice(userId);
```

## Troubleshooting

### "Firebase messaging not available"
- Install packages: `npm install @react-native-firebase/messaging @react-native-firebase/app`
- Rebuild app: `npm run android` or `npm run ios`

### "Permission denied"
- Check app permissions in device settings
- For Android: Settings → Apps → Shortsy → Permissions → Notifications

### "FCM token not generating"
- Ensure GoogleServices config is correct (android/app/google-services.json)
- Try uninstalling and reinstalling the app

### "Notifications not showing"
- Check notification channel configuration (see notificationService.ts)
- Ensure app has notification permission granted
- Check that notification payload has `title` and `body`

### "Notification taps not working"
- Add proper navigation logic in setupNotificationListener
- Test with `sendTestNotification()` first

## Next Steps

1. ✅ Install Firebase packages
2. ✅ Add `useNotifications` hook to App.tsx
3. ✅ Configure notification handlers in your screens
4. ✅ Test with debug panel or test notifications
5. ✅ Add settings screen for notification preferences
6. ✅ Deploy and verify on real devices

## Production Checklist

- [ ] Firebase services configured for production
- [ ] google-services.json is correct version
- [ ] Notification permission request shown at right time
- [ ] Error handling for permission denial
- [ ] Navigation working for notification taps
- [ ] Device token unregistered on logout
- [ ] Tested on both Android and iOS
- [ ] Tested with app in foreground and background
- [ ] Tested with app closed/killed
