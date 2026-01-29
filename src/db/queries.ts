import { getAllAsync, getAsync, runAsync } from '@/src/db/database';
import { Bill, Payment } from '@/src/types';
import * as Crypto from 'expo-crypto';

// Bills queries
export async function insertBill(bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = Crypto.randomUUID();
  const now = Date.now();

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
      bill.notificationIds || null,
      bill.timezone || null,
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
  const updateFields: string[] = [];
  const values: any[] = [];

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

  await runAsync(
    `INSERT INTO payments (id, billId, paidDate, amountPaid, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [id, payment.billId, payment.paidDate, payment.amountPaid || null, now]
  );

  return id;
}

export async function getPaymentsForBill(billId: string): Promise<Payment[]> {
  const results = await getAllAsync<any>(
    'SELECT * FROM payments WHERE billId = ? ORDER BY paidDate DESC',
    [billId]
  );

  return results.map((row) => ({
    ...row,
    paidDate: parseInt(row.paidDate, 10),
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
