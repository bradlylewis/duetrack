# Firebase Setup Documentation

## Overview
Firebase has been configured for the DueTrack app to enable authentication, cloud sync, and cloud messaging features.

## What Was Configured

### 1. Firebase Project
- **Project Name:** DueTrack
- **Console:** https://console.firebase.google.com/
- **Package Name:** `com.duetrack.app`

### 2. Dependencies Installed
```json
"@react-native-firebase/app": "^21.9.0"
"@react-native-firebase/auth": "^21.9.0"
"@react-native-firebase/firestore": "^21.9.0"
```

### 3. Android Configuration
- `google-services.json` added to `android/app/`
- Google Services Gradle plugin added to `android/build.gradle`
- Plugin applied in `android/app/build.gradle`

### 4. Initialization
Firebase is automatically initialized when `@react-native-firebase/app` is imported. Initialization happens in `App.tsx` on app startup.

## Testing Firebase Connection

### On Device/Emulator
1. Connect Android device or start emulator
2. Run: `npx expo run:android`
3. Check logs for: `"Firebase initialized"`
4. Verify no Firebase-related errors in console

### Expected Console Output
```
Firebase initialized
Database initialized successfully
Notifications initialized successfully
```

## Next Steps

### Enable Firebase Services
In Firebase Console, enable:
1. **Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google Sign-In (optional)

2. **Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules

3. **Firebase Cloud Messaging (FCM)** (optional)
   - Go to Cloud Messaging
   - Enable FCM for notifications

### Security Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Build Errors
- Run `npx expo prebuild --clean` to regenerate native code
- Check that `google-services.json` is in `android/app/`
- Verify Gradle plugin version in `android/build.gradle`

### Runtime Errors
- Check Firebase Console for project configuration
- Verify package name matches in `app.json` and Firebase Console
- Check Android Studio logs for detailed error messages

## Resources
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
