# Bill Tracker MVP – SQLite Schema

**Version:** 1.0 | **Last Updated:** Jan 28, 2026 | **Status:** Draft

---

## Overview

All data is stored locally using SQLite (via Expo SQLite). No cloud sync or accounts.

---

## Tables

### 1. `bills`

Stores all bills (active and completed).

```sql
CREATE TABLE bills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dueDate INTEGER NOT NULL,                -- Unix timestamp (e.g., 1706745600)
  amount REAL,                             -- Optional; NULL if not set
  frequency TEXT NOT NULL,                 -- "one-time" or "monthly"
  autopay BOOLEAN NOT NULL DEFAULT 0,      -- 0 = false, 1 = true
  notes TEXT,
  iconKey TEXT NOT NULL,                   -- e.g., "electricity", "water", "rent", etc.
  status TEXT NOT NULL DEFAULT "active",   -- "active" or "completed"
  createdAt INTEGER NOT NULL,              -- Unix timestamp
  updatedAt INTEGER NOT NULL,              -- Unix timestamp
  
  -- Notification tracking
  notificationIds TEXT,                    -- JSON array of notification IDs (stringified)
                                           -- e.g., "[\"not-123\", \"not-456\"]"
  
  -- Metadata
  timezone TEXT                            -- User's timezone at bill creation (optional, for DST handling)
);
```

**Indexes:**
```sql
CREATE INDEX idx_bills_dueDate ON bills(dueDate);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_frequency ON bills(frequency);
```

**Notes:**
- `dueDate` is stored as Unix timestamp for easy comparison.
- `notificationIds` is a JSON array (stringified) to store multiple notification IDs (3 days before + day-of).
- `status` = "active" for upcoming bills; "completed" for one-time bills after payment.
- `timezone` is optional; used to handle DST edge cases during notification recalculation.

---

### 2. `payments`

Stores payment history for all bills.

```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  billId TEXT NOT NULL REFERENCES bills(id),
  paidDate INTEGER NOT NULL,               -- Unix timestamp (when user marked as paid)
  amountPaid REAL,                         -- Amount paid (defaults to bill.amount)
  createdAt INTEGER NOT NULL,
  
  FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE
);
```

**Indexes:**
```sql
CREATE INDEX idx_payments_billId ON payments(billId);
CREATE INDEX idx_payments_paidDate ON payments(paidDate);
```

**Notes:**
- One bill can have many payments (e.g., for monthly bills, one payment per month).
- `paidDate` is a timestamp (the moment the user tapped "Mark Paid").
- `amountPaid` can differ from the bill's amount (user override, future).

---

### 3. `app_meta` (Optional, for Schema Versioning)

Stores app metadata (e.g., schema version, last notification sanity check).

```sql
CREATE TABLE app_meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updatedAt INTEGER NOT NULL
);
```

**Sample rows:**
```
key="schema_version", value="1"
key="last_notification_sanity_check", value="1706745600"
key="notification_permission_status", value="granted"
```

---

## Data Migration & Schema Versioning

- **Initial schema:** Version 1.0 (all tables above).
- **On app launch:** Check `app_meta.schema_version`. If missing or outdated, run migration scripts.
- **Migration strategy:** Keep migration files in `/src/db/migrations/001-initial-schema.sql`, etc.

---

## UX Implications

### Grouping Bills (Dashboard)

```typescript
// Pseudo-code for grouping logic
const today = new Date().setHours(0, 0, 0, 0);
const in7Days = new Date(today + 7 * 24 * 60 * 60 * 1000);

const overdue = bills.filter(b => b.dueDate < today && isActive(b));
const dueThisWeek = bills.filter(b => b.dueDate >= today && b.dueDate < in7Days && isActive(b));
const dueLater = bills.filter(b => b.dueDate >= in7Days && isActive(b));

// isActive: bill.status = "active" AND (no payment within last 7 days OR bill.frequency = "monthly")
```

### Monthly Rollover Logic

When marking a monthly bill as paid, calculate the next due date:

```typescript
function calculateNextDueDate(originalDueDate, today) {
  const original = new Date(originalDueDate);
  const originalDay = original.getDate();
  
  // Add 1 month
  let nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, originalDay);
  
  // If day is invalid for next month (e.g., Feb 31), use last day of month
  if (nextMonth.getDate() !== originalDay) {
    nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0); // Last day of next month
  }
  
  return nextMonth;
}
```

### Notification IDs Storage

Notifications are stored as a JSON array in the `bills.notificationIds` field:

```json
["notif-1-3days", "notif-1-dayof"]
```

When editing a bill:
1. Cancel all notification IDs from the array.
2. Recalculate new notification dates.
3. Schedule new notifications.
4. Update `notificationIds` with new IDs.

---

## Key Decisions

- **Unix timestamps:** All dates are stored as Unix timestamps (milliseconds or seconds, standardize) for easy comparisons and timezone handling.
- **No soft deletes (initially):** One-time bills are marked with `status="completed"`, effectively hidden from the upcoming view. Hard deletion is supported.
- **Local-first architecture:** SQLite is the primary data store; Firestore used for cloud backup and sync (see [ADR-003](../docs/adr/003-firestore-schema.md)).
- **Cloud sync:** Firestore schema mirrors SQLite with additional sync metadata fields (`lastSynced`, `deviceId`, `_version`).

---

## Cloud Sync (Firestore)

For users with Firebase accounts, data syncs to Firestore for cross-device access and backup.

**Firestore Schema:** See [ADR-003: Firestore Schema Design](../docs/adr/003-firestore-schema.md)

**Collection Structure:**
```
users/{uid}/
  ├── bills/{billId}
  └── payments/{paymentId}
```

**Key Differences from SQLite:**
- `notificationIds`: Stored as native array (not JSON string)
- Added sync metadata: `lastSynced`, `deviceId`, `_version`
- Timestamps use Firestore `Timestamp` type
- Security rules enforce user isolation

---

## Future Enhancements (Out of MVP Scope)

- `bills.color` or `bills.categoryId` for color-coding bills.
- `bills.recurringRuleId` for complex recurrence (biweekly, custom intervals).
- `app_meta.locale` for locale-specific grouping/formatting.
- Analytics tables for tracking payment behavior (post-MVP).
