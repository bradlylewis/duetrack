import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import { getAppMeta, setAppMeta } from '../db/database';

export async function initializeNotifications(): Promise<void> {
  try {
    // Request permission
    const permission = await Notifications.requestPermissionsAsync();
    const isGranted =
      permission.granted ||
      (Platform.OS === 'ios' &&
        permission.ios?.status ===
          Notifications.IosNotificationPermissionStatus.PROVISIONAL);

    console.log(`Notification permission: ${isGranted ? 'granted' : 'denied'}`);

    // Store permission status
    await setAppMeta('notification_permission_status', isGranted ? 'granted' : 'denied');

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'unknown'> {
  try {
    const status = await getAppMeta('notification_permission_status');
    return (status as 'granted' | 'denied' | 'unknown') || 'unknown';
  } catch (error) {
    console.error('Error getting notification permission status:', error);
    return 'unknown';
  }
}

export async function checkAndUpdatePermissionStatus(): Promise<'granted' | 'denied'> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    const isGranted = status === 'granted';
    await setAppMeta('notification_permission_status', isGranted ? 'granted' : 'denied');
    return isGranted ? 'granted' : 'denied';
  } catch (error) {
    console.error('Error checking permission status:', error);
    return 'denied';
  }
}

export async function openNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error('Error opening settings:', error);
  }
}

export async function scheduleNotificationAsync(
  trigger: Notifications.NotificationTriggerInput,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      trigger,
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
    });
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelNotificationAsync(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error(`Error canceling notification ${notificationId}:`, error);
  }
}

export async function getScheduledNotificationsAsync(): Promise<
  Notifications.ScheduledLocalNotification[]
> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

export function setupNotificationListeners(onNotificationTapped: (billId: string) => void): void {
  // When notification is tapped
  Notifications.addNotificationResponseReceivedListener((response) => {
    const billId = response.notification.request.content.data?.billId;
    if (billId) {
      onNotificationTapped(billId);
    }
  });
}
