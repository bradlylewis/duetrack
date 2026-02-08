import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSync } from '@/src/contexts/SyncContext';
import { colors } from '@/src/styles/colors';
import { typography } from '@/src/styles/typography';
import { spacing } from '@/src/styles/spacing';

export const SyncStatusIndicator: React.FC = () => {
  const { syncState, isSyncing, isOffline, hasError } = useSync();

  // Don't show anything if synced and no errors
  if (syncState.status === 'synced' && !hasError) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isSyncing && (
        <View style={styles.statusRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusText}>Syncing...</Text>
        </View>
      )}
      
      {isOffline && (
        <View style={[styles.statusRow, styles.offlineContainer]}>
          <Text style={styles.dot}>●</Text>
          <Text style={[styles.statusText, styles.offlineText]}>
            Offline - Changes will sync when reconnected
          </Text>
        </View>
      )}
      
      {hasError && (
        <View style={[styles.statusRow, styles.errorContainer]}>
          <Text style={styles.dot}>●</Text>
          <Text style={[styles.statusText, styles.errorText]}>
            {syncState.error || 'Sync error'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  offlineContainer: {
    backgroundColor: '#FFF3CD',
  },
  errorContainer: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    ...typography.styles.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  offlineText: {
    color: '#856404',
  },
  errorText: {
    color: '#721C24',
  },
  dot: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
