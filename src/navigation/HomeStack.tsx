import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { BillDetailsScreen } from '../screens/BillDetailsScreen';
import { colors } from '../styles/colors';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="BillDetails"
        component={BillDetailsScreen}
        options={{ title: 'Bill Details' }}
      />
    </Stack.Navigator>
  );
};
