# Bill Tracker MVP – QA Test Plan

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Draft

---

## Overview

This document outlines the comprehensive test plan for Bill Tracker MVP. It covers functional testing, edge cases, performance, and accessibility. QA should execute these tests on both iOS and Android, across multiple device sizes.

---

## Test Environment

- **iOS:** iPhone 12, iPhone SE (small screen), iPhone 14 Pro Max (large screen). OS versions: iOS 14, iOS 17 (latest).
- **Android:** Pixel 6 (modern), Pixel 3 (older, ~API 30). OS versions: Android 12, Android 14 (latest).
- **Simulators:** Can be used for initial testing; real devices for final validation.

---

## Test Categories

### 1. Functional Testing (Core Features)

#### 1.1 Bills CRUD

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Add Bill – Happy Path** | 1. Tap "Add Bill" 2. Fill all fields 3. Tap Save | Bill appears on Dashboard in correct group | P0 |
| **Add Bill – Validation** | 1. Leave name empty, tap Save | Error shown: "Name is required" | P0 |
| | 1. Leave due date empty, tap Save | Error shown: "Due date is required" | P0 |
| | 1. Leave icon unselected, tap Save | Error shown: "Please select an icon" | P0 |
| **Add Bill – Optional Fields** | 1. Add bill without amount 2. Add without notes | Bill saved; no errors | P0 |
| **Edit Bill** | 1. Tap bill → Edit 2. Change name 3. Save | Bill updated on Dashboard; old name replaced | P0 |
| **Edit Bill – Reschedule Notifications** | 1. Edit bill due date 2. Verify reminders rescheduled | Reminders scheduled for new due date | P1 |
| **Delete Bill** | 1. Tap bill → Delete 2. Confirm | Bill removed from Dashboard; reminders canceled | P0 |
| **Delete Bill – Cancel** | 1. Tap bill → Delete 2. Tap Cancel | Bill remains; no changes | P0 |

#### 1.2 Dashboard – Upcoming Bills

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Empty Dashboard** | 1. Fresh install 2. View Dashboard | "No bills yet. Add your first bill…" message | P0 |
| **Bill Grouping – Overdue** | 1. Add bill due yesterday 2. View Dashboard | Bill in "Overdue" group | P0 |
| **Bill Grouping – This Week** | 1. Add bills due today, tomorrow, 3 days, 7 days 2. View Dashboard | Bills in "Due This Week" group (sorted by date) | P0 |
| **Bill Grouping – Later** | 1. Add bill due 10 days from now 2. View Dashboard | Bill in "Due Later" group | P0 |
| **Sorting Within Group** | 1. Add multiple bills to same group 2. Check sort order | Bills sorted by due date (earliest first) | P0 |
| **Group Count Badges** | 1. Add 3 overdue bills 2. Check badge | Badge shows "3 Overdue" | P0 |
| **Empty Group States** | 1. Verify "Overdue" section (if no overdue bills) | "No overdue bills" message shown | P0 |
| **Pull to Refresh** | 1. On Dashboard, pull down 2. Release | Refresh spinner shows; bills reload | P0 |
| **Dashboard Update on Return** | 1. Add bill 2. Return to Dashboard | New bill appears immediately | P0 |

#### 1.3 Mark Paid (Monthly Bills)

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Mark Monthly Bill Paid** | 1. Create monthly bill due Jan 31 2. Tap "Mark Paid" | Payment recorded; bill due date → Feb 28 | P0 |
| **Payment History** | 1. Mark bill paid 2. View bill details | Payment listed in history (date, amount) | P0 |
| **Monthly Rollover – Valid Date** | 1. Bill due Mar 31 2. Mark paid | Next due: Apr 30 | P0 |
| **Monthly Rollover – Month-End** | 1. Bill due Jan 31, mark paid in Jan 2. Check next due | Next due: Feb 28 (or Feb 29 leap year) | P1 |
| **Multiple Monthly Payments** | 1. Mark monthly bill paid 2 months in a row | 2 payments in history; bill due date advances each time | P0 |

