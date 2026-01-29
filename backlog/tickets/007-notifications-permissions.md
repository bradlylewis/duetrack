# Ticket 007: Notifications – Permission Request & UI

**ID:** 007  
**Title:** Implement notification permissions, request flow, and permission denied UI  
**Status:** ✅ IMPLEMENTED  
**Complexity:** Low-Medium  
**Priority:** P1 (High)

---

## Goal

Build the notification permission request flow and handle permission denied gracefully:
- Request notification permission on app launch (or first time adding a bill).
- Show a banner if permission is denied, with a link to Settings.
- Gracefully handle the case where notifications are not available.
- Store permission status in app_meta for future reference.

---

## Acceptance Criteria

1. ✅ On app launch, notification permission is requested (using expo-notifications API).
2. ✅ Permission request dialog appears on iOS/Android.
3. ✅ User can grant or deny permission.
4. ✅ If granted:
   - Permission is stored in app_meta.
   - Notifications can be scheduled (tested in ticket 008).
   - No banner is shown.
5. ✅ If denied:
   - Permission status stored in app_meta.
   - A dismissible banner appears on Dashboard: "Reminders are disabled. Tap to enable in Settings."
   - Banner has "Open Settings" button.
   - Tapping "Open Settings" opens native app settings (iOS: Settings > [App Name] > Notifications; Android: Settings > Apps > [App Name] > Notifications).
6. ✅ Banner is dismissible (user can close it; it reappears on app restart if permission still denied).
7. ✅ Permission recovery:
   - If user enables notifications in Settings and returns to app, banner disappears.
   - On next app launch, reminders are scheduled for all bills.
8. ✅ Error handling:
   - If permission request fails or throws error, log it and proceed (allow app to function without notifications).
9. ✅ No crashes or errors related to notifications.
10. ✅ Works on both iOS and Android.

---

## Manual Test Steps

1. **Fresh Install – Permission Request:**
   - Uninstall app (or clear app data).
   - Launch app.
   - Verify permission request dialog appears (iOS: "Allow Notifications?", Android: "Allow 'Bill Tracker' to send notifications?").
   - Tap "Allow".
   - Verify dialog closes; no banner shown.

2. **Permission Request – Deny:**
   - (Repeat step 1 on a fresh install or use app reset.)
   - Tap "Don't Allow" (or equivalent deny button).
   - Verify dialog closes.
   - Navigate to Dashboard.
   - Verify banner appears: "Reminders are disabled. Tap to enable in Settings."

3. **Banner Interaction:**
   - On Dashboard with banner visible (permission denied):
   - Tap "Open Settings" button.
   - Verify native app settings open (Settings > Notifications or equivalent).
   - Go back to app.
   - Verify banner is still visible (or disappears if you actually enabled notifications).

4. **Permission Recovery:**
   - Start with permission denied (banner visible).
   - Leave app.
   - Go to Settings > Notifications.
   - Enable notifications for Bill Tracker.
   - Return to app (or relaunch).
   - Verify banner disappears.
   - Verify in app_meta that permission status is updated to "granted".

5. **Banner Dismissal:**
   - With banner visible, tap the close button (X) on banner.
   - Verify banner closes.
   - Close and reopen app.
   - Verify banner reappears (permission is still denied; banner should persist across launches).

6. **Android Specific:**
   - Repeat all tests on Android emulator.
   - Verify banner styling matches Android design language.
   - Verify Settings link opens Android system settings.

7. **Error Handling:**
   - (Simulate permission request error if possible; otherwise, skip or manually test.)
   - Verify app does not crash if permission request fails.

---

## Files Likely Touched / Created

```
src/
├── screens/
│   └── HomeScreen.tsx (add banner component)
├── components/
│   ├── NotificationPermissionBanner.tsx (banner UI)
│   └── (existing components)
├── services/
│   ├── notifications.ts (update to request permission on launch)
│   └── permissions.ts (new; handle permission checks and settings link)
├── db/
│   └── queries.ts (use app_meta helpers)
└── hooks/
    └── useNotificationPermission.ts (custom hook to track permission state)
```

---

## Notification Permission Request Logic

### On App Launch

```typescript
async function initializeNotifications() {
  try {
    // Request permission
    const permission = await Notifications.requestPermissionsAsync();
    const isGranted = permission.granted || permission.ios?.status === IosNotificationPermissionStatus.PROVISIONAL;
    
    // Store status in app_meta
    await setAppMeta("notification_permission_status", isGranted ? "granted" : "denied");
    
    // If granted, proceed; if denied, banner will show on Dashboard
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    // Proceed; allow app to function without notifications
  }
}
```

### Permission Check (On Dashboard)

```typescript
async function checkNotificationPermission() {
  const status = await getAppMeta("notification_permission_status");
  return status === "granted";
}
```

### Open Settings

```typescript
async function openNotificationSettings() {
  const platform = Platform.OS;
  
  if (platform === "ios") {
    // iOS: Open app-specific settings
    Linking.openURL("app-settings:");
  } else if (platform === "android") {
    // Android: Open app's notification settings
    Linking.openURL(
      "android.settings.APP_NOTIFICATION_SETTINGS?app_package=" + Application.applicationId
    );
  }
}
```

---

## Banner Component

**File:** `src/components/NotificationPermissionBanner.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const NotificationPermissionBanner: React.FC<Props> = ({ visible, onDismiss }) => {
  if (!visible) return null;
  
  const handleOpenSettings = () => {
    // Open app settings (see openNotificationSettings logic above)
  };
  
  return (
    <View style={{ backgroundColor: '#fff3cd', padding: 12, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>
          🔔 Reminders are disabled
        </Text>
        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          Tap to enable notifications in Settings.
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={handleOpenSettings}
        style={{
          backgroundColor: '#007AFF',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 4,
          marginHorizontal: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={onDismiss}>
        <Text style={{ fontSize: 20, color: '#666' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## Assumptions

1. **Permission on Launch:** Permission request happens immediately on app launch (no deferral).
2. **Provisional Permission (iOS):** On iOS, "Allow Once" is treated as sufficient for MVP (provisional permission).
3. **Banner Persistence:** Banner persists until permission is granted or user enables it in Settings.
4. **Settings Link:** Tapping "Open Settings" opens native app settings (platform-specific).
5. **No Retry:** If user denies permission, we don't ask again until app restart (no "ask every time").
6. **App Functions Without Notifications:** If permission denied, app still works; just no reminders.

---

## Definition of Done

- ✅ Permission request shown on app launch.
- ✅ Permission status stored in app_meta.
- ✅ Banner shown on Dashboard if permission denied.
- ✅ "Open Settings" button in banner links to app settings.
- ✅ Permission recovery detected (banner disappears when permission enabled).
- ✅ Banner dismissal works (user can close; reappears on app restart).
- ✅ No crashes or errors.
- ✅ Works on iOS and Android.
- ✅ TypeScript passes; ESLint passes.
- ✅ Manual test steps all pass.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Use `expo-notifications` for permission request (already installed in ticket 001).
- Use `expo-application` to get app package ID for Android settings link.
- Store permission status in DB (`app_meta` table) for quick checks.
- Create a custom hook `useNotificationPermission()` to track permission state (simplifies components).
- Use `useEffect` on Dashboard to check permission status on mount and when app comes to foreground.
- Banner should be dismissible (user can close it manually), but reappear on app restart if permission still denied.
- Test on both iOS and Android; permission dialogs are platform-specific.
