import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { NavigationParamList } from '@/src/types';

// Placeholder screens
const HomeScreen = () => <Text>Home / Dashboard</Text>;
const AddBillScreen = () => <Text>Add Bill</Text>;
const EditBillScreen = () => <Text>Edit Bill</Text>;
const BillDetailsScreen = () => <Text>Bill Details</Text>;
const HistoryScreen = () => <Text>History</Text>;
const SettingsScreen = () => <Text>Settings</Text>;

const Stack = createNativeStackNavigator<NavigationParamList>();
const Tab = createBottomTabNavigator();
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Bill Tracker', headerShown: false }}
      />
      <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
      <Stack.Screen name="EditBill" component={EditBillScreen} />
    </Stack.Navigator>
  );
}

function AddBillStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AddBill" component={AddBillScreen} options={{ title: 'Add Bill' }} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export const RootNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: { marginBottom: 6 },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: () => <Text>📊</Text>,
          }}
        />
        <Tab.Screen
          name="AddBillTab"
          component={AddBillStack}
          options={{
            tabBarLabel: 'Add Bill',
            tabBarIcon: () => <Text>➕</Text>,
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStack}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: () => <Text>📜</Text>,
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStack}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: () => <Text>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
