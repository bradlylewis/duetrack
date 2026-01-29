# Ticket 006: Mark Paid & Payment History

**ID:** 006  
**Title:** Implement Mark Paid action and payment history view  
**Status:** ✅ IMPLEMENTED  
**Complexity:** Medium  
**Priority:** P1 (High)

---

## Goal

Build the "Mark Paid" functionality and payment history view:
- **Mark Paid Button:** On bill details, user can mark bill as paid.
- **For Monthly Bills:** Payment recorded; due date advanced to next month (respecting rollover rule).
- **For One-Time Bills:** Payment recorded; bill marked as completed and hidden from upcoming.
- **Payment History:** Show all past payments for a bill (date, amount).
- **Behavior:** After marking paid, bill moves to appropriate group (or disappears if one-time).

---

## Acceptance Criteria

1. ✅ "Mark Paid" button visible on Bill Details screen.
2. ✅ Tapping "Mark Paid" shows a confirmation dialog (optional) or immediate action.
3. ✅ Payment record is inserted into DB with:
   - billId (linked to bill).
   - paidDate (timestamp of now).
   - amountPaid (defaults to bill.amount; can be overridden if needed).
4. ✅ **For Monthly Bills:**
   - Due date advanced by 1 month.
   - Rollover rule applied (if due date is Jan 31, next due date is Feb 28/29, not Feb 31).
   - Bill remains in "active" status.
   - Reminders rescheduled for new due date.
5. ✅ **For One-Time Bills:**
   - Status changed to "completed".
   - Bill hidden from upcoming view (does not appear in Dashboard groupings).
   - Payment record stored for history.
6. ✅ Payment History shown on Bill Details:
   - List/table of all payments for that bill.
   - Shows: paidDate (formatted), amountPaid.
   - Empty state if no payments: "No payment history yet."
7. ✅ After marking paid, user is returned to Dashboard or Bill Details (refreshed).
8. ✅ Dashboard immediately reflects the change:
   - Monthly bill appears in new due date group.
   - One-time bill disappears (or appears in "Completed" tab if added).
9. ✅ Toast/confirmation message: "Bill marked as paid."
10. ✅ Error handling: if payment insert fails, show error and do not update bill.

---

## Manual Test Steps

1. **Mark Monthly Bill as Paid:**
   - Create a monthly bill due Jan 31.
   - Verify it appears in "Due This Week" (or appropriate group).
   - Tap bill → Details.
   - Tap "Mark Paid".
   - Verify confirmation message: "Bill marked as paid."
   - Verify payment appears in Payment History with today's date.
   - Close details and return to Dashboard.
   - Verify bill now shows due date of Feb 28 (rollover applied).
   - Verify bill appears in new group (Due Later, if Feb 28 is > 7 days away).

2. **Rollover Rule – Month with Fewer Days:**
   - Create a monthly bill due Jan 31.
   - Mark as paid in January.
   - Verify next due date is Feb 28 (not Feb 31, which is invalid).
   - (If Feb is a leap year, could be Feb 29; test both scenarios.)

3. **Mark One-Time Bill as Paid:**
   - Create a one-time bill due in 5 days.
   - Tap bill → Details.
   - Tap "Mark Paid".
   - Verify confirmation message.
   - Verify payment appears in history.
   - Close details and return to Dashboard.
   - Verify bill no longer appears in any upcoming group.

4. **Payment History – Multiple Payments:**
   - Create a monthly bill due today.
   - Mark as paid.
   - Verify payment 1 in history.
   - Wait a few seconds (simulate time passing).
   - Mark as paid again (for next month due date).
   - Verify payment 2 in history.
   - Verify both payments listed chronologically.

5. **Mark Paid – Multiple Bills:**
   - Create 3 monthly bills.
   - Mark bill A as paid.
   - Verify bill A's due date advanced; others unchanged.

6. **Cancel Mark Paid (if confirmation dialog):**
   - Tap "Mark Paid".
   - Tap Cancel in confirmation dialog.
   - Verify bill status unchanged; no payment recorded.

7. **Error Handling:**
   - Simulate DB error (if possible) or disable DB temporarily.
   - Attempt to mark bill as paid.
   - Verify error message shown; bill status unchanged.

---

## Files Likely Touched / Created

