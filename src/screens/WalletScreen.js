import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import AccountGate from '../components/AccountGate';
import Button from '../components/Button';
import BalanceCard from '../components/BalanceCard';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function WalletScreen() {
  const { account, accountLoading, reloadAccount } = useAuth();
  return (
    <Screen>
      <AccountGate>
        {account ? <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={accountLoading} onRefresh={reloadAccount} tintColor={colors.accent} />}>
          <Text style={styles.eyebrow}>P2P WALLET · ŚRODKI WIRTUALNE</Text>
          <Text style={styles.title}>Cześć, {account.profile.display_name}</Text>
          <Text style={styles.subtitle}>{account.role === 'admin' ? 'Administrator' : 'Użytkownik'} · portfel {account.wallet.status === 'active' ? 'aktywny' : 'zablokowany'}</Text>
          <BalanceCard balanceMinor={Number(account.wallet.balance_minor)} />
          <View style={styles.actions}>
            <Button title="Historia transakcji" onPress={() => router.push('/history')} />
            <Button title="Mój profil" secondary onPress={() => router.push('/profile')} />
            {account.role === 'admin' ? <Button title="Panel administratora" secondary onPress={() => router.push('/admin')} /> : null}
            <Button title="Odśwież dane" secondary onPress={() => { void reloadAccount(); }} disabled={accountLoading} />
          </View>
          <Text style={styles.note}>Saldo pochodzi z Twojego portfela. To środki testowe bez wartości pieniężnej. Funkcja przelewów będzie dostępna w kolejnym etapie.</Text>
        </ScrollView> : null}
      </AccountGate>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { padding: 22 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 10 },
  subtitle: { color: colors.muted, marginTop: 8, marginBottom: 24 },
  actions: { gap: 12, marginVertical: 24 },
  note: { color: colors.muted, fontSize: 14, lineHeight: 22 },
});
