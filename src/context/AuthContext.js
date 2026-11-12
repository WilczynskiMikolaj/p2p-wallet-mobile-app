import { createContext, useContext, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { configurationError, supabase } from "../services/supabase";
import { fetchAccount } from "../services/account";
import { userError } from "../utils/errors";
import { disablePush } from "../services/notifications";
import { useAsyncResource } from "../hooks/useAsyncResource";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(!!supabase);
  const [authError, setAuthError] = useState("");
  const userId = session?.user.id ?? null;
  const {
    data: account,
    loading: accountLoading,
    error: accountError,
    reload: reloadAccount,
  } = useAsyncResource(userId, fetchAccount, true);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    let authEventReceived = false;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      authEventReceived = true;
      setSession(nextSession);
      setAuthError("");
      setInitializing(false);
    });
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) throw error;
        if (!authEventReceived) setSession(data.session);
      })
      .catch((error) => {
        if (active) setAuthError(userError(error));
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    function refreshForState(state) {
      if (state === "active") client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    }
    const appListener =
      Platform.OS !== "web"
        ? AppState.addEventListener("change", refreshForState)
        : null;
    if (Platform.OS !== "web") refreshForState(AppState.currentState);
    return () => {
      active = false;
      subscription.unsubscribe();
      appListener?.remove();
      if (Platform.OS !== "web") client.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active" && userId) void reloadAccount();
    });
    return () => {
      listener.remove();
    };
  }, [userId, reloadAccount]);

  async function signOut() {
    if (!supabase) return;
    await disablePush();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        initializing,
        authError,
        account,
        accountLoading,
        accountError,
        reloadAccount,
        signOut,
        configurationError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Brak AuthProvider.");
  return value;
}
