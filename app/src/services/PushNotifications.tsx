import { PermissionsAndroid, Platform } from "react-native";
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestPushNotifications = async () => {
    try {
        if (Platform.OS === "android" && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else if (Platform.OS === "ios") {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            return enabled;
        }
        return true;
    } catch (error) {
        console.error("Error requesting push notification permission:", error);
        return false;
    }
}

export const getOrCreateDeviceId = async (): Promise<string> => {
    try {
        let deviceId = await AsyncStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
            await AsyncStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    } catch (error) {
        console.error("Error getting or creating device ID:", error);
        return 'device_fallback_' + Date.now().toString(36);
    }
}

export const getFcmToken = async (): Promise<string | null> => {
    try {
        const token = await messaging().getToken();
        return token;
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
}

export const shouldSyncToken = async (token: string, userId: string): Promise<boolean> => {
    try {
        const cachedInfoStr = await AsyncStorage.getItem('last_synced_token_info');
        if (cachedInfoStr) {
            const cachedInfo = JSON.parse(cachedInfoStr);
            if (cachedInfo.token === token && cachedInfo.userId === userId) {
                return false;
            }
        }
    } catch (err) {
        console.error("Error reading cached token info:", err);
    }
    return true;
}

export const markTokenSynced = async (token: string, userId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(
            'last_synced_token_info',
            JSON.stringify({ token, userId, syncedAt: new Date().toISOString() })
        );
    } catch (err) {
        console.error("Error saving cached token info:", err);
    }
}

export const clearSyncedTokenInfo = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('last_synced_token_info');
    } catch (err) {
        console.error("Error clearing cached token info:", err);
    }
}

export const createChannel = async () => {
    try {
        await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: AndroidImportance.HIGH,
            sound: 'message_sound',
            vibration: true,
        });
    } catch (error) {
        console.error("Error creating Notifee channel:", error);
    }
}

export const showNotifications = async (remoteMessage: any) => {
    try {
        const { notification, data } = remoteMessage;

        const title = notification?.title || data?.title || "New Message";
        const body = notification?.body || data?.body || "";

        await notifee.displayNotification({
            title,
            body,
            android: {
                channelId: 'default',
                pressAction: {
                    id: 'default'
                }
            }
        });
    } catch (error) {
        console.error("Error displaying notification:", error);
    }
}

export const foregroundListener = () => {
    return messaging().onMessage(async remoteMessage => {
        console.log("FCM Foreground message received:", remoteMessage);
        await showNotifications(remoteMessage);
    });
}