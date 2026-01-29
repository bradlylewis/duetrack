import * as Notifications from 'expo-notifications';
import { scheduleNotificationAsync, cancelNotificationAsync } from '../services/notifications';

export interface NotificationTriggerTimes {
  threeDaysBefore: Date;
  dayOf: Date;
}

/**
 * Calculate notification trigger times for a bill
 * Both notifications fire at 9 AM local time
 */
export function calculateNotificationTriggerTimes(dueDate: number): NotificationTriggerTimes {
  const due = new Date(dueDate);
  
  // Day-of notification at 9 AM
  const dayOf = new Date(due);
  dayOf.setHours(9, 0, 0, 0);
  
  // 3 days before at 9 AM
  const threeDaysBefore = new Date(dayOf);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  
  return { threeDaysBefore, dayOf };
}

/**
 * Schedule notifications for a bill
 * Returns array of notification IDs
 */
export async function scheduleBillNotifications(
  billId: string,
  billName: string,
  dueDate: number
): Promise<string[]> {
  try {
    const notificationIds: string[] = [];
    const { threeDaysBefore, dayOf } = calculateNotificationTriggerTimes(dueDate);
    const now = new Date();
    
    // Only schedule if the notification time is in the future
    if (threeDaysBefore > now) {
      const id = await scheduleNotificationAsync(
        threeDaysBefore,
        '📅 Bill Reminder',
        `${billName} is due in 3 days`,
        { billId, type: 'reminder' }
      );
      if (id) notificationIds.push(id);
    }
    
    if (dayOf > now) {
      const id = await scheduleNotificationAsync(
        dayOf,
        '⚠️ Due Today',
        `${billName} is due today!`,
        { billId, type: 'due-today' }
      );
      if (id) notificationIds.push(id);
    }
    
    return notificationIds;
  } catch (error) {
    console.error('Error scheduling bill notifications:', error);
    return [];
  }
}

/**
 * Cancel all notifications for a bill
 */
export async function cancelBillNotifications(notificationIds: string[]): Promise<void> {
  try {
    if (!notificationIds || notificationIds.length === 0) return;
    
    await Promise.all(
      notificationIds.map((id) => cancelNotificationAsync(id))
    );
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Reschedule notifications for a bill (cancel old, schedule new)
 */
export async function rescheduleBillNotifications(
  oldNotificationIds: string[] | null,
  billId: string,
  billName: string,
  newDueDate: number
): Promise<string[]> {
  // Cancel old notifications
  if (oldNotificationIds && oldNotificationIds.length > 0) {
    await cancelBillNotifications(oldNotificationIds);
  }
  
  // Schedule new notifications
  return await scheduleBillNotifications(billId, billName, newDueDate);
}
