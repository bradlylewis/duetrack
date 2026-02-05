# Internal Testing Guide

## Build Status
✅ **Production AAB build completed successfully**
- Build ID: `900d5bd1-3d48-4d2d-b193-cc627db61134`
- Platform: Android
- Build Type: app-bundle (AAB)
- Version: 1.0.0
- Version Code: 5
- File Size: 70 MB
- Downloaded: `DueTrack-v1.0.0.aab`
- Track: https://expo.dev/accounts/bradlylewis/projects/bill-tracker/builds/900d5bd1-3d48-4d2d-b193-cc627db61134

**Fixes Applied:**
- ✅ Removed invalid `privacyPolicy` field from app.json
- ✅ Removed deprecated `ios.supportsTabletMode` field
- ✅ Created placeholder app assets (icon, splash, adaptive-icon, etc.)
- ✅ Installed missing peer dependency `react-native-worklets`
- ✅ Removed `versionCode` from app.json (now managed by EAS)
- ✅ Committed assets to git repository

## Step 1: Download AAB from EAS

✅ **Already downloaded:** `DueTrack-v1.0.0.aab` (70 MB)

To download again if needed:
```bash
curl -L -o DueTrack-v1.0.0.aab "https://expo.dev/artifacts/eas/iMHqUApkrVfapF4HiPscb5.aab"
```

## Step 2: Upload to Google Play Console

1. **Go to Google Play Console:** https://play.google.com/console
2. **Navigate to:** Your App → Testing → Internal testing
3. **Click:** "Create new release"
4. **Upload:** The downloaded `.aab` file
5. **Release name:** "Internal Testing v1.0.0 (Build 3)"
6. **Release notes:**
   ```
   Initial internal testing release for DueTrack bill tracking app.
   
   Features to test:
   - Add, edit, delete bills
   - Mark payments as paid
   - View payment history
   - Receive notifications (3 days before + day-of at 9 AM)
   - App icon and splash screen
   
   Please report any crashes, bugs, or UX issues.
   ```
7. **Click:** "Save" then "Review release"
8. **Click:** "Start rollout to Internal testing"

## Step 3: Create Internal Testing Group

1. **In Google Play Console:** Testing → Internal testing → Testers tab
2. **Click:** "Create email list"
3. **List name:** "DueTrack Alpha Testers"
4. **Add email addresses:**
   - Your email
   - Any team members/friends willing to test
   - (Up to 100 testers allowed)
5. **Save**
6. **Copy the testing link** (e.g., https://play.google.com/apps/internaltest/...)

## Step 4: Invite Testers

Send testers an email with:

```
Subject: DueTrack Internal Testing Invitation

Hi!

You're invited to test DueTrack, a simple bill tracking app with payment reminders.

Testing Link: [Your internal testing link]

Instructions:
1. Click the link above
2. Accept the invitation
3. Download the app from Google Play
4. Test the following features:
   - Add bills (utilities, subscriptions, etc.)
   - Edit and delete bills
   - Mark payments as paid
   - Check payment history
   - Verify you receive notifications

Please report any issues, crashes, or suggestions!

Thanks,
[Your name]
```

## Step 5: Testing Checklist

Once testers have the app installed, verify:

### Core Functionality
- [ ] Add bill (various amounts, dates, frequencies)
- [ ] Edit bill (change name, amount, due date)
- [ ] Delete bill
- [ ] Mark payment as paid
- [ ] View payment history
- [ ] Multiple bills display correctly
- [ ] Empty states show properly

### Notifications
- [ ] Notification permission requested on first launch
- [ ] Notifications scheduled (check system notification settings)
- [ ] Receive notification 3 days before due date at 9 AM
- [ ] Receive notification on due date at 9 AM
- [ ] Tap notification opens app to bill details

### Edge Cases
- [ ] Long bill names (20+ characters)
- [ ] Bills with same name/amount
- [ ] Bills due on Jan 31 (month boundaries)
- [ ] Very large amounts ($99,999+)
- [ ] 50+ bills (performance test)

### UI/UX
- [ ] App icon displays correctly in launcher
- [ ] Splash screen shows on launch
- [ ] All screens readable and aligned
- [ ] Touch targets easy to hit (44pt minimum)
- [ ] No overlapping text or clipped content
- [ ] Loading states work (if any)
- [ ] Error messages user-friendly

### Stability
- [ ] No crashes during normal use
- [ ] App recovers from background/foreground
- [ ] Data persists after app restart
- [ ] Works offline (no network required)

## Step 6: Collect Feedback

Create a feedback form or spreadsheet:
- Tester name
- Device model & Android version
- Issue/bug description
- Steps to reproduce
- Screenshots (if applicable)
- Severity (Critical, High, Medium, Low)

## Step 7: Fix Critical Bugs

If any critical bugs found:
1. Create GitHub issue for each bug
2. Fix locally on this branch
3. Commit changes
4. Build new production version
5. Upload to internal testing (creates new release)
6. Re-test

## Step 8: Promote to Production

Once all tests pass and no critical bugs:
1. Google Play Console → Internal testing release
2. Click "Promote release" → "Production"
3. Complete store listing (if not done)
4. Submit for review

## Expected Timeline

- **Build time:** 10-15 minutes
- **Upload to Play Console:** 5 minutes
- **Testing period:** 1-3 days (depending on tester availability)
- **Bug fixes (if needed):** 1-2 days
- **Google Play review:** 1-7 days (usually 1-3 days)

## Success Criteria

✅ All testers successfully installed from Play Store  
✅ No critical bugs or crashes  
✅ All core features work as expected  
✅ Notifications reliably received  
✅ App performance acceptable (fast, no lag)  
✅ Ready for public release

## Resources

- EAS Build Dashboard: https://expo.dev/accounts/bradlylewis/projects/bill-tracker/builds
- Google Play Console: https://play.google.com/console
- Internal Testing Guide: https://support.google.com/googleplay/android-developer/answer/9845334
- Release Checklist: See `spec/release-checklist.md`

---

**Status:** 🔄 Waiting for build to complete...  
**Next Step:** Download AAB and upload to Google Play Console
