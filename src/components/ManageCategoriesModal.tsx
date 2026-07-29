import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { CATEGORIES } from '../data/categories';

interface ManageCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ManageCategoriesModal({ visible, onClose }: ManageCategoriesModalProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(theme);
  const { selectedCategories, toggleCategory } = usePreferences();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>İçerik Filtreleri</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Akışınızda öne çıkmasını istediğiniz konuları seçin.</Text>
        <ScrollView contentContainerStyle={styles.content}>
          {CATEGORIES.map((cat, index) => {
            const selected = selectedCategories.includes(cat.slug);
            return (
              <TouchableOpacity
                key={cat.slug}
                style={[styles.row, index === CATEGORIES.length - 1 && styles.rowLast]}
                onPress={() => toggleCategory(cat.slug)}
                activeOpacity={0.7}
              >
                <View style={styles.iconBadge}>
                  <Ionicons name={cat.icon} size={17} color={theme.colors.primary} />
                </View>
                <Text style={styles.label}>{cat.label}</Text>
                <View style={styles.spacer} />
                {selected && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
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
    hint: {
      fontFamily: theme.typography.labelSm.fontFamily,
      fontSize: theme.typography.labelSm.fontSize,
      color: theme.colors.onSurfaceVariant,
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: theme.spacing.stackSm,
    },
    content: {
      padding: theme.spacing.marginMobile,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: theme.rounded.md,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    spacer: {
      flex: 1,
    },
  });
}
