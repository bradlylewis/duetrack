/**
 * Sync-aware database queries
 * 
 * These functions wrap the base SQLite queries and automatically sync changes to Firestore.
 * Use these instead of the base queries when the user is authenticated.
 */

import * as baseQueries from './queries';
import { syncLocalChange } from '@/src/services/sync';
import { Bill, Payment } from '@/src/types';

/**
 * Insert a bill and sync to Firestore
 */
export async function insertBill(
  userId: string | null,
  bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const billId = await baseQueries.insertBill(bill);
  
  if (userId) {
    // Get the newly created bill to sync
    const newBill = await baseQueries.getBillById(billId);
    if (newBill) {
      await syncLocalChange(userId, 'bill', 'create', newBill);
    }
  }
  
  return billId;
}

/**
 * Update a bill and sync to Firestore
 */
export async function updateBill(
  userId: string | null,
  id: string,
  updates: Partial<Bill>
): Promise<void> {
  await baseQueries.updateBill(id, updates);
  
  if (userId) {
    // Get the updated bill to sync
    const updatedBill = await baseQueries.getBillById(id);
    if (updatedBill) {
      await syncLocalChange(userId, 'bill', 'update', updatedBill);
    }
  }
}

/**
 * Delete a bill and sync to Firestore
 */
export async function deleteBill(
  userId: string | null,
  id: string
): Promise<void> {
  // Get bill before deleting (for sync)
  const bill = userId ? await baseQueries.getBillById(id) : null;
  
  await baseQueries.deleteBill(id);
  
  if (userId && bill) {
    await syncLocalChange(userId, 'bill', 'delete', bill);
  }
}

/**
 * Insert a payment and sync to Firestore
 */
export async function insertPayment(
  userId: string | null,
  payment: Omit<Payment, 'id' | 'createdAt'>
): Promise<string> {
  const paymentId = await baseQueries.insertPayment(payment);
  
  if (userId) {
    // Get the newly created payment to sync
    const payments = await baseQueries.getPaymentsForBill(payment.billId);
    const newPayment = payments.find(p => p.id === paymentId);
    
    if (newPayment) {
      await syncLocalChange(userId, 'payment', 'create', newPayment);
    }
  }
  
  return paymentId;
}

/**
 * Mark bill as paid and sync to Firestore
 */
export async function markBillAsPaid(
  userId: string | null,
  billId: string
): Promise<void> {
  await baseQueries.markBillAsPaid(billId);
  
  if (userId) {
    // Get the updated bill to sync
    const updatedBill = await baseQueries.getBillById(billId);
    if (updatedBill) {
      await syncLocalChange(userId, 'bill', 'update', updatedBill);
    }
    
    // Get the latest payment to sync
    const payments = await baseQueries.getPaymentsForBill(billId);
    if (payments.length > 0) {
      const latestPayment = payments[0]; // Sorted by paidDate DESC
      await syncLocalChange(userId, 'payment', 'create', latestPayment);
    }
  }
}

/**
 * Delete payments for a bill and sync to Firestore
 */
export async function deletePaymentsForBill(
  userId: string | null,
  billId: string
): Promise<void> {
  // Get payments before deleting (for sync)
  const payments = userId ? await baseQueries.getPaymentsForBill(billId) : [];
  
  await baseQueries.deletePaymentsForBill(billId);
  
  if (userId) {
    // Sync deletions
    for (const payment of payments) {
      await syncLocalChange(userId, 'payment', 'delete', payment);
    }
  }
}

// Re-export read-only queries (no sync needed)
export {
  getBillById,
  getAllBills,
  getBillsByStatus,
  getPaymentsForBill,
  getAllPayments,
} from './queries';
