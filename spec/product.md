# Bill Tracker MVP – Product Spec

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Draft

---

## Overview

Bill Tracker is a mobile-first app (iOS + Android) designed to reduce anxiety around bill payment and prevent missed payments. The MVP focuses on core functionality: adding bills, viewing upcoming bills, marking them as paid, and receiving local reminders.

**Key Promise:** A minimal, anxiety-reducing app that prevents you from forgetting to pay bills.

---

## MVP Scope (IN SCOPE)

### 1. Bills Management
Users can:
- **Add bills** with: name, due date, amount (optional), frequency (one-time or monthly), autopay (boolean), notes (optional), and icon (required, chosen from built-in set).
- **Edit bills** – change any field and reschedule notifications automatically.
- **Delete bills** – remove from the app and cancel scheduled reminders.
- **View bill details** – open a bill to see full metadata and payment history.

### 2. Dashboard ("Upcoming Bills")
- **Grouped view** by urgency:
  - **Overdue** – bills past due date (sorted by oldest first).
  - **Due This Week** – due within the next 7 days.
  - **Due Later** – everything else (sorted by due date ascending).
- Each group shows a count badge.
- **Empty states** for each section (clear, friendly messaging).
- **Sort:** Within each group, bills are sorted by due date (earliest first).
- **Quick view:** Show bill name, due date, amount, autopay badge, and icon.

### 3. Mark as Paid
- **Action:** Tap "Mark Paid" on any bill.
- **Outcome:**
  - Create a **payment record** (timestamp, amount paid).
  - For **monthly bills:** Advance due date to next month (respecting rollover rule; see ADR).
  - For **one-time bills:** Mark as completed; hide from upcoming view by default.
  - **Payment history:** Always accessible (visible in bill details or separate history view).

### 4. Local Notifications
- **Reminder schedule:**
  - 3 days before due date (at 9 AM local time).
  - On the day due (at 9 AM local time).
- **Behavior:**
  - Only if notifications permission is granted.
  - Gracefully show a banner if permission is denied.
  - Reschedule automatically when bill is edited.
  - Sanity-check reminders on app open (reschedule if stale).
- **No silent/deep notifications;** opt for user-visible local notifications.

### 5. Built-in Icons
- **Icon set:** 20–40 common bill icons (e.g., electricity, water, internet, phone, rent, insurance, gas, etc.).
- **Icon picker:** Simple list/grid UI on bill creation/edit.
- **Storage:** Icon key stored in DB (no external logo fetching in MVP).
- **No defaults:** User must select an icon (required field).

---

## MVP Scope (OUT OF SCOPE)

- ❌ Bank integrations or account linking.
- ❌ Budgeting, spending analytics, or insights.
- ❌ User accounts, login, or cloud sync.
- ❌ Sharing or household management.
- ❌ Advanced recurrence (biweekly, custom intervals, recurring on specific days of month).
- ❌ Public logo search or external icon APIs.
- ❌ Payment processing or in-app payments.
- ❌ Web app or desktop version.
- ❌ Landscape orientation support (portrait only initially).
- ❌ Dark mode (can add as polish if time permits).

---

## Screens (User-Facing)

1. **Dashboard / Upcoming Bills** (Home)
   - Tab or default screen.
   - Lists bills grouped by urgency.
   - "Add Bill" button.
   - Settings button (optional, can open notification settings placeholder).

2. **Add Bill**
   - Form: name, due date picker, amount, frequency dropdown, autopay toggle, notes, icon picker.
   - Save / Cancel buttons.

3. **Edit Bill**
   - Same as Add but populated with current bill data.
   - Delete button (with confirmation).
   - Save / Cancel.

4. **Bill Details / Payment History**
   - Show bill info (name, due date, amount, frequency, autopay, notes, icon, payment history).
   - "Mark Paid" button (if not paid recently).
   - "Edit" and "Delete" buttons.
   - List of past payments (paid_date, amount_paid).

5. **Icon Picker**
   - Standalone or modal; show 20–40 icons in grid.
   - Tap to select; highlight selected icon.
   - Confirm / Close.

6. **Notification Banner** (if permission denied)
   - Explain why reminders are useful.
   - "Settings" button to open iOS/Android notification settings.

---

## Key Decisions / Assumptions

- **No accounts/login:** App is local-first; all data stored on device.
- **SQLite for data:** Via Expo SQLite for maximum compatibility.
- **Local notifications only:** No backend, no push; using expo-notifications.
- **Single timezone handling:** Assume user is in one timezone; record and persist timezone with bill if needed.
- **Monthly rollover rule:** If a bill is due on the 31st and user pays it in February, the next due date is Feb 28/29 (last day of month). See ADR-002 for rationale.
- **No internet requirement:** MVP works fully offline.
- **Portrait orientation:** iOS/Android phones in portrait; landscape not supported initially.

---

## Monetization (Future, Not MVP)

- Eventually: **Free tier** (5 bills max) + **Pro** ($1.99/mo or $9.99/yr for unlimited bills + future features).
- For MVP: Unlimited bills, no paywall, focus on core retention.

---

## Success Metrics (Post-Launch)

- Users add >= 2 bills.
- Reminders are enabled and working.
- Bills are marked as paid after due date (proof of core behavior).
- Low uninstall rate in first 30 days.

---

## Non-Functional Requirements

- **Performance:** App launches in <2 seconds.
- **Accessibility:** Button sizes >= 44x44 pt (iOS); text >= 12pt.
- **Reliability:** No crashes; graceful error handling for notification errors.
- **Battery:** Notifications should not drain battery (use standard iOS/Android APIs).
- **Data safety:** No data is sent to external servers; app can be uninstalled and reinstalled (data persisted locally).
