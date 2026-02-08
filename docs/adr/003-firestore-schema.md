# ADR 003: Firestore Schema Design

**Status:** Accepted  
**Date:** Feb 7, 2026  
**Context:** Adding Firebase Authentication and cloud sync requires a Firestore schema that mirrors SQLite, supports efficient sync, and scales with users.

---

## Decision

Use a **user-scoped subcollection structure** in Firestore with sync metadata fields to enable two-way SQLite ↔ Firestore synchronization.

---

## Schema Structure

### Collection Hierarchy

```
users/{uid}/
  ├── bills/{billId}
  └── payments/{paymentId}
```

**Rationale:**
- **User isolation:** Each user's data is in their own subcollection; prevents accidental cross-user queries.
- **Security:** Firestore rules can easily restrict access to `users/{uid}/*` based on Auth UID.
- **Scalability:** Subcollections scale well (millions of documents per user).
- **Query efficiency:** All queries are automatically scoped to a single user.

---

## Document Schemas

### 1. `users/{uid}/bills/{billId}`

Matches SQLite `bills` table with added sync metadata.

```typescript
interface FirestoreBill {
  // Core fields (from SQLite)
  id: string;                    // Matches SQLite id (UUID)
  name: string;
  dueDate: number;               // Unix timestamp (milliseconds)
  amount: number | null;         // Nullable
  frequency: 'one-time' | 'monthly';
  autopay: boolean;
  notes: string | null;
  iconKey: string;
  status: 'active' | 'completed';
  timezone: string | null;
  notificationIds: string[];     // Array (not JSON string)
  
  // Sync metadata (new fields)
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  lastSynced: FirebaseFirestore.Timestamp;
  deviceId: string;              // Last device that modified this doc
  
  // Firestore native
  _version: number;              // Optimistic concurrency control
}
```

**Field Mapping (SQLite → Firestore):**

| SQLite Field       | Firestore Field    | Type Change                          |
|--------------------|--------------------|--------------------------------------|
| `id`               | `id`               | TEXT → string                        |
| `name`             | `name`             | TEXT → string                        |
| `dueDate`          | `dueDate`          | INTEGER → number (timestamp)         |
| `amount`           | `amount`           | REAL → number \| null                |
| `frequency`        | `frequency`        | TEXT → 'one-time' \| 'monthly'       |
| `autopay`          | `autopay`          | BOOLEAN → boolean                    |
| `notes`            | `notes`            | TEXT → string \| null                |
| `iconKey`          | `iconKey`          | TEXT → string                        |
| `status`           | `status`           | TEXT → 'active' \| 'completed'       |
| `createdAt`        | `createdAt`        | INTEGER → Timestamp                  |
| `updatedAt`        | `updatedAt`        | INTEGER → Timestamp                  |
| `notificationIds`  | `notificationIds`  | TEXT (JSON) → string[] (array)       |
| `timezone`         | `timezone`         | TEXT → string \| null                |
| *(new)*            | `lastSynced`       | Timestamp (sync tracking)            |
| *(new)*            | `deviceId`         | string (conflict resolution)         |
| *(new)*            | `_version`         | number (optimistic locking)          |

**Notes:**
- `notificationIds`: Store as native array in Firestore (not JSON string); easier to query and update.
- `createdAt` / `updatedAt`: Use Firestore `Timestamp` type for consistency.
- `lastSynced`: Tracks when this document was last synced to this device; used to determine which changes to pull.
- `deviceId`: Identifies which device last modified the document; useful for conflict resolution.
- `_version`: Increment on each update; used for optimistic concurrency control.

---

### 2. `users/{uid}/payments/{paymentId}`

Matches SQLite `payments` table with sync metadata.

```typescript
interface FirestorePayment {
  // Core fields (from SQLite)
  id: string;                    // Matches SQLite id (UUID)
  billId: string;                // Foreign key to bill
  paidDate: number;              // Unix timestamp (milliseconds)
  amountPaid: number | null;     // Nullable
  
  // Sync metadata (new fields)
  createdAt: FirebaseFirestore.Timestamp;
  lastSynced: FirebaseFirestore.Timestamp;
  deviceId: string;
  
  // Firestore native
  _version: number;
}
```

