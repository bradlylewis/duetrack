# Ticket 002: Navigation Shell & Layout

**ID:** 002  
**Title:** Set up navigation flow and layout (tabs, stacks, bottom nav)  
**Status:** Ready to Implement  
**Complexity:** Low-Medium  
**Priority:** P0 (Critical)

---

## Goal

Design and implement the main navigation structure for Bill Tracker:
- Tab-based navigation for primary sections (Dashboard, Add Bill, Settings/History).
- Ensure screens have headers, back buttons, and consistent styling.
- Create a reusable layout component for consistent margins, safe areas, and styling.
- Define the navigation flow for deep-linking (e.g., tap notification → bill details).

---

## Acceptance Criteria

1. ✅ Tab navigation created with at least 3 tabs:
   - **Dashboard** (Upcoming Bills)
   - **History/Completed Bills** (view past payments)
   - **Settings** (placeholder for now)
2. ✅ Each tab has a dedicated Navigator (stack inside tab if needed for sub-navigation).
3. ✅ Dashboard tab shows a home screen with placeholder content.
4. ✅ Header bar with app title or logo.
5. ✅ Safe area insets handled (iOS notch, Android status bar).
6. ✅ Consistent spacing, padding, and fonts across all screens.
7. ✅ Back button works on all stack screens.
8. ✅ Bottom tab bar styled consistently (icon + label, highlight on active tab).
9. ✅ Navigation state persists across app lifecycle (navigate away and back).
10. ✅ Placeholder screens are ready to be filled in by later tickets.

---

## Manual Test Steps

1. **Launch App:**
   - Run on iOS simulator.
   - Verify 3 tabs visible at bottom.

2. **Tab Navigation:**
   - Tap each tab; verify screen changes.
   - Verify tab highlights correctly.
   - Tap same tab again; verify no unnecessary reload.

3. **Back Navigation (if nested stacks exist):**
   - Navigate to a sub-screen (if any in this ticket).
   - Verify back button appears in header.
   - Tap back; verify return to parent screen.

4. **Safe Areas:**
   - Verify content respects notch on iPhone X/12+.
   - Verify content does not overlap with Android status bar.

5. **Styling Consistency:**
   - Verify fonts, colors, and spacing are consistent.
   - Check that buttons are at least 44x44pt.

6. **Android Testing:**
   - Repeat tests on Android emulator.
   - Verify tab bar placement (usually bottom) and back button behavior.

7. **State Persistence:**
   - Navigate through tabs, then close app.
   - Reopen; verify you're still on the same tab (if state should persist).

---

## Files Likely Touched / Created

```
src/
├── navigation/
│   ├── RootNavigator.tsx (main navigator with tabs)
│   ├── HomeStack.tsx (Dashboard stack)
│   ├── HistoryStack.tsx (History stack)
│   ├── SettingsStack.tsx (Settings stack)
│   ├── types.ts (navigation types, RootParamList, etc.)
│   └── LinkingConfiguration.ts (deep linking config)
├── screens/
│   ├── HomeScreen.tsx (placeholder, will be filled by ticket 005)
│   ├── HistoryScreen.tsx (placeholder, will be filled by ticket 006)
│   ├── SettingsScreen.tsx (placeholder)
│   ├── BillDetailsScreen.tsx (placeholder, will be filled later)
│   └── AddBillScreen.tsx (placeholder, will be filled by ticket 004)
├── components/
│   ├── Layout.tsx (wrapper for safe area, padding, etc.)
│   ├── Header.tsx (consistent header component)
│   └── TabBar.tsx (optional, if custom tab bar styling needed)
└── styles/
    ├── colors.ts (app color palette)
    ├── typography.ts (font sizes, weights)
    └── spacing.ts (padding, margin constants)
```

---

## Assumptions

1. **Tab-Based Navigation:** Assuming bottom-tab navigation is most intuitive for mobile (vs. drawer).
2. **Three Primary Tabs:** Dashboard (bills), History (completed), Settings (for future expansion).
3. **No Complex Nesting Initially:** Simple tab + optional stack per tab (no nested tabs or drawer combinations yet).
4. **Deep Linking:** Basic support for navigating from notification tap (implemented in this ticket, but notification integration is in ticket 007).
5. **Consistent Design Language:** All screens follow a single design system (colors, spacing, typography).

---

## Dependencies

- React Navigation (already installed in ticket 001).
- `@react-navigation/bottom-tabs` for tab navigation.
- `@react-navigation/stack` for stack navigation within tabs.
- `react-native-safe-area-context` for safe area handling.

---

## Definition of Done

- ✅ Tab navigation renders without errors.
- ✅ All tabs are interactive and switch screens correctly.
- ✅ Header and bottom tab bar are visible and styled.
- ✅ Safe areas respected on both iOS and Android.
- ✅ Navigation types (TypeScript) defined and used.
- ✅ All screens are placeholder-ready for filling in later.
- ✅ App passes linting and TypeScript checks.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Define navigation type definitions in `navigation/types.ts` for type-safe navigation.
- Use `@react-navigation/bottom-tabs` for the main tab navigator.
- Create a reusable `Layout` component that wraps all screens with consistent padding and safe area.
- Use a centralized `colors.ts` and `typography.ts` for consistency.
- Placeholder screens should have a simple centered text or image (e.g., "Coming Soon").
- Test back button behavior; ensure it's available only when needed (stack navigation context).
