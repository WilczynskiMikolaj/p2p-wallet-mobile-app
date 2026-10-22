import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { formatDate, formatMoney } from '../utils/format';

/** @param {{ transaction: (typeof import('../data/demo').demoTransactions)[number] }} props */
export default function TransactionRow({ transaction }) {
  const incoming = transaction.direction === 'incoming';

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Text style={styles.name}>{transaction.counterpartyName}</Text>
        <Text style={[styles.amount, incoming && styles.incoming]}>
          {incoming ? '+' : '−'} {formatMoney(transaction.amountMinor)}
        </Text>
      </View>
      <Text style={styles.description}>{incoming ? 'Otrzymano' : 'Wysłano'} · {transaction.description}</Text>
      <Text style={styles.date}>{formatDate(transaction.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { padding: 16, borderRadius: 14, backgroundColor: colors.surface, marginBottom: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600', flexShrink: 1 },
  amount: { color: colors.negative, fontWeight: '700', fontSize: 15 },
  incoming: { color: colors.positive },
  description: { color: colors.muted, fontSize: 13, marginTop: 8 },
  date: { color: colors.muted, fontSize: 12, marginTop: 5 },
});
