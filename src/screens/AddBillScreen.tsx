import React from 'react';
import { Alert } from 'react-native';
import { Layout } from '../components/Layout';
import { BillForm, BillFormValues } from '../components/BillForm';
import { insertBill } from '../db/queries';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootTabParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootTabParamList, 'AddBill'>;

export const AddBillScreen: React.FC<Props> = ({ navigation }) => {
  const handleSubmit = async (values: BillFormValues) => {
    try {
      await insertBill({
        name: values.name,
        dueDate: values.dueDate,
        amount: values.amount,
        frequency: values.frequency,
        autopay: values.autopay,
        notes: values.notes,
        iconKey: values.iconKey,
        status: 'active',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      Alert.alert('Success', 'Bill added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home', { screen: 'HomeMain' }),
        },
      ]);
    } catch (error) {
      console.error('Error adding bill:', error);
      Alert.alert('Error', 'Failed to add bill. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <Layout noPadding useSafeArea={false}>
      <BillForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Add Bill"
      />
    </Layout>
  );
};
