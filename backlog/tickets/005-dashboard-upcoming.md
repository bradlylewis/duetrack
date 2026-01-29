# Ticket 005: Dashboard – Upcoming Bills View

**ID:** 005  
**Title:** Implement Dashboard with bill grouping and UI  
**Status:** ✅ IMPLEMENTED  
**Complexity:** Medium  
**Priority:** P1 (High)

---

## Goal

Build the main Dashboard screen (HomeScreen) that displays all upcoming bills, grouped by urgency:
- **Overdue:** Past due date (sorted oldest first).
- **Due This Week:** Due within 7 days.
- **Due Later:** All other upcoming bills.

Each group shows a count badge, and bills are sorted by due date within each group. The Dashboard is the app's home screen and primary interaction point.

---

## Acceptance Criteria

1. ✅ Dashboard loads all bills from DB on screen mount.
2. ✅ Bills are grouped correctly:
   - **Overdue:** dueDate < today AND status = "active" AND (no recent payment within last 7 days).
   - **Due This Week:** dueDate >= today AND dueDate <= today + 7 days.
   - **Due Later:** dueDate > today + 7 days.
3. ✅ Within each group, bills sorted by due date (earliest first).
4. ✅ Each group shows a count badge (e.g., "2 Overdue").
5. ✅ Each bill card shows:
   - Icon (from icon set).
   - Name.
   - Due date (human-readable, e.g., "Due Jan 31").
   - Amount (if set).
   - Autopay badge/indicator (if enabled).
6. ✅ Tapping a bill card opens Bill Details screen.
7. ✅ Empty states for each section:
   - If no overdue bills: "No overdue bills" (or similar, friendly message).
   - If no due this week: "Nothing due this week" (or similar).
   - If no due later: "No upcoming bills" (or similar).
8. ✅ If all sections are empty: "No bills yet. Add your first bill to get started."
9. ✅ "Add Bill" button visible (usually in header or footer).
10. ✅ Pull-to-refresh functionality to reload bills from DB.
11. ✅ Dashboard refreshes when returning from Add/Edit (bills appear immediately).
12. ✅ Swipe to delete (optional, but nice-to-have; can defer).
13. ✅ Smooth animations/transitions (not jittery).

---

## Manual Test Steps

1. **Empty Dashboard:**
   - Fresh install or cleared app.
   - Verify empty state message: "No bills yet. Add your first bill to get started."

2. **Add Bills & Verify Grouping:**
   - Add bill due today: "Bill A"
   - Add bill due tomorrow: "Bill B"
   - Add bill due 3 days from now: "Bill C"
   - Add bill due 10 days from now: "Bill D"
   - Add bill due 30 days from now: "Bill E"
   - Verify Dashboard shows:
     - **Overdue:** (empty, no message visible or "No overdue bills")
     - **Due This Week:** Bill A (due today), Bill B (due tomorrow), Bill C (due 3 days away) – sorted by date.
     - **Due Later:** Bill D, Bill E – sorted by date.

3. **Overdue Bills:**
   - Manually set system time backward (or use DB manipulation for testing).
   - Add bill due yesterday: "Bill Z"
   - Verify Bill Z appears in Overdue group.
   - Verify Overdue count badge updates.

4. **Tap Bill Card:**
   - Tap "Bill A" on Dashboard.
   - Verify Bill Details screen opens.
   - Verify bill data is displayed correctly.

5. **Pull to Refresh:**
   - On Dashboard, pull down to refresh.
   - Verify refresh indicator appears and disappears.
   - Verify bills reload (or stay same if no changes).

6. **Return from Add Bill:**
   - From Dashboard, tap "Add Bill".
   - Fill in and save a new bill.
   - Verify Dashboard automatically updates with new bill in correct group.

7. **Bill Counts:**
   - Verify group badges show correct counts (e.g., "3 Due This Week").

