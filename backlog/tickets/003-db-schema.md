# Ticket 003: Database Schema Implementation

**ID:** 003  
**Title:** Implement SQLite schema, migrations, and query helpers  
**Status:** Ready to Implement  
**Complexity:** Low-Medium  
**Priority:** P0 (Critical)

---

## Goal

Fully implement the SQLite database layer for Bill Tracker:
- Create all tables (`bills`, `payments`, `app_meta`).
- Write migration system to handle schema versioning.
- Implement type-safe query helpers (insert, update, delete, select, filtering).
- Test database initialization and queries.

---

## Acceptance Criteria

1. ✅ Database initializes on app launch without errors.
2. ✅ All three tables created (`bills`, `payments`, `app_meta`).
3. ✅ All indexes created for performance.
4. ✅ Migration system in place (version tracking in `app_meta`).
5. ✅ Query helpers exported (insert bill, update bill, delete bill, get bill by ID, get all bills, get payments for bill, etc.).
6. ✅ All queries are typed using TypeScript interfaces.
7. ✅ Error handling for DB operations (gracefully log/handle errors).
8. ✅ Fresh install starts with empty database and schema v1.0.
9. ✅ Database file persists across app launches.
10. ✅ Unit tests for query helpers (at least basic CRUD tests).

---

## Manual Test Steps

1. **Fresh Install:**
   - Uninstall app (or clear app data).
   - Launch app.
   - Verify no errors in console.
   - Verify database file is created.

2. **Insert & Retrieve Bill:**
   - Programmatically insert a test bill (via debug code or test script).
   - Query the bill back.
   - Verify all fields match.

3. **Update Bill:**
   - Update a bill's name.
   - Query it; verify name is updated.

4. **Insert Payment:**
   - Insert a payment for a bill.
   - Query payments for that bill.
   - Verify payment is in the list.

5. **Delete Bill:**
   - Delete a bill.
   - Query by ID; verify null result (or error).
   - Verify associated payments are deleted (cascade).

6. **Filtering & Sorting:**
   - Insert multiple bills with different due dates.
   - Query bills sorted by due date.
   - Verify sort order is correct.

7. **App Restart:**
   - Launch app, verify data persists.
   - Restart simulator, launch app again.
   - Verify data still exists.

8. **TypeScript Types:**
   - Verify all queries are typed (no `any` types).
   - Verify interfaces match schema.

9. **Linting:**
   - Run ESLint; verify no errors.

---

## Files Likely Touched / Created

```
src/
├── db/
│   ├── database.ts (main DB initialization, open/close)
│   ├── queries.ts (all query helpers exported)
│   ├── migrations/
│   │   └── 001-initial-schema.sql (full schema DDL)
│   └── types.ts (TypeScript interfaces for tables)
├── types/
│   └── database.ts (re-exported from src/db/types.ts or similar)
└── utils/
    └── db-helper.ts (internal utils for running queries safely)
```

---

## Database Schema (From spec/schema.md)

### Bills Table
```sql
CREATE TABLE bills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dueDate INTEGER NOT NULL,
  amount REAL,
  frequency TEXT NOT NULL,
  autopay BOOLEAN NOT NULL DEFAULT 0,
  notes TEXT,
  iconKey TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT "active",
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  notificationIds TEXT,
  timezone TEXT
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  billId TEXT NOT NULL REFERENCES bills(id),
  paidDate INTEGER NOT NULL,
  amountPaid REAL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE
);
```

### App Meta Table
```sql
CREATE TABLE app_meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updatedAt INTEGER NOT NULL
);
```

---

## Query Helpers to Implement

