# Bill Tracker App - Product Roadmap

**Last Updated:** January 29, 2026  
**Current Status:** MVP Complete, preparing for Google Play Store launch

---

## Overview

This roadmap outlines the path from MVP to multi-device sync capability. We're taking a phased approach: launch with local-only storage first to validate market fit, then add Firebase authentication and cloud sync as a major v2.0 feature.

**Structure:**
- **Planning Cycles** = Major feature themes (e.g., Store Launch, Multi-Device Sync)
- **Sprints** = Individual work iterations within a planning cycle (e.g., Sprint 2.1, Sprint 2.2)

---

## Planning Cycle 1: Store Launch

### Sprint 1: Store Readiness (Pre-Launch)
**Theme:** "Get to Google Play"  
**Goal:** Launch app on Google Play Store with local-only data storage

### Deliverables
1. **Privacy Policy** - Write and publish privacy policy for local-only data storage
2. **App Metadata** - Create screenshots, app description, feature graphic (1024x500px)
3. **Build Configuration** - Set version codes, configure signing keys, remove debug code
4. **Data Safety Form** - Complete Google Play Data Safety questionnaire (local storage only)
5. **Content Rating** - Complete Google Play content rating questionnaire
6. **Internal Testing** - Deploy to Google Play internal testing track

### Success Criteria
✅ App submitted to Google Play Store  
✅ Privacy policy published on public URL  
✅ All store metadata complete  
✅ Release build tested and approved  
✅ App available for download

### Technical Notes
- Local SQLite storage only (no cloud sync yet)
- Local notifications (expo-notifications)
- Simple privacy policy: "All data stored locally on your device"
- Data Safety: No data collection, no data sharing

---

## Planning Cycle 2: Multi-Device Sync (Post-Launch - v2.0)
**Theme:** "Add Firebase Authentication & Cloud Sync"  
**Goal:** Enable users to sync bills across multiple devices with cloud backup

---

### Sprint 2.1: Firebase Foundation
**Goal:** Set up Firebase infrastructure and basic authentication
**Priority:** Critical for sync functionality

#### Deliverables
1. **Firebase Project Setup**
   - Create Firebase project in console
   - Add Android/iOS apps to Firebase
   - Install Firebase SDK dependencies (`@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`)
   - Configure `app.json` with Firebase credentials

2. **Authentication UI**
   - Login screen (email/password)
   - Signup screen
   - Auth state management (logged in/out)
   - Persist auth state across app restarts
   - Password reset flow

3. **Account Management**
   - Account deletion flow (required by Google Play)
   - Delete Firebase user
   - Clear local data on account deletion
   - Settings screen updates

#### Success Criteria
✅ Firebase project configured and connected  
✅ Users can create accounts and sign in  
✅ Auth state persists across app restarts  
✅ Account deletion works properly

---

### Sprint 2.2: Data Sync Architecture
**Goal:** Implement two-way sync between local and cloud data
**Priority:** Core sync functionality

#### Deliverables
1. **Firestore Schema Design**
   - Design `users/{uid}/bills` collection structure
   - Design `users/{uid}/payments` collection structure
   - Plan sync metadata (lastSynced timestamps, device IDs)
   - Document schema in ADR

5. **Sync Service Implementation**
   - Two-way sync: SQLite ↔ Firestore
   - Sync on app launch (pull from Firestore)
   - Sync on local changes (push to Firestore)
   - Offline queue (writes when no internet)
   - Background sync on app resume
   - Conflict resolution strategy (last-write-wins or merge)

6. **Data Migration**
   - Detect first login after v2.0 update
   - Upload existing local bills to Firestore
   - Handle multiple device scenarios
   - Merge logic if user has data on multiple devices
   - Migration status tracking

#### Success Criteria
✅ Bills created on Device A appear on Device B  
✅ App works offline, syncs when reconnected  
✅ Existing users' local data migrated to cloud  
✅ No duplicate bills or lost data

---

### Sprint 2.3: Enhanced Notifications & UX
**Goal:** Improve notification reliability and add Google Sign-In
**Priority:** Enhance user experience

#### Deliverables
1. **Firebase Cloud Messaging**
   - Set up FCM in Firebase console
   - Migrate local notifications → FCM
   - Server-side notification scheduling
   - Handle notification permissions
   - Test notifications in production build

8. **Google Sign-In**
   - Better UX than email/password
   - One-tap sign in with Google account
   - Reduces signup friction
   - Configure Google Sign-In in Firebase console

9. **Store Updates**
   - Update privacy policy (Firebase data storage)
   - Update Data Safety form (data shared with Firebase/Google)
   - Submit app update to Google Play
   - Update app description with "sync across devices" feature

#### Success Criteria
✅ Push notifications work reliably via FCM  
✅ Google Sign-In works (one-tap login)  
✅ Privacy policy updated and approved by Google Play  
✅ App update submitted to Google Play with sync features

---

