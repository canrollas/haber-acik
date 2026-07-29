import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';

export type NavTab = 'home' | 'discover' | 'gazeteler' | 'settings';

interface BottomNavBarProps {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

export default function BottomNavBar({ active, onNavigate }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 6 }]}>
      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
        <View style={active === 'home' ? styles.iconContainerActive : styles.iconContainer}>
          <Ionicons
            name={active === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={active === 'home' ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer}
          />
        </View>
        <Text style={active === 'home' ? styles.navLabelActive : styles.navLabel} numberOfLines={1}>Akış</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('discover')}>
        <View style={active === 'discover' ? styles.iconContainerActive : styles.iconContainer}>
          <Ionicons
            name={active === 'discover' ? 'compass' : 'compass-outline'}
            size={24}
            color={active === 'discover' ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer}
          />
        </View>
        <Text style={active === 'discover' ? styles.navLabelActive : styles.navLabel} numberOfLines={1}>Keşfet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('gazeteler')}>
        <View style={active === 'gazeteler' ? styles.iconContainerActive : styles.iconContainer}>
          <Ionicons
            name={active === 'gazeteler' ? 'newspaper' : 'newspaper-outline'}
            size={24}
            color={active === 'gazeteler' ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer}
          />
        </View>
        <Text style={active === 'gazeteler' ? styles.navLabelActive : styles.navLabel} numberOfLines={1}>Gazeteler</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('settings')}>
        <View style={active === 'settings' ? styles.iconContainerActive : styles.iconContainer}>
          <Ionicons
            name={active === 'settings' ? 'settings' : 'settings-outline'}
            size={24}
            color={active === 'settings' ? theme.colors.onPrimaryContainer : theme.colors.onSecondaryContainer}
          />
        </View>
        <Text style={active === 'settings' ? styles.navLabelActive : styles.navLabel} numberOfLines={1}>Ayarlar</Text>
      </TouchableOpacity>
    </View>
  );
}

function useStyles(theme: AppTheme) {
  return StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: theme.rounded.full,
    overflow: 'hidden',
  },
  iconContainerActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.rounded.full,
    overflow: 'hidden',
  },
  navLabel: {
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.onSecondaryContainer,
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.primary,
    marginTop: 4,
  },
});
}
