import { useRef, useState } from "react";
import { ScrollView, Share, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Screen from "../components/Screen";
import AccountGate from "../components/AccountGate";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { createRequest } from "../services/payments";
import { encodeRequest, parseAmount, paymentTitle } from "../utils/payments";
import { userError } from "../utils/errors";
import { formatMoney } from "../utils/format";
import { paymentStyles as styles } from "../theme";

export default function RequestScreen() {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("Rozliczenie");
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function generate() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      setRequest(await createRequest(parseAmount(amount), paymentTitle(title)));
    } catch (cause) {
      setError(userError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Screen withHeader>
      <AccountGate>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>Poproś o płatność</Text>
          {request ? (
            <>
              <View
                style={{
                  padding: 20,
                  backgroundColor: "white",
                  alignSelf: "center",
                }}
              >
                <QRCode value={encodeRequest(request.id)} size={230} />
              </View>
              <Text style={styles.title}>
                {formatMoney(request.amountMinor)}
              </Text>
              <Text style={styles.text}>{request.title}</Text>
              <Text style={styles.hint}>
                Kod jest jednorazowy. Ważny do{" "}
                {new Date(request.expiresAt).toLocaleString("pl-PL")}. Odbiorca
                skanuje go w aplikacji i potwierdza przelew.
              </Text>
              <Button
                title="Udostępnij kod jako tekst"
                onPress={async () => {
                  try {
                    await Share.share({ message: encodeRequest(request.id) });
                  } catch (cause) {
                    setError(userError(cause));
                  }
                }}
              />
              <Button
                title="Utwórz kolejną prośbę"
                secondary
                onPress={() => setRequest(null)}
              />
            </>
          ) : (
            <>
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
              <Button title="Generuj QR" onPress={generate} disabled={busy} />
            </>
          )}
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
        </ScrollView>
      </AccountGate>
    </Screen>
  );
}
