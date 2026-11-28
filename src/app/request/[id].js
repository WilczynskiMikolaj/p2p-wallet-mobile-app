import { Redirect, useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import Screen from "../../components/Screen";
import LoginScreen from "../../screens/LoginScreen";
import { useAuth } from "../../context/AuthContext";
import { UUID_PATTERN } from "../../utils/payments";
import { paymentStyles } from "../../theme";

export default function OpenRequest() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  if (typeof id !== "string" || !UUID_PATTERN.test(id))
    return (
      <Screen withHeader>
        <Text style={paymentStyles.error}>
          Nieprawidłowy link do prośby o płatność.
        </Text>
      </Screen>
    );
  if (!session) return <LoginScreen />;
  return (
    <Redirect href={{ pathname: "/transfer", params: { requestId: id } }} />
  );
}
