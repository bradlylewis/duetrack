import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Layout } from '../components/Layout';
import { getAllPayments } from '../db/queries';
import { getBillById } from '../db/queries';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import type { Payment, Bill } from '../types';

interface PaymentWithBill extends Payment {
  billName: string;
  billIcon: string;
}

export const HistoryScreen: React.FC = () => {
  const [payments, setPayments] = useState<PaymentWithBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      
      const allPayments = await getAllPayments();
      
      // Fetch bill details for each payment
      const paymentsWithBills = await Promise.all(
        allPayments.map(async (payment) => {
          const bill = await getBillById(payment.billId);
          return {
            ...payment,
            billName: bill?.name || 'Unknown Bill',
            billIcon: bill?.iconKey || '📄',
          };
        })
      );
      
      setPayments(paymentsWithBills);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments(true);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (payments.length === 0) {
    return (
      <Layout>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Payment History</Text>
          <Text style={styles.emptyText}>
            Your payment history will appear here once you mark bills as paid.
          </Text>
        </ScrollView>
      </Layout>
    );
  }

  return (
    <Layout noPadding>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Payment History</Text>
        {payments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.icon}>{payment.billIcon}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.billName}>{payment.billName}</Text>
                <Text style={styles.date}>{formatDate(payment.paidDate)}</Text>
              </View>
              <Text style={styles.amount}>
                {payment.amountPaid ? `$${payment.amountPaid.toFixed(2)}` : 'N/A'}
              </Text>
            </View>
          </View>
        ))}
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
  title: {
    ...typography.styles.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  billName: {
    ...typography.styles.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  amount: {
    ...typography.styles.h3,
    color: colors.success,
  },
});
