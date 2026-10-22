import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

/** @param {{ children: import('react').ReactNode, withHeader?: boolean }} props */
export default function Screen({ children, withHeader = false }) {
  return (
    <SafeAreaView edges={withHeader ? ['left', 'right', 'bottom'] : ['top', 'left', 'right', 'bottom']} style={styles.screen}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background } });
