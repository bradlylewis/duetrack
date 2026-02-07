# Test Cases for Issue #8: Set Up Firebase Project & Configuration

**Issue:** #8
**Feature:** Firebase Infrastructure Setup
**Created:** February 5, 2026
**Last Updated:** February 5, 2026

## Test Scenarios

### TC-1: Firebase Project Created
**Scenario:** Verify Firebase project exists in Firebase Console
**Precondition:** Access to Firebase Console
**Steps:**
1. Navigate to https://console.firebase.google.com/
2. Look for "DueTrack" project
3. Verify project exists and is accessible
**Expected Result:** Firebase project "DueTrack" is visible and accessible
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-2: Firebase SDK Dependencies Installed
**Scenario:** Verify all required Firebase packages are in package.json
**Precondition:** Access to project repository
**Steps:**
1. Open `package.json`
2. Check dependencies section for `@react-native-firebase/app`
3. Check dependencies section for `@react-native-firebase/auth`
4. Check dependencies section for `@react-native-firebase/firestore`
5. Verify all three packages have compatible versions
**Expected Result:** All three Firebase packages present in dependencies with v23.8.6
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-3: google-services.json Configuration
**Scenario:** Verify Firebase config file exists and is properly placed
**Precondition:** Access to android/ directory
**Steps:**
1. Check if `android/app/google-services.json` exists
2. Verify file size is reasonable (>500 bytes)
3. Check file contains valid JSON structure
4. Verify package name matches `com.duetrack.app`
**Expected Result:** google-services.json exists in correct location with valid configuration
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-4: Security - google-services.json Not Tracked in Git
**Scenario:** Verify sensitive Firebase config is not committed to git
**Precondition:** Access to git repository
**Steps:**
1. Run `git ls-files android/app/google-services.json`
2. Verify command returns empty (file not tracked)
3. Check `android/.gitignore` contains `google-services.json`
4. Check root `.gitignore` contains `google-services.json`
**Expected Result:** google-services.json is not tracked by git and is in both .gitignore files
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-5: Firebase Initialization Code
**Scenario:** Verify Firebase is properly imported and initialized
**Precondition:** Access to source code
**Steps:**
1. Open `App.tsx`
2. Check for `import '@react-native-firebase/app';` statement
3. Verify import is at top of file
4. Verify no Firebase initialization errors exist
**Expected Result:** Firebase import present in App.tsx
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-6: Android Build Configuration
**Scenario:** Verify Android build files properly configured for Firebase
**Precondition:** Access to android/ directory
**Steps:**
1. Open `android/build.gradle`
2. Check for Google Services classpath: `com.google.gms:google-services:4.4.2`
3. Open `android/app/build.gradle`
4. Check for plugin: `apply plugin: 'com.google.gms.google-services'`
5. Verify plugin is applied after React plugin
**Expected Result:** Android build files properly configured with Google Services plugin
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-7: Clean Build from Scratch
**Scenario:** Verify project builds successfully from clean state
**Precondition:** Clean working directory
**Steps:**
1. Run `rm -rf android/build android/app/build`
2. Run `npx expo run:android`
3. Monitor build output for errors
4. Wait for build completion
**Expected Result:** Build completes successfully without Firebase-related errors
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-8: Firebase Initialization on Device
**Scenario:** Verify Firebase initializes when app runs on device
**Precondition:** App installed on Android device/emulator
**Steps:**
1. Launch app on device
2. Check logs for "Firebase initialized" message
3. Verify no Firebase initialization errors in logs
4. Check for any crash or error screens
**Expected Result:** Log shows "Firebase initialized" with no errors
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-9: Firebase Connection Test
**Scenario:** Verify app can communicate with Firebase
**Precondition:** App running on device with internet connection
**Steps:**
1. Launch app with internet connection
2. Check device logs for Firebase connection status
3. Verify no "Firebase not configured" or connection errors
4. Check Firebase Console for app connection events
**Expected Result:** No Firebase connection errors; app successfully communicates with Firebase
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

### TC-10: Documentation Exists
**Scenario:** Verify Firebase setup is documented
**Precondition:** Access to docs/ directory
**Steps:**
1. Look for Firebase setup documentation
2. Check if `docs/FIREBASE_SETUP.md` exists
3. Verify documentation includes setup steps and troubleshooting
**Expected Result:** Comprehensive Firebase setup documentation exists
**Status:** ⏳ Not Run
**Last Tested:** N/A
**Notes:**

## Regression Tests

### RT-1: Existing Bills Feature
**Scenario:** Verify existing bill management still works
**Steps:**
1. Launch app
2. Navigate to home screen
3. Create a new bill
4. Verify bill appears in list
5. Edit the bill
6. Delete the bill
**Expected Result:** All bill operations work without errors
**Status:** ⏳ Not Run
**Last Tested:** N/A

### RT-2: Existing Payments Feature
**Scenario:** Verify payment tracking still works
**Steps:**
1. Create a bill
2. Mark bill as paid
3. Check payment history
4. Verify payment recorded correctly
**Expected Result:** Payment tracking works correctly
**Status:** ⏳ Not Run
**Last Tested:** N/A

### RT-3: Database Initialization
**Scenario:** Verify SQLite database still initializes
**Steps:**
1. Launch app
2. Check logs for "Database initialized successfully"
3. Verify no database errors
**Expected Result:** Database initializes without errors
**Status:** ⏳ Not Run
**Last Tested:** N/A

### RT-4: Notifications Initialization
**Scenario:** Verify notification system still works
**Steps:**
1. Launch app
2. Check logs for "Notifications initialized successfully"
3. Verify no notification errors
**Expected Result:** Notifications initialize without errors
**Status:** ⏳ Not Run
**Last Tested:** N/A

### RT-5: No Console Errors
**Scenario:** Verify no new errors introduced
**Steps:**
1. Launch app
2. Navigate through all screens
3. Monitor console for errors/warnings
**Expected Result:** No Firebase-related errors or new console errors
**Status:** ⏳ Not Run
**Last Tested:** N/A

## Edge Cases

- [x] google-services.json security (not in git)
- [x] Clean build from scratch
- [ ] Offline mode - app still launches without Firebase connection
- [ ] Invalid google-services.json - proper error handling
- [x] Build configuration order (Google Services plugin after React)

## Notes
- Android-only testing (iOS not in scope per current implementation)
- Focus on infrastructure setup, not Firebase features (Auth/Firestore usage comes later)
- Security is critical - google-services.json must never be committed
