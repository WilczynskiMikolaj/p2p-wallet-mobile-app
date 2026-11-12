import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getSupabase } from "./supabase";
import { validatePending, UUID_PATTERN } from "../utils/payments";

export async function paymentRpc(name, args = {}) {
  const { data, error } = await getSupabase().rpc(name, args);
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
export const findRecipient = (email) =>
  paymentRpc("stage3_find_recipient", { p_email: email.trim() });
export function getRequest(id) {
  if (!UUID_PATTERN.test(id)) return Promise.reject(new Error("INVALID_QR"));
  return paymentRpc("stage3_get_request", { p_id: id });
}
export const createRequest = (amountMinor, title) =>
  paymentRpc("stage3_create_request", {
    p_amount_minor: amountMinor,
    p_title: title,
  });
export async function transfer(draft, accessToken) {
  if (!accessToken) throw new Error("AUTH_REQUIRED");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/rest/v1/rpc/stage3_transfer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          p_recipient_user_id: draft.userId,
          p_amount_minor: draft.amountMinor,
          p_title: draft.title,
          p_idempotency_key: draft.key,
          p_request_id: draft.requestId ?? null,
        }),
      },
    );
    const result = await response.json();
    if (!response.ok) throw result;
    if (result?.error) throw new Error(result.error);
    if (!UUID_PATTERN.test(result?.transactionId))
      throw new Error("network response invalid");
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

const memory = new Map();
const pendingKey = (userId) => `pending-payment-${userId}`;
export async function readPending(userId) {
  const value =
    Platform.OS === "web"
      ? memory.get(userId)
      : await SecureStore.getItemAsync(pendingKey(userId));
  return value ? validatePending(JSON.parse(value)) : null;
}
export async function savePending(userId, value) {
  const text = JSON.stringify(validatePending(value));
  if (Platform.OS === "web") memory.set(userId, text);
  else
    await SecureStore.setItemAsync(pendingKey(userId), text, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
}
export async function clearPending(userId) {
  if (Platform.OS === "web") memory.delete(userId);
  else await SecureStore.deleteItemAsync(pendingKey(userId));
}
