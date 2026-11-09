import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { userError } from '../utils/errors';
import Button from './Button';


export default function AccountGate({ children }) {
  const { account, accountLoading, accountError, reloadAccount, signOut } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (account) return children;
  return (
    <View style={styles.container}>
      {accountLoading || !accountError ? <ActivityIndicator color={colors.accent} /> : null}
      <Text style={styles.text}>{accountError || 'Pobieranie profilu i portfela…'}</Text>
      {accountError ? <Button title="Spróbuj ponownie" onPress={() => { void reloadAccount(); }} disabled={busy} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Wyloguj" secondary disabled={busy} onPress={async () => {
        setBusy(true); setError('');
        try { await signOut(); } catch (cause) { setError(userError(cause)); } finally { setBusy(false); }
      }} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 24, gap: 16, flex: 1, justifyContent: 'center' },
  text: { color: colors.text, lineHeight: 22 },
  error: { color: colors.negative },
});
