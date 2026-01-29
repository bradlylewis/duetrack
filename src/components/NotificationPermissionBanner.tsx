import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import { openNotificationSettings } from '../services/notifications';

interface Props {
  onDismiss?: () => void;
}

export const NotificationPermissionBanner: React.FC<Props> = ({ onDismiss }) => {
  const handleOpenSettings = () => {
    openNotificationSettings();
  };

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔔</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Reminders Disabled</Text>
          <Text style={styles.message}>
            Enable notifications to receive bill reminders
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleOpenSettings}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning + '15', // 15 is for 8% opacity
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderRadius: spacing.borderRadius.base,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.styles.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: spacing.borderRadius.sm,
  },
  buttonText: {
    ...typography.styles.caption,
    color: colors.white,
    fontWeight: '600',
  },
  dismissButton: {
    padding: spacing.sm,
  },
  dismissText: {
    ...typography.styles.body,
    color: colors.textSecondary,
  },
});
