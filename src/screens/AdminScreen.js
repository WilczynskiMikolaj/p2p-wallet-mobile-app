import { useCallback, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { randomUUID } from "expo-crypto";
import Screen from "../components/Screen";
import Button from "../components/Button";
import FormField from "../components/FormField";
import {
  applyAdminAction,
  fetchAdminAccounts,
  fetchAdminLog,
} from "../services/account";
import { useAsyncResource } from "../hooks/useAsyncResource";
import { formatDate, formatMoney } from "../utils/format";
import { parseAmount } from "../utils/payments";
import { userError } from "../utils/errors";
import { paymentStyles as styles } from "../theme";

const labels = {
  credit: "Przyznaj środki testowe",
  block: "Zablokuj portfel",
  unblock: "Odblokuj portfel",
};
const events = {
  credit: "Przyznano środki testowe",
  block: "Zablokowano portfel",
  unblock: "Odblokowano portfel",
};
export default function AdminScreen() {
  const [log, setLog] = useState(false);
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const running = useRef(false);
  const load = useCallback(
    (p) => (log ? fetchAdminLog(p) : fetchAdminAccounts(p * 50)),
    [log],
  );
  const list = useAsyncResource(page, load);
  function choose(row, action) {
    setDraft({ row, action, operation: randomUUID() });
    setAmount("");
    setMessage("");
  }
  async function confirm() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setMessage("");
    try {
      const minor = draft.action === "credit" ? parseAmount(amount) : 0;
      await applyAdminAction(
        draft.operation,
        draft.row.user_id,
        draft.action,
        minor,
      );
      setDraft(null);
      setMessage("Zapisano operację w dzienniku.");
      await list.reload();
    } catch (cause) {
      setMessage(userError(cause));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <Screen withHeader>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>
          {log ? "Dziennik administratora" : "Konta i portfele"}
        </Text>
        {draft ? (
          <>
            <Text style={styles.text}>
              {labels[draft.action]} · {draft.row.display_name}
            </Text>
            <Text selectable style={styles.hint}>
              {draft.row.user_id}
            </Text>
            {draft.action === "credit" && (
              <FormField
                label="Kwota testowa w PLN"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!busy}
              />
            )}
            <Button
              title="Potwierdź operację"
              onPress={confirm}
              disabled={busy}
            />
            <Button
              title="Anuluj"
              secondary
              onPress={() => {
                setDraft(null);
                setMessage("");
              }}
              disabled={busy}
            />
          </>
        ) : (
          <>
            <Button
              title={log ? "Pokaż konta" : "Pokaż dziennik bezpieczeństwa"}
              secondary
              onPress={() => {
                setLog(!log);
                setPage(0);
                setMessage("");
              }}
            />
            {list.loading && <Text style={styles.hint}>Ładowanie…</Text>}
            {!!list.error && (
              <>
                <Text style={styles.error}>{list.error}</Text>
                <Button title="Spróbuj ponownie" onPress={list.reload} />
              </>
            )}
            {list.data?.length === 0 && (
              <Text style={styles.hint}>Brak wpisów na tej stronie.</Text>
            )}
            {list.data?.map((row) =>
              log ? (
                <View key={row.operation_id}>
                  <Text style={styles.text}>
                    {events[row.action]}{" "}
                    {row.action === "credit" && formatMoney(row.amount_minor)}
                  </Text>
                  <Text selectable style={styles.hint}>
                    {formatDate(row.occurred_at)}
                    {"\n"}Administrator: {row.actor_id}
                    {"\n"}Konto: {row.target_id}
                  </Text>
                </View>
              ) : (
                <View key={row.user_id} style={{ gap: 8 }}>
                  <Text style={styles.text}>
                    {row.display_name} · {row.account_role} ·{" "}
                    {row.wallet_status}
                  </Text>
                  <Button
                    secondary
                    title={
                      row.wallet_status === "active"
                        ? labels.block
                        : labels.unblock
                    }
                    onPress={() =>
                      choose(
                        row,
                        row.wallet_status === "active" ? "block" : "unblock",
                      )
                    }
                  />
                  <Button
                    secondary
                    title={labels.credit}
                    disabled={row.wallet_status !== "active"}
                    onPress={() => choose(row, "credit")}
                  />
                </View>
              ),
            )}
            <Button
              title="Poprzednia strona"
              disabled={list.loading || page === 0}
              onPress={() => setPage(page - 1)}
            />
            <Button
              title="Następna strona"
              disabled={list.loading || list.data?.length !== 50}
              onPress={() => setPage(page + 1)}
            />
          </>
        )}
        {message ? (
          <Text accessibilityRole="alert" style={styles.text}>
            {message}
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
