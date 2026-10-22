import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoSessionProvider, useDemoSession } from '../context/DemoSessionContext';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DemoSessionProvider>
        <StatusBar style="light" />
        <Navigation />
      </DemoSessionProvider>
    </SafeAreaProvider>
  );
}

function Navigation() {
  const { isSignedIn } = useDemoSession();

  return (
    <Stack screenOptions={{
      contentStyle: { backgroundColor: colors.background },
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerShadowVisible: false,
    }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ title: 'Historia transakcji' }} />
      </Stack.Protected>
    </Stack>
  );
}
