import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Device from 'expo-device';
import { getAllAsync, runAsync, getAsync } from '@/src/db/database';
import { Bill, Payment, FirestoreBill, FirestorePayment } from '@/src/types';
import { scheduleBillNotifications, cancelBillNotifications } from '@/src/utils/notification-scheduling';

// Storage keys
const DEVICE_ID_KEY = '@duetrack:deviceId';
const LAST_SYNC_KEY = '@duetrack:lastSync';
const OFFLINE_QUEUE_KEY = '@duetrack:offlineQueue';

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: number | null;
  error: string | null;
}

interface QueuedOperation {
  type: 'bill' | 'payment';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

// Sync event listeners
type SyncListener = (state: SyncState) => void;
const syncListeners = new Set<SyncListener>();

let currentSyncState: SyncState = {
  status: 'idle',
  lastSyncTime: null,
  error: null,
};

// Subscribe to sync state changes
export function subscribeSyncState(listener: SyncListener): () => void {
  syncListeners.add(listener);
  // Immediately call with current state
  listener(currentSyncState);
  
  return () => {
    syncListeners.delete(listener);
  };
}

// Update sync state and notify listeners
function updateSyncState(updates: Partial<SyncState>) {
  currentSyncState = { ...currentSyncState, ...updates };
  syncListeners.forEach(listener => listener(currentSyncState));
}

// Get or create device ID
async function getDeviceId(): Promise<string> {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate device ID from device info
    const deviceName = Device.deviceName || 'unknown';
    const modelId = Device.modelId || 'unknown';
    const timestamp = Date.now();
    deviceId = `${deviceName}-${modelId}-${timestamp}`.replace(/[^a-zA-Z0-9-]/g, '-');
    
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

// Get last sync timestamp
async function getLastSyncTime(): Promise<number> {
  const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
  return lastSync ? parseInt(lastSync, 10) : 0;
}

// Update last sync timestamp
async function updateLastSyncTime(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
}

// Check network connectivity
async function isOnline(): Promise<boolean> {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected === true && netInfo.isInternetReachable === true;
}

// === Conversion Utilities ===

// Convert SQLite Bill to Firestore format
function sqliteToFirestoreBill(bill: Bill, deviceId: string): FirestoreBill {
  const notificationIds = bill.notificationIds 
    ? JSON.parse(bill.notificationIds) 
    : [];
  
  return {
    id: bill.id,
    name: bill.name,
    dueDate: bill.dueDate,
    amount: bill.amount ?? null,
    frequency: bill.frequency,
    autopay: bill.autopay,
    notes: bill.notes ?? null,
    iconKey: bill.iconKey,
    status: bill.status,
    timezone: bill.timezone ?? null,
    notificationIds,
    createdAt: firestore.Timestamp.fromMillis(bill.createdAt),
    updatedAt: firestore.Timestamp.fromMillis(bill.updatedAt),
    lastSynced: firestore.Timestamp.now(),
    deviceId,
    _version: 1, // Will be incremented on updates
  };
}

// Convert Firestore Bill to SQLite format
function firestoreToSqliteBill(bill: FirestoreBill): Bill {
  const notificationIds = Array.isArray(bill.notificationIds) && bill.notificationIds.length > 0
    ? JSON.stringify(bill.notificationIds)
    : undefined;
  
  return {
    id: bill.id,
    name: bill.name,
    dueDate: bill.dueDate,
    amount: bill.amount ?? undefined,
    frequency: bill.frequency,
    autopay: bill.autopay,
    notes: bill.notes ?? undefined,
    iconKey: bill.iconKey,
    status: bill.status,
    timezone: bill.timezone ?? undefined,
    notificationIds,
    createdAt: bill.createdAt?.toMillis ? bill.createdAt.toMillis() : bill.createdAt,
    updatedAt: bill.updatedAt?.toMillis ? bill.updatedAt.toMillis() : bill.updatedAt,
  };
}

// Convert SQLite Payment to Firestore format
function sqliteToFirestorePayment(payment: Payment, deviceId: string): FirestorePayment {
  return {
    id: payment.id,
    billId: payment.billId,
    paidDate: payment.paidDate,
    amountPaid: payment.amountPaid ?? null,
    createdAt: firestore.Timestamp.fromMillis(payment.createdAt),
    lastSynced: firestore.Timestamp.now(),
    deviceId,
    _version: 1,
  };
}

// Convert Firestore Payment to SQLite format
function firestoreToSqlitePayment(payment: FirestorePayment): Payment {
  return {
    id: payment.id,
    billId: payment.billId,
    paidDate: payment.paidDate,
    amountPaid: payment.amountPaid ?? undefined,
    createdAt: payment.createdAt?.toMillis ? payment.createdAt.toMillis() : payment.createdAt,
  };
}

// === Pull Sync (Firestore → SQLite) ===

async function pullBills(userId: string, lastSyncTime: number): Promise<void> {
  const billsRef = firestore()
    .collection('users')
    .doc(userId)
    .collection('bills');
  
  // Query bills updated since last sync
  const query = lastSyncTime > 0
    ? billsRef.where('updatedAt', '>', firestore.Timestamp.fromMillis(lastSyncTime))
    : billsRef;
  
  const snapshot = await query.get();
  
  if (snapshot.empty) return;
  
  // Upsert bills into SQLite
  for (const doc of snapshot.docs) {
    const firestoreBill = doc.data() as FirestoreBill;
    const sqliteBill = firestoreToSqliteBill(firestoreBill);
    
    // Check if bill exists in SQLite
    const existing = await getAsync<any>('SELECT id, updatedAt FROM bills WHERE id = ?', [sqliteBill.id]);
    
    if (existing) {
      // Conflict resolution: last-write-wins
      const existingUpdatedAt = parseInt(existing.updatedAt, 10);
      const incomingUpdatedAt = sqliteBill.updatedAt;
      
      if (incomingUpdatedAt > existingUpdatedAt) {
        // Firestore version is newer, update SQLite
        await runAsync(
          `UPDATE bills SET name = ?, dueDate = ?, amount = ?, frequency = ?, autopay = ?, notes = ?, iconKey = ?, status = ?, updatedAt = ?, notificationIds = ?, timezone = ? WHERE id = ?`,
          [
            sqliteBill.name,
            sqliteBill.dueDate,
            sqliteBill.amount ?? null,
            sqliteBill.frequency,
            sqliteBill.autopay ? 1 : 0,
            sqliteBill.notes ?? null,
            sqliteBill.iconKey,
            sqliteBill.status,
            sqliteBill.updatedAt,
            sqliteBill.notificationIds ?? null,
            sqliteBill.timezone ?? null,
            sqliteBill.id,
          ]
        );
        
        // Reschedule notifications for updated bill
        if (sqliteBill.status === 'active') {
          const oldNotificationIds = existing.notificationIds ? JSON.parse(existing.notificationIds) : [];
          await cancelBillNotifications(oldNotificationIds);
          const newNotificationIds = await scheduleBillNotifications(
            sqliteBill.id,
            sqliteBill.name,
            sqliteBill.dueDate
          );
          
          if (newNotificationIds.length > 0) {
            await runAsync(
              'UPDATE bills SET notificationIds = ? WHERE id = ?',
              [JSON.stringify(newNotificationIds), sqliteBill.id]
            );
          }
        }
      }
      // else: Local version is newer or same, keep local
    } else {
      // Bill doesn't exist, insert new
      const notificationIds = sqliteBill.status === 'active'
        ? await scheduleBillNotifications(sqliteBill.id, sqliteBill.name, sqliteBill.dueDate)
        : [];
      
      await runAsync(
        `INSERT INTO bills (id, name, dueDate, amount, frequency, autopay, notes, iconKey, status, createdAt, updatedAt, notificationIds, timezone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sqliteBill.id,
          sqliteBill.name,
          sqliteBill.dueDate,
          sqliteBill.amount ?? null,
          sqliteBill.frequency,
          sqliteBill.autopay ? 1 : 0,
          sqliteBill.notes ?? null,
          sqliteBill.iconKey,
          sqliteBill.status,
          sqliteBill.createdAt,
          sqliteBill.updatedAt,
          notificationIds.length > 0 ? JSON.stringify(notificationIds) : null,
          sqliteBill.timezone ?? null,
        ]
      );
    }
  }
}

async function pullPayments(userId: string, lastSyncTime: number): Promise<void> {
  const paymentsRef = firestore()
    .collection('users')
    .doc(userId)
    .collection('payments');
  
  // Query payments updated since last sync
  const query = lastSyncTime > 0
    ? paymentsRef.where('createdAt', '>', firestore.Timestamp.fromMillis(lastSyncTime))
    : paymentsRef;
  
  const snapshot = await query.get();
  
  if (snapshot.empty) return;
  
  // Upsert payments into SQLite
  for (const doc of snapshot.docs) {
    const firestorePayment = doc.data() as FirestorePayment;
    const sqlitePayment = firestoreToSqlitePayment(firestorePayment);
    
    // Check if payment exists
    const existing = await getAsync<any>('SELECT id FROM payments WHERE id = ?', [sqlitePayment.id]);
    
    if (!existing) {
      // Insert new payment
      await runAsync(
        `INSERT INTO payments (id, billId, paidDate, amountPaid, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [
          sqlitePayment.id,
          sqlitePayment.billId,
          sqlitePayment.paidDate,
          sqlitePayment.amountPaid ?? null,
          sqlitePayment.createdAt,
        ]
      );
    }
    // Payments are immutable, no update needed
  }
}

// === Push Sync (SQLite → Firestore) ===

async function pushBills(userId: string, lastSyncTime: number): Promise<void> {
  const deviceId = await getDeviceId();
  
  // Query bills updated since last push
  const bills = await getAllAsync<any>(
    'SELECT * FROM bills WHERE updatedAt > ?',
    [lastSyncTime]
  );
  
  if (bills.length === 0) return;
  
  const batch = firestore().batch();
  let operationCount = 0;
  
  for (const row of bills) {
    const sqliteBill: Bill = {
      ...row,
      autopay: row.autopay === 1,
      dueDate: parseInt(row.dueDate, 10),
      createdAt: parseInt(row.createdAt, 10),
      updatedAt: parseInt(row.updatedAt, 10),
    };
    
    const firestoreBill = sqliteToFirestoreBill(sqliteBill, deviceId);
    
    const billRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('bills')
      .doc(sqliteBill.id);
    
    // Get current version for optimistic locking
    const existingDoc = await billRef.get();
    if (existingDoc.exists()) {
      const currentVersion = existingDoc.data()?._version || 0;
      firestoreBill._version = currentVersion + 1;
    }
    
    batch.set(billRef, firestoreBill, { merge: true });
    operationCount++;
    
    // Firestore batches have a limit of 500 operations
    if (operationCount >= 500) {
      await batch.commit();
      operationCount = 0;
    }
  }
  
  if (operationCount > 0) {
    await batch.commit();
  }
}

async function pushPayments(userId: string, lastSyncTime: number): Promise<void> {
  const deviceId = await getDeviceId();
  
  // Query payments created since last push
  const payments = await getAllAsync<any>(
    'SELECT * FROM payments WHERE createdAt > ?',
    [lastSyncTime]
  );
  
  if (payments.length === 0) return;
  
  const batch = firestore().batch();
  let operationCount = 0;
  
  for (const row of payments) {
    const sqlitePayment: Payment = {
      ...row,
      paidDate: parseInt(row.paidDate, 10),
      createdAt: parseInt(row.createdAt, 10),
    };
    
    const firestorePayment = sqliteToFirestorePayment(sqlitePayment, deviceId);
    
    const paymentRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('payments')
      .doc(sqlitePayment.id);
    
    batch.set(paymentRef, firestorePayment);
    operationCount++;
    
    if (operationCount >= 500) {
      await batch.commit();
      operationCount = 0;
    }
  }
  
  if (operationCount > 0) {
    await batch.commit();
  }
}

// === Offline Queue ===

async function addToOfflineQueue(operation: QueuedOperation): Promise<void> {
  const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  const queue: QueuedOperation[] = queueJson ? JSON.parse(queueJson) : [];
  
  queue.push(operation);
  
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

async function processOfflineQueue(userId: string): Promise<void> {
  const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!queueJson) return;
  
  const queue: QueuedOperation[] = JSON.parse(queueJson);
  if (queue.length === 0) return;
  
  const deviceId = await getDeviceId();
  const batch = firestore().batch();
  
  for (const op of queue) {
    if (op.type === 'bill') {
      const billRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('bills')
        .doc(op.data.id);
      
      if (op.operation === 'delete') {
        batch.delete(billRef);
      } else {
        const firestoreBill = sqliteToFirestoreBill(op.data, deviceId);
        batch.set(billRef, firestoreBill, { merge: true });
      }
    } else if (op.type === 'payment') {
      const paymentRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('payments')
        .doc(op.data.id);
      
      if (op.operation === 'delete') {
        batch.delete(paymentRef);
      } else {
        const firestorePayment = sqliteToFirestorePayment(op.data, deviceId);
        batch.set(paymentRef, firestorePayment);
      }
    }
  }
  
  await batch.commit();
  
  // Clear queue after successful sync
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// === Main Sync Functions ===

/**
 * Perform full two-way sync: pull from Firestore, then push to Firestore
 */
export async function syncData(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required for sync');
  }
  
  updateSyncState({ status: 'syncing', error: null });
  
  try {
    const online = await isOnline();
    
    if (!online) {
      updateSyncState({ status: 'offline', error: 'No internet connection' });
      return;
    }
    
    const lastSyncTime = await getLastSyncTime();
    
    // Pull changes from Firestore
    await pullBills(userId, lastSyncTime);
    await pullPayments(userId, lastSyncTime);
    
    // Process offline queue if any
    await processOfflineQueue(userId);
    
    // Push local changes to Firestore
    await pushBills(userId, lastSyncTime);
    await pushPayments(userId, lastSyncTime);
    
    // Update last sync time
    const now = Date.now();
    await updateLastSyncTime(now);
    
    updateSyncState({ 
      status: 'synced', 
      lastSyncTime: now,
      error: null 
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    updateSyncState({ 
      status: 'error', 
      error: error.message || 'Sync failed' 
    });
    throw error;
  }
}

/**
 * Sync on local change: push to Firestore immediately or queue if offline
 */
export async function syncLocalChange(
  userId: string,
  type: 'bill' | 'payment',
  operation: 'create' | 'update' | 'delete',
  data: Bill | Payment
): Promise<void> {
  if (!userId) return;
  
  const online = await isOnline();
  
  if (!online) {
    // Queue operation for later
    await addToOfflineQueue({
      type,
      operation,
      data,
      timestamp: Date.now(),
    });
    updateSyncState({ status: 'offline' });
    return;
  }
  
  try {
    const deviceId = await getDeviceId();
    
    if (type === 'bill') {
      const billRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('bills')
        .doc(data.id);
      
      if (operation === 'delete') {
        await billRef.delete();
      } else {
        const firestoreBill = sqliteToFirestoreBill(data as Bill, deviceId);
        
        // Optimistic locking
        const existingDoc = await billRef.get();
        if (existingDoc.exists()) {
          const currentVersion = existingDoc.data()?._version || 0;
          firestoreBill._version = currentVersion + 1;
        }
        
        await billRef.set(firestoreBill, { merge: true });
      }
    } else if (type === 'payment') {
      const paymentRef = firestore()
        .collection('users')
        .doc(userId)
        .collection('payments')
        .doc(data.id);
      
      if (operation === 'delete') {
        await paymentRef.delete();
      } else {
        const firestorePayment = sqliteToFirestorePayment(data as Payment, deviceId);
        await paymentRef.set(firestorePayment);
      }
    }
    
    updateSyncState({ status: 'synced', lastSyncTime: Date.now() });
  } catch (error: any) {
    console.error('Sync local change error:', error);
    // Queue operation if sync fails
    await addToOfflineQueue({
      type,
      operation,
      data,
      timestamp: Date.now(),
    });
    updateSyncState({ status: 'error', error: error.message });
  }
}

/**
 * Setup real-time sync listener for bills
 */
export function setupRealtimeSync(
  userId: string,
  onBillsChanged: () => void,
  onPaymentsChanged: () => void
): () => void {
  const unsubscribeBills = firestore()
    .collection('users')
    .doc(userId)
    .collection('bills')
    .onSnapshot(
      async (snapshot) => {
        if (!snapshot.metadata.hasPendingWrites) {
          // Only process remote changes
          const lastSyncTime = await getLastSyncTime();
          await pullBills(userId, lastSyncTime);
          await updateLastSyncTime(Date.now());
          onBillsChanged();
        }
      },
      (error) => {
        console.error('Bills realtime sync error:', error);
      }
    );
  
  const unsubscribePayments = firestore()
    .collection('users')
    .doc(userId)
    .collection('payments')
    .onSnapshot(
      async (snapshot) => {
        if (!snapshot.metadata.hasPendingWrites) {
          // Only process remote changes
          const lastSyncTime = await getLastSyncTime();
          await pullPayments(userId, lastSyncTime);
          await updateLastSyncTime(Date.now());
          onPaymentsChanged();
        }
      },
      (error) => {
        console.error('Payments realtime sync error:', error);
      }
    );
  
  // Return cleanup function
  return () => {
    unsubscribeBills();
    unsubscribePayments();
  };
}

// Migration status storage key
const MIGRATION_STATUS_KEY = '@duetrack:migrationComplete';

export interface MigrationResult {
  success: boolean;
  billsUploaded: number;
  paymentsUploaded: number;
  billsMerged: number;
  billsDuplicated: number;
  error?: string;
}

export interface MigrationProgress {
  phase: 'checking' | 'uploading_bills' | 'uploading_payments' | 'merging' | 'complete';
  current: number;
  total: number;
  message: string;
}

// Migration progress listeners
type MigrationProgressListener = (progress: MigrationProgress) => void;
const migrationProgressListeners = new Set<MigrationProgressListener>();

// Subscribe to migration progress
export function subscribeMigrationProgress(listener: MigrationProgressListener): () => void {
  migrationProgressListeners.add(listener);
  return () => {
    migrationProgressListeners.delete(listener);
  };
}

// Update migration progress and notify listeners
function updateMigrationProgress(progress: MigrationProgress) {
  migrationProgressListeners.forEach(listener => listener(progress));
}

// Check if migration has been completed
async function isMigrationComplete(userId: string): Promise<boolean> {
  try {
    const metaDoc = await firestore()
      .collection('users')
      .doc(userId)
      .collection('meta')
      .doc('migration')
      .get();
    
    return metaDoc.exists() && metaDoc.data()?.migrationComplete === true;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

// Mark migration as complete
async function markMigrationComplete(userId: string): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('meta')
    .doc('migration')
    .set({
      migrationComplete: true,
      completedAt: firestore.Timestamp.now(),
    });
}

// Check if two bills are duplicates based on name, amount, and dueDate
function areBillsDuplicate(bill1: any, bill2: any): boolean {
  return (
    bill1.name.toLowerCase().trim() === bill2.name.toLowerCase().trim() &&
    bill1.amount === bill2.amount &&
    bill1.dueDate === bill2.dueDate
  );
}

/**
 * Initial migration: upload all local data to Firestore with merge support
 */
export async function migrateLocalDataToFirestore(userId: string): Promise<MigrationResult> {
  if (!userId) {
    throw new Error('User ID is required for migration');
  }
  
  const result: MigrationResult = {
    success: false,
    billsUploaded: 0,
    paymentsUploaded: 0,
    billsMerged: 0,
    billsDuplicated: 0,
  };
  
  updateSyncState({ status: 'syncing', error: null });
  
  try {
    // Check if migration already completed
    updateMigrationProgress({
      phase: 'checking',
      current: 0,
      total: 1,
      message: 'Checking migration status...',
    });
    
    const migrationDone = await isMigrationComplete(userId);
    if (migrationDone) {
      console.log('Migration skipped: Already completed');
      result.success = true;
      updateMigrationProgress({
        phase: 'complete',
        current: 1,
        total: 1,
        message: 'Migration already completed',
      });
      return result;
    }
    
    const deviceId = await getDeviceId();
    
    // Get all local bills
    const localBills = await getAllAsync<any>('SELECT * FROM bills');
    
    // Get all existing Firestore bills
    const billsRef = firestore().collection('users').doc(userId).collection('bills');
    const existingBillsSnapshot = await billsRef.get();
    const existingBills = existingBillsSnapshot.docs.map(doc => doc.data());
    
    // Check if user has local data
    if (localBills.length === 0 && existingBills.length === 0) {
      // No data to migrate
      await markMigrationComplete(userId);
      result.success = true;
      updateMigrationProgress({
        phase: 'complete',
        current: 1,
        total: 1,
        message: 'No data to migrate',
      });
      return result;
    }
    
    // Merge scenario: deduplicate bills
    const billsToUpload: Bill[] = [];
    
    for (const row of localBills) {
      const sqliteBill: Bill = {
        ...row,
        autopay: row.autopay === 1,
        dueDate: parseInt(row.dueDate, 10),
        createdAt: parseInt(row.createdAt, 10),
        updatedAt: parseInt(row.updatedAt, 10),
      };
      
      // Check if this bill is a duplicate of existing Firestore bill
      const isDuplicate = existingBills.some(existingBill => 
        areBillsDuplicate(sqliteBill, existingBill)
      );
      
      if (isDuplicate) {
        result.billsDuplicated++;
      } else {
        billsToUpload.push(sqliteBill);
      }
    }
    
    // Upload bills in batches
    if (billsToUpload.length > 0) {
      updateMigrationProgress({
        phase: 'uploading_bills',
        current: 0,
        total: billsToUpload.length,
        message: `Syncing ${billsToUpload.length} bills...`,
      });
      
      for (let i = 0; i < billsToUpload.length; i += 500) {
        const batch = firestore().batch();
        const chunk = billsToUpload.slice(i, i + 500);
        
        for (const sqliteBill of chunk) {
          const firestoreBill = sqliteToFirestoreBill(sqliteBill, deviceId);
          
          const billRef = firestore()
            .collection('users')
            .doc(userId)
            .collection('bills')
            .doc(sqliteBill.id);
          
          batch.set(billRef, firestoreBill);
        }
        
        await batch.commit();
        
        result.billsUploaded += chunk.length;
        
        updateMigrationProgress({
          phase: 'uploading_bills',
          current: result.billsUploaded,
          total: billsToUpload.length,
          message: `Synced ${result.billsUploaded} of ${billsToUpload.length} bills...`,
        });
      }
    }
    
    // If there were existing bills, merge them to local SQLite
    if (existingBills.length > 0) {
      updateMigrationProgress({
        phase: 'merging',
        current: 0,
        total: existingBills.length,
        message: `Merging ${existingBills.length} bills from cloud...`,
      });
      
      for (const existingBill of existingBills) {
        const firestoreBill = existingBill as FirestoreBill;
        
        // Check if this bill exists in local SQLite
        const localBill = await getAsync<any>('SELECT id FROM bills WHERE id = ?', [firestoreBill.id]);
        
        if (!localBill) {
          // Bill doesn't exist locally, add it
          const sqliteBill = firestoreToSqliteBill(firestoreBill);
          
          await runAsync(
            `INSERT INTO bills (id, name, dueDate, amount, frequency, autopay, notes, iconKey, status, createdAt, updatedAt, notificationIds, timezone)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sqliteBill.id,
              sqliteBill.name,
              sqliteBill.dueDate,
              sqliteBill.amount ?? null,
              sqliteBill.frequency,
              sqliteBill.autopay ? 1 : 0,
              sqliteBill.notes ?? null,
              sqliteBill.iconKey,
              sqliteBill.status,
              sqliteBill.createdAt,
              sqliteBill.updatedAt,
              sqliteBill.notificationIds ?? null,
              sqliteBill.timezone ?? null,
            ]
          );
          
          result.billsMerged++;
        }
        
        updateMigrationProgress({
          phase: 'merging',
          current: result.billsMerged,
          total: existingBills.length,
          message: `Merged ${result.billsMerged} bills from cloud...`,
        });
      }
    }
    
    // Get all local payments
    const localPayments = await getAllAsync<any>('SELECT * FROM payments');
    
    updateMigrationProgress({
      phase: 'uploading_payments',
      current: 0,
      total: localPayments.length,
      message: localPayments.length > 0 ? `Syncing ${localPayments.length} payments...` : 'Syncing payments...',
    });
    
    if (localPayments.length > 0) {
      // Upload payments in batches
      for (let i = 0; i < localPayments.length; i += 500) {
        const batch = firestore().batch();
        const chunk = localPayments.slice(i, i + 500);
        
        for (const row of chunk) {
          const sqlitePayment: Payment = {
            ...row,
            paidDate: parseInt(row.paidDate, 10),
            createdAt: parseInt(row.createdAt, 10),
          };
          
          const firestorePayment = sqliteToFirestorePayment(sqlitePayment, deviceId);
          
          const paymentRef = firestore()
            .collection('users')
            .doc(userId)
            .collection('payments')
            .doc(sqlitePayment.id);
          
          batch.set(paymentRef, firestorePayment);
        }
        
        await batch.commit();
        
        result.paymentsUploaded += chunk.length;
        
        updateMigrationProgress({
          phase: 'uploading_payments',
          current: result.paymentsUploaded,
          total: localPayments.length,
          message: `Synced ${result.paymentsUploaded} of ${localPayments.length} payments...`,
        });
      }
    }
    
    // Mark migration as complete
    await markMigrationComplete(userId);
    
    // Update last sync time
    const now = Date.now();
    await updateLastSyncTime(now);
    
    result.success = true;
    
    updateSyncState({ 
      status: 'synced', 
      lastSyncTime: now,
      error: null 
    });
    
    updateMigrationProgress({
      phase: 'complete',
      current: 1,
      total: 1,
      message: 'Your bills have been synced to the cloud',
    });
    
    console.log('Migration complete:', result);
    
    return result;
  } catch (error: any) {
    console.error('Migration error:', error);
    result.error = error.message || 'Migration failed';
    
    updateSyncState({ 
      status: 'error', 
      error: result.error 
    });
    
    throw error;
  }
}

// Get current sync state
export function getSyncState(): SyncState {
  return { ...currentSyncState };
}
