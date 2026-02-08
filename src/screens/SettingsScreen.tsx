import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const SettingsScreen: React.FC = () => {
  const { user, signOut, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your bills, payment history, and account data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccount();
              Alert.alert('Success', 'Account successfully deleted');
            } catch (error: any) {
              setIsDeleting(false);
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Layout noPadding>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Settings</Text>
          
          {user && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>1.0.0</Text>
            </View>
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
  title: {
    ...typography.styles.h2,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.styles.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    fontSize: typography.fontSize.sm,
  },
  card: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.borderRadius.base,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.styles.body,
    color: colors.text,
  },
  signOutButton: {
    height: spacing.buttonHeight.base,
    backgroundColor: colors.error,
    borderRadius: spacing.borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.base,
  },
  signOutButtonText: {
    ...typography.styles.bodyBold,
    color: colors.white,
  },
  deleteButton: {
    height: spacing.buttonHeight.base,
    backgroundColor: colors.error,
    borderRadius: spacing.borderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.base,
    borderWidth: 2,
    borderColor: colors.error,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    ...typography.styles.bodyBold,
    color: colors.white,
  },
});
