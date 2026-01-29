import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Layout } from '../components/Layout';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing } from '../styles/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BillDetails'>;

export const BillDetailsScreen: React.FC<Props> = ({ route }) => {
  const { billId } = route.params;

  return (
    <Layout noPadding>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Bill Details</Text>
          <Text style={styles.placeholder}>
            Details for bill ID: {billId}
          </Text>
          <Text style={styles.info}>
            This screen will show full bill details, edit options, and payment history.
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
