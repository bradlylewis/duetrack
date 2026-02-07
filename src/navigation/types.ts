import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack params
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Root Tab Navigator params
export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  AddBill: undefined;
  History: NavigatorScreenParams<HistoryStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Home Stack params (nested in Home tab)
export type HomeStackParamList = {
  HomeMain: undefined;
  BillDetails: { billId: string };
};

// History Stack params (nested in History tab)
export type HistoryStackParamList = {
  HistoryMain: undefined;
};

// Settings Stack params (nested in Settings tab)
export type SettingsStackParamList = {
  SettingsMain: undefined;
};

// Combined navigation prop types
export type HomeTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, T>;

export type HistoryStackScreenProps<T extends keyof HistoryStackParamList> =
  NativeStackScreenProps<HistoryStackParamList, T>;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  NativeStackScreenProps<SettingsStackParamList, T>;

// Declare global types for navigation (for useNavigation hook)
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
