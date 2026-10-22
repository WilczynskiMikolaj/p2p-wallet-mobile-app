import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import TransactionRow from '../components/TransactionRow';
import { demoTransactions } from '../data/demo';
import { colors } from '../theme';

const filters = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'incoming', label: 'Przychodzące' },
  { value: 'outgoing', label: 'Wychodzące' },
];

export default function HistoryScreen() {
  const [filter, setFilter] = useState('all');
  const transactions = demoTransactions.filter((item) => filter === 'all' || item.direction === filter);

  return (
    <Screen withHeader>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.filters}>
              {filters.map((item) => (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.value === filter }}
                  onPress={() => setFilter(item.value)}
                  style={[styles.filter, item.value === filter && styles.activeFilter]}
                >
                  <Text style={[styles.filterText, item.value === filter && styles.activeText]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.count}>Liczba operacji: {transactions.length}</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.intro}>Brak transakcji w tej kategorii.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22 },
  intro: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 20 },
  filter: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  activeFilter: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  activeText: { color: colors.background },
  count: { color: colors.muted, fontSize: 12, marginBottom: 16 },
});
