# ADR 002: Billing Rules & Monthly Rollover

**Status:** Accepted  
**Date:** Jan 28, 2026  
**Context:** Bill Tracker needs to handle monthly recurring bills and determine when and how to advance due dates.

---

## Decision

When a monthly bill is marked as paid, the next due date is calculated by adding 1 month to the current due date. If the day-of-month is invalid in the next month (e.g., Jan 31 → Feb 31, which doesn't exist), the due date is set to the last day of the next month (Feb 28 or Feb 29).

---

## Rationale

### Monthly Rollover Rule
- **User expectation:** If a user has a bill due on the 31st, they expect it to recur on the 31st of each month (or the closest valid date).
- **Implementation:** Most accounting systems and finance apps follow this approach.
- **Examples:**
  - Jan 31 → Pay in Jan → Next due: Feb 28 (or Feb 29 in leap year).
  - Feb 28 → Pay in Feb → Next due: Mar 28 (unless it's a leap year; then Feb 29 → Mar 29).
  - Dec 31 → Pay in Dec → Next due: Jan 31.

### Rationale for "Last Day of Month" Approach
- **Consistent:** Users expect rent/mortgage due on "the end of the month" to always be the last day.
- **Financial correctness:** Many utilities and subscriptions follow this rule.
- **Avoids complexity:** Simpler than trying to find "the nearest valid day" (which could be ambiguous).

---

## Alternatives Considered

### Alternative 1: Fixed Day of Month
- **Rule:** Always set to day 31 if possible, else 30, else 28.
- **Problem:** Unintuitive; a bill due on "the 15th" might skip some months.

### Alternative 2: Keep Same Day If Invalid
- **Rule:** If Feb 31 is invalid, don't advance; stay on Jan 31 (or error).
- **Problem:** Breaks monthly recurrence; user would need to manually reschedule.

### Alternative 3: Prompt User for Next Due Date
- **Rule:** When marking a bill due on Jan 31 as paid, show a dialog: "Next due: Feb 28 (OK?) or [Custom Date]".
- **Problem:** Adds friction; users should not have to think about this for MVP.

---

## Implementation

### Algorithm

```typescript
function calculateNextDueDate(currentDueDate: number): number {
  const current = new Date(currentDueDate);
  const originalDay = current.getDate();
  
  // Create date for next month with same day
  const next = new Date(
    current.getFullYear(),
    current.getMonth() + 1,
    originalDay
  );
  
  // If day is invalid for next month (e.g., Feb 31), JS sets it to next month's last day
  // Verify and adjust if needed
  if (next.getDate() !== originalDay) {
    // Day doesn't exist; set to last day of the intended month
    next.setDate(0); // This gives us the last day of the previous month
    next.setMonth(next.getMonth() + 1); // Move back to the intended month
  }
  
  return next.getTime();
}
```

### Test Cases

| Current Due | Next Month | Expected Result | Notes |
|---|---|---|---|
| Jan 31 | Feb | Feb 28 | February has 28 days (non-leap) |
| Jan 31 | Feb (leap) | Feb 29 | February has 29 days (leap year) |
| Mar 31 | Apr | Apr 30 | April has 30 days |
| May 31 | Jun | Jun 30 | June has 30 days |
| Dec 31 | Jan | Jan 31 | January has 31 days |
| Feb 29 (leap) | Feb (non-leap) | Feb 28 | Non-leap year; use last day |
| Jun 30 | Jul | Jul 30 | Same day exists in next month; no adjustment |

---

## Consequences

### Positive
- **User-friendly:** Matches user expectations for "monthly recurring on the 31st."
- **Automatic:** No manual intervention needed; bills recur seamlessly.
- **Deterministic:** Algorithm is clear and testable.

### Negative
- **Lease agreements:** Some leases are due "on the 15th" specifically; if Feb 15 → Mar 15 is expected but we stick to day-15, no issue. But if Feb 29 exists in a leap year, edge cases could arise (though this is rare).

---

## One-Time Bills

**Rule:** One-time bills are NOT advanced. Once marked as paid:
1. A payment record is created.
2. Bill status is set to "completed".
3. Bill is hidden from the upcoming view.
4. Bill is kept in the database for historical reference (payment history).

**Rationale:** One-time bills do not recur by definition. Hiding them keeps the dashboard clean. Keeping them in the database allows the user to see that they were paid (for records/tax purposes).

---

## Notification Rescheduling

**After Marking as Paid:**
- **Monthly bills:** Reminders are rescheduled for the new due date (3 days before + day-of at 9 AM).
- **One-time bills:** Reminders are canceled (bill will not recur).

---

## Future Considerations

- **Advanced recurrence:** Biweekly, quarterly, or custom intervals (out of MVP scope).
- **Flexible payment dates:** Allow user to manually set next due date (future UX enhancement).
- **Auto-skip:** If a bill due on Feb 29 is paid late (on Mar 15), determine next due date based on payment date or original due date (decision: use original due date for simplicity).

---

## Related

- [ADR-001: Tech Stack Decision](001-stack.md)
- [spec/schema.md](../spec/schema.md)
- [spec/flows.md](../spec/flows.md) (Flow 5: Mark Bill as Paid)
- [backlog/tickets/006-mark-paid-history.md](../../backlog/tickets/006-mark-paid-history.md)
