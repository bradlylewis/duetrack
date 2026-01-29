export interface Bill {
  id: string;
  name: string;
  dueDate: number;
  amount?: number;
  frequency: 'one-time' | 'monthly';
  autopay: boolean;
  notes?: string;
  iconKey: string;
  status: 'active' | 'completed';
  createdAt: number;
  updatedAt: number;
  notificationIds?: string;
  timezone?: string;
}

export interface Payment {
  id: string;
  billId: string;
  paidDate: number;
  amountPaid?: number;
  createdAt: number;
}

export interface AppMeta {
  key: string;
  value: string;
  updatedAt: number;
}

export type NavigationParamList = {
  Home: undefined;
  AddBill: undefined;
  EditBill: { billId: string };
  BillDetails: { billId: string };
  History: undefined;
  Settings: undefined;
};
