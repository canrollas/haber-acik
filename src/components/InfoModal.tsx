import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
}

export default function InfoModal({ visible, onClose, title, body }: InfoModalProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.body}>{body}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function useStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.marginMobile,
      paddingVertical: theme.spacing.stackSm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
    },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: theme.typography.headlineMd.fontSize,
      color: theme.colors.onSurface,
    },
    scrollContent: {
      padding: theme.spacing.marginMobile,
    },
    body: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: theme.typography.bodyMd.fontSize,
      lineHeight: theme.typography.bodyMd.lineHeight,
      color: theme.colors.onSurfaceVariant,
    },
  });
}
