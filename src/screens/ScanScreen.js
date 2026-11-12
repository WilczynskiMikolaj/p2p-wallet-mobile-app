import { useCallback, useRef, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useFocusEffect } from "expo-router";
import Screen from "../components/Screen";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { decodeRequest } from "../utils/payments";
import { userError } from "../utils/errors";
import { paymentStyles as styles } from "../theme";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [focused, setFocused] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  function scan(value) {
    if (lock.current) return;
    lock.current = true;
    setScanned(true);
    setError("");
    try {
      const requestId = decodeRequest(value);
      router.replace({ pathname: "/transfer", params: { requestId } });
    } catch (cause) {
      setError(userError(cause));
    }
  }
  return (
    <Screen withHeader>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Zeskanuj QR</Text>
        {permission?.granted && focused && !scanned ? (
          <View style={{ height: 300, overflow: "hidden", borderRadius: 16 }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }) => scan(data)}
              onMountError={() =>
                setError("Nie można uruchomić kamery. Wklej kod poniżej.")
              }
            />
          </View>
        ) : !permission?.granted ? (
          <>
            <Text style={styles.hint}>
              Kamera służy wyłącznie do skanowania QR. Możesz też wkleić treść
              kodu.
            </Text>
            <Button
              title={
                permission?.canAskAgain === false
                  ? "Otwórz ustawienia kamery"
                  : "Zezwól na użycie kamery"
              }
              onPress={async () => {
                try {
                  if (permission?.canAskAgain === false)
                    await Linking.openSettings();
                  else await requestPermission();
                } catch (cause) {
                  setError(userError(cause));
                }
              }}
            />
          </>
        ) : null}
        <FormField
          label="Treść kodu QR"
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
          maxLength={100}
          editable={!scanned}
        />
        <Button
          title="Odczytaj wklejony kod"
          onPress={() => scan(text)}
          disabled={scanned}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {scanned ? (
          <Button
            title="Spróbuj jeszcze raz"
            onPress={() => {
              lock.current = false;
              setScanned(false);
              setError("");
            }}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
