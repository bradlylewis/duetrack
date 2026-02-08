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

// Firestore types (for cloud sync)
export interface FirestoreBill {
  // Core fields (from SQLite)
  id: string;
  name: string;
  dueDate: number;
  amount: number | null;
  frequency: 'one-time' | 'monthly';
  autopay: boolean;
  notes: string | null;
  iconKey: string;
  status: 'active' | 'completed';
  timezone: string | null;
  notificationIds: string[]; // Array (not JSON string)
  
  // Timestamps (Firestore Timestamp type in actual implementation)
  createdAt: any; // FirebaseFirestore.Timestamp
  updatedAt: any; // FirebaseFirestore.Timestamp
  lastSynced: any; // FirebaseFirestore.Timestamp
  
  // Sync metadata
  deviceId: string;
  _version: number;
}

export interface FirestorePayment {
  // Core fields (from SQLite)
  id: string;
  billId: string;
  paidDate: number;
  amountPaid: number | null;
  
  // Timestamps (Firestore Timestamp type in actual implementation)
  createdAt: any; // FirebaseFirestore.Timestamp
  lastSynced: any; // FirebaseFirestore.Timestamp
  
  // Sync metadata
  deviceId: string;
  _version: number;
}

export type NavigationParamList = {
  Home: undefined;
  AddBill: undefined;
  EditBill: { billId: string };
  BillDetails: { billId: string };
  History: undefined;
  Settings: undefined;
};
