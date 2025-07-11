import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import { ToastProvider } from '@/contexts/ToastContext';
import { DataProvider } from '@/contexts/DataContext';
import { FilterModalProvider } from '@/contexts/FilterModalContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <DataProvider>
          <ToastProvider>
            <FilterModalProvider>
              <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <StatusBar style="dark" backgroundColor="#ffffff"  translucent={true} />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <KeyboardDismissButton />
              </View>
            </FilterModalProvider>
          </ToastProvider>
        </DataProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}