**Field Mapping (SQLite → Firestore):**

| SQLite Field  | Firestore Field | Type Change                     |
|---------------|-----------------|---------------------------------|
| `id`          | `id`            | TEXT → string                   |
| `billId`      | `billId`        | TEXT → string                   |
| `paidDate`    | `paidDate`      | INTEGER → number (timestamp)    |
| `amountPaid`  | `amountPaid`    | REAL → number \| null           |
| `createdAt`   | `createdAt`     | INTEGER → Timestamp             |
| *(new)*       | `lastSynced`    | Timestamp (sync tracking)       |
| *(new)*       | `deviceId`      | string (conflict resolution)    |
| *(new)*       | `_version`      | number (optimistic locking)     |

**Notes:**
- No `FOREIGN KEY` constraint in Firestore; enforce referential integrity in app logic.
- `billId` remains a string field; queries can filter by `WHERE billId == {id}`.

---

## Indexing Strategy

### Composite Indexes (Required)

Firestore requires composite indexes for queries with multiple filters or sorts.

**1. Bills by User (Automatic)**
```
users/{uid}/bills
```
- Automatically indexed by Firestore.
- Query: `firestore().collection('users').doc(uid).collection('bills').get()`

**2. Bills by Status and Due Date**
```
Collection: users/{uid}/bills
Fields: status (Ascending), dueDate (Ascending)
```
- Query: `WHERE status == 'active' ORDER BY dueDate ASC`
- Use case: Dashboard (show upcoming bills).

**3. Bills by Last Synced**
```
Collection: users/{uid}/bills
Fields: lastSynced (Ascending)
```
- Query: `WHERE lastSynced > {timestamp} ORDER BY lastSynced ASC`
- Use case: Incremental sync (pull only changed docs).

**4. Payments by Bill ID and Paid Date**
```
Collection: users/{uid}/payments
Fields: billId (Ascending), paidDate (Descending)
```
- Query: `WHERE billId == {id} ORDER BY paidDate DESC`
- Use case: Payment history for a bill.

**5. Payments by Last Synced**
```
Collection: users/{uid}/payments
Fields: lastSynced (Ascending)
```
- Query: `WHERE lastSynced > {timestamp} ORDER BY lastSynced ASC`
- Use case: Incremental sync (pull only changed payments).

**How to Create:**
- Define in `firestore.indexes.json` (auto-generated by Firebase CLI).
- Deploy via `firebase deploy --only firestore:indexes`.
- Or create manually in Firebase Console when query fails with "requires an index" error.

---

## Security Rules

