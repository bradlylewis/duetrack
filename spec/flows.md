# Bill Tracker MVP – User Flows

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Draft

---

## Flow 1: Onboarding (First Launch)

1. App opens.
2. Dashboard shows empty state with message: "No bills yet. Add your first bill to get started."
3. User taps "Add Bill" button.
4. → Proceeds to **Flow 2: Add Bill**.

---

## Flow 2: Add Bill

1. User on Dashboard or after onboarding.
2. Taps "Add Bill".
3. **Add Bill screen** appears with empty form:
   - Name field (text input).
   - Due date picker (calendar or date picker).
   - Amount field (optional, decimal input).
   - Frequency dropdown (One-time / Monthly).
   - Autopay toggle (on/off, default off).
   - Notes field (text, optional).
   - Icon picker (user must select one; required).
4. User fills in fields.
5. Taps icon picker → Opens **icon picker modal** (grid of 20–40 icons).
6. User selects an icon.
7. User taps "Save".
8. **Backend (DB + Notifications):**
   - Insert bill into DB.
   - Calculate notification dates (3 days before due date + day-of due date, both at 9 AM local).
   - Schedule notifications using expo-notifications.
   - Store notification IDs in bill record.
9. App returns to Dashboard.
10. New bill appears in appropriate group (Overdue / Due This Week / Due Later).

---

## Flow 3: View Dashboard

1. User opens app or taps "Dashboard" tab.
2. Dashboard loads; bills are grouped and sorted:
   - **Overdue:** Bills with due_date < today (sorted oldest first).
   - **Due This Week:** Bills with due_date between today and today + 7 days (sorted by date).
   - **Due Later:** Bills with due_date > today + 7 days (sorted by date).
3. Each group shows count badge (e.g., "2 Overdue", "0 Due This Week").
4. Each bill card shows:
   - Icon (from built-in set).
   - Bill name.
   - Due date (human-readable, e.g., "Due Jan 30").
   - Amount (if set).
   - Autopay badge (if enabled).
5. User can:
   - Tap bill → Opens bill details (**Flow 4**).
   - Tap "Add Bill" button → (**Flow 2**).
   - Tap Settings → Opens notification settings (future).

---

## Flow 4: View Bill Details

1. User taps a bill on Dashboard.
2. **Bill Details screen** shows:
   - Full bill info (name, due date, amount, frequency, autopay, notes, icon).
   - Payment history (table of past payments: paid_date, amount_paid).
   - Action buttons: "Mark Paid", "Edit", "Delete".
3. User can:
   - Tap "Mark Paid" → (**Flow 5**).
   - Tap "Edit" → (**Flow 6**).
   - Tap "Delete" → Shows confirmation. If confirmed, deletes bill and cancels reminders.
   - Swipe back / tap back button to return to Dashboard.

---

## Flow 5: Mark Bill as Paid

1. User on Bill Details (or bill card on Dashboard, long-press action).
2. Taps "Mark Paid".
3. **For Monthly Bills:**
   - Create payment record (timestamp, amount_paid = bill.amount or user-entered).
   - Advance bill.due_date by 1 month (applying rollover rule if needed; see ADR-002).
   - Reschedule notifications for new due date.
   - Bill moves to appropriate group based on new due date.
4. **For One-Time Bills:**
   - Create payment record.
   - Mark bill as status = "completed" (or hidden flag).
   - Remove from upcoming view.
   - Keep in DB for history; show in a "Completed Bills" or "History" tab (future).
5. Show toast/confirmation: "Bill marked as paid."
6. Return to Dashboard or Bill Details (refreshed).

---

## Flow 6: Edit Bill

1. User on Bill Details.
2. Taps "Edit".
3. **Edit Bill screen** appears with current bill data pre-filled.
4. User modifies field(s) (name, due date, amount, frequency, autopay, notes, icon).
5. Taps "Save".
6. **Backend:**
   - Update bill in DB.
   - Cancel old notification IDs.
   - Recalculate and reschedule notifications based on new due date.
   - Store new notification IDs.
7. Return to Dashboard or Bill Details (refreshed).

---

## Flow 7: Permission Check (Notifications)

1. On app launch or first time "Add Bill" is tapped:
   - Request notification permission (iOS: `expo-notifications.requestPermissionsAsync()`).
2. **If granted:**
   - Proceed normally; schedule reminders for bills.
3. **If denied:**
   - Show banner on Dashboard: "Reminders are disabled. Go to Settings to enable notifications."
   - Banner has "Open Settings" button.
   - Tapping it opens native Settings app (iOS: Settings > [App Name] > Notifications; Android: Settings > Apps > [App Name] > Permissions).
   - Bill functionality works normally; just no reminders.

---

## Flow 8: App Lifecycle (Sanity Check on Open)

1. App launches or comes to foreground.
2. Background task runs:
   - Load all active bills.
   - For each bill: check if scheduled notification IDs are still valid/pending.
   - If notification is stale (e.g., due date passed, no payment record exists), reschedule.
3. Dashboard updates to reflect any changes.

---

## Flow 9: Notification Trigger (User Receives Reminder)

1. At 9 AM local time, 3 days before bill due date:
   - Local notification fires: "Reminder: [Bill Name] due in 3 days."
   - Tapping notification opens app and navigates to bill details or dashboard.
2. At 9 AM local time, on bill due date:
   - Local notification fires: "[Bill Name] is due today."
   - Tapping notification opens app.

---

## Flow 10: Handle Monthly Rollover (Dates Edge Cases)

**Scenario:** Bill due on Jan 31 (monthly). User marks as paid on Jan 25.
- New due date should be Feb 28 (or Feb 29 in leap year), not Feb 31 (invalid).
- Logic: If original day-of-month > days in next month, set to last day of next month.
- See **ADR-002** for detailed rollover rules.

---

## Flow 11: Delete Bill

1. User on Bill Details.
2. Taps "Delete".
3. Confirmation dialog: "Are you sure? This cannot be undone."
4. If confirmed:
   - Cancel all scheduled notification IDs.
   - Delete bill and associated payment records from DB (or soft-delete).
   - Return to Dashboard.
5. If cancelled, stay on Bill Details.

---

## Assumptions & Notes

- **Timezone:** Bill reminders fire at 9 AM in the user's local timezone. The app uses the device timezone (no manual timezone picker in MVP).
- **Payment amount:** When marking a bill as paid, the amount_paid defaults to bill.amount. User can override if needed (future enhancement).
- **Recurring behavior:** Monthly bills recur indefinitely until deleted. One-time bills do not recur.
- **Overdue logic:** A bill is overdue if due_date < today and it has no recent payment record (paid_date is nil or older than some threshold, e.g., > 7 days ago). This prevents showing a bill as "overdue" for days after it's paid.
- **Empty states:** Every screen that could be empty (e.g., "Overdue" section, "History" tab) shows a friendly, clear empty state message.