#### 1.4 Mark Paid (One-Time Bills)

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Mark One-Time Bill Paid** | 1. Create one-time bill 2. Mark paid | Payment recorded; bill status → "completed" | P0 |
| **One-Time Disappears from Dashboard** | 1. (Cont'd) 2. Return to Dashboard | Bill no longer in upcoming groups | P0 |
| **One-Time in History Tab (Future)** | 1. (Future feature) | Completed bills accessible in History | P2 |

#### 1.5 Notifications – Permission Flow

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Permission Request on Launch** | 1. Fresh install 2. Launch app | Permission dialog appears | P1 |
| **Permission Granted** | 1. Tap "Allow" in dialog | No banner; reminders enabled | P1 |
| **Permission Denied – Banner** | 1. Tap "Don't Allow" 2. View Dashboard | Banner shows: "Reminders are disabled…" | P1 |
| **Permission Denied – Settings Link** | 1. Tap "Open Settings" in banner 2. Enable notifications | Returns to app; banner disappears on refresh | P1 |
| **Permission Recovery** | 1. Deny permission 2. Manually enable in Settings 3. Reopen app | App detects permission granted; banner disappears | P1 |

#### 1.6 Notifications – Scheduling

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Reminders Scheduled on Bill Create** | 1. Create bill due 5 days from now 2. Check scheduled notifications | 2 notifications pending (3-day + day-of) | P1 |
| **Reminder – 3 Days Before** | 1. Create bill due exactly 3 days from now at 9 AM 2. Wait for 9 AM | Notification fires with correct title/body | P1 |
| **Reminder – Day Of** | 1. Create bill due tomorrow at 9 AM 2. Wait for 9 AM | Notification fires with correct title/body | P1 |
| **Notification Tap Navigation** | 1. Tap notification 2. App opens | Navigates to bill details | P1 |
| **Edit Bill – Reschedule** | 1. Create bill 2. Edit due date 3. Check notifications | Old notifications canceled; new ones scheduled | P1 |
| **Delete Bill – Cancel Reminders** | 1. Create bill 2. Delete 3. Check notifications | Notifications canceled (not pending) | P1 |

#### 1.7 Icon Picker

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Icon Picker Modal** | 1. Add Bill 2. Tap icon selector 3. Check modal | Icon grid displays (4–6 columns, all icons visible) | P1 |
| **Icon Selection** | 1. Tap an icon 2. Check highlight | Icon highlighted; others not | P1 |
| **Icon Confirm** | 1. Select icon 2. Tap "Done" | Modal closes; icon shown in form | P1 |
| **Icon Display on Bill Card** | 1. Save bill with icon 2. View Dashboard | Icon displays correctly on bill card | P1 |
| **Icon Display on Bill Details** | 1. Tap bill 2. View details | Icon prominent on details screen | P1 |

---

### 2. Edge Cases & Special Scenarios

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Long Bill Names** | 1. Create bill name (80+ chars) 2. View on Dashboard | Name wraps or truncates gracefully (no layout break) | P1 |
| **Very Large Amounts** | 1. Create bill with amount $999,999.99 2. View | Amount displays correctly | P2 |
| **Empty Notes** | 1. Create bill without notes 2. View details | Notes section empty or "No notes" | P0 |
| **Past Due – After Payment** | 1. Add bill due yesterday 2. Check grouping 3. Mark paid 4. Check grouping | Appears overdue until paid; disappears after payment | P1 |
| **Bills Due Today** | 1. Add bill due today 2. View dashboard 3. Check time | Appears in "Due This Week" (or special handling) | P0 |
| **Recurring Bills – Multiple in One Day** | 1. Add 3 monthly bills all due on 31st 2. View overdue after a month | All 3 show as due/overdue together | P1 |

---

### 3. Timezone & DST Testing

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Timezone – 9 AM Notification** | 1. Create bill 2. Set device timezone 3. Check notification time | Notification fires at 9 AM local time (not UTC) | P1 |
| **DST Transition** | 1. Create bill due on DST transition date 2. Simulate DST shift 3. Reopen app | Reminders adjusted for new local time (no duplicate/miss) | P1 |
| **Timezone Change** | 1. Create bill in TZ-A 2. Change device to TZ-B 3. Reopen app | Notifications recalculated for new timezone | P1 |

---

### 4. Performance & Load Testing

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **App Launch Speed** | 1. Open app 2. Measure time to Dashboard | App launches in <2 seconds | P1 |
| **Dashboard Load (100 Bills)** | 1. Add 100 bills via DB 2. View Dashboard | Dashboard loads in <1 second; no jank | P2 |
| **Scrolling Performance** | 1. Dashboard with many bills 2. Scroll quickly | Scrolling smooth (60 FPS, no stutter) | P1 |
| **Memory Usage** | 1. Run app for 10 minutes 2. Monitor memory | No memory leak; stable usage | P2 |
| **Battery Impact** | 1. Run app with reminders enabled 2. Monitor battery for 24h | No unusual drain; reminders do not keep CPU/radio awake | P2 |

---

### 5. Accessibility Testing

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **Screen Reader (VoiceOver/TalkBack)** | 1. Enable VoiceOver/TalkBack 2. Navigate app | All buttons, text, icons readable and navigable | P2 |
| **Text Sizing** | 1. Increase font size in system settings 2. Navigate app | App text scales; still readable | P2 |
| **Color Contrast** | 1. Check all text colors 2. Measure contrast | Contrast >= 4.5:1 (WCAG AA) | P2 |
| **Touch Target Size** | 1. Inspect all buttons 2. Measure | All buttons >= 44x44pt (iOS) | P2 |

---

### 6. Cross-Platform Compatibility

| Test Case | Steps | Expected Result | Priority |
|-----------|-------|-----------------|----------|
| **iOS – iPhone SE** | 1. Install on small screen 2. Use app | All UI fits; no overflow | P1 |
| **iOS – iPhone 14 Pro Max** | 1. Install on large screen 2. Use app | UI adapts; readable | P1 |
| **iOS – Various OS Versions** | 1. Test on iOS 14 and iOS 17 | App works on both (no crashes, no feature gaps) | P1 |
| **Android – Pixel 6** | 1. Install on modern Android 2. Use app | All features work | P1 |
| **Android – Older Device (API 30)** | 1. Install on older Android 2. Use app | All features work (some animations may be slower) | P1 |
| **Android – Various Screen Sizes** | 1. Test on 6", 5.5", 4.5" screens | UI adapts to all sizes | P1 |

---

## Regression Test Checklist (Per Release)

- [ ] Add bill with all fields.
- [ ] View Dashboard; verify grouping (Overdue / This Week / Later).
- [ ] Edit a bill.
- [ ] Delete a bill.
- [ ] Mark bill as paid (monthly).
- [ ] Mark bill as paid (one-time).
- [ ] View payment history.
- [ ] Verify notification permission dialog.
- [ ] Verify notification scheduled (if permission granted).
- [ ] Test app on iOS simulator.
- [ ] Test app on Android emulator.
- [ ] Check ESLint, TypeScript, all tests pass.
- [ ] Review test coverage; target >70%.

---

## Test Data Setup

### Seeding for QA

```typescript
// DB seed script for QA testing
const testBills = [
  { name: 'Electricity', dueDate: today - 5 * DAY, frequency: 'monthly', amount: 120 },
  { name: 'Internet', dueDate: today + 2 * DAY, frequency: 'monthly', amount: 80 },
  { name: 'Netflix', dueDate: today + 10 * DAY, frequency: 'monthly', amount: 15.99 },
  { name: 'Rent', dueDate: today + 28 * DAY, frequency: 'monthly', amount: 1500 },
  { name: 'Car Maintenance', dueDate: today + 5 * DAY, frequency: 'one-time', amount: 200 },
];

// Use this seed for initial testing
```

---

## Known Issues & Workarounds

(To be updated as issues are discovered during testing.)

---

## Sign-Off

- [ ] QA Lead: Testing plan reviewed and approved.
- [ ] Dev Lead: Aware of test expectations.
- [ ] Product: Acceptance criteria reviewed.
