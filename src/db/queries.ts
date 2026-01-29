import { getAllAsync, getAsync, runAsync } from '@/src/db/database';
import { Bill, Payment } from '@/src/types';
import * as Crypto from 'expo-crypto';
import { scheduleBillNotifications, cancelBillNotifications, rescheduleBillNotifications } from '@/src/utils/notification-scheduling';

// Utility: Calculate next due date with month-end rollover
function calculateNextDueDate(currentDueDate: number): number {
  const current = new Date(currentDueDate);
  const year = current.getFullYear();
  const month = current.getMonth(); // 0-indexed
  const day = current.getDate();

  // Calculate next month
  let nextMonth = month + 1;
  let nextYear = year;
  
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear += 1;
  }

  // Get last day of next month
  const lastDayOfNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
  
  // Apply rollover: if current day > last day of next month, use last day
  const nextDay = Math.min(day, lastDayOfNextMonth);
  
  return new Date(nextYear, nextMonth, nextDay).getTime();
}

// Bills queries
export async function insertBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = Crypto.randomUUID();
  const now = Date.now();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Schedule notifications
  const notificationIds = await scheduleBillNotifications(id, bill.name, bill.dueDate);
  const notificationIdsJson = notificationIds.length > 0 ? JSON.stringify(notificationIds) : null;

  await runAsync(
    `INSERT INTO bills (id, name, dueDate, amount, frequency, autopay, notes, iconKey, status, createdAt, updatedAt, notificationIds, timezone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      bill.name,
      bill.dueDate,
      bill.amount || null,
      bill.frequency,
      bill.autopay ? 1 : 0,
      bill.notes || null,
      bill.iconKey,
      bill.status || 'active',
      now,
      now,
      notificationIdsJson,
      timezone,
    ]
  );

  return id;
}

export async function getBillById(id: string): Promise<Bill | null> {
  const result = await getAsync<any>(
    'SELECT * FROM bills WHERE id = ?',
    [id]
  );

  if (!result) return null;

  return {
    ...result,
    autopay: result.autopay === 1,
    dueDate: parseInt(result.dueDate, 10),
    createdAt: parseInt(result.createdAt, 10),
    updatedAt: parseInt(result.updatedAt, 10),
  };
}

export async function getAllBills(): Promise<Bill[]> {
  const results = await getAllAsync<any>(
    'SELECT * FROM bills ORDER BY dueDate ASC'
  );

  return results.map((row) => ({
    ...row,
    autopay: row.autopay === 1,
    dueDate: parseInt(row.dueDate, 10),
    createdAt: parseInt(row.createdAt, 10),
    updatedAt: parseInt(row.updatedAt, 10),
  }));
}

export async function updateBill(id: string, updates: Partial<Bill>): Promise<void> {
  // Get current bill to access notificationIds
  const currentBill = await getBillById(id);
  
  const updateFields: string[] = [];
  const values: any[] = [];

  // Check if due date or name is being updated (need to reschedule notifications)
  const shouldReschedule = updates.dueDate !== undefined || updates.name !== undefined;
  
  if (shouldReschedule && currentBill) {
    const oldNotificationIds = currentBill.notificationIds ? JSON.parse(currentBill.notificationIds) : [];
    const newName = updates.name || currentBill.name;
    const newDueDate = updates.dueDate || currentBill.dueDate;
    
    // Reschedule notifications
    const newNotificationIds = await rescheduleBillNotifications(
      oldNotificationIds,
      id,
      newName,
      newDueDate
    );
    
    // Update notificationIds in the updates object
    updates.notificationIds = newNotificationIds.length > 0 ? JSON.stringify(newNotificationIds) : null;
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'id' || key === 'createdAt') return;

    updateFields.push(`${key} = ?`);
    if (key === 'autopay') {
      values.push(value ? 1 : 0);
    } else {
      values.push(value ?? null);
    }
  });

  updateFields.push('updatedAt = ?');
  values.push(Date.now());
  values.push(id);

  await runAsync(
    `UPDATE bills SET ${updateFields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteBill(id: string): Promise<void> {
  // Get bill to access notificationIds before deleting
  const bill = await getBillById(id);
  
  if (bill && bill.notificationIds) {
    const notificationIds = JSON.parse(bill.notificationIds);
    await cancelBillNotifications(notificationIds);
  }
  
  await runAsync('DELETE FROM bills WHERE id = ?', [id]);
}

export async function getBillsByStatus(status: 'active' | 'completed'): Promise<Bill[]> {
  const results = await getAllAsync<any>(
    'SELECT * FROM bills WHERE status = ? ORDER BY dueDate ASC',
    [status]
  );

  return results.map((row) => ({
    ...row,
    autopay: row.autopay === 1,
    dueDate: parseInt(row.dueDate, 10),
    createdAt: parseInt(row.createdAt, 10),
    updatedAt: parseInt(row.updatedAt, 10),
  }));
}

// Payments queries
export async function insertPayment(
  payment: Omit<Payment, 'id' | 'createdAt'>
): Promise<string> {
  const id = Crypto.randomUUID();
  const now = Date.now();

  console.log('Inserting payment:', { id, billId: payment.billId, paidDate: payment.paidDate, amountPaid: payment.amountPaid, createdAt: now });

  await runAsync(
    `INSERT INTO payments (id, billId, paidDate, amountPaid, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [id, payment.billId, payment.paidDate, payment.amountPaid || null, now]
  );

  console.log('Payment inserted successfully');

  return id;
}

export async function getPaymentsForBill(billId: string): Promise<Payment[]> {
  const results = await getAllAsync<any>(
    'SELECT * FROM payments WHERE billId = ? ORDER BY paidDate DESC',
    [billId]
  );

  console.log('Raw payment results from DB:', results);

  return results.map((row) => ({
    ...row,
    paidDate: parseInt(row.paidDate, 10),
    amountPaid: row.amountPaid ? parseFloat(row.amountPaid) : undefined,
    createdAt: parseInt(row.createdAt, 10),
  }));
}

export async function getAllPayments(): Promise<Payment[]> {
  const results = await getAllAsync<any>(
    'SELECT * FROM payments ORDER BY paidDate DESC'
  );

  return results.map((row) => ({
    ...row,
    paidDate: parseInt(row.paidDate, 10),
    createdAt: parseInt(row.createdAt, 10),
  }));
}

export async function deletePaymentsForBill(billId: string): Promise<void> {
  await runAsync('DELETE FROM payments WHERE billId = ?', [billId]);
}

// Mark Bill as Paid
export async function markBillAsPaid(billId: string): Promise<void> {
  // Get the bill
  const bill = await getBillById(billId);
  if (!bill) throw new Error('Bill not found');

  const now = Date.now();

  console.log('Marking bill as paid:', billId, 'Amount:', bill.amount);

  // Insert payment record
  const paymentId = await insertPayment({
    billId,
    paidDate: now,
    amountPaid: bill.amount || null,
  });

  console.log('Payment inserted with ID:', paymentId);

  // Update bill based on frequency
  if (bill.frequency === 'monthly') {
    // Calculate next due date with rollover
    const nextDueDate = calculateNextDueDate(bill.dueDate);
    
    console.log('Monthly bill - advancing due date from', new Date(bill.dueDate), 'to', new Date(nextDueDate));
    
    // updateBill will automatically reschedule notifications
    await updateBill(billId, {
      dueDate: nextDueDate,
      updatedAt: now,
    });
  } else {
    // One-time bill: mark as completed and cancel notifications
    console.log('One-time bill - marking as completed');
    
    // Cancel notifications since bill is completed
    if (bill.notificationIds) {
      const notificationIds = JSON.parse(bill.notificationIds);
      await cancelBillNotifications(notificationIds);
    }
    
    await updateBill(billId, {
      status: 'completed',
      notificationIds: null,
      updatedAt: now,
    });
  }
}
