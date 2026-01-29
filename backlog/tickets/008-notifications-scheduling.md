# Ticket 008: Notifications – Scheduling & Reminders

**ID:** 008  
**Title:** Implement notification scheduling (3 days before + day-of at 9 AM)  
**Status:** ✅ IMPLEMENTED  
**Complexity:** Medium-High  
**Priority:** P1 (High)

---

## Goal

Fully implement local notification scheduling for bills:
- Schedule two reminders per bill: 3 days before due date and on due date (both at 9 AM local time).
- Store notification IDs in DB for later cancellation/rescheduling.
- Handle DST transitions and timezone edge cases.
- Implement sanity check on app launch to reschedule stale notifications.
- Gracefully handle notifications if permission is denied.

---

## Acceptance Criteria

1. ✅ When a bill is created or due date is changed, notifications are scheduled automatically.
2. ✅ Two notifications scheduled per bill:
   - 3 days before due date at 9 AM local time.
   - Day of due date at 9 AM local time.
3. ✅ Notification content:
   - 3-day reminder: "Reminder: [Bill Name] is due in 3 days (due [Date])."
   - Day-of reminder: "Due Today: [Bill Name] is due today."
4. ✅ Notification IDs are stored in `bills.notificationIds` (as JSON array).
5. ✅ When editing a bill:
   - Old notification IDs are canceled.
   - New notifications are scheduled for new due date.
   - notificationIds field is updated.
6. ✅ When deleting a bill:
   - All notification IDs are canceled.
7. ✅ Tapping a notification opens app and navigates to bill details (deep linking).
8. ✅ On app launch:
   - Sanity check: verify all scheduled notifications are still pending (not stale).
   - If notification time has passed and bill has not been paid, reschedule.
9. ✅ DST Handling:
   - Store timezone in `bills.timezone` for reference.
   - Detect timezone changes on app launch.
   - If timezone changed or DST transition detected, reschedule notifications.
10. ✅ If notification permission is denied:
    - Skip scheduling; do not throw errors.
    - Log warning.
11. ✅ Error handling:
    - If scheduling fails, log error; do not crash app.
    - Bill is still created/saved; just without reminders.
12. ✅ Notifications actually fire at the scheduled time (manual testing).

---

## Manual Test Steps

1. **Create Bill & Verify Notification Scheduled:**
   - Create a bill due 5 days from now.
   - Check app logs or use `Notifications.getScheduledNotificationsAsync()` to verify two notifications are pending.
   - Verify notification IDs are stored in DB.

2. **Edit Bill & Verify Reschedule:**
   - Edit bill: change due date to 10 days from now.
   - Verify old notification IDs are canceled.
   - Verify new notification IDs are generated and stored.
   - Verify new notifications are pending (via logs or API).

3. **Delete Bill & Verify Cancel:**
   - Create a bill.
   - Delete the bill.
   - Verify notification IDs are canceled (not pending).

4. **Notification Fires (3 Days Before):**
   - Create a bill due exactly 3 days from now at 9 AM local time.
   - Wait for 9 AM on that date (or use time manipulation if simulator allows).
   - Verify notification fires with correct title/body.
   - Verify notification is clearable (user can dismiss).

5. **Notification Fires (Day Of):**
   - Create a bill due tomorrow at 9 AM local time.
   - Wait for 9 AM tomorrow.
   - Verify notification fires with correct title/body.

6. **Notification Tap Navigation:**
   - (With notification firing) Tap notification.
   - Verify app opens and navigates to bill details.

7. **Sanity Check on App Launch:**
   - Create a bill due 3 days from now.
   - Set device time forward by 3 days (simulate time passing).
   - Close and reopen app.
   - Verify app detects stale notifications and reschedules (or handles gracefully).
   - Verify no duplicate notifications.

8. **DST Transition Test (If Feasible):**
   - Create a bill due on a DST transition date.
   - Simulate DST transition (set device time to transition moment).
   - Reopen app.
   - Verify notifications are still correct (9 AM local time is maintained).

9. **Permission Denied:**
   - Deny notification permission (clear app data, deny on permission dialog).
   - Create a bill.
   - Verify no errors; bill is created without notifications.
   - Verify in logs that scheduling was skipped.

10. **Multiple Bills Same Due Date:**
    - Create 3 bills all due on same date.
    - Verify 6 notifications total are scheduled (2 per bill).
    - Verify all fire correctly (at 9 AM).

11. **Timezone Change:**
    - Create a bill due tomorrow at 9 AM in current timezone.
    - Change device timezone (if simulator allows).
    - Reopen app.
    - Verify notifications are adjusted for new timezone.

---

## Files Likely Touched / Created

```
src/
├── services/
│   ├── notifications.ts (update with scheduling logic)
│   └── (existing services)
├── utils/
│   ├── notification-scheduling.ts (new; scheduling logic)
│   ├── notification-times.ts (new; calculate trigger times)
│   └── timezone-detection.ts (new; detect timezone changes)
├── db/
│   └── queries.ts (update to handle notificationIds)
└── types/
    └── notifications.ts (new; Notification types & interfaces)
```

---

## Notification Scheduling Logic

### Calculate Trigger Times

```typescript
function calculateNotificationTriggerTimes(dueDate: number): {
  threeDaysBefore: Date;
  dayOf: Date;
} {
  const due = new Date(dueDate);
  
  // 3 days before at 9 AM
  const threeDaysBefore = new Date(due);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  threeDaysBefore.setHours(9, 0, 0, 0);
  
  // Day of at 9 AM
  const dayOf = new Date(due);
  dayOf.setHours(9, 0, 0, 0);
  
  return { threeDaysBefore, dayOf };
}
```

### Schedule Notifications

