import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import { ToastProvider } from '@/contexts/ToastContext';
import { DataProvider } from '@/contexts/DataContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DataProvider>
        <ToastProvider>
          <View style={{ flex: 1, backgroundColor: '#1e3a2e' }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" backgroundColor="#1e3a2e" />
            <KeyboardDismissButton />
          </View>
        </ToastProvider>
      </DataProvider>
    </GestureHandlerRootView>
  );
}