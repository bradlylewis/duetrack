# Bill Tracker MVP – Notifications Spec

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Draft

---

## Overview

Reminders are delivered via **local notifications** (no backend, no push). The app schedules notifications at specific times and handles permission requests gracefully.

---

## Reminder Schedule

For each bill, the app schedules **two** local notifications:

1. **3 Days Before Due Date** at 9 AM (local time)
   - Title: "Reminder"
   - Body: "[Bill Name] is due in 3 days (due [Date])."
   - Action: Tapping opens app and navigates to bill details.

2. **Day Of Due Date** at 9 AM (local time)
   - Title: "Due Today"
   - Body: "[Bill Name] is due today."
   - Action: Tapping opens app and navigates to bill details.

---

## Assumptions & Edge Cases

### Timezone Handling

- **Device timezone:** The app uses the device's local timezone (from `DateTimeFormat.currentTimeZone()` or equivalent).
- **No manual timezone picker in MVP:** Assume users are in their device's timezone.
- **Daylight Saving Time (DST):**
  - On app launch, run a **sanity check** to reschedule notifications that might have been invalidated by DST transitions.
  - Store the user's timezone string in `bills.timezone` (optional) to detect DST shifts.
  - When editing a bill, recalculate notification times to account for DST.

### Edge Cases

#### 1. Bill Due Date = Today
- **3 days before:** Still valid. Fire at 9 AM today if not already passed.
- **Day of:** Fire at 9 AM today.
- **Result:** User gets reminder at 9 AM on the due date.

#### 2. Bill Due Date = Tomorrow
- **3 days before:** Do NOT fire (negative offset).
- **Day of:** Fire at 9 AM tomorrow.

#### 3. Multiple Notifications on Same Day
- If a user has bills due on the same date, they will receive multiple notifications (one per bill).
- Notifications are fired independently; no deduplication or grouping in MVP.

#### 4. Notification Scheduled in the Past
- When calculating notification times, if the time has already passed today:
  - **Within 3-day window:** Advance notification to tomorrow at 9 AM (or recalculate based on context).
  - **On due date:** Advance to next scheduled time (usually does not occur if app is regularly opened).
- **Sanity check on app launch:** If a notification time is in the past and the bill hasn't been paid, reschedule for the next valid time.

#### 5. Permission Denied
- If notification permission is not granted:
  - Do NOT schedule notifications.
  - Show a **banner** on the Dashboard: "Reminders are disabled. Tap to enable in Settings."
  - User can tap the banner → Opens native Settings app (iOS: Settings > [App Name] > Notifications; Android: Settings > Apps > [App Name] > Notifications).
  - On app launch, re-check permission status. If permission is newly granted, schedule pending reminders.

#### 6. Notification Already Fired
- Once a notification is delivered and the user interacts with it (or dismisses it), no action needed.
- The app does NOT track "notification was read." Reminders are one-time fires.
- If a user doesn't see a notification (e.g., phone in Do Not Disturb), the notification is still cleared from the system.

---

## Notification Scheduling Algorithm

### On Bill Creation / Edit

```pseudocode
function scheduleReminders(bill) {
  if (!isNotificationPermitted()) {
    return; // Skip scheduling; user can enable later
  }

  const dueDate = new Date(bill.dueDate);
  const today = new Date().setHours(0, 0, 0, 0);
  
  // Calculate reminder times
  const threeDaysBefore = new Date(dueDate);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
  threeDaysBefore.setHours(9, 0, 0, 0);
  
  const dayOf = new Date(dueDate);
  dayOf.setHours(9, 0, 0, 0);
  
  // Only schedule if in the future
  const notifications = [];
  
  if (threeDaysBefore > now) {
    const notifId = scheduleLocalNotification({
      trigger: threeDaysBefore,
      title: "Reminder",
      body: `${bill.name} is due in 3 days (due ${formatDate(dueDate)}).`,
      data: { billId: bill.id }
    });
    notifications.push(notifId);
  }
  
  if (dayOf > now) {
    const notifId = scheduleLocalNotification({
      trigger: dayOf,
      title: "Due Today",
      body: `${bill.name} is due today.`,
      data: { billId: bill.id }
    });
    notifications.push(notifId);
  }
  
  // Store notification IDs in DB
  bill.notificationIds = JSON.stringify(notifications);
  updateBillInDB(bill);
}
```

