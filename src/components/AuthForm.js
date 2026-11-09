import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import Screen from './Screen';
import { colors } from '../theme';


export default function AuthForm({ title, description, children }) {
  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>P2P WALLET</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
export const authStyles = StyleSheet.create({
  form: { gap: 18 },
  error: { color: colors.negative, lineHeight: 22 },
  info: { color: colors.accent, lineHeight: 22 },
  note: { color: colors.muted, lineHeight: 22, fontSize: 13 },
});
const styles = StyleSheet.create({
  content: { padding: 24, flexGrow: 1, justifyContent: 'center', gap: 16 },
  brand: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 30, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 23, marginBottom: 12 },
});
