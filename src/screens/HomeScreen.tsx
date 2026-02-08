import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Layout } from '../components/Layout';
import { BillCard } from '../components/BillCard';
import { NotificationPermissionBanner } from '../components/NotificationPermissionBanner';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';
import { getAllBills } from '../db/queries';
import { checkAndUpdatePermissionStatus } from '../services/notifications';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import type { Bill } from '../types';
import type { HomeStackScreenProps } from '../navigation/types';

type Props = HomeStackScreenProps<'HomeMain'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const loadBills = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const fetchedBills = await getAllBills();
      
      // Filter active bills and sort by due date
      const activeBills = fetchedBills
        .filter((bill) => bill.status === 'active')
        .sort((a, b) => a.dueDate - b.dueDate);
      
      setBills(activeBills);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBills();
      checkPermissionStatus();
    }, [])
  );

  const checkPermissionStatus = async () => {
    const status = await checkAndUpdatePermissionStatus();
    setPermissionStatus(status);
    // Reset banner dismissed state when checking permission
    setBannerDismissed(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBills(true);
  };

  const groupBillsByUrgency = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const overdue: Bill[] = [];
    const thisWeek: Bill[] = [];
    const later: Bill[] = [];

    bills.forEach((bill) => {
      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        overdue.push(bill);
      } else if (dueDate <= oneWeekFromNow) {
        thisWeek.push(bill);
      } else {
        later.push(bill);
      }
    });

    return { overdue, thisWeek, later };
  };

  const getEmptyMessage = (groupType: 'overdue' | 'thisWeek' | 'later'): string => {
    switch (groupType) {
      case 'overdue':
        return "You're all caught up!";
      case 'thisWeek':
        return 'Nothing due this week';
      case 'later':
        return 'No upcoming bills';
    }
  };

  const renderBillGroup = (
    title: string, 
    groupBills: Bill[], 
    color: string, 
    groupType: 'overdue' | 'thisWeek' | 'later'
  ) => {
    return (
      <View style={styles.group}>
        <Text style={[styles.groupTitle, { color }]}>
          {title} ({groupBills.length})
        </Text>
        {groupBills.length === 0 ? (
          <View style={styles.emptyGroupContainer}>
            <Text style={styles.emptyGroupText}>{getEmptyMessage(groupType)}</Text>
          </View>
        ) : (
          groupBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onPress={() =>
                navigation.navigate('BillDetails', { billId: bill.id })
              }
            />
          ))
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Layout>
    );
  }

  if (bills.length === 0) {
    return (
      <Layout>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Bills Yet</Text>
          <Text style={styles.emptyText}>
            Add your first bill to get started tracking your payments and never miss a due date!
          </Text>
        </ScrollView>
      </Layout>
    );
  }

  const { overdue, thisWeek, later } = groupBillsByUrgency();

  return (
    <Layout noPadding>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {permissionStatus === 'denied' && !bannerDismissed && (
          <NotificationPermissionBanner 
            onDismiss={() => setBannerDismissed(true)}
          />
        )}
        
        <SyncStatusIndicator />
        
        {renderBillGroup('Overdue', overdue, colors.error, 'overdue')}
        {renderBillGroup('This Week', thisWeek, colors.warning, 'thisWeek')}
        {renderBillGroup('Later', later, colors.textSecondary, 'later')}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screenPadding,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenPadding,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.styles.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  group: {
    marginBottom: spacing.xl,
  },
  groupTitle: {
    ...typography.styles.h3,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  emptyGroupContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyGroupText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
