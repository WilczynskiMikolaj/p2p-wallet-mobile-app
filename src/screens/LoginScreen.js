import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import { demoCredentials } from '../data/demo';
import { useDemoSession } from '../context/DemoSessionContext';
import { colors } from '../theme';

export default function LoginScreen() {
  const { signIn } = useDemoSession();
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);
  const [error, setError] = useState('');

  function handleLogin() {
    if (!email.trim() || !password) {
      setError('Uzupełnij e-mail i hasło.');
      return;
    }
    if (!signIn(email, password)) {
      setError('Użyj danych konta demonstracyjnego podanych poniżej.');
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>P2P WALLET</Text>
          <Text style={styles.title}>Twój portfel,{'\n'}proste rozliczenia.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              accessibilityLabel="E-mail"
              style={styles.input}
              value={email}
              onChangeText={(value) => { setEmail(value); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="alex@example.com"
              placeholderTextColor={colors.muted}
            />
            <Text style={styles.label}>Hasło</Text>
            <TextInput
              accessibilityLabel="Hasło"
              style={styles.input}
              value={password}
              onChangeText={(value) => { setPassword(value); setError(''); }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Button title="Zaloguj" onPress={handleLogin} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 32, fontWeight: '700', marginTop: 16 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
  form: { marginVertical: 28 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20 },
  error: { color: colors.negative, marginBottom: 16, lineHeight: 20 },
});
