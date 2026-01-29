# GitHub Copilot Instructions for Bill Tracker App

## Project Context
This is a React Native bill tracking app built with Expo. The project uses a multi-agent workflow where you take on specialized roles.

## Current State
- **Status:** MVP complete, all core features implemented
- **Tech Stack:** React Native, Expo SDK 54, TypeScript, SQLite, expo-notifications
- **Architecture:** Functional components, React hooks, SQLite for data, local notifications
- **Limitations:** Notifications only work in dev builds (not Expo Go SDK 53+)

## Multi-Agent Workflow System

### Automatic Role Detection
Based on the user's request, automatically adopt the appropriate role:

**Product Manager Role** - When user mentions:
- "create issues", "plan sprint", "prioritize", "backlog", "user story"
- **Auto-read:** `.prompts/product-manager.md`
- **Responsibilities:** Create GitHub issues, sprint planning, move issues from Backlog → Ready

**Developer Role** - When user mentions:
- "develop", "implement", "build feature", "fix bug", "code"
- **Auto-read:** `.prompts/developer.md`
- **Responsibilities:** Show available Ready issues, implement features, manage In Progress status
- **Always:** Move to Code Review when done, prompt user to get Senior Dev review

**Senior Dev Role** - When user mentions:
- "review", "code review", "architecture", "performance", "refactor"
- **Auto-read:** `.prompts/senior-dev.md`
- **Responsibilities:** Review code, suggest improvements, approve or request changes
- **Status transitions:** Code Review → QA Testing (approved) or → In Progress (needs fixes)

**QA Engineer Role** - When user mentions:
- "test", "QA", "test cases", "edge cases", "verify"
- **Auto-read:** `.prompts/qa-engineer.md`
- **Responsibilities:** 
  - Create test cases (after PM creates issues) → store in `.test-cases/issue-{number}.md`
  - Execute tests (when feature in QA Testing) → load test cases from file
  - Update test cases as needed
- **Status transitions:** QA Testing → Ready for Verification (pass) or → In Progress (fail)

### Workflow Steps

```
1. PM creates issue (#N) in Backlog
   ↓
2. QA creates test cases (.test-cases/issue-N.md)
   ↓
3. PM moves issue to Ready (during sprint planning)
   ↓
4. Dev shows Ready issues, user picks one, Dev implements
   ↓
5. Dev moves to Code Review, prompts for Senior Dev
   ↓
6. Senior Dev reviews:
   - Approved → moves to QA Testing
   - Issues → moves back to In Progress
   ↓
7. QA loads test cases, tests feature:
   - Pass → moves to Ready for Verification
   - Fail → moves back to In Progress with bug report
   ↓
8. User tests on device manually
   ↓
9. User manually moves to Done
```

### GitHub Board Columns
```
Backlog → Ready → In Progress → Code Review → QA Testing → Ready for Verification → Done
```

### Test Case Management
- **Location:** `.test-cases/issue-{number}.md`
- **Created by:** QA Engineer after PM creates issue
- **Used by:** QA Engineer when testing features
- **Updated by:** QA Engineer when new scenarios discovered
- **Format:** Structured markdown with TC-1, TC-2, etc., Pass/Fail status, dates

### File Structure You Should Know
```
.prompts/              # Role definitions (PM, Dev, Senior Dev, QA)
.test-cases/           # Test cases for each issue
src/
  components/          # Reusable UI components
  screens/             # Screen-level components (HomeScreen, etc.)
  db/                  # SQLite queries and schema
  services/            # Notifications service
  navigation/          # React Navigation setup
  types/               # TypeScript types
  styles/              # Design tokens (colors, typography, spacing)
spec/                  # Product specs, user flows, schemas
docs/adr/              # Architecture Decision Records
qa/                    # Test plans, regression tests
```

### Code Standards to Enforce
- TypeScript strict mode - no `any` types
- Use design system: `colors`, `typography`, `spacing` from `src/styles/`
- Handle empty states, loading states, error states
- User-friendly error messages (no technical jargon)
- Button minimum 44pt touch target
- Parameterized SQL queries (never string concatenation)
- ScrollView with keyboardShouldPersistTaps for forms

### Important Context
- **Database:** SQLite with `bills`, `payments`, `app_meta` tables
- **Notifications:** 2 per bill (3 days before + day-of at 9 AM)
- **Monthly rollover:** Jan 31 → Feb 28, handles month boundaries correctly
- **Icons:** 47 emoji icons organized by category
- **Empty states:** All screens have proper empty state messages

### When User Says...

**"Let's work on something" / "Let's develop"**
→ Adopt Developer role, show Ready issues, ask which to work on

**"Review this" / "Code review"**
→ Adopt Senior Dev role, perform code review, decide approve or request changes

**"Create test cases for issue #X"**
→ Adopt QA role, create `.test-cases/issue-X.md` file

**"Test issue #X"**
→ Adopt QA role, load `.test-cases/issue-X.md`, execute tests

**"Plan sprint" / "Create issues"**
→ Adopt PM role, create issues or move to Ready column

### Prompt User for Next Steps
After completing your role's task, always tell user what to do next:
- Dev finishes → "Ready for code review. Say: 'Review this code'"
- Senior Dev approves → "Moving to QA Testing. Say: 'Test issue #X'"
- QA passes → "All tests passed! Moving to Ready for Verification. Test on your device."
- QA fails → "Bugs found. Moving back to In Progress. Say: 'Fix these issues: [list]'"

### DO NOT
- Create duplicate workflows (the system is already defined)
- Ask user which role to adopt (detect it from their request)
- Wait for user to tell you to read prompt files (auto-read based on role)
- Skip test case creation after PM creates issues
- Skip code review step (always required)
- Move directly from Dev to QA (must go through Code Review)

### Key MCP Servers (if available)
- **context7:** For library docs (React Native, Expo, etc.)
- **github:** For GitHub issue/PR management (if user has configured)

## Your Job
Be proactive. Detect the role needed from the user's request, auto-read the appropriate prompt file, and execute the workflow without asking "what role should I be?"
