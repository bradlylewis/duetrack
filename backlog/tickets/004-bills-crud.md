# Ticket 004: Bills CRUD Operations

**ID:** 004  
**Title:** Implement Add Bill, Edit Bill, Delete Bill screens and logic  
**Status:** ✅ IMPLEMENTED  
**Complexity:** Medium  
**Priority:** P1 (High)

---

## Goal

Build out the Bills CRUD screens and logic:
- **Add Bill Screen:** Form with name, due date, amount, frequency, autopay, notes, icon picker.
- **Edit Bill Screen:** Same form but pre-filled with bill data.
- **Delete Bill:** Confirmation dialog; cascade delete to payments and cancel reminders.
- **Validation:** Required fields enforced; due date must be valid.
- **Navigation:** Back from form returns to Dashboard; newly added bills appear immediately.

---

## Acceptance Criteria

1. ✅ Add Bill screen has all required fields (name, due date, amount, frequency, autopay, notes, icon).
2. ✅ Due date picker uses native date input (iOS picker or Android DatePickerDialog).
3. ✅ Amount field is optional and accepts decimal input.
4. ✅ Frequency dropdown shows "One-time" or "Monthly".
5. ✅ Autopay toggle works (visual feedback on state change).
6. ✅ Notes field is optional and accepts multi-line text.
7. ✅ Icon picker modal launches from a button or field; displays 20+ icons in grid.
8. ✅ Save button validates form:
   - Name is not empty.
   - Due date is selected and valid.
   - Icon is selected.
9. ✅ On save, bill is inserted into DB and notifications are scheduled (via notification service).
10. ✅ After save, user returns to Dashboard; new bill appears immediately in correct grouping.
11. ✅ Edit Bill screen identical to Add Bill, but fields are pre-filled.
12. ✅ Edit save reschedules notifications automatically.
13. ✅ Delete Bill shows confirmation dialog: "Are you sure? This cannot be undone."
14. ✅ On delete confirm, bill is deleted from DB, notifications are canceled, and user returns to Dashboard.
15. ✅ Cancel button on form returns to Dashboard without saving.
16. ✅ Keyboard handling: form does not get hidden behind keyboard (ScrollView, FlatList, or keyboard avoiding view).
17. ✅ Error handling: if save fails, show toast/alert with error message.

---

## Manual Test Steps

1. **Add Bill – Happy Path:**
   - From Dashboard, tap "Add Bill".
   - Fill in all fields:
     - Name: "Electricity"
     - Due Date: Jan 31 (future date)
     - Amount: 150.00
     - Frequency: Monthly
     - Autopay: On
     - Notes: "Pay online"
     - Icon: Electricity icon
   - Tap Save.
   - Verify bill appears on Dashboard.

2. **Add Bill – Validation:**
   - Tap Add Bill.
   - Leave name empty; tap Save.
   - Verify error message: "Name is required."
   - Leave due date empty; tap Save.
   - Verify error message: "Due date is required."
   - Leave icon unselected; tap Save.
   - Verify error message: "Please select an icon."

3. **Add Bill – Optional Fields:**
   - Add bill without amount.
   - Add bill without notes.
   - Verify both save successfully.

4. **Add Bill – Icon Picker:**
   - Tap Add Bill; tap icon picker.
   - Verify modal opens with icon grid.
   - Scroll through icons.
   - Select an icon; verify it's highlighted.
   - Tap confirm/done.
   - Verify icon is selected in form.

5. **Edit Bill:**
   - From Dashboard, tap a bill to see details.
   - Tap Edit button.
   - Modify name (e.g., "Electricity Bill" → "Electric Co.").
   - Modify due date (e.g., Jan 31 → Feb 15).
   - Tap Save.
   - Verify bill is updated on Dashboard.
   - Verify notifications are rescheduled (if notification service is integrated).

6. **Delete Bill:**
   - From bill details, tap Delete.
   - Verify confirmation dialog appears.
   - Tap Cancel; verify dialog closes, bill remains.
   - Tap Delete again, then confirm.
   - Verify bill disappears from Dashboard.

7. **Keyboard Handling:**
   - Add Bill; focus on name field.
   - Verify keyboard appears and form scrolls (doesn't hide the form).
   - Scroll down; verify all fields remain visible/accessible.

8. **Cancel/Back Navigation:**
   - Add Bill; fill in some fields.
   - Tap Cancel or back button.
   - Verify form closes without saving.
   - Verify bill does not appear on Dashboard.

---

## Files Likely Touched / Created

```
src/
├── screens/
│   ├── AddBillScreen.tsx (new)
│   ├── EditBillScreen.tsx (or reuse AddBillScreen with route param)
│   ├── BillDetailsScreen.tsx (new)
│   └── HomeScreen.tsx (update to show bills from DB)
├── components/
│   ├── BillForm.tsx (reusable form for Add & Edit)
│   ├── IconPicker.tsx (icon picker modal)
│   ├── BillCard.tsx (card for bill in list)
│   └── DatePicker.tsx (wrapper for native date picker)
├── services/
│   └── (notification scheduling will be called from here)
└── db/
    └── queries.ts (use existing CRUD helpers)
```

---

## Assumptions

1. **Form Reuse:** Add and Edit screens use same form component (BillForm) with different initial state.
2. **Date Picker:** Using native iOS/Android date pickers (expo-date-picker or react-native-date-time-picker).
3. **Icon Selection:** Icon picker is a modal; user must select one icon (required).
4. **Notifications Scheduled:** Notification scheduling happens in this ticket (calls into notification service).
5. **No Confirmation on Cancel:** Tapping Cancel/back without saving does not prompt confirmation (can add in future if desired).
6. **DB Insert Synchronous to User:** Save button feels instant; no loader needed for MVP (unless DB operations are slow, then add spinner).
7. **Error Toast:** Simple toast/alert for errors (using React Native Alert or custom toast component).

---

## Validation Rules

- **Name:** Required, min 1 char, max 100 chars.
- **Due Date:** Required, must be a valid date (no past dates for new bills, or allow editing).
- **Amount:** Optional, if present must be > 0, max 999,999.99.
- **Frequency:** Required, enum: "one-time" or "monthly".
- **Autopay:** Optional boolean (default false).
- **Notes:** Optional, max 500 chars.
- **Icon:** Required, must be a valid iconKey from ICON_MAP.

---

## Definition of Done

- ✅ Add Bill screen implemented with all fields.
- ✅ Edit Bill screen implemented.
- ✅ Delete Bill confirmation flow works.
- ✅ Form validation working (all required fields).
- ✅ Date picker integrated (native date selection).
- ✅ Icon picker modal works.
- ✅ Bills saved to DB via queries.
- ✅ Bills appear on Dashboard after save.
- ✅ Notifications are scheduled on save (calls notification service).
- ✅ TypeScript passes; ESLint passes.
- ✅ Manual test steps all pass.
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Use `BillForm` component to share logic between Add and Edit.
- Use React's `useEffect` hook to pre-fill form in Edit mode.
- For date picker, consider `react-native-date-time-picker` or native Date APIs.
- KeyboardAvoidingView or ScrollView to handle keyboard occlusion.
- Use centralized error/toast component for user feedback.
- Generate bill IDs using UUID or random string.
- Call `scheduleReminders()` from notification service after DB insert (ticket 008 will refine this).
- Consider adding a "loading" state during save (spinner).
