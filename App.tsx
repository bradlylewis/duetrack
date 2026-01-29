import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/src/navigation/RootNavigator';
import { initializeNotifications } from '@/src/services/notifications';
import { initDatabase } from '@/src/db/database';

export default function App() {
  React.useEffect(() => {
    const setup = async () => {
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
      <View style={styles.container}>
        <RootNavigator />
        <StatusBar barStyle="dark-content" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
