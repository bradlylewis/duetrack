# Bill Tracker MVP

A mobile-first app for tracking bills, marking payments, and receiving reminders to never miss a payment.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Xcode (for iOS) or Android Studio (for Android)

### Installation

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd bill-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on iOS:
   ```bash
   npm run ios
   ```

5. Run on Android:
   ```bash
   npm run android
   ```

## Project Structure

```
bill-app/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── services/         # Business logic (DB, notifications)
│   ├── db/               # Database layer
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── constants/        # App constants
│   ├── navigation/       # Navigation configuration
│   └── styles/           # Global styles and themes
├── assets/               # App icons, images
├── spec/                 # Product and technical specifications
├── backlog/              # Feature tickets
├── qa/                   # QA test plans
├── docs/                 # Documentation and ADRs
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── .eslintrc.json        # ESLint config
```

## Development

### Code Style

- **Linting:** Run `npm run lint` to check code style.
- **Formatting:** Run `npm run format` to auto-format code.
- **Type Checking:** Run `npm run type-check` to check TypeScript.

### Testing

Run tests with:
```bash
npm test
```

## Documentation

- [Product Spec](./spec/product.md)
- [User Flows](./spec/flows.md)
- [Database Schema](./spec/schema.md)
- [Notification Rules](./spec/notifications.md)
- [Icon Specs](./spec/icons.md)
- [Tech Stack ADR](./docs/adr/001-stack.md)
- [Billing Rules ADR](./docs/adr/002-billing-rules.md)

## Features (MVP)

- ✅ Add, edit, and delete bills
- ✅ Dashboard with upcoming bills grouped by urgency
- ✅ Mark bills as paid (with monthly rollover)
- ✅ Local notifications (3 days before + day-of at 9 AM)
- ✅ Icon picker with 30+ built-in icons
- ✅ Payment history tracking
- ✅ Timezone and DST handling

## Build & Deployment

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## Troubleshooting

### Permission Errors on Windows

If you encounter permission errors, run PowerShell as Administrator or use WSL.

### Node Modules Issues

Clear and reinstall:
```bash
rm -r node_modules
npm install
```

## Contributing

1. Create a feature branch from `main`.
2. Make changes following the code style (ESLint + Prettier).
3. Add tests for new features.
4. Submit a pull request.

## License

(To be determined)

## Contact

For questions or issues, open an issue on GitHub.
