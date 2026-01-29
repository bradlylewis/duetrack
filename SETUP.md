# Setup Instructions

## ⚠️ Important: Install Dependencies First

Before running the app, you need to install all project dependencies.

### Option 1: Using PowerShell with Execution Policy Bypass (Recommended)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
```

### Option 2: Using Command Prompt (cmd.exe)

```cmd
npm install
```

### Option 3: Using Git Bash or WSL

```bash
npm install
```

## After Installation

Once dependencies are installed, you can start the app:

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser (limited functionality)

## What's Been Completed

### ✅ Ticket 001: App Scaffold
- Database layer with SQLite
- Notification service
- Basic navigation structure
- TypeScript configuration
- Testing setup

### ✅ Ticket 002: Navigation Shell & Layout
- Complete navigation system with tabs and stacks
- Reusable UI components (Layout, Header)
- Style system (colors, typography, spacing)
- All placeholder screens
- Deep linking configuration

## Next Up

**Ticket 003:** Database Schema (already mostly complete from Ticket 001)
**Ticket 004:** Bills CRUD - Implement Add/Edit/Delete bill functionality

## Known Issues

- Dependencies need to be installed (node_modules folder is missing)
- PowerShell execution policy may need adjustment on Windows
- TypeScript errors will appear until `npm install` completes

## Troubleshooting

### "Cannot find module 'react'" errors
These will disappear after running `npm install` successfully.

### PowerShell execution policy error
Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Expo CLI not found
Install globally: `npm install -g expo-cli` or `npx expo`