### On Bill Edit

```pseudocode
function rescheduleReminders(bill) {
  // Cancel old notifications
  if (bill.notificationIds) {
    const oldIds = JSON.parse(bill.notificationIds);
    oldIds.forEach(id => cancelNotification(id));
  }
  
  // Schedule new notifications
  scheduleReminders(bill);
}
```

### On App Launch (Sanity Check)

```pseudocode
function sanitizeReminders() {
  const bills = getActiveBills();
  const now = new Date();
  
  bills.forEach(bill => {
    const dueDate = new Date(bill.dueDate);
    const dayOf = new Date(dueDate).setHours(9, 0, 0, 0);
    
    // If due date + 1 day has passed and bill is not paid, reschedule
    if (dayOf + 24*60*60*1000 < now && !hasRecentPayment(bill)) {
      rescheduleReminders(bill);
    }
  });
}
```

---

## DST Handling

### Problem
Daylight Saving Time transitions can invalidate scheduled notification times. For example:
- A notification scheduled for 9 AM on March 12 might become 8 AM if DST starts.
- iOS and Android APIs handle this differently.

### Solution
- **On app launch:** Compare stored timezone (`bill.timezone`) with current timezone.
- **If different:** Assume DST has occurred; reschedule all reminders.
- **Implementation:**
  ```typescript
  const storedTZ = bill.timezone; // e.g., "America/New_York"
  const currentTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (storedTZ !== currentTZ || aDayHasPassed(lastNotificationCheck)) {
    rescheduleReminders(bill);
  }
  ```

---

## User Interactions with Notifications

### Tapping a Notification
- App opens.
- Deep link to bill details screen (based on `billId` in notification data).
- Dashboard is shown briefly, then navigates to bill.

### Dismissing a Notification
- Notification is cleared from system; no action in app.
- Reminder is considered "seen" by the user (best effort).

### Do Not Disturb Mode
- iOS: Notifications are queued and delivered when DND ends.
- Android: Varies by OS version; typically follows system DND settings.
- App does NOT override DND; uses standard system behavior.

---

## Permission Request Flow

### Initial Permission Request

```pseudocode
function initializeNotifications() {
  const status = await requestNotificationPermission();
  
  if (status === "granted") {
    // Schedule any pending reminders
    updateAppMeta("notification_permission_status", "granted");
  } else if (status === "denied") {
    updateAppMeta("notification_permission_status", "denied");
    // Show banner on Dashboard
  }
}
```

### Permission Denied Recovery

```pseudocode
function checkPermissionRecovery() {
  const previousStatus = getAppMeta("notification_permission_status");
  const currentStatus = await getNotificationPermissionStatus();
  
  if (previousStatus === "denied" && currentStatus === "granted") {
    // User went to Settings and enabled notifications
    scheduleAllReminders();
    showToast("Reminders are now enabled.");
  }
}
```

---

## Notification UI Behavior

### Banner (Permission Denied)

**Placement:** Top of Dashboard (dismissible or persistent).

```
┌─────────────────────────────────────────┐
│ 🔔 Reminders disabled                 ✕ │
│ Tap to enable notifications in Settings │
│ [Open Settings]                         │
└─────────────────────────────────────────┘
```

**Action:** Tapping "Open Settings" opens native app settings (iOS or Android).

### Notification Delivered

**iOS:**
```
Due Today
[Bill Name] is due today.
```

**Android:**
```
Due Today
[Bill Name] is due today.
```

---

## Testing Considerations

- **Manual testing:** Use a date/time mocking library to set device time and trigger notifications.
- **Timezone testing:** Set device to different timezones and verify 9 AM fires at local 9 AM.
- **DST testing:** Check behavior around DST transition dates.
- **Permission testing:** Test with permission granted, denied, and post-recovery.
- **Multiple notifications:** Add multiple bills with same due date; verify all reminders fire.

---

## Future Enhancements (Out of MVP Scope)

- Custom reminder times (e.g., 8 AM, 6 PM).
- Multiple reminders per bill (e.g., 7 days before + 3 days before).
- Notification sound customization.
- Quiet hours / Do Not Disturb integration.
- Push notifications from backend (requires accounts).