```
src/
├── screens/
│   ├── BillDetailsScreen.tsx (update to show Mark Paid button & history)
│   └── CompletedBillsScreen.tsx (optional; if showing completed bills)
├── components/
│   ├── PaymentHistorySection.tsx (list of payments)
│   ├── MarkPaidButton.tsx (reusable button component)
│   └── ConfirmationDialog.tsx (reusable dialog)
├── services/
│   ├── billing-service.ts (new; contains markPaid logic)
│   └── notifications.ts (update to reschedule reminders after mark paid)
├── utils/
│   └── date-rollover.ts (monthly rollover logic)
└── db/
    └── queries.ts (update with markPayment / advanced queries)
```

---

## Business Logic: Mark Paid

### For Monthly Bills

```typescript
async function markMonthlyBillAsPaid(bill: Bill): Promise<void> {
  // 1. Insert payment record
  const payment: Payment = {
    id: generateId(),
    billId: bill.id,
    paidDate: Date.now(),
    amountPaid: bill.amount,
    createdAt: Date.now(),
  };
  await insertPayment(payment);
  
  // 2. Calculate next due date (apply rollover rule)
  const nextDueDate = calculateNextDueDate(bill.dueDate);
  
  // 3. Update bill
  await updateBill(bill.id, {
    dueDate: nextDueDate,
    updatedAt: Date.now(),
  });
  
  // 4. Reschedule notifications
  await rescheduleReminders({ ...bill, dueDate: nextDueDate });
}
```

### For One-Time Bills

```typescript
async function markOneTimeBillAsPaid(bill: Bill): Promise<void> {
  // 1. Insert payment record
  const payment: Payment = {
    id: generateId(),
    billId: bill.id,
    paidDate: Date.now(),
    amountPaid: bill.amount,
    createdAt: Date.now(),
  };
  await insertPayment(payment);
  
  // 2. Update bill status to completed
  await updateBill(bill.id, {
    status: "completed",
    updatedAt: Date.now(),
  });
  
  // 3. Cancel reminders
  await cancelReminders(bill);
}
```

### Monthly Rollover Rule

```typescript
function calculateNextDueDate(currentDueDate: number): number {
  const current = new Date(currentDueDate);
  const originalDay = current.getDate();
  
  // Add 1 month
  const next = new Date(current.getFullYear(), current.getMonth() + 1, originalDay);
  
  // If day is invalid for next month, use last day of next month
  if (next.getDate() !== originalDay) {
    // Day doesn't exist in next month; set to last day of next month
    next.setDate(0); // Last day of current month
    next.setMonth(next.getMonth() + 1); // Move to next month's last day
  }
  
  return next.getTime();
}
```

---

## Assumptions

1. **Payment Timestamp:** Payment is recorded with current timestamp (no editing past payment dates in MVP).
2. **Amount Paid Default:** Defaults to bill.amount; no UI to override in MVP (can add in future).
3. **Confirmation Dialog:** Optional (can auto-confirm if UX testing suggests it); if shown, should be simple ("Mark as paid?" / Yes / No).
4. **Completed Bills Hidden:** One-time bills marked "completed" are hidden from Dashboard by default (no "Completed Bills" tab in MVP, but DB stores them).
5. **No Undo:** Once marked as paid, cannot undo (can add in future if needed).
6. **Notifications Canceled:** One-time bills' reminders are canceled on mark paid. Monthly bills' reminders are rescheduled.

---

## Definition of Done

- ✅ "Mark Paid" button visible on Bill Details.
- ✅ Mark Paid logic implemented for monthly and one-time bills.
- ✅ Monthly rollover rule implemented and tested.
- ✅ Payment records inserted into DB.
- ✅ Payment history displayed on Bill Details.
- ✅ Dashboard updates after mark paid (bills move or disappear).
- ✅ Reminders rescheduled (monthly) or canceled (one-time).
- ✅ Error handling in place.
- ✅ TypeScript passes; ESLint passes.
- ✅ Manual test steps all pass.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Extract rollover logic into a pure utility function with unit tests.
- Test rollover rule with edge cases (Jan 31, Feb 29, etc.).
- Use `calculateNextDueDate()` utility in billing-service.
- Call `rescheduleReminders()` after updating bill due date (monthly).
- Call `cancelReminders()` after marking one-time as completed.
- Show toast confirmation message after successful mark paid.
- Update Bill Details screen to refresh after mark paid (or use useFocusEffect).
- Payment history should be sorted by paidDate (newest first or oldest first; decide on UX).
- Consider adding a "Mark as Paid" bottom sheet or modal instead of dialog (feels more mobile-native).
