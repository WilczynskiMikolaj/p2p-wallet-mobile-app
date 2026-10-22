import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { formatMoney } from '../utils/format';

/** @param {{ balanceMinor: number }} props */
export default function BalanceCard({ balanceMinor }) {
  const [visible, setVisible] = useState(true);

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.label}>Dostępne środki</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ukryj saldo' : 'Pokaż saldo'}
          onPress={() => setVisible((previous) => !previous)}
          style={styles.toggle}
        >
          <Text style={styles.link}>{visible ? 'Ukryj' : 'Pokaż'}</Text>
        </Pressable>
      </View>
      <Text style={styles.balance}>{visible ? formatMoney(balanceMinor) : '••••••'}</Text>
      <Text style={styles.label}>Twoje środki · portfel PLN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  label: { color: colors.muted, fontSize: 14 },
  toggle: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  link: { color: colors.accent, fontWeight: '600' },
  balance: { color: colors.text, fontSize: 34, fontWeight: '700', marginVertical: 12 },
});
