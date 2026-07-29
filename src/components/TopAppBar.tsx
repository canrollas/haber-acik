import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import LogoMark from './LogoMark';
import SearchModal from './SearchModal';

export default function TopAppBar() {
  const insets = useSafeAreaInsets();
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <LogoMark size={30} />
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkDark}>Haber</Text>
            <Text style={styles.wordmarkAccent}>Açık</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7} onPress={() => setSearchOpen(true)}>
          <Ionicons name="search" size={19} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <SearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </View>
  );
}

function useStyles(theme: AppTheme) {
  return StyleSheet.create({
  // Extends behind the notch/status bar with its own background so there's
  // no separately-colored strip above the header; only paddingTop (the inset)
  // pushes the actual row content down below the notch.
  wrapper: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    height: 52,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  wordmark: {
    fontFamily: 'SourceSerif4_700Bold',
    fontSize: 21,
    letterSpacing: -0.4,
  },
  wordmarkDark: {
    color: theme.colors.onBackground,
  },
  wordmarkAccent: {
    color: theme.colors.primary,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: theme.rounded.full,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
}