```typescript
// Bills
export async function insertBill(bill: Bill): Promise<string>; // Returns bill.id
export async function getBillById(id: string): Promise<Bill | null>;
export async function getAllBills(): Promise<Bill[]>;
export async function updateBill(id: string, updates: Partial<Bill>): Promise<void>;
export async function deleteBill(id: string): Promise<void>;
export async function getBillsByStatus(status: "active" | "completed"): Promise<Bill[]>;

// Payments
export async function insertPayment(payment: Payment): Promise<string>; // Returns payment.id
export async function getPaymentsForBill(billId: string): Promise<Payment[]>;
export async function getAllPayments(): Promise<Payment[]>;
export async function deletePaymentsForBill(billId: string): Promise<void>;

// App Meta
export async function setAppMeta(key: string, value: string): Promise<void>;
export async function getAppMeta(key: string): Promise<string | null>;
export async function deleteAppMeta(key: string): Promise<void>;

// Utils
export async function initDatabase(): Promise<void>;
export async function clearAllData(): Promise<void>; // For dev/testing only
```

---

## Assumptions

1. **SQLite Engine:** Using `expo-sqlite` (v14+); no additional native modules needed.
2. **Async Operations:** All DB operations are async (return Promises).
3. **IDs:** Using UUIDs (or random strings) for bill and payment IDs.
4. **Timestamps:** All timestamps are Unix milliseconds (not seconds).
5. **Error Handling:** Errors are logged to console; no error UI in this ticket (handled later).
6. **No Encryption:** MVP does not encrypt database (can add in future).
7. **Single User:** No multi-user support; local app only.

---

## TypeScript Interfaces

```typescript
export interface Bill {
  id: string;
  name: string;
  dueDate: number; // Unix timestamp
  amount?: number;
  frequency: "one-time" | "monthly";
  autopay: boolean;
  notes?: string;
  iconKey: string;
  status: "active" | "completed";
  createdAt: number;
  updatedAt: number;
  notificationIds?: string; // JSON array (stringified)
  timezone?: string;
}

export interface Payment {
  id: string;
  billId: string;
  paidDate: number; // Unix timestamp
  amountPaid?: number;
  createdAt: number;
}

export interface AppMeta {
  key: string;
  value: string;
  updatedAt: number;
}
```

---

## Unit Tests

Create `/src/db/__tests__/queries.test.ts`:

```typescript
import {
  initDatabase,
  insertBill,
  getBillById,
  updateBill,
  deleteBill,
  insertPayment,
  getPaymentsForBill,
} from '../queries';

describe('Database Queries', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  test('insertBill creates a bill', async () => {
    const bill = { /* ... */ };
    const id = await insertBill(bill);
    expect(id).toBeDefined();
  });

  test('getBillById retrieves the bill', async () => {
    const retrieved = await getBillById(id);
    expect(retrieved).toEqual(bill);
  });

  test('updateBill modifies bill', async () => {
    await updateBill(id, { name: 'Updated Name' });
    const updated = await getBillById(id);
    expect(updated.name).toBe('Updated Name');
  });

  test('deleteBill removes bill and cascades to payments', async () => {
    await deleteBill(id);
    const retrieved = await getBillById(id);
    expect(retrieved).toBeNull();
  });

  test('insertPayment and getPaymentsForBill', async () => {
    // ... payment tests
  });
});
```

---

## Definition of Done

- ✅ All three tables created and indexed.
- ✅ All query helpers implemented and typed.
- ✅ Database initializes on first launch.
- ✅ Data persists across app restarts.
- ✅ TypeScript passes strict type-checking.
- ✅ ESLint passes; no warnings.
- ✅ Basic unit tests written and passing.
- ✅ Migration system in place (version tracking).
- ✅ Committed to git with clear commit messages.

---

## Notes for Implementation

- Use `expo-sqlite` for database operations.
- Implement a migration runner that checks `app_meta.schema_version` on launch.
- Generate UUIDs using a library like `uuid` or simple random string generation.
- Wrap all DB queries in try-catch; log errors without crashing.
- Use TypeScript strict mode to catch type issues early.
- Export all helpers from a single `queries.ts` file for clean imports.
- Consider adding a "debug" mode to clear all data (for testing).
