import { useEffect } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAuth } from "../context/AuthContext";
import { getSupabase } from "../services/supabase";

export default function NotificationEvents() {
  const { session, reloadAccount } = useAuth();
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const client = getSupabase();
    const channel = client
      .channel(`wallet-events-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wallet_notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void reloadAccount();
        },
      )
      .subscribe();
    function open(response) {
      if (
        !active ||
        response?.notification.request.content.data?.kind !== "wallet"
      )
        return;
      router.push("/history");
      void Notifications.clearLastNotificationResponseAsync();
    }
    const listener =
      Notifications.addNotificationResponseReceivedListener(open);
    Notifications.getLastNotificationResponseAsync()
      .then(open)
      .catch(() => {});
    return () => {
      active = false;
      listener.remove();
      void client.removeChannel(channel);
    };
  }, [userId, reloadAccount]);
  return null;
}
