import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { getSupabase } from "./supabase";
import { paymentRpc } from "./payments";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const TOKEN_KEY = "p2p-push-token";

async function pushStep(step, action) {
  try {
    return await action();
  } catch (cause) {
    const error = new Error(step);
    error.cause = cause;
    throw error;
  }
}

async function requestPushPermission() {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("transfers", {
      name: "Przelewy",
      importance: 5,
    });
  const permission = await Notifications.getPermissionsAsync();
  return permission.granted
    ? permission
    : Notifications.requestPermissionsAsync();
}

export async function enablePush() {
  if (Platform.OS === "web" || isRunningInExpoGo())
    throw new Error("PUSH_BUILD_REQUIRED");
  const permission = await pushStep(
    "PUSH_SETTINGS_FAILED",
    requestPushPermission,
  );
  if (!permission.granted) throw new Error("PUSH_DENIED");
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) throw new Error("PUSH_PROJECT_REQUIRED");
  const devicePushToken = await pushStep(
    Platform.OS === "android" ? "PUSH_FCM_FAILED" : "PUSH_APNS_FAILED",
    () => Notifications.getDevicePushTokenAsync(),
  );
  const { data: token } = await pushStep("PUSH_EXPO_FAILED", () =>
    Notifications.getExpoPushTokenAsync({ projectId, devicePushToken }),
  );
  await pushStep("PUSH_STORAGE_FAILED", () =>
    SecureStore.setItemAsync(TOKEN_KEY, token),
  );
  await pushStep("PUSH_REGISTER_FAILED", () =>
    paymentRpc("stage3_register_push", { p_token: token }),
  );
}

export async function disablePush() {
  if (Platform.OS === "web") return;
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    await paymentRpc("stage3_unregister_push", { p_token: token });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  await Notifications.dismissAllNotificationsAsync();
}
export async function fetchNotifications() {
  const { data, error } = await getSupabase()
    .from("wallet_notifications")
    .select("id, transaction_id, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
