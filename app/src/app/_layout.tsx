import { DarkTheme, DefaultTheme, Slot, ThemeProvider, router } from 'expo-router';
import { useColorScheme, View, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import messaging from "@react-native-firebase/messaging";
import notifee, { EventType } from '@notifee/react-native';
import '../global.css';
import {
  createChannel,
  foregroundListener,
  getFcmToken,
  requestPushNotifications,
  showNotifications,
  getOrCreateDeviceId,
  shouldSyncToken,
  markTokenSynced
} from '@/services/PushNotifications';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRegisterDeviceTokenMutation } from '@/redux/api/auth';
import DeviceInfo from 'react-native-device-info';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM Message handled in the background!', remoteMessage);
  await showNotifications(remoteMessage);
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('FCM Notification pressed in background/killed state:', detail.notification);
  }
});


function NotificationSyncWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth) as any;
  const [registerDeviceToken] = useRegisterDeviceTokenMutation();
  const appVersion = DeviceInfo.getVersion();
  const deviceName = DeviceInfo.getDeviceName();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const handleNotificationPress = (data: any) => {
    if (!data || !data.type) return;
    console.log("FCM Notification pressed with data:", data);

    let route = "";
    switch (data.type) {
      case "attendance":
        route = "/dashboard/attendance";
        break;
      case "feed":
        route = "/dashboard/feed";
        break;
      case "homework":
        route = "/dashboard/homework";
        break;
      case "fees":
        route = "/dashboard/fee";
        break;
      case "timetable":
        route = "/dashboard/timetable";
        break;
      default:
        route = "/dashboard";
        break;
    }

    if (route) {
      if (isAuthenticated) {
        console.log("Navigating immediately to:", route);
        setTimeout(() => {
          try {
            router.push(route as any);
          } catch (e) {
            console.error("Navigation error:", e);
          }
        }, 300);
      } else {
        console.log("Not authenticated. Saving pending route:", route);
        setPendingRoute(route);
      }
    }
  };

  useEffect(() => {
    const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const data = detail.notification?.data;
        if (data) {
          handleNotificationPress(data);
        }
      }
    });

    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification) {
        const data = initialNotification.notification?.data;
        if (data) {
          handleNotificationPress(data);
        }
      }
    });

    return () => {
      unsubscribeNotifeeForeground();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && pendingRoute) {
      console.log("User authenticated. Navigating to pending route:", pendingRoute);
      setTimeout(() => {
        try {
          router.push(pendingRoute as any);
          setPendingRoute(null);
        } catch (e) {
          console.error("Navigation error for pending route:", e);
        }
      }, 800);
    }
  }, [isAuthenticated, pendingRoute]);

  useEffect(() => {
    createChannel();

    const unsubscribeForeground = foregroundListener();

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      if (isAuthenticated && user?.id) {
        try {
          const deviceId = await getOrCreateDeviceId();
          await registerDeviceToken({
            token: newToken,
            platform: Platform.OS,
            deviceId,
            deviceName,
            osVersion: Platform.Version,
            appVersion
          }).unwrap();
          await markTokenSynced(newToken, user.id);
          console.log("FCM Token refreshed and synced successfully.");
        } catch (error) {
          console.error("Failed to sync refreshed FCM token:", error);
        }
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const syncToken = async () => {
      if (!isAuthenticated || !user?.id) return;

      const hasPermission = await requestPushNotifications();
      if (!hasPermission) {
        console.log("Push Notification permission denied.");
        return;
      }

      const token = await getFcmToken();
      if (!token) return;

      const needsSync = await shouldSyncToken(token, user.id);
      if (!needsSync) {
        console.log("FCM Token already synced. Skipping.");
        return;
      }

      const deviceId = await getOrCreateDeviceId();

      try {
        console.log("Syncing FCM Token with backend...");
        await registerDeviceToken({
          token,
          platform: Platform.OS,
          deviceId,
          deviceName: `${Platform.OS} Device`,
        }).unwrap();

        await markTokenSynced(token, user.id);
        console.log("FCM Token synced with backend successfully.");
      } catch (error) {
        console.error("Failed to sync FCM Token with backend:", error);
      }
    };

    syncToken();
  }, [isAuthenticated, user?.id]);

  return <>{children}</>;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationSyncWrapper>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1 }}>
              <Slot />
            </View>
          </ThemeProvider>
        </NotificationSyncWrapper>
      </PersistGate>
    </Provider>
  );
}
