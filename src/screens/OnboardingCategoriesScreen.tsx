import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { CATEGORIES } from '../data/categories';

interface OnboardingCategoriesScreenProps {
  onNext: () => void;
}

export default function OnboardingCategoriesScreen({ onNext }: OnboardingCategoriesScreenProps) {
  const insets = useSafeAreaInsets();
  const { selectedCategories, setSelectedCategories } = usePreferences();
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedCategories));
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  const toggle = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleNext = () => {
    setSelectedCategories(Array.from(selected));
    onNext();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.step}>ADIM 1 / 2</Text>
        <Text style={styles.title}>Hangi kategorileri okumak istersiniz?</Text>
        <Text style={styles.subtitle}>
          Size özel bir akış oluşturalım. İstediğiniz kadar seçebilirsiniz.
        </Text>

        <View style={styles.grid}>
          {CATEGORIES.map(cat => {
            const isSelected = selected.has(cat.slug);
            return (
              <TouchableOpacity
                key={cat.label}
                style={[styles.card, isSelected ? styles.cardSelected : styles.cardUnselected]}
                onPress={() => toggle(cat.slug)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                  <Ionicons
                    name={cat.icon}
                    size={22}
                    color={isSelected ? theme.colors.onPrimary : theme.colors.primary}
                  />
                </View>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {cat.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={12} color={theme.colors.onPrimary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.continueButton, selected.size === 0 && styles.continueButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={selected.size === 0}
        >
          <Text style={styles.continueButtonText}>Devam Et</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.7}>
          <Text style={styles.skipText}>Şimdilik atla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function useStyles(theme: AppTheme) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: 24,
  },
  step: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    letterSpacing: 0.8,
    color: theme.colors.primary,
    marginBottom: theme.spacing.stackSm,
  },
  title: {
    fontFamily: theme.typography.headlineLg.fontFamily,
    fontSize: theme.typography.headlineLg.fontSize,
    lineHeight: theme.typography.headlineLg.lineHeight,
    letterSpacing: theme.typography.headlineLg.letterSpacing,
    color: theme.colors.onBackground,
    marginBottom: theme.spacing.stackSm,
  },
  subtitle: {
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.stackLg,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.gutter,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: theme.rounded.xl,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardUnselected: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.outlineVariant,
  },
  cardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.rounded.md,
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  cardLabel: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    color: theme.colors.onSurface,
  },
  cardLabelSelected: {
    color: theme.colors.onPrimary,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: theme.rounded.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: theme.spacing.stackSm,
  },
  continueButton: {
    height: 52,
    borderRadius: theme.rounded.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.outlineVariant,
  },
  continueButtonText: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: 16,
    color: theme.colors.onPrimary,
  },
  skipText: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
}
