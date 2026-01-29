# Bill Tracker MVP – Release Checklist

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Placeholder

---

## Pre-Release (Before Submission to App Stores)

### Code Quality
- [ ] All TypeScript errors fixed; no `any` types without justification.
- [ ] ESLint passes; Prettier formatting applied.
- [ ] No console.warn or console.error in production code (use proper logging).
- [ ] Remove all `TODO` and `FIXME` comments (move to tickets if needed).

### Testing
- [ ] All unit tests pass (date rollover, notification scheduling, DB queries).
- [ ] All integration tests pass (CRUD + notifications + notification permission flow).
- [ ] Manual QA sign-off: all 10 tickets tested per acceptance criteria.
- [ ] Regression tests pass (see `/qa/regression.md`).

### Performance
- [ ] App launches in <2 seconds on average device.
- [ ] Dashboard renders in <1 second (even with 100+ bills).
- [ ] No memory leaks on device (profile with React DevTools or Xcode).
- [ ] Notifications do not drain battery (test over 24 hours).

### Accessibility
- [ ] All text labels >= 12pt.
- [ ] All touchable targets >= 44x44pt (iOS) or 48x48dp (Android).
- [ ] Color contrast >= 4.5:1 for text (WCAG AA).
- [ ] Screen reader tested (VoiceOver on iOS, TalkBack on Android).

### Data Safety
- [ ] SQLite database encrypted (optional but recommended).
- [ ] No sensitive data in logs.
- [ ] No data persisted to cloud (verified).
- [ ] No data sent to analytics (verified).

### Build & Deployment
- [ ] iOS build passes: no warnings, code signing valid.
- [ ] Android build passes: no warnings, signing key configured.
- [ ] App versioning set (e.g., 1.0.0).
- [ ] Release notes written and reviewed.
- [ ] Privacy policy drafted (describe local-only storage, no data collection).
- [ ] Terms of Service drafted (if needed).

### Store Submission
- [ ] Screenshots prepared (iOS: 4-5 screens; Android: similar).
- [ ] App description written (80 characters max for title; compelling description).
- [ ] App category selected (Productivity or Utilities).
- [ ] Keywords/tags selected.
- [ ] Age rating questionnaire completed.
- [ ] Content warnings addressed (if any).

### Device Testing
- [ ] iOS: tested on iPhone 12 mini (small) and iPhone 14 Pro Max (large).
- [ ] iOS: tested on iOS 14 and latest (current).
- [ ] Android: tested on Pixel 6 (modern) and older device (API level 30+).
- [ ] Android: tested on Android 12 and latest.
- [ ] Landscape mode: not supported (blocked or handled gracefully).
- [ ] Tablet: behavior verified (or locked to phone-only).

### Notification & Permissions
- [ ] Notification permission request shown on first launch.
- [ ] Permission denied flow tested: banner shown, Settings link works.
- [ ] Notifications fire at correct times (9 AM local, 3 days + day-of).
- [ ] DST transition tested (if time permits).
- [ ] Notification tap opens app and navigates correctly.

### Database
- [ ] SQLite schema migrations tested on fresh install.
- [ ] Fresh install shows empty state correctly.
- [ ] Upgrade from non-existent DB to v1.0 works.
- [ ] DB backup/restore tested (if exporting is supported).

---

## Launch Day

### Pre-Launch (Within 1 hour of go-live)
- [ ] App is live on iOS App Store.
- [ ] App is live on Google Play Store.
- [ ] Download and install from both stores (fresh device or simulator).
- [ ] Smoke test: add a bill, see it on dashboard, mark as paid.
- [ ] Check store pages: screenshots, description, rating visible.

### Day 1-7 Monitoring
- [ ] Monitor crash reports (Xcode, Google Play Console).
- [ ] Monitor user reviews (both stores).
- [ ] Check for 1-star reviews; prioritize critical bugs.
- [ ] No major crashes or permission-related issues.

---

## Metrics & Goals (Post-Launch)

- [ ] 50+ downloads in first week.
- [ ] Average rating >= 4.0 stars.
- [ ] <1% crash rate.
- [ ] >50% of users enable notifications.
- [ ] >30% of users add >= 2 bills.
- [ ] Retention: >20% of users return after 7 days.

---

## Hot-Fix & Follow-Up Releases

### Critical Bugs (Fix ASAP)
- [ ] Any crash on launch.
- [ ] Any crash on Add Bill or Dashboard.
- [ ] Notifications not firing.
- [ ] Data loss or corruption.

### High-Priority Bugs (Fix within 1 week)
- [ ] UI layout issues on specific devices.
- [ ] Notification permission flow broken.
- [ ] Bills not saving or disappearing.

### Low-Priority Enhancements (Defer to v1.1)
- [ ] UI polish (animations, spacing).
- [ ] Additional icons or categories.
- [ ] Dark mode support.
- [ ] Pro/monetization features.

---

## Future Release Candidates (Post-MVP)

- **v1.1:** Dark mode, additional icons, undo/redo, bill templates.
- **v2.0:** Cloud sync, accounts, household sharing, advanced recurrence.
- **v3.0:** Monetization (free tier + Pro), budget tracking, integrations.

---

## Sign-Offs

- [ ] **Architect:** Tech stack & schema approved.
- [ ] **Dev:** All code complete, reviewed, tested.
- [ ] **QA:** All test cases passed, regression tests clear.
- [ ] **Product:** Feature set matches spec, no scope creep.
- [ ] **Orchestrator:** Ready to ship.

---

**Release Date:** TBD  
**Version:** 1.0.0  
**Build Number:** TBD
