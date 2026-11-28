import { BiometricGate, useBiometrics } from "../components/BiometricGate";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import NotificationEvents from "../components/NotificationEvents";
import { colors } from "../theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function Navigation() {
  const { session, initializing } = useAuth();
  if (initializing)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          color={colors.accent}
          accessibilityLabel="Odczytywanie sesji"
        />
      </View>
    );
  return (
    <BiometricGate userId={session?.user.id}>
      <Routes />
    </BiometricGate>
  );
}

function Routes() {
  const { session, account } = useAuth();
  const { blocked, cover } = useBiometrics();
  return (
    <>
      {!blocked && <NotificationEvents />}
      <Stack
        screenLayout={({ children }) => (blocked ? cover : children)}
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      >
        <Stack.Protected guard={!session}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="transfer" options={{ title: "Przelew" }} />
          <Stack.Screen
            name="request-qr"
            options={{ title: "Prośba o płatność" }}
          />
          <Stack.Screen name="scan" options={{ title: "Skanuj QR" }} />
          <Stack.Screen
            name="notifications"
            options={{ title: "Powiadomienia" }}
          />
          <Stack.Screen
            name="history"
            options={{ title: "Historia transakcji" }}
          />
          <Stack.Screen name="profile" options={{ title: "Mój profil" }} />
          <Stack.Protected guard={account?.role === "admin"}>
            <Stack.Screen name="admin" options={{ title: "Administrator" }} />
          </Stack.Protected>
        </Stack.Protected>
        <Stack.Screen name="terms" options={{ title: "Regulamin" }} />
        <Stack.Screen
          name="request/[id]"
          options={{ title: "Prośba o płatność" }}
        />
      </Stack>
    </>
  );
}
