import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import type { Bill } from '../types';

interface BillFormProps {
  initialValues?: Partial<Bill>;
  onSubmit: (values: BillFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export interface BillFormValues {
  name: string;
  dueDate: number;
  amount?: number;
  frequency: 'one-time' | 'monthly';
  autopay: boolean;
  notes?: string;
  iconKey: string;
}

export const BillForm: React.FC<BillFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [amount, setAmount] = useState(
    initialValues?.amount?.toString() || ''
  );
  const [dueDate, setDueDate] = useState(
    initialValues?.dueDate ? new Date(initialValues.dueDate) : new Date()
  );
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>(
    initialValues?.frequency || 'monthly'
  );
  const [autopay, setAutopay] = useState(initialValues?.autopay || false);
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [iconKey, setIconKey] = useState(initialValues?.iconKey || '💵');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!iconKey) {
      newErrors.iconKey = 'Please select an icon';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const values: BillFormValues = {
      name: name.trim(),
      dueDate: dueDate.getTime(),
      amount: amount ? parseFloat(amount) : undefined,
      frequency,
      autopay,
      notes: notes.trim() || undefined,
      iconKey,
    };

    onSubmit(values);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(dueDate);
    newDate.setDate(newDate.getDate() + days);
    setDueDate(newDate);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Name Field */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Electricity Bill"
            placeholderTextColor={colors.textPlaceholder}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Amount Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Amount (optional)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Due Date Field */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Due Date <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => handleDateChange(-1)}
            >
              <Text style={styles.dateButtonText}>◀</Text>
            </TouchableOpacity>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            </View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => handleDateChange(1)}
            >
              <Text style={styles.dateButtonText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Frequency Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyContainer}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'one-time' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('one-time')}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === 'one-time' &&
                    styles.frequencyButtonTextActive,
                ]}
              >
                One-time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'monthly' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('monthly')}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === 'monthly' && styles.frequencyButtonTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Autopay Toggle */}
        <View style={styles.field}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Autopay</Text>
            <Switch
              value={autopay}
              onValueChange={setAutopay}
              trackColor={{
                false: colors.gray300,
                true: colors.primaryLight,
              }}
              thumbColor={autopay ? colors.primary : colors.gray50}
            />
          </View>
        </View>

        {/* Icon Picker */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Icon <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.iconGrid}>
            {['💵', '💡', '📱', '🏠', '🚗', '🍔', '💳', '📺'].map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconButton,
                  iconKey === icon && styles.iconButtonActive,
                ]}
                onPress={() => setIconKey(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.iconKey && (
            <Text style={styles.errorText}>{errors.iconKey}</Text>
          )}
        </View>

        {/* Notes Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.textPlaceholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onCancel}
          >
            <Text style={styles.buttonTextSecondary}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonTextPrimary}>{submitLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: spacing.screenPadding,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.styles.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...typography.styles.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.base,
    padding: spacing.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    ...typography.styles.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: spacing.borderRadius.base,
  },
  dateButtonText: {
    ...typography.styles.h4,
    color: colors.primary,
  },
  dateDisplay: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius.base,
    alignItems: 'center',
  },
  dateText: {
    ...typography.styles.bodyBold,
    color: colors.text,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.base,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyButtonText: {
    ...typography.styles.body,
    color: colors.text,
  },
  frequencyButtonTextActive: {
    color: colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius.base,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  iconText: {
    fontSize: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    height: spacing.buttonHeight.base,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.borderRadius.base,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.gray200,
  },
  buttonTextPrimary: {
    ...typography.styles.bodyBold,
    color: colors.white,
  },
  buttonTextSecondary: {
    ...typography.styles.bodyBold,
    color: colors.text,
  },
});
