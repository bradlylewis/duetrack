import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@react-native-firebase/app';
import { AuthProvider } from './src/contexts/AuthContext';
import { SyncProvider } from './src/contexts/SyncContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initializeNotifications } from './src/services/notifications';
import { initDatabase } from './src/db/database';

export default function App() {
  React.useEffect(() => {
    const setup = async () => {
      // Initialize Firebase
      // Firebase is automatically initialized when @react-native-firebase/app is imported
      console.log('Firebase initialized');

      // Initialize database
      try {
        await initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
      }

      // Initialize notifications
      try {
        await initializeNotifications();
        console.log('Notifications initialized successfully');
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SyncProvider>
          <View style={styles.container}>
            <RootNavigator />
            <StatusBar style="dark" />
          </View>
        </SyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
