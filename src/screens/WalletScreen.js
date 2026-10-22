import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import BalanceCard from '../components/BalanceCard';
import TransactionRow from '../components/TransactionRow';
import { demoProfile, demoWallet, demoTransactions } from '../data/demo';
import { useDemoSession } from '../context/DemoSessionContext';
import { colors } from '../theme';

export default function WalletScreen() {
  const { signOut } = useDemoSession();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>P2P WALLET</Text>
        <Text style={styles.title}>Cześć, {demoProfile.displayName}</Text>
        <Text style={styles.subtitle}>Twoje rozliczenia w jednym miejscu.</Text>

        <BalanceCard balanceMinor={demoWallet.balanceMinor} />

        <View style={styles.upcoming}>
          <Text style={styles.upcomingTitle}>Przelewy i prośby QR</Text>
          <Text style={styles.upcomingTitle}> PLACEHOLDER </Text>
        </View>

        <Text style={styles.sectionTitle}>Ostatnia aktywność</Text>
        {demoTransactions.slice(0, 3).map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
        <Button title="Zobacz całą historię" onPress={() => router.push('/history')} />

        <View style={{ height: 12 }} />

        <Button title="Wyloguj" onPress={signOut} secondary />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 30, fontWeight: '700', marginTop: 8 },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 8, marginBottom: 24 },
  upcoming: { marginTop: 18, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 14, gap: 8 },
  upcomingTitle: { color: colors.text, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 28, marginBottom: 16 },
  footer: { color: colors.muted, textAlign: 'center', fontSize: 12, marginVertical: 20 },
});
