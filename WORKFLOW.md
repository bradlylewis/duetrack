# Multi-Agent Workflow for Bill Tracker App

This document describes how to use specialized AI agents to develop features in an organized, quality-focused workflow.

---

## Quick Start

### 1. Start a Feature
```bash
# You (as Product Manager)
"Read .prompts/product-manager.md. Review the current bill tracker app 
and create 5 prioritized GitHub issues for the next iteration."
```

### 2. Pick an Issue
```bash
# You (as Developer)
"Read .prompts/developer.md. I'm implementing issue #5: 'Add bill categories'. 
Here's the issue description: [paste]. Implement this feature."
```

### 3. Review the Code
```bash
# You (as Senior Dev)
"Read .prompts/senior-dev.md. Review the code I just wrote for the 
categories feature. Here are the changed files: [paste or reference files]"
```

### 4. Test It
```bash
# You (as QA)
"Read .prompts/qa-engineer.md. Create a test plan for the categories 
feature and identify edge cases I should test manually."
```

### 5. Fix Bugs
```bash
# You (as Developer again)
"Read .prompts/developer.md. QA found these issues: [paste]. Fix them."
```

---

## Agent Roles

### 🎯 Product Manager (`.prompts/product-manager.md`)
**Use When:** Planning features, prioritizing work, writing user stories

**Example Prompts:**
- "Create 5 GitHub issues for improving the dashboard UX"
- "Prioritize these feature requests by user value"
- "Write acceptance criteria for a bill categories feature"
- "What features would improve user retention?"

**Output:** GitHub issue descriptions, user stories, priorities

---

### 💻 Developer (`.prompts/developer.md`)
**Use When:** Implementing features, writing code, fixing bugs

**Example Prompts:**
- "Implement issue #7: Add bill search functionality"
- "Fix this TypeScript error: [paste error]"
- "Add a filter to the dashboard by category"
- "Refactor the BillCard component to reduce duplication"

**Output:** Code changes, file edits, implementations

---

### 👴 Senior Developer (`.prompts/senior-dev.md`)
**Use When:** Reviewing code, architecture decisions, performance optimization

**Example Prompts:**
- "Review the code for the search feature: [paste files or git diff]"
- "What are the performance implications of this database query?"
- "Suggest architectural improvements for the notification system"
- "Review this component for React best practices"

**Output:** Code review feedback, architectural suggestions, improvement recommendations

---

### 🧪 QA Engineer (`.prompts/qa-engineer.md`)
**Use When:** Creating test plans, finding edge cases, verifying fixes

**Example Prompts:**
- "Create a test plan for the bill categories feature"
- "What edge cases should I test for the search functionality?"
- "Create a bug report template for this crash: [paste error]"
- "Verify that fix #123 doesn't cause regressions"

**Output:** Test plans, edge case lists, bug reports, test scenarios

---

## Recommended Workflows

### Workflow 1: New Feature (Full Cycle)
```
1. Product Manager → Create issue
2. Developer → Implement feature
3. Senior Dev → Code review
4. Developer → Address review feedback
5. QA → Create test plan + find bugs
6. Developer → Fix bugs
7. Senior Dev → Final review
8. QA → Verify fixes
9. Ship ✅
```

### Workflow 2: Bug Fix (Fast)
```
1. QA → Document bug with repro steps
2. Developer → Fix bug
3. Senior Dev → Quick review
4. QA → Verify fix + check for regressions
5. Ship ✅
```

### Workflow 3: Refactoring (Quality)
```
1. Senior Dev → Identify refactoring opportunity
2. Senior Dev → Propose architectural changes
3. Developer → Implement refactoring
4. Senior Dev → Review changes
5. QA → Regression testing
6. Ship ✅
```

### Workflow 4: Planning Sprint (Start of work)
```
1. Product Manager → Review current app state
2. Product Manager → Create 10 prioritized issues
3. Senior Dev → Review technical feasibility
4. Product Manager → Adjust priorities based on feedback
5. You → Pick top issue and start Workflow 1
```

