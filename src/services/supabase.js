import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { createClient, processLock } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { createChunkedStorage } from "./chunkedStorage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url);
export const configurationError =
  !validUrl || !key.startsWith("sb_publishable_") || key.includes("TWOJ_")
    ? "Uzupełnij .env: URL projektu Supabase i klucz sb_publishable_. Następnie uruchom Expo ponownie z --clear. Instrukcja: docs/supabase-setup.md."
    : null;

const nativeStorage = createChunkedStorage(
  {
    getItem: (name) => SecureStore.getItemAsync(name),
    setItem: (name, value) =>
      SecureStore.setItemAsync(name, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    removeItem: (name) => SecureStore.deleteItemAsync(name),
  },
  () => Crypto.randomUUID(),
);

const memory = new Map();
const memoryStorage = {
  getItem: async (name) => memory.get(name) ?? null,
  setItem: async (name, value) => {
    memory.set(name, value);
  },
  removeItem: async (name) => {
    memory.delete(name);
  },
};

export const supabase = configurationError
  ? null
  : createClient(url, key, {
      auth: {
        storage: Platform.OS === "web" ? memoryStorage : nativeStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    });

export function getSupabase() {
  if (!supabase)
    throw new Error(configurationError || "Brak konfiguracji Supabase.");
  return supabase;
}
