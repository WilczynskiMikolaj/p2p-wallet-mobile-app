import { Platform } from "react-native";
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
export async function enablePush() {
  if (Platform.OS === "web" || Constants.appOwnership === "expo")
    throw new Error("PUSH_BUILD_REQUIRED");
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("transfers", {
      name: "Przelewy",
      importance: 5,
    });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted)
    permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error("PUSH_DENIED");
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) throw new Error("PUSH_PROJECT_REQUIRED");
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await paymentRpc("stage3_register_push", { p_token: token });
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
