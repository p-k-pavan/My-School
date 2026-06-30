import admin from "firebase-admin";
import { DeviceToken } from "../models/deviceToken.model.js";

let fcmInitialized = false;

try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        fcmInitialized = true;
        console.log("Firebase Admin SDK initialized successfully via env variables.");
    } else {
        console.warn("FCM Warning: FIREBASE_SERVICE_ACCOUNT_JSON env variable not found. Push notifications will be mocked.");
    }
} catch (error) {
    console.error("FCM Initialization Error: Push notifications will be mocked.", error.message);
}


export const sendPushNotifications = async ({ title, body, data = {}, userIds = [], sendToAll = false }) => {
    if (!fcmInitialized) {
        console.log(`[FCM Mock Send] Title: "${title}", Body: "${body}". Target: ${sendToAll ? "ALL" : userIds.length + " users"}`);
        return { success: true, mocked: true };
    }

    try {
        let query = { isActive: true };
        if (!sendToAll) {
            if (!userIds || userIds.length === 0) {
                return { success: true, sentCount: 0, message: "No target users provided" };
            }
            query.userId = { $in: userIds };
        }

        const deviceTokens = await DeviceToken.find(query).select("token userId deviceId");
        if (deviceTokens.length === 0) {
            return { success: true, sentCount: 0, message: "No active device tokens found for target" };
        }

        const tokenList = [...new Set(deviceTokens.map(dt => dt.token))];

        console.log(`Sending push notification to ${tokenList.length} unique device tokens (Total matching records: ${deviceTokens.length})`);

        const BATCH_SIZE = 500;
        const batches = [];
        for (let i = 0; i < tokenList.length; i += BATCH_SIZE) {
            batches.push(tokenList.slice(i, i + BATCH_SIZE));
        }

        let totalSuccess = 0;
        let totalFailure = 0;
        const tokensToRemove = [];

        for (const batch of batches) {
            const message = {
                tokens: batch,
                notification: {
                    title,
                    body,
                },
                data: {
                    ...data,
                    click_action: "FLUTTER_NOTIFICATION_CLICK", 
                },
                android: {
                    priority: "high",
                    notification: {
                        sound: "default",
                        channelId: "default",
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: "default",
                            badge: 1,
                        }
                    }
                }
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            totalSuccess += response.successCount;
            totalFailure += response.failureCount;

            if (response.failureCount > 0) {
                response.responses.forEach((res, index) => {
                    if (!res.success) {
                        const error = res.error;
                        const token = batch[index];
                        if (error && (
                            error.code === "messaging/registration-token-not-registered" ||
                            error.code === "messaging/invalid-registration-token"
                        )) {
                            tokensToRemove.push(token);
                        } else {
                            console.error(`FCM token delivery failed with error:`, error);
                        }
                    }
                });
            }
        }

        if (tokensToRemove.length > 0) {
            console.log(`Cleaning up ${tokensToRemove.length} stale/invalid FCM tokens from MongoDB...`);
            await DeviceToken.deleteMany({ token: { $in: tokensToRemove } });
        }

        return {
            success: true,
            sentCount: totalSuccess,
            failureCount: totalFailure,
            cleanedCount: tokensToRemove.length
        };

    } catch (error) {
        console.error("Error sending push notifications:", error);
        return { success: false, error: error.message };
    }
};


export const sendPushNotificationsAsync = (params) => {
    setImmediate(async () => {
        try {
            const result = await sendPushNotifications(params);
            console.log("Async Push Notification Result:", result);
        } catch (error) {
            console.error("Async Push Notification failed:", error);
        }
    });
};
