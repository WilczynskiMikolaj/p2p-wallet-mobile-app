import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import AuthForm, { authStyles } from "../components/AuthForm";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { signIn } from "../services/auth";
import { userError } from "../utils/errors";

export default function LoginScreen() {
  const { configurationError, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (busy || configurationError) return;
    if (!email.trim() || !password) {
      setError("Uzupełnij e-mail i hasło.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      setPassword("");
    } catch (cause) {
      setError(userError(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthForm
      title="Witaj ponownie"
      description="Zaloguj się, aby zobaczyć swój profil i wirtualny portfel."
    >
      <View style={authStyles.form}>
        {configurationError ? (
          <Text selectable style={authStyles.error}>
            {configurationError}
          </Text>
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
        <FormField
          label="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          editable={!busy}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {error || authError ? (
          <Text accessibilityRole="alert" style={authStyles.error}>
            {error || authError}
          </Text>
        ) : null}
        <Button
          title={busy ? "Logowanie…" : "Zaloguj"}
          onPress={submit}
          disabled={busy || !!configurationError}
        />
        <Button
          title="Regulamin"
          secondary
          onPress={() => router.push("/terms")}
        />
        <Button
          title="Utwórz konto"
          secondary
          onPress={() => router.push("/register")}
          disabled={busy || !!configurationError}
        />
        <Button
          title="Mam kod potwierdzenia e-maila"
          secondary
          onPress={() => router.push("/register?confirm=1")}
          disabled={busy || !!configurationError}
        />
      </View>
    </AuthForm>
  );
}
