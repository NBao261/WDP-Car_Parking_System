import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { User } from '../models/user.model';
import { logger } from '../config/logger';

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

export class NotificationService {
  /**
   * Gửi thông báo đẩy (Push Notification) đến một user cụ thể
   * @param userId ID của người nhận
   * @param title Tiêu đề thông báo
   * @param body Nội dung thông báo
   * @param data Dữ liệu đính kèm (tùy chọn)
   */
  static async sendPushNotificationToUser(userId: string, title: string, body: string, data?: any): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.deviceToken) {
        logger.info(`Notification: User ${userId} not found or no deviceToken available.`);
        return false;
      }

      const pushToken = user.deviceToken;

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Notification: Push token ${pushToken} is not a valid Expo push token`);
        return false;
      }

      // Create the messages that you want to send to clients
      const messages: ExpoPushMessage[] = [{
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data || {},
      }];

      // The Expo push notification service accepts batches of notifications so
      // that you don't need to send 1000 requests to send 1000 notifications. We
      // recommend you batch your notifications to reduce the number of requests
      // and to compress them (notifications with similar content will get
      // compressed).
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          logger.info(`Notification: Sent chunk successfully`, ticketChunk);
          tickets.push(...ticketChunk);
          // NOTE: If a ticket contains an error code in ticket.details.error, you
          // must handle it appropriately. The error codes are listed in the Expo
          // documentation.
        } catch (error) {
          logger.error(`Notification: Error sending chunk`, error);
        }
      }

      return true;
    } catch (error) {
      logger.error('Notification: Error in sendPushNotificationToUser', error);
      return false;
    }
  }

  /**
   * Lưu hoặc cập nhật deviceToken cho User
   * @param userId ID của User
   * @param token ExpoPushToken
   */
  static async updateDeviceToken(userId: string, token: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { deviceToken: token });
      logger.info(`Notification: Updated deviceToken for user ${userId}`);
    } catch (error) {
      logger.error(`Notification: Error updating deviceToken for user ${userId}`, error);
    }
  }
}
