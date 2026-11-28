import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform, Text } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import AuthForm, { authStyles } from "./AuthForm";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";

const Context = createContext(null);
export const useBiometrics = () => useContext(Context);

export function BiometricGate({ userId, children }) {
  const { signOut } = useAuth();
  const key = userId && Platform.OS !== "web" ? "biometric-" + userId : null;
  const [status, setStatus] = useState(key ? "loading" : "off");
  const [previousKey, setPreviousKey] = useState(key);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const action = useRef(false);
  const background = useRef(0);
  const identity = useRef(0);

  if (key !== previousKey) {
    setPreviousKey(key);
    setStatus(key ? "loading" : "off");
    setMessage("");
  }

  useEffect(() => {
    const revision = identity.current;
    let mounted = true;
    if (key)
      SecureStore.getItemAsync(key)
        .then((value) => {
          if (mounted) setStatus(value === "1" ? "locked" : "off");
        })
        .catch(() => {
          if (mounted) setStatus("storageError");
        });
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        background.current++;
        setStatus((s) => (s === "open" ? "locked" : s));
      }
    });
    return () => {
      mounted = false;
      identity.current = revision + 1;
      listener.remove();
    };
  }, [key]);

  async function authenticate() {
    if (!key || action.current) return;
    action.current = true;
    const generation = background.current;
    const owner = identity.current;
    setBusy(true);
    setMessage("");
    try {
      if (
        !(await LocalAuthentication.hasHardwareAsync()) ||
        !(await LocalAuthentication.isEnrolledAsync())
      ) {
        setMessage(
          "Skonfiguruj odcisk palca lub rozpoznawanie twarzy w ustawieniach telefonu.",
        );
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Potwierdź tożsamość w P2P Wallet",
        disableDeviceFallback: true,
        cancelLabel: "Anuluj",
      });
      if (owner !== identity.current) return;
      if (!result.success || generation !== background.current) {
        setMessage("Nie potwierdzono tożsamości. Możesz spróbować ponownie.");
        return;
      }
      if (status === "open") {
        await SecureStore.deleteItemAsync(key);
        if (owner === identity.current) setStatus("off");
      } else {
        if (status === "off") await SecureStore.setItemAsync(key, "1");
        if (owner === identity.current)
          setStatus(generation === background.current ? "open" : "locked");
      }
    } catch {
      setMessage("Operacja biometryczna nie powiodła się.");
    } finally {
      action.current = false;
      setBusy(false);
    }
  }

  const blocked = status !== "off" && status !== "open";
  const cover = blocked ? (
    <AuthForm
      title="Portfel zablokowany"
      description={
        status === "storageError"
          ? "Błąd odczytu zabezpieczeń urządzenia."
          : "Potwierdź tożsamość, aby otworzyć portfel."
      }
    >
      {status === "locked" && (
        <Button
          title="Odblokuj biometrią"
          onPress={authenticate}
          disabled={busy}
        />
      )}
      {message ? <Text style={authStyles.error}>{message}</Text> : null}
      {status !== "loading" && (
        <Button
          title="Wyloguj i wróć do logowania hasłem"
          secondary
          disabled={busy}
          onPress={() =>
            signOut()
              .then(() => SecureStore.deleteItemAsync(key))
              .catch(() => setMessage("Nie udało się zakończyć wylogowania."))
          }
        />
      )}
    </AuthForm>
  ) : null;
  return (
    <Context.Provider
      value={{
        blocked,
        cover,
        available: !!key,
        enabled: status === "open",
        authenticate,
        message,
        busy,
      }}
    >
      {children}
    </Context.Provider>
  );
}
