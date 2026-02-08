import React from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors } from '@/src/styles/colors';
import { typography } from '@/src/styles/typography';
import { spacing } from '@/src/styles/spacing';
import { MigrationProgress } from '@/src/services/sync';

interface MigrationModalProps {
  visible: boolean;
  progress: MigrationProgress | null;
  error: string | null;
  onRetry?: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({ 
  visible, 
  progress, 
  error, 
  onRetry 
}) => {
  if (!progress && !error) return null;

  const isComplete = progress?.phase === 'complete';
  const hasError = error !== null;
  const progressPercent = progress && progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            {!isComplete && !hasError && (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
            {isComplete && !hasError && (
              <Text style={styles.successIcon}>✓</Text>
            )}
            {hasError && (
              <Text style={styles.errorIcon}>⚠</Text>
            )}
          </View>
          
          <Text style={styles.title}>
            {hasError ? 'Sync Failed' : isComplete ? 'Sync Complete' : 'Syncing Your Bills'}
          </Text>
          
          {!hasError && progress && (
            <Text style={styles.message}>
              {progress.message}
            </Text>
          )}
          
          {hasError && (
            <Text style={styles.errorMessage}>
              {error}
            </Text>
          )}
          
          {!isComplete && !hasError && progress && progress.total > 0 && (
            <>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${progressPercent}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.progressText}>
                {progress.current} of {progress.total}
              </Text>
            </>
          )}
          
          {isComplete && !hasError && (
            <Text style={styles.completeMessage}>
              Your bills have been synced to the cloud
            </Text>
          )}
          
          {hasError && onRetry && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    color: colors.success,
    fontWeight: 'bold',
  },
  errorIcon: {
    fontSize: 48,
    color: colors.error,
    fontWeight: 'bold',
  },
  title: {
    ...typography.styles.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  completeMessage: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    marginTop: spacing.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
    textAlign: 'center',
  },
});
