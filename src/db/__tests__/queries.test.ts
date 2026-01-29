import { insertBill, getBillById, updateBill, deleteBill, getAllBills } from '../queries';
import { Bill } from '@/src/types';

describe('Database Queries', () => {
  const testBill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Test Electricity Bill',
    dueDate: 1706745600000,
    amount: 150,
    frequency: 'monthly',
    autopay: false,
    notes: 'Test bill',
    iconKey: 'electricity',
    status: 'active',
  };

  test('insertBill creates a bill and returns an ID', async () => {
    const id = await insertBill(testBill);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  test('getBillById retrieves a bill', async () => {
    const id = await insertBill(testBill);
    const retrieved = await getBillById(id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe(testBill.name);
    expect(retrieved?.dueDate).toBe(testBill.dueDate);
  });

  test('updateBill modifies a bill', async () => {
    const id = await insertBill(testBill);
    await updateBill(id, { name: 'Updated Electricity Bill' });
    const updated = await getBillById(id);
    expect(updated?.name).toBe('Updated Electricity Bill');
  });

  test('getAllBills returns all bills', async () => {
    const before = await getAllBills();
    await insertBill(testBill);
    const after = await getAllBills();
    expect(after.length).toBeGreaterThan(before.length);
  });

  test('deleteBill removes a bill', async () => {
    const id = await insertBill(testBill);
    await deleteBill(id);
    const deleted = await getBillById(id);
    expect(deleted).toBeNull();
  });
});
