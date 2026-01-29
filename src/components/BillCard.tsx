import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import type { Bill } from '../types';

interface BillCardProps {
  bill: Bill;
  onPress: () => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onPress }) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getDaysUntilDue = (): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (): string => {
    const daysUntil = getDaysUntilDue();
    if (daysUntil < 0) return colors.error;
    if (daysUntil <= 3) return colors.warning;
    return colors.textSecondary;
  };

  const getUrgencyLabel = (): string | null => {
    const daysUntil = getDaysUntilDue();
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Due Today';
    if (daysUntil <= 7) return `${daysUntil} days`;
    return null;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{bill.iconKey}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {bill.name}
          </Text>
          {bill.autopay && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Auto</Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <Text style={[styles.date, { color: getUrgencyColor() }]}>
            {formatDate(bill.dueDate)}
          </Text>
          {getUrgencyLabel() && (
            <Text style={[styles.urgency, { color: getUrgencyColor() }]}>
              • {getUrgencyLabel()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.amountContainer}>
        {bill.amount ? (
          <Text style={styles.amount}>${bill.amount.toFixed(2)}</Text>
        ) : (
          <Text style={styles.noAmount}>—</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius.base,
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.styles.bodyBold,
    color: colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
    marginLeft: spacing.xs,
  },
  badgeText: {
    ...typography.styles.small,
    color: colors.success,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    ...typography.styles.caption,
  },
  urgency: {
    ...typography.styles.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.styles.h4,
    color: colors.text,
  },
  noAmount: {
    ...typography.styles.h4,
    color: colors.gray400,
  },
});
