import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

/** @param {{ title: string, onPress: () => void, secondary?: boolean }} props */
export default function Button({ title, onPress, secondary = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, pressed && styles.pressed]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.7 },
  label: { color: colors.background, fontWeight: '700', fontSize: 15, textAlign: 'center' },
  secondaryLabel: { color: colors.text },
});