```typescript
async function scheduleReminders(bill: Bill): Promise<string[]> {
  // Check permission
  const permission = await getNotificationPermission();
  if (!permission) {
    console.warn(`Notification permission denied; skipping scheduling for bill ${bill.id}`);
    return [];
  }
  
  const { threeDaysBefore, dayOf } = calculateNotificationTriggerTimes(bill.dueDate);
  const now = new Date();
  
  const notificationIds: string[] = [];
  
  try {
    // Schedule 3-day reminder
    if (threeDaysBefore > now) {
      const id = await Notifications.scheduleNotificationAsync({
        trigger: {
          type: 'date',
          date: threeDaysBefore,
        },
        content: {
          title: 'Reminder',
          body: `${bill.name} is due in 3 days (due ${formatDate(bill.dueDate)}).`,
          data: { billId: bill.id },
        },
      });
      notificationIds.push(id);
    }
    
    // Schedule day-of reminder
    if (dayOf > now) {
      const id = await Notifications.scheduleNotificationAsync({
        trigger: {
          type: 'date',
          date: dayOf,
        },
        content: {
          title: 'Due Today',
          body: `${bill.name} is due today.`,
          data: { billId: bill.id },
        },
      });
      notificationIds.push(id);
    }
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
  
  return notificationIds;
}
```

### Reschedule Notifications

```typescript
async function rescheduleReminders(bill: Bill): Promise<void> {
  // Cancel old notifications
  if (bill.notificationIds) {
    const oldIds = JSON.parse(bill.notificationIds);
    for (const id of oldIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (error) {
        console.warn(`Error canceling notification ${id}:`, error);
      }
    }
  }
  
  // Schedule new notifications
  const newIds = await scheduleReminders(bill);
  
  // Update DB
  await updateBill(bill.id, {
    notificationIds: JSON.stringify(newIds),
    updatedAt: Date.now(),
  });
}
```

### Sanity Check on App Launch

```typescript
async function sanitizeNotifications(): Promise<void> {
  try {
    const bills = await getAllBills();
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = new Set(scheduledNotifications.map(n => n.identifier));
    
    for (const bill of bills) {
      if (bill.status === 'completed') {
        // Completed bills should have no notifications
        if (bill.notificationIds) {
          const ids = JSON.parse(bill.notificationIds);
          for (const id of ids) {
            await Notifications.cancelScheduledNotificationAsync(id);
          }
          await updateBill(bill.id, { notificationIds: null });
        }
      } else if (bill.status === 'active') {
        // Active bills should have valid notifications
        const storedIds = bill.notificationIds ? JSON.parse(bill.notificationIds) : [];
        const missingIds = storedIds.filter(id => !scheduledIds.has(id));
        
        if (missingIds.length > 0 || storedIds.length === 0) {
          // Reschedule
          await rescheduleReminders(bill);
        }
      }
    }
    
    // Update last sanity check time
    await setAppMeta('last_notification_sanity_check', Date.now().toString());
  } catch (error) {
    console.error('Error sanitizing notifications:', error);
  }
}
```

---

## Deep Linking for Notifications

### Notification Listener

```typescript
function setupNotificationListeners() {
  // When notification is tapped
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { billId } = response.notification.request.content.data;
    
    if (billId) {
      // Navigate to bill details
      navigationRef.navigate('BillDetails', { billId });
    }
  });
  
  return subscription;
}
```

---

## Timezone & DST Handling

### Detect Timezone Change

```typescript
async function detectTimezoneChange() {
  const currentTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const storedTZ = await getAppMeta('current_timezone');
  
  if (storedTZ && storedTZ !== currentTZ) {
    console.log(`Timezone changed from ${storedTZ} to ${currentTZ}; reschedule notifications`);
    
    // Reschedule all active bills
    const bills = await getBillsByStatus('active');
    for (const bill of bills) {
      await rescheduleReminders(bill);
    }
    
    await setAppMeta('current_timezone', currentTZ);
  } else if (!storedTZ) {
    await setAppMeta('current_timezone', currentTZ);
  }
}
```

---

## Assumptions

1. **9 AM Local Time:** Notifications always fire at 9 AM in the device's local timezone.
2. **No Silent Mode Override:** Notifications respect system notification settings (silent mode, Do Not Disturb).
3. **No Custom Notification Sounds:** MVP uses default notification sound.
4. **Notification ID Storage:** IDs are stored as JSON string for simplicity.
5. **Single Timezone:** No multi-timezone support (assume user stays in one timezone).
6. **No Repeat Notifications:** After notification fires, it's gone (no repeat if dismissed).
7. **Deep Linking:** Tapping notification opens app and navigates to bill details.

---

## Definition of Done

- ✅ Notifications scheduled on bill creation.
- ✅ Reminders scheduled for 3 days before + day-of (both at 9 AM).
- ✅ Notification IDs stored in DB.
- ✅ Rescheduling works on bill edit.
- ✅ Cancellation works on bill delete.
- ✅ Sanity check implemented and runs on app launch.
- ✅ DST/timezone handling in place.
- ✅ Permission denied handled gracefully.
- ✅ Error handling throughout.
- ✅ Notifications fire at correct times (manual testing).
- ✅ Tapping notification navigates to bill details (deep linking).
- ✅ TypeScript passes; ESLint passes.
- ✅ Manual test steps all pass.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Use `expo-notifications` for all scheduling and management.
- Test with actual device time advancement (simulator or real device).
- Store notification IDs as JSON in DB for easy serialization/deserialization.
- Run sanity check on app launch via `useFocusEffect` or app initialization.
- Handle edge cases: bill due in 1 day, bill due today, bill due in 3 days, etc.
- Test DST transitions (if simulator supports time manipulation).
- Use deep linking to navigate from notification tap to bill details.
- Consider adding a log/debug mode to print scheduled notifications.
