import { LinkingOptions } from '@react-navigation/native';
import type { RootTabParamList } from './types';

export const linkingConfiguration: LinkingOptions<RootTabParamList> = {
  prefixes: ['billtracker://', 'https://billtracker.app'],
  config: {
    screens: {
      Home: {
        screens: {
          HomeMain: 'dashboard',
          BillDetails: 'bill/:billId',
        },
      },
      AddBill: 'add',
      History: {
        screens: {
          HistoryMain: 'history',
        },
      },
      Settings: {
        screens: {
          SettingsMain: 'settings',
        },
      },
    },
  },
};
