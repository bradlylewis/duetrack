import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Layout } from '../components/Layout';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootTabParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootTabParamList, 'AddBill'>;

export const AddBillScreen: React.FC<Props> = () => {
  return (
    <Layout noPadding>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Add New Bill</Text>
          <Text style={styles.placeholder}>
            Form to add a new bill will be implemented here.
          </Text>
          <Text style={styles.info}>
            Fields: name, amount, due date, recurrence, icon, notes.
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
  },
  title: {
    ...typography.styles.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  placeholder: {
    ...typography.styles.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  info: {
    ...typography.styles.body,
    color: colors.textSecondary,
  },
});