### `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    // Users collection
    match /users/{uid} {
      // Users can only access their own documents
      allow read, write: if isAuthenticated() && isOwner(uid);
      
      // Bills subcollection
      match /bills/{billId} {
        allow read, write: if isAuthenticated() && isOwner(uid);
      }
      
      // Payments subcollection
      match /payments/{paymentId} {
        allow read, write: if isAuthenticated() && isOwner(uid);
      }
    }
  }
}
```

**Rule Breakdown:**
- **Authentication required:** All reads/writes require `request.auth != null`.
- **User isolation:** Users can only access `users/{their-uid}/*`.
- **Subcollections inherit parent rules:** Bills and payments inherit user ownership check.
- **No cross-user queries:** Impossible to query another user's bills.

**Testing:**
- Use Firebase Console → Rules Playground to test rules.
- Test cases:
  - ✅ User A can read `users/{uidA}/bills`
  - ❌ User A cannot read `users/{uidB}/bills`
  - ❌ Unauthenticated user cannot read any documents

---

## Sync Metadata Fields

### Purpose

Enable efficient two-way sync between SQLite and Firestore.

### Fields

| Field         | Type      | Purpose                                                     |
|---------------|-----------|-------------------------------------------------------------|
| `lastSynced`  | Timestamp | Last time this document was synced to the current device.   |
| `deviceId`    | string    | Device that last modified this document (for conflict resolution). |
| `_version`    | number    | Document version; increment on each update (optimistic locking). |

### Sync Strategy (Overview)

**Pull (Firestore → SQLite):**
1. Query: `WHERE lastSynced > {deviceLastSyncTime} ORDER BY lastSynced ASC`
2. For each doc: Upsert into SQLite, update local `lastSynced`.

**Push (SQLite → Firestore):**
1. Query SQLite: `WHERE updatedAt > {lastPushTime}`
2. For each row: Upsert into Firestore, increment `_version`, set `deviceId`.

**Conflict Resolution:**
- **Last-write-wins:** Compare `updatedAt` timestamps; keep most recent.
- **Device ID tracking:** If same device, no conflict; if different device, apply last-write-wins.

*(Detailed sync logic will be in ADR-004 or `src/services/sync.ts`)*

---

## Migration Plan

### SQLite → Firestore (Initial Upload)

**Scenario:** Existing user signs up for the first time; needs to upload local bills to Firestore.

**Steps:**
1. **Detect first login:** Check if `users/{uid}/bills` is empty in Firestore.
2. **Read all local bills:** `SELECT * FROM bills`
3. **Transform to Firestore format:**
   - Convert `createdAt` / `updatedAt` from INTEGER to Timestamp.
   - Parse `notificationIds` JSON string → array.
   - Add sync metadata: `lastSynced = now()`, `deviceId = {currentDeviceId}`, `_version = 1`.
4. **Batch upload:** Use Firestore `writeBatch()` to upload all bills (max 500 per batch).
5. **Repeat for payments:** Upload all payments to `users/{uid}/payments`.
6. **Mark migration complete:** Store `migrationComplete: true` in `app_meta` or Firestore.

**Edge Case 1: User has data on multiple devices**
- Merge strategy: Keep all bills; deduplicate by `name + amount + dueDate` (fuzzy match).
- Show UI: "We found bills on multiple devices. Keep all? [Yes] [Review]"

**Edge Case 2: Large datasets (1000+ bills)**
- Batch uploads in chunks of 500 (Firestore limit).
- Show progress bar: "Uploading bills... 450/1000"

### Firestore → SQLite (Initial Download)

**Scenario:** User logs in on a new device; needs to download bills from Firestore.

**Steps:**
1. **Detect new device:** Check if SQLite `bills` table is empty or no bills exist.
2. **Query Firestore:** `GET users/{uid}/bills` (all bills).
3. **Transform to SQLite format:**
   - Convert Timestamp → INTEGER (Unix ms).
   - Convert `notificationIds` array → JSON string.
   - Remove sync metadata fields (`lastSynced`, `deviceId`, `_version`).
4. **Batch insert into SQLite:** `INSERT INTO bills (...)`
5. **Repeat for payments.**
6. **Update `lastSynced`:** Store current timestamp in `app_meta`.

---

## Data Flow Diagram

```
┌─────────────┐         Push (Local → Cloud)         ┌─────────────┐
│   Device A  │────────────────────────────────────>│  Firestore  │
│   (SQLite)  │                                      │             │
└─────────────┘<────────────────────────────────────└─────────────┘
                 Pull (Cloud → Local)                        │
                                                              │
                                                              v
                                                      ┌─────────────┐
                                                      │   Device B  │
                                                      │   (SQLite)  │
                                                      └─────────────┘
```

**Sync Triggers:**
- **On app launch:** Pull latest changes from Firestore.
- **On local change:** Push to Firestore (debounced by 2 seconds).
- **On network reconnect:** Push queued changes.
- **Background sync:** Every 15 minutes (app in background).

---

## Alternatives Considered

### Alternative 1: Flat Collection (`bills` at root level)

**Structure:**
```
bills/{billId}
  - uid: string (user ID)
  - ...other fields
```

**Pros:**
- Simpler structure; no nested collections.

**Cons:**
- ❌ **Security risk:** Queries must filter by `uid`; easy to accidentally query all bills.
- ❌ **Performance:** Global collection grows unbounded; queries slower as app scales.
- ❌ **Firestore pricing:** Queries scan more documents; higher costs.

**Verdict:** Rejected due to security and scalability concerns.

### Alternative 2: Subcollection + Top-Level User Doc

**Structure:**
```
users/{uid}
  - metadata: { displayName, email }
  └── bills/{billId}
      - ...
```

**Pros:**
- Can store user profile in top-level doc.

**Cons:**
- Adds complexity; MVP doesn't need user profiles yet.
- Can add user doc layer later if needed.

**Verdict:** Deferred; use flat subcollections for MVP.

### Alternative 3: Use SQLite IDs as Firestore Doc IDs

**Pros:**
- Direct 1:1 mapping; easier to sync.

**Cons:**
- Firestore doc IDs must be valid paths (no `/` or `\`).
- SQLite UUIDs contain dashes; compatible with Firestore.

**Verdict:** **Accepted**; use SQLite UUIDs as Firestore doc IDs.

---

## Consequences

### Positive
- ✅ Clear schema; matches SQLite structure.
- ✅ User data isolated; secure by default.
- ✅ Efficient queries; composite indexes support dashboard and sync.
- ✅ Scalable; subcollections handle millions of documents per user.
- ✅ Migration plan clear; existing users can upload local data seamlessly.

### Negative
- ❌ Requires Firestore setup; adds infrastructure dependency.
- ❌ Sync logic complex; needs careful conflict resolution (addressed in Issue #12).
- ❌ Firestore reads/writes cost money; need to monitor usage (free tier: 50k reads/20k writes per day).

### Neutral
- ⚠️ **Indexing:** Must create composite indexes before deploying (auto-generated on first query).
- ⚠️ **Security rules:** Must deploy rules before enabling Firestore in production.

---

## Implementation Checklist

- [ ] Create Firestore database in Firebase Console
- [ ] Define `firestore.indexes.json` with composite indexes
- [ ] Write `firestore.rules` with security rules
- [ ] Deploy indexes and rules: `firebase deploy --only firestore`
- [ ] Test rules in Firebase Console (Rules Playground)
- [ ] Document this ADR (this file)
- [ ] Update `spec/schema.md` to reference Firestore schema
- [ ] Implement sync service (Issue #12)

---

## Future Decisions

- **Conflict resolution:** If last-write-wins causes issues, consider operational transformation (OT) or CRDTs.
- **Real-time sync:** Use Firestore real-time listeners (`onSnapshot`) for instant updates (Issue #12).
- **Offline queue:** Queue writes when offline; sync when reconnected (Issue #12).
- **Schema versioning:** If schema changes in future, add `schemaVersion` field and migration logic.

---

## Related

- [ADR-001: Tech Stack Decision](001-stack.md)
- [ADR-002: Billing Rules & Monthly Rollover](002-billing-rules.md)
- [spec/schema.md](../../spec/schema.md)
- [Issue #11: Design Firestore Schema for Bills & Payments](https://github.com/bradlylewis/duetrack/issues/11)
- [Issue #12: Implement Data Sync Service (SQLite ↔ Firestore)](https://github.com/bradlylewis/duetrack/issues/12)

---

## Appendix: Example Documents

### Example Bill Document

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Electric Bill",
  "dueDate": 1709251200000,
  "amount": 125.50,
  "frequency": "monthly",
  "autopay": false,
  "notes": "Check for surge charges",
  "iconKey": "electricity",
  "status": "active",
  "timezone": "America/New_York",
  "notificationIds": ["not-abc123", "not-def456"],
  "createdAt": { "_seconds": 1706745600, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1706745600, "_nanoseconds": 0 },
  "lastSynced": { "_seconds": 1706745600, "_nanoseconds": 0 },
  "deviceId": "device-xyz789",
  "_version": 1
}
```

### Example Payment Document

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "billId": "550e8400-e29b-41d4-a716-446655440000",
  "paidDate": 1709251200000,
  "amountPaid": 125.50,
  "createdAt": { "_seconds": 1709251200, "_nanoseconds": 0 },
  "lastSynced": { "_seconds": 1709251200, "_nanoseconds": 0 },
  "deviceId": "device-xyz789",
  "_version": 1
}
```
