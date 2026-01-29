import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Layout } from '../components/Layout';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';

export const SettingsScreen: React.FC = () => {
  return (
    <Layout noPadding>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.placeholder}>
            App settings and preferences will be available here.
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
