# Firebase Messaging Setup for React Native CLI

To enable push notifications in the React Native app, install Firebase Cloud Messaging:

## Installation

```bash
cd /Users/adarshchaudhary/Desktop/artisthub/Shortsy-App/shortsy

# Install Firebase packages
npm install @react-native-firebase/messaging @react-native-firebase/app
```

## Configuration

### Android Setup

1. Download your Firebase `google-services.json` from Firebase Console
2. Place it in: `android/app/google-services.json`
3. The rest is already configured in `android/build.gradle`

### iOS Setup

1. Run `cd ios && pod install && cd ..`
2. iOS configuration is automatic for React Native Firebase

## Next Steps

After installation, the notification service will be fully functional:

- **getDeviceTokenForTesting()** - Get the device's FCM token
- **registerDeviceToken(userId)** - Register the device with the backend
- **requestNotificationPermissionsAndGetToken()** - Request permission and get token
- **setupNotificationListener(callback)** - Listen for incoming notifications
- **subscribeToNotificationTopic(topic)** - Subscribe to notification topics
- **sendTestNotification()** - Send a test notification to this device
- **unregisterDevice(userId)** - Unregister device when user logs out

## Testing Notifications

1. Get the FCM token from `getDeviceTokenForTesting()`
2. Go to the Firebase Console → Cloud Messaging
3. Select your project and create a new notification
4. Paste the FCM token and send
5. The notification should appear on the device

Or use the API endpoint directly:

```bash
curl -X POST http://api.shortsy.app/v1/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "YOUR_FCM_TOKEN_HERE",
    "title": "Test Notification",
    "body": "This is a test notification"
  }'
```