### Planning Cycle 2 - Overall Success Criteria
✅ Users can create accounts and sign in  
✅ Bills created on Device A appear on Device B  
✅ App works offline, syncs when reconnected  
✅ Existing users' local data migrated to cloud  
✅ Account deletion works properly  
✅ Push notifications work reliably via FCM  
✅ Privacy policy updated and approved by Google Play  
✅ 90%+ of users successfully synced across devices

### Technical Decisions Needed
- **Conflict Resolution:** Last-write-wins vs. merge strategies
- **Sync Frequency:** Real-time vs. periodic sync
- **Offline Behavior:** Queue writes vs. immediate conflict detection
- **Migration Strategy:** Force login vs. optional login with sync prompt

---

## Planning Cycle 3: Post-Launch Enhancements (Future)
**Theme:** "Iterate Based on User Feedback"  
**Goal:** Add features requested by users, improve UX, expand platform support

### Potential Features (Prioritize After Launch)
- **Apple Sign-In** (required for iOS App Store)
- **Email Verification** (prevent fake accounts)
- **Profile Management** (change password, update email)
- **Export Data** (CSV/PDF for taxes, GDPR compliance)
- **Crash Reporting** (Sentry or Firebase Crashlytics)
- **Analytics** (Firebase Analytics for user behavior insights)
- **Onboarding Tutorial** (first-time user guide)
- **In-App Feedback** (bug reports, feature requests)
- **Bill Categories** (utilities, subscriptions, insurance)
- **Budget Tracking** (monthly limits, spending alerts)
- **Recurring Bill Detection** (suggest auto-fill for similar bills)
- **Bill Sharing** (split bills with roommates/family)
- **Multi-Currency Support** (for international users)
- **Dark Mode** (theme switching)
- **Widgets** (home screen upcoming bills widget)
- **Advanced Search & Filters** (find bills by name, amount, date range)
- **Bill Photos** (attach receipts or bill images)
- **Spending Analytics** (charts, trends, insights)

### Success Metrics to Track
- User retention rate (DAU/MAU)
- Sync success rate (% of syncs without errors)
- Crash-free rate (target: 99.5%+)
- Average bills per user
- Notification engagement rate
- User feedback ratings

---

## Architecture Decisions

### Why Firebase?
- **Fast to implement:** Expo has Firebase support, well-documented
- **Free tier generous:** 50K reads/day, 20K writes/day, 1GB storage (good for ~1,000 active users)
- **Google Play friendly:** Firebase is a Google product, standard privacy templates available
- **Cross-platform:** Works on iOS and Android
- **Built-in features:** Auth, push notifications, real-time sync, file storage

### Why Local-First Launch?
- **Faster to market:** Validate product-market fit before investing in backend
- **Simpler compliance:** Local-only data = simpler privacy policy, easier store approval
- **Lower risk:** Don't build sync infrastructure if users don't want the app
- **User control:** Users own their data, privacy-friendly approach
- **Easier migration:** Local → Cloud migration is smoother than launching with cloud-only

### Alternative Considered
- **Supabase:** Open-source Firebase alternative, but less Expo integration
- **AWS Amplify:** More complex setup, higher learning curve
- **Self-hosted backend:** Too much DevOps overhead for MVP

---

## Risk Mitigation

### Store Approval Risks
- **Mitigation:** Follow Google Play policies closely, use standard Firebase privacy templates
- **Testing:** Internal testing track first, address feedback before public launch

### Data Migration Risks
- **Mitigation:** Test migration flow extensively, backup local data before upload
- **Rollback plan:** Keep local SQLite as source of truth, allow re-sync if Firestore upload fails

### Sync Conflict Risks
- **Mitigation:** Implement last-write-wins initially, add merge logic if users report issues
- **User communication:** Clear messaging about how sync works, especially offline scenarios

### Firebase Cost Risks
- **Mitigation:** Monitor usage in Firebase console, set up billing alerts
- **Scaling plan:** Free tier → Blaze (pay-as-you-go) only when needed

---

## Definition of Done

### Sprint 1: Store Readiness
- [ ] Privacy policy live on public URL
- [ ] App screenshots and metadata submitted
- [ ] Release build signed and tested
- [ ] Data Safety form completed
- [ ] Content rating completed
- [ ] App live on Google Play Store
- [ ] 10+ users successfully downloaded and used app

### Sprint 2.1: Firebase Foundation
- [ ] Firebase project configured
- [ ] Users can sign up/login/logout
- [ ] Account deletion works

### Sprint 2.2: Data Sync Architecture
- [ ] Firestore schema documented
- [ ] Sync service implemented and tested
- [ ] Existing user data migrated

### Sprint 2.3: Enhanced Notifications & UX
- [ ] FCM notifications working
- [ ] Google Sign-In working
- [ ] Updated privacy policy approved
- [ ] v2.0 update live on Google Play
- [ ] 90%+ of users successfully synced across devices

---

## Notes

- **No time estimates:** We're not tracking hours or weeks, just sprint goals
- **User-driven priorities:** Post-launch features will be prioritized based on user feedback
- **Agile approach:** Roadmap is flexible, can pivot based on what we learn

---

**Questions or feedback?** Update this roadmap as priorities change.
