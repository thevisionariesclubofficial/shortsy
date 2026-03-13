import messaging from '@react-native-firebase/messaging';
// import DeviceInfo from 'react-native-device-info';

export const registerDevice = async () => {
  try {
    console.log('[notificationService] Starting device registration...');

    // Request permission
    console.log('[notificationService] Requesting permissions...');
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("[notificationService] ❌ Notification permission not granted. Status:", authStatus);
      return;
    }

    console.log('[notificationService] ✅ Permission granted. Status:', authStatus);

    // Get FCM token
    console.log('[notificationService] Getting FCM token...');
    const fcmToken = await messaging().getToken();

    // Get device ID
    // const deviceId = DeviceInfo.getUniqueId();

    // console.log("Device ID:", deviceId);
    console.log("[notificationService] ✅ FCM Token acquired:", fcmToken);
    console.log("[notificationService] Token length:", fcmToken?.length, "chars");

    return {
//      deviceId,
      fcmToken
    };

  } catch (error) {
    console.log("[notificationService] ❌ Notification error:", error);
    console.log("[notificationService] Error details:", (error as any)?.message);
  }
};