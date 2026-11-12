import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Screen from "../components/Screen";
import AccountGate from "../components/AccountGate";
import TransactionRow from "../components/TransactionRow";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { fetchTransactions } from "../services/account";
import { useAsyncResource } from "../hooks/useAsyncResource";
import { colors } from "../theme";

const filters = [
  { value: "all", label: "Wszystkie" },
  { value: "incoming", label: "Przychodzące" },
  { value: "outgoing", label: "Wychodzące" },
];

export default function HistoryScreen() {
  const { account } = useAuth();
  const walletId = account?.wallet.id;
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const load = useCallback(() => fetchTransactions(page * 50), [page]);
  const { data, loading, error, reload } = useAsyncResource(
    walletId ?? null,
    load,
  );
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  const rows = data ?? [];
  const transactions = rows.filter(
    (item) => filter === "all" || item.direction === filter,
  );
  return (
    <Screen withHeader>
      <AccountGate>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionRow transaction={item} />}
          contentContainerStyle={styles.content}
          refreshing={loading}
          onRefresh={reload}
          ListHeaderComponent={
            <View>
              <Text style={styles.intro}>
                Historia · strona {page + 1} (do 50 operacji).
              </Text>
              <View style={styles.filters}>
                {filters.map((item) => (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: item.value === filter }}
                    onPress={() => setFilter(item.value)}
                    style={[
                      styles.filter,
                      item.value === filter && styles.activeFilter,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        item.value === filter && styles.activeText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {error ? (
                <View style={{ gap: 12, marginBottom: 16 }}>
                  <Text accessibilityRole="alert" style={styles.error}>
                    {error}
                  </Text>
                  <Button title="Spróbuj ponownie" onPress={reload} />
                </View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            <View style={{ gap: 12, marginTop: 16 }}>
              <Button
                title="Poprzednia strona"
                secondary
                disabled={loading || page === 0}
                onPress={() => setPage((n) => n - 1)}
              />
              <Button
                title="Następna strona"
                secondary
                disabled={loading || rows.length < 50}
                onPress={() => setPage((n) => n + 1)}
              />
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : !error ? (
              <Text style={styles.intro}>Brak operacji w tej kategorii.</Text>
            ) : undefined
          }
        />
      </AccountGate>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { padding: 22 },
  intro: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  error: { color: colors.negative },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 20,
  },
  filter: {
    minHeight: 44,
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  activeFilter: { backgroundColor: colors.accent },
  filterText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  activeText: { color: colors.background },
});
