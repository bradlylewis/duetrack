# ADR 001: Tech Stack Decision

**Status:** Accepted  
**Date:** Jan 28, 2026  
**Context:** Bill Tracker MVP requires a mobile-only solution (iOS + Android) with local-first data storage and local notifications.

---

## Decision

Use **React Native + Expo** as the primary framework, with **SQLite** for local storage and **expo-notifications** for reminders.

---

## Rationale

### React Native + Expo
- **One codebase for iOS + Android:** Reduces development time and maintenance overhead.
- **Rapid prototyping:** Expo provides a managed build service; no need for Xcode/Android Studio for development.
- **Vibrant ecosystem:** Well-established libraries for navigation, state management, notifications, and database access.
- **Live reload & fast iteration:** EAS Update allows OTA updates post-MVP.
- **Community support:** Large community; easy to find solutions and libraries.

### SQLite (via expo-sqlite)
- **Local-first:** No backend required; all data stored on device.
- **Reliable:** Battle-tested; used in production by millions of apps.
- **Privacy-focused:** No data leaves the device.
- **Performance:** Fast for <10,000 bills (MVP scope).
- **No learning curve:** Familiar SQL queries; easy to migrate later if needed.

### expo-notifications
- **Local-only:** Schedules notifications without a backend (no push service required).
- **Cross-platform:** Works on iOS and Android with minimal code difference.
- **Reliable:** Uses platform-native notification APIs under the hood.
- **Permission handling:** Built-in permission request flow.

### TypeScript
- **Type safety:** Catches errors at compile time.
- **Developer experience:** Better IDE support and autocomplete.
- **Maintainability:** Code is self-documenting; easier for team collaboration.

### React Navigation
- **Navigation standard:** De facto standard in React Native.
- **Flexible:** Supports tabs, stacks, drawers, and nesting.
- **Type-safe:** Works well with TypeScript.

### ESLint + Prettier
- **Code quality:** Enforces consistent code style.
- **Developer experience:** Automatic formatting; no bikeshedding.
- **Best practices:** Catches common mistakes.

---

## Alternatives Considered

### Alternative 1: Flutter + Dart
- **Pros:** Fast compilation, excellent UI toolkit, hot reload.
- **Cons:** Smaller ecosystem; fewer libraries; team less familiar with Dart.

### Alternative 2: Native iOS (Swift) + Native Android (Kotlin)
- **Pros:** Best performance; native look and feel.
- **Cons:** Two codebases; double development time; higher maintenance cost.

### Alternative 3: React Native (Bare Workflow)
- **Pros:** More control; can add custom native modules.
- **Cons:** More complex setup; Expo is simpler for MVP; can eject later if needed.

---

## Consequences

### Positive
- Fast development cycle; MVP can ship quickly.
- Shared codebase; easier to maintain both iOS and Android.
- Abundant libraries and community support.
- Can iterate and update easily (OTA updates via EAS).

### Negative
- Performance ceiling (React Native is slower than native); acceptable for MVP.
- App store review lag (typical 1–3 days per platform).
- Some platform-specific quirks require workarounds.

---

## Future Decisions

- **Post-MVP:** If performance becomes critical, can rewrite performance-critical sections in native code.
- **Monetization:** If adding payments, integrate Stripe or Paddle via React Native libraries.
- **Cloud Sync:** If adding accounts, use Firebase or similar backend; requires architectural changes.

---

## Related

- [ADR-002: Billing Rules & Monthly Rollover](002-billing-rules.md)
- [spec/schema.md](../spec/schema.md)
- [spec/product.md](../spec/product.md)
