import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Screen from "../components/Screen";
import Button from "../components/Button";
import { fetchAdminAccounts } from "../services/account";
import { useAsyncResource } from "../hooks/useAsyncResource";
import { colors } from "../theme";

export default function AdminScreen() {
  const [page, setPage] = useState(0);
  const loadPage = useCallback(
    (pageNumber) => fetchAdminAccounts(pageNumber * 50),
    [],
  );
  const { data, loading, error, reload } = useAsyncResource(page, loadPage);
  const rows = data ?? [];
  return (
    <Screen withHeader>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={reload}
        ListHeaderComponent={
          <Text style={styles.description}>
            Lista kont · strona {page + 1}. Dostęp jest sprawdzany na serwerze.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.display_name}</Text>
            <Text style={styles.description}>
              {item.account_role} · portfel {item.wallet_status}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Text style={styles.description}>
              {error || "Brak kont na tej stronie."}
            </Text>
          )
        }
        ListFooterComponent={
          <View style={styles.controls}>
            {error ? (
              <Button
                title="Spróbuj ponownie"
                onPress={reload}
                disabled={loading}
              />
            ) : null}
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
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { padding: 24 },
  card: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  name: { color: colors.text, fontSize: 16, fontWeight: "600" },
  description: { color: colors.muted, lineHeight: 22, marginVertical: 8 },
  controls: { gap: 12, marginTop: 16 },
});
