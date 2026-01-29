# Bill Tracker MVP – Regression Test Suite

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Updated per Release

---

## Overview

This document tracks regression tests performed before each release or major update. It ensures that new changes do not break existing functionality.

---

## Pre-Release Regression Checklist

### Core Features (Every Release)

#### Bills CRUD
- [ ] **Add Bill**
  - [ ] Add with all fields.
  - [ ] Add with optional fields missing (amount, notes).
  - [ ] Verify validation (name, due date, icon required).
  - [ ] Verify bill appears on Dashboard.

- [ ] **Edit Bill**
  - [ ] Edit existing bill; change name.
  - [ ] Edit due date; verify reminders rescheduled.
  - [ ] Edit icon; verify icon updates on Dashboard.
  - [ ] Edit frequency; verify behavior (still monthly/one-time).

- [ ] **Delete Bill**
  - [ ] Delete bill; verify removed from Dashboard.
  - [ ] Verify reminders canceled (check app logs or DB).
  - [ ] Delete with payments; verify payments not orphaned.

#### Dashboard
- [ ] **Grouping**
  - [ ] Add bills with due dates: yesterday, today, 3 days, 7 days, 30 days.
  - [ ] Verify Overdue group shows yesterday's bill.
  - [ ] Verify This Week shows today, 3, 7 day bills (sorted by date).
  - [ ] Verify Later shows 30 day bill.

- [ ] **Empty States**
  - [ ] Fresh install shows "No bills yet…"
  - [ ] After deleting all bills, empty state reappears.

- [ ] **Bill Cards**
  - [ ] Verify icon displays.
  - [ ] Verify name, due date, amount display.
  - [ ] Verify autopay badge (if enabled).

- [ ] **Interactions**
  - [ ] Tap bill → Details screen opens.
  - [ ] Pull to refresh works.

#### Mark Paid
- [ ] **Monthly Bill**
  - [ ] Create monthly bill due Jan 31.
  - [ ] Mark paid.
  - [ ] Verify due date advances to Feb 28 (or Feb 29 leap year).
  - [ ] Verify payment in history.
  - [ ] Verify notifications rescheduled.

- [ ] **One-Time Bill**
  - [ ] Create one-time bill.
  - [ ] Mark paid.
  - [ ] Verify bill disappears from Dashboard.
  - [ ] Verify payment in history (accessible if History tab exists).

#### Notifications (If Permission Granted)
- [ ] **Permission Flow**
  - [ ] Fresh install: permission dialog appears.
  - [ ] Grant permission: no banner.
  - [ ] Deny permission: banner appears on Dashboard.
  - [ ] Tap "Open Settings": opens native settings.

- [ ] **Scheduling**
  - [ ] Create bill; verify 2 notifications scheduled.
  - [ ] Edit bill due date; verify notifications rescheduled (old canceled, new created).
  - [ ] Delete bill; verify notifications canceled.

- [ ] **Notification Firing**
  - [ ] Set device time to 9 AM on 3-day reminder date; verify fires.
  - [ ] Set device time to 9 AM on day-of due date; verify fires.
  - [ ] Tap notification; verify app opens and navigates to bill.

#### Icons
- [ ] **Icon Picker**
  - [ ] Add Bill → tap icon selector.
  - [ ] Verify icon grid opens with all icons.
  - [ ] Select icon; verify highlighted.
  - [ ] Confirm; verify modal closes and icon shown in form.

- [ ] **Icon Display**
  - [ ] Save bill with icon.
  - [ ] Verify icon displays on Dashboard bill card.
  - [ ] Verify icon displays on Bill Details.

---

### Edge Cases (Per Release)

- [ ] **Long Bill Name**
  - [ ] Create bill with 80+ char name.
  - [ ] Verify no layout break on Dashboard or Details.

- [ ] **Month-End Dates**
  - [ ] Jan 31 → Feb: verify next due is Feb 28/29.
  - [ ] Feb 29 (leap): verify handles correctly.
  - [ ] Dec 31 → Jan: verify wraps to new year.

- [ ] **Multiple Payments**
  - [ ] Mark monthly bill paid multiple times.
  - [ ] Verify all payments in history.
  - [ ] Verify due dates advance correctly each time.

