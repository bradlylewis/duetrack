# Test Cases for Issue #4: Configure Build for Production Release

**Issue:** #4  
**Feature:** Production build configuration for Google Play Store  
**Created:** 2026-01-29  
**Last Updated:** 2026-01-29

## Test Scenarios

### TC-1: Verify app.json Configuration
**Scenario:** Validate that app.json has all required production settings  
**Precondition:** Code checked out on BA-4 branch  
**Steps:**
1. Open `app.json`
2. Check version is set to "1.0.0"
3. Check android.versionCode is 1
4. Check android.package is "com.billtracker.app"
5. Check ios.bundleIdentifier is "com.billtracker.app"
6. Check android.permissions includes RECEIVE_BOOT_COMPLETED and SCHEDULE_EXACT_ALARM
7. Check extra.eas.projectId exists

**Expected Result:** All fields properly configured with production-ready values  
**Status:** ✅ Pass  
**Last Tested:** 2026-01-29  
**Notes:** All configuration values verified correctly

### TC-2: Verify console.log Statements Removed
**Scenario:** Ensure all console.log statements removed from production code  
**Precondition:** Code checked out on BA-4 branch  
**Steps:**
1. Run: `grep -r "console.log" src/`
2. Verify no results found in production code

**Expected Result:** No console.log statements in src/ directory (console.error is acceptable)  
**Status:** ✅ Pass  
**Last Tested:** 2026-01-29  
**Notes:** Confirmed no console.log statements found in src/

### TC-3: Verify EAS Build Configuration
**Scenario:** Check that eas.json is properly configured  
**Precondition:** Code checked out on BA-4 branch  
**Steps:**
1. Verify `eas.json` file exists
2. Check "development" profile has developmentClient: true, distribution: internal, buildType: apk
3. Check "preview" profile has distribution: internal, buildType: apk
4. Check "production" profile has autoIncrement: true, buildType: aab

**Expected Result:** eas.json configured with three build profiles for different environments  
**Status:** ✅ Pass  
**Last Tested:** 2026-01-29  
**Notes:** All three profiles (development, preview, production) configured correctly with proper build types

### TC-4: Verify Build Documentation
**Scenario:** Check that BUILD.md documentation exists and is complete  
**Precondition:** Code checked out on BA-4 branch  
**Steps:**
1. Verify `BUILD.md` file exists
2. Check it contains build commands for all three profiles
3. Check it explains keystore management
4. Check it has troubleshooting section
5. Check it links to relevant Expo/EAS documentation

**Expected Result:** Comprehensive build documentation available  
**Status:** ✅ Pass  
**Last Tested:** 2026-01-29  
**Notes:** BUILD.md exists with all sections including build commands, keystore management, troubleshooting, and resources

### TC-5: Verify .gitignore Excludes Keystore
**Scenario:** Ensure keystore files won't be committed to git  
**Precondition:** Code checked out on BA-4 branch  
**Steps:**
1. Open `.gitignore`
2. Verify it includes `*.jks` pattern
3. Verify it includes `*.keystore` pattern or similar

**Expected Result:** Keystore files properly excluded from version control  
**Status:** ✅ Pass  
**Last Tested:** 2026-01-29  
**Notes:** .gitignore includes *.jks pattern to exclude keystore files

### TC-6: Verify expo-dev-client Installation
**Scenario:** Check that expo-dev-client is installed for native builds  
**Precondition:** Code checked out on BA-4 branch  
**Steps:**
1. Open `package.json`
2. Verify "expo-dev-client" is listed in dependencies
3. Run: `npm list expo-dev-client` to confirm installation

**Expected Result:** expo-dev-client package installed and listed  
**Status:** ✅ Pass  
**Last Tested:** 2026-01-29  
**Notes:** expo-dev-client@6.0.20 installed and verified

### TC-7: Build Development APK
**Scenario:** Generate a development build for testing  
**Precondition:** EAS CLI installed, logged into Expo account  
**Steps:**
1. Run: `eas build --profile development --platform android`
2. Wait for build to complete on EAS servers
3. Download the APK from Expo dashboard

**Expected Result:** Development APK successfully built without errors  
**Status:** ⏸️ User Action Required  
**Last Tested:** N/A  
**Notes:** User must run this when ready to test - requires EAS account and 10-20 minutes

### TC-8: Build Production AAB
**Scenario:** Generate production AAB for Play Store  
**Precondition:** EAS CLI installed, logged into Expo account  
**Steps:**
1. Run: `eas build --profile production --platform android`
2. Wait for build to complete on EAS servers
3. Verify build type is AAB (Android App Bundle)
4. Verify version code auto-incremented

**Expected Result:** Production AAB successfully built without errors  
**Status:** ⏸️ User Action Required  
**Last Tested:** N/A  
**Notes:** User must run this before Play Store submission - requires EAS account and 10-20 minutes

### TC-9: Install and Run APK on Physical Device
**Scenario:** Test that app installs and launches on real Android device  
**Precondition:** Development APK downloaded from TC-7  
**Steps:**
1. Enable Developer Options on Android device
2. Enable USB debugging
3. Connect device via USB
4. Run: `adb install path/to/app.apk`
5. Launch app from device home screen

**Expected Result:** App installs successfully and launches without crashes  
**Status:** ⏸️ User Action Required  
**Last Tested:** N/A  
**Notes:** User must test on their physical Android device after building APK

### TC-10: Verify App Size
**Scenario:** Check that app size is reasonable for distribution  
**Precondition:** APK or AAB downloaded  
**Steps:**
1. Check file size of APK/AAB
2. Compare against 50MB target

**Expected Result:** App size is under 50MB (ideally under 30MB)  
**Status:** ⏸️ User Action Required  
**Last Tested:** N/A  
**Notes:** Check after building APK/AAB from EAS

## Edge Cases
- [x] Code committed without keystore files
- [x] Documentation covers all build profiles
- [ ] Build fails gracefully with clear error messages
- [ ] EAS Build handles network interruptions

## Regression Tests
- [ ] Existing app functionality unchanged
- [ ] No new TypeScript errors introduced
- [ ] No new console errors in runtime
- [ ] Database schema unchanged
- [ ] Notification scheduling unchanged

## Configuration-Specific Tests
- [x] app.json has proper version numbers
- [x] Android permissions properly declared
- [x] iOS bundle identifier configured
- [x] EAS project ID present
- [ ] Build profiles generate correct artifact types (APK vs AAB)

## Security Checks
- [x] No hardcoded secrets in app.json or eas.json
- [x] Keystore files excluded from git
- [x] No sensitive data in console logs
- [ ] App permissions justified and minimal

## Notes
- This is primarily a configuration issue, so most tests are verification of files/settings
- Physical device testing (TC-9) should be done by user on their own device
- Build generation (TC-7, TC-8) requires EAS account and will take time
- Focus on verifying configuration correctness since actual builds will be done by EAS
