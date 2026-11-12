import { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AuthForm, { authStyles } from "../components/AuthForm";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { signUp, confirmEmail, resendConfirmation } from "../services/auth";
import { configurationError } from "../services/supabase";
import { userError } from "../utils/errors";
import { registrationError } from "../utils/validation";

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const [confirming, setConfirming] = useState(params.confirm === "1");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeated, setRepeated] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit() {
    if (busy || configurationError) return;
    const validation = confirming
      ? !email.trim() || !/^\d{6}$/.test(token.trim())
        ? "Podaj e-mail i 6-cyfrowy kod z wiadomości."
        : ""
      : registrationError(email, password, name, repeated);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (confirming) {
        await confirmEmail(email, token);
        setToken("");
      } else {
        const session = await signUp(email, password, name);
        setPassword("");
        setRepeated("");
        if (!session) {
          setConfirming(true);
          setInfo(
            "Sprawdź skrzynkę e-mail. Jeśli rejestracja wymaga potwierdzenia, wpisz kod z wiadomości.",
          );
        }
      }
    } catch (cause) {
      setError(userError(cause));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (busy || !email.trim()) return;
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await resendConfirmation(email);
      setInfo(
        "Jeśli konto oczekuje potwierdzenia, otrzymasz nową wiadomość. Przed kolejną próbą odczekaj minutę.",
      );
    } catch (cause) {
      setError(userError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthForm
      title={confirming ? "Potwierdź e-mail" : "Utwórz konto"}
      description={
        confirming
          ? "Wpisz kod z wiadomości wysłanej przez P2P Wallet."
          : "Po rejestracji otrzymasz 1000 zł."
      }
    >
      <View style={authStyles.form}>
        {configurationError ? (
          <Text style={authStyles.error}>{configurationError}</Text>
        ) : null}
        <FormField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          editable={!busy}
        />
        {confirming ? (
          <FormField
            label="Kod z e-maila"
            value={token}
            onChangeText={setToken}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            editable={!busy}
            onSubmitEditing={submit}
          />
        ) : (
          <>
            <FormField
              label="Nazwa wyświetlana"
              value={name}
              onChangeText={setName}
              maxLength={60}
              editable={!busy}
            />
            <FormField
              label="Hasło"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!busy}
            />
            <FormField
              label="Powtórz hasło"
              value={repeated}
              onChangeText={setRepeated}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!busy}
              onSubmitEditing={submit}
            />
            <Text style={authStyles.note}>
              Minimum 12 znaków, mała i wielka litera oraz cyfra.
            </Text>
          </>
        )}
        {error ? (
          <Text accessibilityRole="alert" style={authStyles.error}>
            {error}
          </Text>
        ) : null}
        {info ? <Text style={authStyles.info}>{info}</Text> : null}
        <Button
          title={
            busy
              ? "Proszę czekać…"
              : confirming
                ? "Potwierdź kod"
                : "Zarejestruj"
          }
          onPress={submit}
          disabled={busy || !!configurationError}
        />
        {confirming ? (
          <Button
            title="Wyślij nowy kod"
            secondary
            onPress={resend}
            disabled={busy || !email.trim() || !!configurationError}
          />
        ) : null}
        <Button
          title="Wróć do logowania"
          secondary
          onPress={() => router.replace("/login")}
          disabled={busy}
        />
      </View>
    </AuthForm>
  );
}
