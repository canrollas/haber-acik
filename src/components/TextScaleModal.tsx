import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme, TextScale } from '../theme/ThemeContext';

interface TextScaleModalProps {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS: { value: TextScale; label: string; sample: number }[] = [
  { value: 'small', label: 'Küçük', sample: 14 },
  { value: 'medium', label: 'Orta', sample: 17 },
  { value: 'large', label: 'Büyük', sample: 20 },
];

export default function TextScaleModal({ visible, onClose }: TextScaleModalProps) {
  const { theme, textScale, setTextScale } = useAppTheme();
  const styles = useStyles(theme);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Metin Boyutu</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          {OPTIONS.map((opt, index) => {
            const selected = textScale === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.row, index === OPTIONS.length - 1 && styles.rowLast]}
                onPress={() => setTextScale(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sampleText, { fontSize: opt.sample }]}>Aa</Text>
                <Text style={styles.label}>{opt.label}</Text>
                <View style={styles.spacer} />
                {selected && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
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
    content: {
      padding: theme.spacing.marginMobile,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    sampleText: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      color: theme.colors.primary,
      width: 32,
    },
    label: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: theme.typography.bodyMd.fontSize,
      color: theme.colors.onSurface,
    },
    spacer: {
      flex: 1,
    },
  });
}
