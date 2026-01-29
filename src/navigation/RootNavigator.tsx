import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeStack } from './HomeStack';
import { HistoryStack } from './HistoryStack';
import { SettingsStack } from './SettingsStack';
import { AddBillScreen } from '../screens/AddBillScreen';
import { linkingConfiguration } from './LinkingConfiguration';
import { colors } from '../styles/colors';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const navigationRef = React.createRef<NavigationContainerRef<RootTabParamList>>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer ref={navigationRef} linking={linkingConfiguration}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            title: 'Dashboard',
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: () => <Text>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="AddBill"
          component={AddBillScreen}
          options={{
            title: 'Add Bill',
            tabBarLabel: 'Add',
            tabBarIcon: () => <Text>➕</Text>,
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryStack}
          options={{
            title: 'History',
            headerShown: false,
            tabBarLabel: 'History',
            tabBarIcon: () => <Text>📜</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarLabel: 'Settings',
            tabBarIcon: () => <Text>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
