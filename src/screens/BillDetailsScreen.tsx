import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Layout } from '../components/Layout';
import { BillForm, BillFormValues } from '../components/BillForm';
import { getBillById, updateBill, deleteBill, markBillAsPaid, getPaymentsForBill } from '../db/queries';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import type { Bill, Payment } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BillDetails'>;

export const BillDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { billId } = route.params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    try {
      setLoading(true);
      const fetchedBill = await getBillById(billId);
      console.log('Fetched bill:', fetchedBill);
      setBill(fetchedBill);
      
      // Load payment history
      console.log('Fetching payments for billId:', billId);
      const fetchedPayments = await getPaymentsForBill(billId);
      console.log('Loaded payments:', fetchedPayments);
      console.log('Number of payments:', fetchedPayments.length);
      setPayments(fetchedPayments);
    } catch (error) {
      console.error('Error loading bill:', error);
      Alert.alert('Error', 'Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values: BillFormValues) => {
    if (!bill) return;

    try {
      await updateBill(billId, {
        name: values.name,
        dueDate: values.dueDate,
        amount: values.amount,
        frequency: values.frequency,
        autopay: values.autopay,
        notes: values.notes,
        iconKey: values.iconKey,
      });

      Alert.alert('Success', 'Bill updated successfully!');
      setIsEditing(false);
      await loadBill();
    } catch (error) {
      console.error('Error updating bill:', error);
      Alert.alert('Error', 'Failed to update bill. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBill(billId);
              Alert.alert('Success', 'Bill deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Error deleting bill:', error);
              Alert.alert('Error', 'Failed to delete bill');
            }
          },
        },
      ]
    );
  };

  const handleMarkPaid = () => {
    Alert.alert(
      'Mark as Paid',
      'Mark this bill as paid for this month?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            try {
              await markBillAsPaid(billId);
              await loadBill();
              Alert.alert('Success', 'Bill marked as paid!');
            } catch (error) {
              console.error('Error marking bill as paid:', error);
              Alert.alert('Error', 'Failed to mark bill as paid');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Layout>
    );
  }

  if (!bill) {
    return (
      <Layout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Bill not found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  if (isEditing) {
    return (
      <Layout noPadding useSafeArea={false}>
        <BillForm
          initialValues={bill}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update Bill"
        />
      </Layout>
    );
  }

  return (
    <Layout noPadding>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.icon}>{bill.iconKey}</Text>
            <Text style={styles.name} numberOfLines={3}>{bill.name}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Amount:</Text>
              <Text style={styles.value}>
                {bill.amount ? `$${bill.amount.toFixed(2)}` : 'Not set'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{formatDate(bill.dueDate)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Frequency:</Text>
              <Text style={styles.value}>
                {bill.frequency === 'one-time' ? 'One-time' : 'Monthly'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Autopay:</Text>
              <Text style={styles.value}>{bill.autopay ? 'Yes' : 'No'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, styles.statusText]}>
                {bill.status === 'active' ? 'Active' : 'Completed'}
              </Text>
            </View>

            {bill.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.label}>Notes:</Text>
                <Text style={styles.notes}>{bill.notes}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <View key={payment.id} style={styles.paymentRow}>
                  <Text style={styles.label}>
                    {formatDate(payment.paidDate)}
                  </Text>
                  <Text style={styles.value}>
                    {payment.amountPaid ? `$${payment.amountPaid.toFixed(2)}` : 'N/A'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyHistoryText}>No payment history yet</Text>
            )}
          </View>

          {bill.status === 'active' && (
            <TouchableOpacity
              style={[styles.button, styles.markPaidButton]}
              onPress={handleMarkPaid}
            >
              <Text style={styles.buttonText}>✓ Mark as Paid</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: spacing.screenPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenPadding,
  },
  errorText: {
    ...typography.styles.h3,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  name: {
    ...typography.styles.h2,
    color: colors.text,
    textAlign: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: {
    ...typography.styles.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.styles.bodyBold,
    color: colors.text,
  },
  statusText: {
    color: colors.success,
  },
  notesSection: {
    paddingTop: spacing.md,
  },
  notes: {
    ...typography.styles.body,
    color: colors.text,
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.md,
  },
  button: {
    height: spacing.buttonHeight.base,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.borderRadius.base,
  },
  markPaidButton: {
    backgroundColor: colors.success,
    marginBottom: spacing.lg,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  emptyHistoryText: {
    ...typography.styles.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  deleteButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.error,
  },
  buttonText: {
    ...typography.styles.bodyBold,
    color: colors.white,
  },
  deleteButtonText: {
    ...typography.styles.bodyBold,
    color: colors.error,
  },
});