---

## Practical Usage Tips

### Starting a New Chat
Always include the role context:
```
"Read .prompts/[role].md and act as that role for this conversation."
```

### Context Switching
You can switch roles mid-conversation:
```
"Now switch to .prompts/senior-dev.md and review what we just built."
```

### Maintaining Context
- **Same feature?** Continue the same chat
- **Different feature?** Start a new chat (avoids context bloat)
- **Multiple related changes?** Keep in same chat with clear delineation

### Efficient Workflow
```bash
# Morning: Plan the day
Chat 1 (PM): "Create today's issues"

# Implementation
Chat 2 (Dev): "Implement issue #15"
  → Code changes made
  → Switch role: "Now as Senior Dev, review this"
  → Feedback received
  → "Back to Dev, address the feedback"

# Testing
Chat 3 (QA): "Test the feature from issue #15"
  → Bugs found
  
# Bug fixes
Back to Chat 2 (Dev): "Fix these bugs: [paste]"
```

---

## File Structure

```
bill-app/
  .prompts/
    product-manager.md    # PM role definition
    developer.md          # Dev role definition
    senior-dev.md         # Senior dev role definition
    qa-engineer.md        # QA role definition
  WORKFLOW.md             # This file
  ...rest of project
```

---

## Example Issue Created by Product Manager

```markdown
**Title:** Add bill categories for better organization

**User Story:** 
As a bill payer, I want to organize my bills into categories (Utilities, 
Subscriptions, Housing, etc.) so that I can quickly filter and view related bills.

**Priority:** P1 (High)
**Effort:** Medium
**Labels:** enhancement, UX

**Acceptance Criteria:**
- [ ] User can assign a category when creating/editing a bill
- [ ] Predefined categories: Utilities, Housing, Transport, Food, Subscriptions, Other
- [ ] Dashboard shows category filter chips
- [ ] Selecting a category filters the bill list
- [ ] Category shown on bill cards
- [ ] Database stores category (migration needed)

**Technical Notes:**
- Add `category` column to bills table (nullable for existing bills)
- Use horizontal ScrollView for category chips
- Maintain existing urgency grouping when filtering
- Empty state when no bills match selected category

**Success Metrics:**
- Users with 5+ bills use categories
- Reduced time to find specific bills
```

---

## Troubleshooting

### "Agent isn't following the role"
- Make sure to include: `"Read .prompts/[role].md"`
- Provide clear context about what you're working on
- Be specific about what you want the agent to do

### "Too much context in one chat"
- Start fresh chats for unrelated features
- Use GitHub issues as handoff points between agents
- Keep conversations focused on one feature/bug at a time

### "Agent missed something"
- Ask follow-up questions
- Switch to Senior Dev role for deeper review
- Use QA role to systematically find gaps

---

## Next Steps

1. **Create your first issues:**
   ```
   "Read .prompts/product-manager.md. Review the bill tracker app and 
   create 5 high-priority issues for the next development sprint."
   ```

2. **Pick an issue and implement:**
   ```
   "Read .prompts/developer.md. Implement issue #[number]."
   ```

3. **Get it reviewed:**
   ```
   "Read .prompts/senior-dev.md. Review the code for issue #[number]."
   ```

4. **Test it:**
   ```
   "Read .prompts/qa-engineer.md. Create test cases for issue #[number]."
   ```

---

## Tips for Success

✅ **DO:**
- Use role prompts at the start of each conversation
- Keep conversations focused on one feature/bug
- Let agents specialize in their domain
- Treat code reviews seriously (don't skip them)
- Create detailed test plans before manual testing

❌ **DON'T:**
- Mix multiple unrelated features in one chat
- Skip the code review step
- Ignore edge cases found by QA
- Forget to test on actual device
- Deploy without regression testing

---

Happy building! 🚀
