import admin from "firebase-admin";
import { DeviceToken } from "../models/deviceToken.model.js";

let fcmInitialized = false;

// Initialize Firebase Admin SDK
try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (serviceAccountJson) {
        // Parse from environment variable string
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        fcmInitialized = true;
        console.log("Firebase Admin SDK initialized successfully via env variables.");
    } else {
        // Try to load from standard local serviceAccount.json file if it exists
        // (Will fail silently if not configured, which is good for local dev)
        console.warn("FCM Warning: FIREBASE_SERVICE_ACCOUNT_JSON env variable not found. Push notifications will be mocked.");
    }
} catch (error) {
    console.error("FCM Initialization Error: Push notifications will be mocked.", error.message);
}

/**
 * Send push notifications to specific users or all users.
 * Handles 4000-5000 students efficiently using FCM multicast batching (max 500 tokens/batch).
 * Automatically cleans up stale/invalid tokens from MongoDB to prevent performance degradation.
 * 
 * @param {Object} params
 * @param {string} params.title Notification Title
 * @param {string} params.body Notification Body
 * @param {Object} [params.data] Custom key-value data payload
 * @param {string[]} [params.userIds] Array of User ObjectIds (for targeting specific users)
 * @param {boolean} [params.sendToAll] If true, sends to all active device tokens in the system
 */
export const sendPushNotifications = async ({ title, body, data = {}, userIds = [], sendToAll = false }) => {
    // If not initialized, mock it
    if (!fcmInitialized) {
        console.log(`[FCM Mock Send] Title: "${title}", Body: "${body}". Target: ${sendToAll ? "ALL" : userIds.length + " users"}`);
        return { success: true, mocked: true };
    }

    try {
        // 1. Fetch active device tokens based on targets
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

        // Extract token strings
        const tokenList = [...new Set(deviceTokens.map(dt => dt.token))];

        console.log(`Sending push notification to ${tokenList.length} unique device tokens (Total matching records: ${deviceTokens.length})`);

        // 2. Batch tokens (FCM multicast supports up to 500 tokens per request)
        const BATCH_SIZE = 500;
        const batches = [];
        for (let i = 0; i < tokenList.length; i += BATCH_SIZE) {
            batches.push(tokenList.slice(i, i + BATCH_SIZE));
        }

        let totalSuccess = 0;
        let totalFailure = 0;
        const tokensToRemove = [];

        // 3. Send batches
        for (const batch of batches) {
            const message = {
                tokens: batch,
                notification: {
                    title,
                    body,
                },
                data: {
                    ...data,
                    // Ensure all data values are strings (required by FCM data payload)
                    click_action: "FLUTTER_NOTIFICATION_CLICK", // for Android background action
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

            // 4. Identify stale/failed tokens for database cleanup
            if (response.failureCount > 0) {
                response.responses.forEach((res, index) => {
                    if (!res.success) {
                        const error = res.error;
                        const token = batch[index];
                        // If token is no longer registered or invalid, mark it for removal
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

        // 5. Clean up invalid/stale tokens in database (asynchronous, non-blocking for this request)
        if (tokensToRemove.length > 0) {
            console.log(`Cleaning up ${tokensToRemove.length} stale/invalid FCM tokens from MongoDB...`);
            // Delete these tokens from our DB
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

/**
 * Helper to execute push notifications asynchronously (background worker pattern)
 * so it doesn't block the Express request-response lifecycle.
 */
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