- [ ] **Permission Recovery**
  - [ ] Deny notification permission.
  - [ ] Manually enable in Settings.
  - [ ] Return to app; verify banner disappears and reminders enabled.

---

### Performance & Stability (Per Release)

- [ ] **App Launch**
  - [ ] Measure app launch time.
  - [ ] Verify <2 seconds.

- [ ] **Dashboard Load**
  - [ ] Add 50+ bills.
  - [ ] Verify Dashboard loads in <1 second.
  - [ ] Verify scrolling is smooth.

- [ ] **No Crashes**
  - [ ] Navigate through all screens multiple times.
  - [ ] No unhandled errors or crashes.

- [ ] **Memory**
  - [ ] Check app memory usage (Xcode or Android Studio).
  - [ ] No obvious leaks; stable after extended use.

---

### Platform-Specific (Per Release)

#### iOS
- [ ] **iPhone SE (Small Screen)**
  - [ ] All UI visible and usable.
  - [ ] No overflow or cutoff.

- [ ] **iPhone 14 Pro Max (Large Screen)**
  - [ ] UI adapts; readable.

- [ ] **iOS Versions**
  - [ ] Test on iOS 14 (if supporting).
  - [ ] Test on latest iOS (17+).

- [ ] **Safe Area**
  - [ ] Content respects notch/safe area.
  - [ ] No overlap with status bar or home indicator.

#### Android
- [ ] **Pixel 6 (Modern)**
  - [ ] All features work.
  - [ ] UI looks native.

- [ ] **Older Device (API 30)**
  - [ ] App installs and runs.
  - [ ] No crashes.
  - [ ] Features work (animations may be slower).

- [ ] **Screen Sizes**
  - [ ] Test on 4.5", 5.5", 6" screens.
  - [ ] UI adapts appropriately.

- [ ] **Back Button**
  - [ ] Back button navigates correctly.
  - [ ] Back from modal/screen returns to previous.

---

### Code Quality (Per Release)

- [ ] **TypeScript**
  - [ ] Run `npx tsc --noEmit`.
  - [ ] Zero TS errors; no `any` types without justification.

- [ ] **ESLint**
  - [ ] Run `npm run lint`.
  - [ ] Zero errors; warnings reviewed and justified.

- [ ] **Prettier**
  - [ ] Run `npm run format`.
  - [ ] All files formatted consistently.

- [ ] **Tests**
  - [ ] Run all unit tests.
  - [ ] All tests pass.
  - [ ] Coverage >= 70% (target for MVP).

- [ ] **Git**
  - [ ] Clean commit history.
  - [ ] Clear, descriptive commit messages.
  - [ ] No large binary files or secrets committed.

---

## Test Execution Log

### Release v1.0.0 (Target Date: Feb 28, 2026)

| Date | Tester | Test | Platform | Status | Notes |
|------|--------|------|----------|--------|-------|
| Feb 26 | QA-1 | Core CRUD | iOS | ✅ PASS | All add/edit/delete working |
| Feb 26 | QA-1 | Dashboard | iOS | ✅ PASS | Grouping correct |
| Feb 26 | QA-2 | Mark Paid | Android | ✅ PASS | Monthly rollover verified |
| Feb 27 | QA-1 | Notifications | iOS | ⚠️ WARN | (Example) – minor timing issue, investigating |
| Feb 27 | QA-2 | Icon Picker | Android | ✅ PASS | All icons display |
| Feb 27 | QA-All | Performance | Both | ✅ PASS | <2s launch, smooth scrolling |
| Feb 27 | QA-All | Edge Cases | Both | ✅ PASS | Long names, month boundaries handled |
| Feb 28 | QA-Lead | Final QA | Both | ✅ PASS | Ready to release |

---

## Known Issues Requiring Hot-Fix

(To be updated as issues are discovered.)

---

## Sign-Off

- [ ] QA Lead: Regression suite executed; all tests passed (or known issues documented).
- [ ] Dev Lead: All failures reviewed and addressed (or deferred with justification).
- [ ] Product: Aware of test status; ready to release or defer issues.

---

## Notes

- Run regression tests on **both iOS and Android** before every release.
- Test on **at least 2 device sizes** per platform (small, large).
- Document any new regression tests discovered during release testing.
- Update this document after each release cycle.
