import { ScrollView, Text } from "react-native";
import { terms } from "../data/terms";
import { paymentStyles as styles } from "../theme";
export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      {terms.map(([title, text]) => (
        <Text key={title} style={styles.text}>
          <Text style={{ fontWeight: "bold" }}>
            {title}
            {"\n"}
          </Text>
          {text}
        </Text>
      ))}
    </ScrollView>
  );
}
