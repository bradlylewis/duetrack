import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import {
  syncData,
  syncLocalChange,
  subscribeSyncState,
  setupRealtimeSync,
  migrateLocalDataToFirestore,
  SyncState,
  SyncStatus,
} from '@/src/services/sync';
import { Bill, Payment } from '@/src/types';

interface SyncContextType {
  syncState: SyncState;
  syncNow: () => Promise<void>;
  syncBillChange: (operation: 'create' | 'update' | 'delete', bill: Bill) => Promise<void>;
  syncPaymentChange: (operation: 'create' | 'update' | 'delete', payment: Payment) => Promise<void>;
  migrateData: () => Promise<void>;
  isSyncing: boolean;
  isOffline: boolean;
  hasError: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSyncTime: null,
    error: null,
  });
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  // Subscribe to sync state changes
  useEffect(() => {
    const unsubscribe = subscribeSyncState((state) => {
      setSyncState(state);
    });

    return unsubscribe;
  }, []);

  // Setup real-time sync when user is authenticated
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = setupRealtimeSync(
      user.uid,
      // On bills changed
      () => {
        setDataRefreshTrigger((prev) => prev + 1);
      },
      // On payments changed
      () => {
        setDataRefreshTrigger((prev) => prev + 1);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  // Sync on app launch
  useEffect(() => {
    if (!user?.uid) return;

    const performInitialSync = async () => {
      try {
        await syncData(user.uid);
      } catch (error) {
        console.error('Initial sync failed:', error);
      }
    };

    performInitialSync();
  }, [user?.uid]);

  // Sync on app resume from background
  useEffect(() => {
    if (!user?.uid) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, sync data
        try {
          await syncData(user.uid);
        } catch (error) {
          console.error('Background sync failed:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user?.uid]);

  // Manual sync trigger
  const syncNow = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    await syncData(user.uid);
    setDataRefreshTrigger((prev) => prev + 1);
  }, [user?.uid]);

  // Sync bill changes
  const syncBillChange = useCallback(
    async (operation: 'create' | 'update' | 'delete', bill: Bill) => {
      if (!user?.uid) return;

      await syncLocalChange(user.uid, 'bill', operation, bill);
    },
    [user?.uid]
  );

  // Sync payment changes
  const syncPaymentChange = useCallback(
    async (operation: 'create' | 'update' | 'delete', payment: Payment) => {
      if (!user?.uid) return;

      await syncLocalChange(user.uid, 'payment', operation, payment);
    },
    [user?.uid]
  );

  // Migrate local data to Firestore
  const migrateData = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    await migrateLocalDataToFirestore(user.uid);
    setDataRefreshTrigger((prev) => prev + 1);
  }, [user?.uid]);

  const isSyncing = syncState.status === 'syncing';
  const isOffline = syncState.status === 'offline';
  const hasError = syncState.status === 'error';

  return (
    <SyncContext.Provider
      value={{
        syncState,
        syncNow,
        syncBillChange,
        syncPaymentChange,
        migrateData,
        isSyncing,
        isOffline,
        hasError,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
