import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Crypto from "expo-crypto";
import * as Contacts from "expo-contacts";
import Screen from "../components/Screen";
import AccountGate from "../components/AccountGate";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useAsyncResource } from "../hooks/useAsyncResource";
import {
  clearPending,
  findRecipient,
  getRequest,
  readPending,
  savePending,
  transfer,
} from "../services/payments";
import { parseAmount, paymentTitle } from "../utils/payments";
import { userError } from "../utils/errors";
import { formatMoney } from "../utils/format";
import { paymentStyles as styles } from "../theme";

export default function TransferScreen() {
  const { session } = useAuth();
  const { requestId } = useLocalSearchParams();
  const load = useCallback(
    async (userId) => {
      const pending = await readPending(userId);
      if (pending) return { pending };
      return { request: requestId ? await getRequest(requestId) : null };
    },
    [requestId],
  );
  const resource = useAsyncResource(session?.user.id ?? null, load);
  return (
    <Screen withHeader>
      <AccountGate>
        {resource.loading ? (
          <ActivityIndicator />
        ) : resource.error ? (
          <View style={styles.body}>
            <Text style={styles.error}>{resource.error}</Text>
            <Button title="Spróbuj ponownie" onPress={resource.reload} />
          </View>
        ) : resource.data ? (
          <TransferForm
            key={`${session.user.id}:${requestId ?? ""}`}
            initial={resource.data}
          />
        ) : null}
      </AccountGate>
    </Screen>
  );
}

function TransferForm({ initial }) {
  const { session, account, reloadAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("Rozliczenie");
  const [draft, setDraft] = useState(
    () =>
      initial.pending ??
      (initial.request
        ? { ...initial.request, key: Crypto.randomUUID() }
        : null),
  );
  const [attempted, setAttempted] = useState(!!initial.pending);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [emails, setEmails] = useState([]);
  const [done, setDone] = useState(null);
  const lock = useRef(false);

  async function run(action) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(userError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function review() {
    void run(async () => {
      const amountMinor = parseAmount(amount);
      const checkedTitle = paymentTitle(title);
      if (!email.trim() || email.length > 254)
        throw new Error("RECIPIENT_NOT_FOUND");
      const person = await findRecipient(email);
      setDraft({
        ...person,
        amountMinor,
        title: checkedTitle,
        key: Crypto.randomUUID(),
      });
    });
  }
  function pickContact() {
    void run(async () => {
      if (Platform.OS === "web") throw new Error("CONTACTS_UNAVAILABLE");
      const permission = await Contacts.requestPermissionsAsync();
      if (!permission.granted) throw new Error("CONTACTS_DENIED");
      const contact = await Contacts.Contact.presentPicker();
      if (!contact) return;
      const addresses = [
        ...new Set(
          (await contact.getEmails())
            .map((item) => item.address?.trim())
            .filter(Boolean),
        ),
      ];
      if (!addresses.length) throw new Error("CONTACT_NO_EMAIL");
      setEmails(addresses);
      if (addresses.length === 1) setEmail(addresses[0]);
    });
  }
  function confirm() {
    void run(async () => {
      await savePending(session.user.id, draft);
      setAttempted(true);
      const result = await transfer(draft, session.access_token);
      setDone(result.transactionId);
      try {
        await clearPending(session.user.id);
      } catch {}
      await reloadAccount();
    });
  }
  return (
    <ScrollView
      contentContainerStyle={styles.body}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {done
          ? "Przelew wykonany"
          : draft
            ? "Potwierdź przelew"
            : "Wyślij środki"}
      </Text>
      <Text style={styles.text}>
        Saldo: {formatMoney(Number(account.wallet.balance_minor))} · środki{" "}
      </Text>
      {done ? (
        <>
          <Text selectable style={styles.text}>
            Numer transakcji: {done}
          </Text>
          <Button
            title="Zobacz historię"
            onPress={() => router.replace("/history")}
          />
        </>
      ) : draft ? (
        <>
          <Text style={styles.text}>Odbiorca: {draft.displayName}</Text>
          <Text selectable style={styles.hint}>
            Identyfikator: {draft.userId}
          </Text>
          <Text style={styles.title}>{formatMoney(draft.amountMinor)}</Text>
          <Text style={styles.text}>{draft.title}</Text>
          {draft.expiresAt ? (
            <Text style={styles.hint}>
              Ważność QR: {new Date(draft.expiresAt).toLocaleString("pl-PL")}
            </Text>
          ) : null}
          {attempted ? (
            <Text style={styles.hint}>
              Ta operacja została już wysłana lub oczekuje na potwierdzenie.
              Ponowienie użyje tego samego identyfikatora i nie pobierze środków
              drugi raz.
            </Text>
          ) : null}
          <Button
            title={
              busy
                ? "Sprawdzanie…"
                : attempted
                  ? "Sprawdź / ponów tę samą operację"
                  : "Zatwierdź i wyślij"
            }
            onPress={confirm}
            disabled={
              busy || (!attempted && account.wallet.status !== "active")
            }
          />
          {!attempted && !initial.request ? (
            <Button
              title="Zmień dane"
              secondary
              disabled={busy}
              onPress={() => setDraft(null)}
            />
          ) : null}
          {attempted ? (
            <Button
              title="Historia transakcji"
              secondary
              disabled={busy}
              onPress={() => router.push("/history")}
            />
          ) : null}
          {attempted && error ? (
            <Button
              title="Zamknij próbę po sprawdzeniu historii"
              secondary
              disabled={busy}
              onPress={() => {
                Alert.alert(
                  "Sprawdź historię",
                  "Operacja mogła się udać mimo błędu połączenia. Po usunięciu próby nowy przelew może ponownie pobrać środki.",
                  [
                    { text: "Wróć", style: "cancel" },
                    {
                      text: "Sprawdziłem historię",
                      onPress: () =>
                        void run(async () => {
                          await clearPending(session.user.id);
                          router.replace("/");
                        }),
                    },
                  ],
                );
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          <FormField
            label="E-mail odbiorcy w P2P Wallet"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!busy}
          />
          <Button
            title="Wybierz z kontaktów"
            secondary
            onPress={pickContact}
            disabled={busy}
          />
          {emails.length > 1 ? (
            <View style={styles.gap}>
              {emails.map((address) => (
                <Button
                  key={address}
                  title={address}
                  secondary
                  disabled={busy}
                  onPress={() => {
                    setEmail(address);
                    setEmails([]);
                  }}
                />
              ))}
            </View>
          ) : null}
          <Text style={styles.hint}>
            Na serwer trafi tylko wybrany e-mail po naciśnięciu „Dalej”.
          </Text>
          <FormField
            label="Kwota PLN"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            maxLength={11}
            editable={!busy}
          />
          <FormField
            label="Tytuł"
            value={title}
            onChangeText={setTitle}
            maxLength={140}
            editable={!busy}
          />
          <Button
            title="Dalej"
            onPress={review}
            disabled={busy || account.wallet.status !== "active"}
          />
        </>
      )}
      {account.wallet.status !== "active" ? (
        <Text style={styles.error}>Portfel jest zablokowany.</Text>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {error.includes("kontakt") ? (
        <Button
          title="Ustawienia uprawnień"
          secondary
          onPress={() => Linking.openSettings()}
        />
      ) : null}
    </ScrollView>
  );
}
