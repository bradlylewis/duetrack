# Build Guide for Bill Tracker

## Production Build Configuration

This project is configured for EAS Build with the following setup:

### Version Information
- **App Version**: 1.0.0
- **Android Version Code**: 1
- **Bundle ID**: `com.billtracker.app`

### EAS Project
- **Project ID**: `b63e5bb7-d51c-486f-b25b-298957496b3e`
- **Project URL**: https://expo.dev/accounts/bradlylewis/projects/bill-tracker

## Building the App

### Prerequisites
- Expo account (logged in via `eas login`)
- EAS CLI installed globally (`npm install -g eas-cli`)

### Build Types

#### 1. Development Build (for testing)
```bash
eas build --profile development --platform android
```
- Includes dev client
- Generates APK file
- For internal testing with live reload

#### 2. Preview Build (for testing)
```bash
eas build --profile preview --platform android
```
- Generates APK file
- For internal testing without dev tools

#### 3. Production Build (for Play Store)
```bash
eas build --profile production --platform android
```
- Generates AAB (Android App Bundle)
- For Google Play Store submission
- Auto-increments version code

### Android Keystore

**EAS Build automatically manages the Android keystore.** You don't need to manually generate one.

- First production build: EAS creates and stores the keystore securely
- Subsequent builds: EAS reuses the same keystore for consistent signing
- Download keystore: `eas credentials` → Select Android → Download keystore

### Testing the Release Build

After building:

1. Download the APK/AAB from EAS Build dashboard
2. Install on a physical Android device:
   ```bash
   adb install path/to/app.apk
   ```
3. Test all features, especially:
   - Notifications (require production/dev build)
   - Database operations
   - Navigation
   - Edge cases

### Pre-Release Checklist

- [ ] All console.log statements removed
- [ ] Version numbers updated in app.json
- [ ] Bundle identifier configured
- [ ] Notification permissions configured
- [ ] App tested in release mode
- [ ] No crashes or errors in release build
- [ ] All features functional

## Deployment

### Internal Testing
```bash
eas build --profile production --platform android
```
Then upload to Google Play Console → Internal Testing track

### Production Release
1. Build production AAB
2. Upload to Google Play Console → Production track
3. Complete store listing (metadata, screenshots)
4. Submit for review

## Troubleshooting

### Build Fails
- Check EAS Build logs in the Expo dashboard
- Verify app.json configuration
- Ensure all dependencies are compatible with SDK version

### Notifications Don't Work
- Notifications only work in development/production builds (not Expo Go)
- Test on physical device, not emulator
- Check notification permissions in device settings

### App Crashes in Release
- Check Logcat: `adb logcat | grep -i error`
- Ensure no debug-only code in production
- Verify all native modules are properly configured

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Signing](https://docs.expo.dev/app-signing/app-credentials/)
- [Google Play Console](https://play.google.com/console/)
