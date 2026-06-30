import app from "../config/firebase.js";
import { getMessaging } from "firebase-admin/messaging";
import { DeviceToken } from "../models/deviceToken.model.js";

export const sendPushNotifications = async ({ title, body, data = {}, userIds = [], sendToAll = false }) => {
    try {
        const query = { isActive: true };

        if (!sendToAll) {
            if (!userIds.length) {
                return {
                    success: false,
                    sentCount: 0,
                    failureCount: 0,
                    message: "No target users found.",
                };
            }

            query.userId = { $in: userIds };
        }

        const deviceTokens = await DeviceToken.find(query)
            .select("token")
            .lean();

        if (!deviceTokens.length) {
            return {
                success: false,
                sentCount: 0,
                failureCount: 0,
                message: "No active devices found.",
            };
        }

        const tokenList = [
            ...new Set(deviceTokens.map((d) => d.token)),
        ];

        const BATCH_SIZE = 500;

        let totalSuccess = 0;
        let totalFailure = 0;

        const invalidTokens = [];

        for (let i = 0; i < tokenList.length; i += BATCH_SIZE) {
            const batch = tokenList.slice(i, i + BATCH_SIZE);

            const response =
                await getMessaging(app).sendEachForMulticast({
                    tokens: batch,
                    notification: { title, body },
                    data,
                    android: {
                        priority: "high",
                        notification: {
                            channelId: "default",
                            sound: "default",
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: "default",
                                badge: 1,
                            },
                        },
                    },
                });

            totalSuccess += response.successCount;
            totalFailure += response.failureCount;

            response.responses.forEach((res, index) => {
                if (!res.success) {
                    const errorCode = res.error?.code;

                    if (errorCode === "messaging/registration-token-not-registered" ||
                        errorCode === "messaging/invalid-registration-token") {
                        invalidTokens.push(batch[index]);
                    }
                }
            });
        }

        if (invalidTokens.length) {
            await DeviceToken.deleteMany({
                token: { $in: invalidTokens },
            });
        }

        return {
            success: totalFailure === 0,
            sentCount: totalSuccess,
            failureCount: totalFailure,
            cleanedCount: invalidTokens.length,
        };
    } catch (error) {
        console.error("FCM Error:", error);

        return {
            success: false,
            sentCount: 0,
            failureCount: 0,
            cleanedCount: 0,
            error: error.message,
        };
    }
};

export const sendPushNotificationsAsync = ({ onSuccess, onFailure, ...params }) => {
    setImmediate(async () => {
        try {
            const result =
                await sendPushNotifications(params);

            if (result.success) {
                onSuccess?.(result);
            } else {
                onFailure?.(result);
            }
        } catch (error) {
            console.error(error);

            onFailure?.({
                success: false,
                error: error.message,
            });
        }
    });
};
