import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AccountGate from '../components/AccountGate';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { authStyles } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { updateDisplayName } from '../services/account';
import { userError } from '../utils/errors';

export default function ProfileScreen() {
  const { session, account, reloadAccount, signOut } = useAuth();
  const [draftName, setName] = useState( (null));
  const name = draftName ?? account?.profile.display_name ?? '';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function save() {
    if (busy || !session) return;
    if (!name.trim() || name.trim().length > 60) { setError('Nazwa musi mieć od 1 do 60 znaków.'); return; }
    setBusy(true); setError(''); setInfo('');
    try { await updateDisplayName(session.user.id, name); await reloadAccount(); setName(null); setInfo('Nazwa została zapisana.'); }
    catch (cause) { setError(userError(cause)); }
    finally { setBusy(false); }
  }
  async function logout() {
    if (busy) return;
    setBusy(true); setError(''); setInfo('');
    try { await signOut(); }
    catch (cause) { setError(userError(cause)); }
    finally { setBusy(false); }
  }
  return (
    <Screen withHeader>
      <AccountGate>
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <View style={authStyles.form}>
            <Text selectable style={authStyles.note}>E-mail: {session?.user.email}</Text>
            <Text style={authStyles.note}>Rola: {account?.role === 'admin' ? 'Administrator' : 'Użytkownik'}</Text>
            <FormField label="Nazwa wyświetlana" value={name} onChangeText={setName} maxLength={60} editable={!busy} />
            {error ? <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text> : null}
            {info ? <Text style={authStyles.info}>{info}</Text> : null}
            <Button title={busy ? 'Proszę czekać…' : 'Zapisz nazwę'} onPress={save} disabled={busy} />
            <Button title="Wyloguj z tego urządzenia" secondary onPress={logout} disabled={busy} />
          </View>
        </ScrollView>
      </AccountGate>
    </Screen>
  );
}
