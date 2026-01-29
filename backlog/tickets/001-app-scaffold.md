# Ticket 001: App Scaffold (Expo + React Native Base)

**ID:** 001  
**Title:** App Scaffold – Set up Expo project with navigation, DB layer, and notification layer  
**Status:** ✅ IMPLEMENTED  
**Complexity:** Medium  
**Priority:** P0 (Critical)

---

## Goal

Create the foundational structure for Bill Tracker: a working Expo + React Native project with:
- Navigation shell (React Navigation, tab or stack navigation).
- SQLite database initialization and query helpers.
- Notification service initialization and permission request flow.
- TypeScript + ESLint + Prettier configuration.
- Basic project file structure (components, screens, services, utils, assets).

---

## Acceptance Criteria

1. ✅ Expo project initialized with `expo init` or similar.
2. ✅ TypeScript configured and working (no errors on init).
3. ✅ React Navigation installed and basic navigation structure in place (e.g., tab navigation with placeholder screens).
4. ✅ SQLite database helper module created (`/src/db/database.ts` or similar):
   - `openDatabase()` function connects to SQLite.
   - `initDatabase()` function runs schema creation on first launch.
   - Exported query helpers (`runAsync()`, `getAsync()`, `getAllAsync()`).
5. ✅ Notification service module created (`/src/services/notifications.ts`):
   - `initializeNotifications()` function requests permission and sets up event listeners.
   - Exported helpers for scheduling and canceling notifications.
6. ✅ ESLint and Prettier configured; project passes linting.
7. ✅ Project runs on iOS and Android simulators without crashes.
8. ✅ `.gitignore` configured (node_modules, .expo, etc.).
9. ✅ `package.json` has all dependencies (Expo, React Native, React Navigation, SQLite, notifications, etc.).
10. ✅ App launches and shows a basic "Home" placeholder screen.

---

## Manual Test Steps

1. **Initialize Project:**
   - Clone/create repo.
   - Run `npm install` or `yarn install`.
   - Verify no dependency errors.

2. **Test TypeScript:**
   - Run `npx tsc --noEmit` (or equivalent) to verify no TS errors.

3. **Test Navigation:**
   - Run app on iOS simulator: `expo run:ios`.
   - Verify app opens and shows tab navigation (or stack navigation).
   - Tap tabs; verify placeholders screens load.

4. **Test Android:**
   - Run app on Android emulator: `expo run:android`.
   - Repeat tab navigation test.

5. **Test Database:**
   - Add a test script: import database module and call `initDatabase()`.
   - Verify SQLite file is created in app's document directory (check filesystem or logs).
   - No errors in console.

6. **Test Notifications:**
   - Add a test script: call `initializeNotifications()` on app launch.
   - Verify permission dialog appears on iOS (or Android) on first launch.
   - Grant permission; verify no errors in console.

7. **Test Linting:**
   - Run `npm run lint` (or `yarn lint`).
   - Verify no errors; fix any warnings.

8. **Verify `.gitignore` & Remote:**
   - Verify large folders like `node_modules` and `.expo` are ignored.
   - Push to GitHub; verify no ignored files are committed.

---

## Files Likely Touched / Created

```
bill-app/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── AddBillScreen.tsx (placeholder)
│   │   └── SettingsScreen.tsx (placeholder)
│   ├── components/
│   │   └── (empty, for now)
│   ├── services/
│   │   ├── notifications.ts
│   │   └── (other services)
│   ├── db/
│   │   ├── database.ts
│   │   └── migrations/ (empty for now)
│   ├── utils/
│   │   └── (helper functions)
│   ├── types/
│   │   └── (TypeScript types & interfaces)
│   ├── constants/
│   │   └── (config, constants)
│   └── navigation/
│       └── RootNavigator.tsx
├── assets/
│   ├── icons/ (icons added in ticket 009)
│   └── images/ (app logo, splash, etc.)
├── app.json (Expo config)
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── README.md
└── (other standard files)
```

---

## Assumptions

1. **Development Environment:** Assuming development on macOS or Windows with Xcode (iOS) and Android Studio (Android) installed.
2. **Expo CLI:** Using Expo CLI for project management (no bare React Native).
3. **Navigation Choice:** Using React Navigation (most popular, well-supported). Specific pattern (tabs, stack, drawer) will be finalized in ticket 002.
4. **Database on Launch:** Database is initialized synchronously on app launch (blocking slightly; acceptable for MVP).
5. **Notification Permission:** Permission is requested immediately on app launch (can be deferred to first "Add Bill" if user feedback suggests).
6. **No Authentication:** Skipping user account setup; local-first from the start.

---

## Dependencies to Install

```json
{
  "dependencies": {
    "expo": "^51.0.0",
    "react-native": "^0.74.0",
    "react": "^18.3.0",
    "@react-navigation/native": "^6.0.0",
    "@react-navigation/bottom-tabs": "^6.0.0",
    "@react-navigation/stack": "^6.0.0",
    "react-native-screens": "^3.0.0",
    "react-native-safe-area-context": "^4.0.0",
    "expo-sqlite": "^14.0.0",
    "expo-notifications": "^0.28.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Definition of Done

- ✅ Project initializes without errors.
- ✅ TypeScript passes type-checking.
- ✅ ESLint and Prettier pass.
- ✅ App runs on iOS and Android simulators.
- ✅ Database and notification services initialize on launch.
- ✅ All files follow project structure and naming conventions.
- ✅ README updated with setup instructions.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Keep architecture modular; separate concerns (DB, notifications, UI).
- Use React context or a simple state management library if needed (defer complex Redux setup).
- Document each module with JSDoc comments.
- Scaffold all placeholder screens (even if empty) so next tickets can fill them in.
- Ensure TypeScript is strict; configure `tsconfig.json` with reasonable defaults.
