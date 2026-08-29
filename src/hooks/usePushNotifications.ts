import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';

const BREAKING_NEWS_CHANNEL_ID = 'breaking-news';

function openArticleFromData(data: Record<string, unknown> | undefined) {
  const url = data?.url;
  if (typeof url === 'string' && url) {
    WebBrowser.openBrowserAsync(url);
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  useEffect(() => {
    async function requestUserPermission() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(BREAKING_NEWS_CHANNEL_ID, {
          name: 'Son Dakika Bildirimleri',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      } else if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(getMessaging());
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          console.log('Authorization status:', authStatus);
        }
      }

      // FCM Token for testing
      try {
        const token = await getToken(getMessaging());
        console.log('FCM Token:', token);
      } catch (error) {
        console.error('Failed to get FCM token:', error);
      }
    }

    requestUserPermission();

    // Foreground message handler: on Android, FCM does not auto-display
    // "notification" payloads while the app is foregrounded, so we show it
    // ourselves via a local notification.
    //
    // iOS is deliberately excluded: expo-notifications installs itself as the
    // UNUserNotificationCenter delegate, so setNotificationHandler above already
    // presents the incoming remote notification. Scheduling one here too would
    // show the banner twice.
    const unsubscribeOnMessage = onMessage(getMessaging(), async remoteMessage => {
      if (Platform.OS !== 'android') {
        return;
      }
      const { title, body } = remoteMessage.notification ?? {};
      if (!title && !body) {
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title ?? '',
          body: body ?? '',
          data: remoteMessage.data ?? {},
        },
        trigger: { channelId: BREAKING_NEWS_CHANNEL_ID },
      });
    });

    // Tap handling, foreground-shown path: notifications we displayed ourselves
    // above via scheduleNotificationAsync.
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      openArticleFromData(response.notification.request.content.data as Record<string, unknown>);
    });

    // Tap handling, background path: app was backgrounded (not killed) and the
    // system tray notification (auto-displayed by FCM) was tapped to reopen it.
    const unsubscribeOnOpenedApp = onNotificationOpenedApp(getMessaging(), remoteMessage => {
      openArticleFromData(remoteMessage.data);
    });

    // Tap handling, cold-start path: app was fully killed and got launched by
    // tapping the notification.
    getInitialNotification(getMessaging()).then(remoteMessage => {
      if (remoteMessage) {
        openArticleFromData(remoteMessage.data);
      }
    });

    return () => {
      unsubscribeOnMessage();
      responseSubscription.remove();
      unsubscribeOnOpenedApp();
    };
  }, []);
}
