import { useCallback, useEffect, useState } from "react";
import { AppState, FlatList, Linking, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Screen from "../components/Screen";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useAsyncResource } from "../hooks/useAsyncResource";
import {
  enablePush,
  disablePush,
  fetchNotifications,
} from "../services/notifications";
import { getSupabase } from "../services/supabase";
import { paymentRpc } from "../services/payments";
import { userError } from "../utils/errors";
import { formatDate } from "../utils/format";
import { paymentStyles as styles } from "../theme";

export default function NotificationsScreen() {
  const { session, reloadAccount } = useAuth();
  const { data, loading, error, reload } = useAsyncResource(
    session?.user.id ?? null,
    fetchNotifications,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  useEffect(() => {
    if (!session) return;
    const client = getSupabase();
    const channel = client
      .channel(`inbox-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wallet_notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          void reload();
          void reloadAccount();
        },
      )
      .subscribe();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void reload();
    });
    return () => {
      listener.remove();
      void client.removeChannel(channel);
    };
  }, [session, reload, reloadAccount]);
  async function action(callback, text) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await callback();
      setMessage(text);
    } catch (cause) {
      setMessage(userError(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen withHeader>
      <FlatList
        contentContainerStyle={styles.body}
        data={data ?? []}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={reload}
        ListHeaderComponent={
          <View style={styles.gap}>
            <Text style={styles.title}>Powiadomienia</Text>
            <Text style={styles.hint}>
              Skrzynka zapisuje otrzymane przelewy również bez zgody na push.
              Powiadomienia systemowe nie pokazują kwoty ani danych nadawcy.
            </Text>
            <Button
              title="Włącz powiadomienia push"
              disabled={busy}
              onPress={() =>
                action(
                  enablePush,
                  "Powiadomienia włączone dla tego konta i urządzenia.",
                )
              }
            />
            <Button
              title="Wyłącz push na tym urządzeniu"
              secondary
              disabled={busy}
              onPress={() =>
                action(disablePush, "Powiadomienia push wyłączone.")
              }
            />
            <Button
              title="Ustawienia systemowe"
              secondary
              onPress={() => Linking.openSettings()}
            />
            <Button
              title="Oznacz jako przeczytane"
              secondary
              disabled={busy}
              onPress={() =>
                action(async () => {
                  await paymentRpc("stage3_mark_notifications_read");
                  await reload();
                }, "Oznaczono jako przeczytane.")
              }
            />
            {message || error ? (
              <Text style={styles.text}>{message || error}</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.gap}>
            <Text style={styles.text}>
              {item.read_at ? "" : "● "}Otrzymano przelew ·{" "}
              {formatDate(item.created_at)}
            </Text>
            <Button
              title="Otwórz historię"
              secondary
              onPress={() => router.push("/history")}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.hint}>Brak powiadomień.</Text> : null
        }
      />
    </Screen>
  );
}
