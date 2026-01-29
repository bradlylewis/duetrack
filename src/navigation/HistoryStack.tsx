import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HistoryScreen } from '../screens/HistoryScreen';
import { colors } from '../styles/colors';
import type { HistoryStackParamList } from './types';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export const HistoryStack: React.FC = () => {
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
        name="HistoryMain"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
    </Stack.Navigator>
  );
};
