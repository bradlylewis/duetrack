import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Layout } from '../components/Layout';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const HistoryScreen: React.FC = () => {
  return (
    <Layout noPadding>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Payment History</Text>
          <Text style={styles.placeholder}>
            Your payment history will appear here once you mark bills as paid.
          </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  placeholder: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