8. **UI/Styling:**
   - Verify all text is readable (high contrast, adequate size).
   - Verify icons display correctly.
   - Verify autopay badge displays (if bill has autopay enabled).
   - Verify spacing and alignment are consistent.

9. **Performance:**
   - Add 50+ bills to DB (via test script).
   - Verify Dashboard still loads in <2 seconds.
   - Verify scrolling is smooth (no jank).

10. **Android Testing:**
    - Repeat all tests on Android emulator.
    - Verify grouping logic is the same.

---

## Files Likely Touched / Created

```
src/
├── screens/
│   └── HomeScreen.tsx (main Dashboard)
├── components/
│   ├── BillGroupSection.tsx (one group with header, badge, bill list)
│   ├── BillCard.tsx (individual bill item)
│   ├── EmptyStateMessage.tsx (generic empty state)
│   └── LoadingSpinner.tsx (if needed)
├── utils/
│   ├── date-grouping.ts (logic to group bills by due date)
│   └── date-formatting.ts (format dates for display)
└── constants/
    └── ui-constants.ts (spacing, colors for groups)
```

---

## Grouping Logic (Pseudo-code)

```typescript
function groupBillsByUrgency(bills: Bill[]): {
  overdue: Bill[];
  thisWeek: Bill[];
  later: Bill[];
} {
  const today = getStartOfDay(new Date());
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const overdue = bills
    .filter(b => new Date(b.dueDate) < today && b.status === "active" && !hasRecentPayment(b))
    .sort((a, b) => a.dueDate - b.dueDate);
  
  const thisWeek = bills
    .filter(b => new Date(b.dueDate) >= today && new Date(b.dueDate) < sevenDaysFromNow && b.status === "active")
    .sort((a, b) => a.dueDate - b.dueDate);
  
  const later = bills
    .filter(b => new Date(b.dueDate) >= sevenDaysFromNow && b.status === "active")
    .sort((a, b) => a.dueDate - b.dueDate);
  
  return { overdue, thisWeek, later };
}
```

---

## Assumptions

1. **Status = Active:** Only show bills with status="active" (completed bills hidden by default).
2. **Overdue Definition:** Bill is overdue if due_date < today AND no payment within last 7 days (prevents showing as overdue immediately after paying).
3. **Timezone:** Use device's local timezone for grouping (today = start of day in local time).
4. **Empty State Content:** Friendly, encouraging messages (not warnings or errors).
5. **Sorting:** Within each group, sort by due date (earliest first).
6. **Refresh:** Pull-to-refresh reloads from DB (not cached).
7. **No Pagination:** All bills loaded at once (assume <1000 bills for MVP).
8. **Card Height:** Bill cards are consistent height, tap target >= 44pt.

---

## Definition of Done

- ✅ Dashboard screen implemented and styled.
- ✅ Bills grouped correctly by urgency.
- ✅ All three groups show counts and empty states.
- ✅ Bill cards display all relevant info (icon, name, date, amount, autopay).
- ✅ Tapping bill card navigates to details.
- ✅ "Add Bill" button accessible (header or footer).
- ✅ Pull-to-refresh works.
- ✅ Dashboard updates when returning from Add/Edit.
- ✅ Performance is smooth (no jank, <2s load time).
- ✅ TypeScript passes; ESLint passes.
- ✅ Manual test steps all pass.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Extract grouping logic into a pure utility function (testable, reusable).
- Use `useFocusEffect` from React Navigation to refresh bills when returning to Dashboard.
- Consider using `FlatList` or `SectionList` for efficient rendering of large bill lists.
- `SectionList` is ideal for grouped data (Overdue, This Week, Later sections).
- Use React query or SWR for data fetching, or simple useState + useEffect.
- Implement pull-to-refresh using `FlatList` or `ScrollView` with refresh control.
- Test grouping logic with unit tests (dates, edge cases).
- Format dates consistently (e.g., "Due Jan 31" or "In 2 days").
