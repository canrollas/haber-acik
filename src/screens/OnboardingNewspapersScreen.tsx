import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { fetchSources } from '../services/api';
import { Source } from '../types/article';
import { getValidLogoUrl } from '../utils/image';

interface OnboardingNewspapersScreenProps {
  onFinish: () => void;
}

export default function OnboardingNewspapersScreen({ onFinish }: OnboardingNewspapersScreenProps) {
  const insets = useSafeAreaInsets();
  const { followedSources, setFollowedSources } = usePreferences();
  const [followed, setFollowed] = useState<Set<string>>(new Set(followedSources));
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  const loadSources = () => {
    setLoading(true);
    fetchSources()
      .then(response => {
        setSources(response.data);
        setError(null);
      })
      .catch(err => {
        setError('Gazeteler yüklenirken bir hata oluştu.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSources();
  }, []);

  const toggle = (slug: string) => {
    setFollowed(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleFinish = () => {
    setFollowedSources(Array.from(followed));
    onFinish();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.step}>ADIM 2 / 2</Text>
        <Text style={styles.title}>Hangi gazeteleri takip etmek istersiniz?</Text>
        <Text style={styles.subtitle}>
          Takip ettiğiniz kaynaklardan öne çıkan haberler akışınıza eklenir.
        </Text>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadSources}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {sources.map((item, index) => {
              const isFollowed = followed.has(item.slug);
              return (
                <View
                  key={item.slug}
                  style={[styles.row, index === sources.length - 1 && styles.rowLast]}
                >
                  {getValidLogoUrl(item.logo_url) && (
                    <View style={styles.logoContainer}>
                      <Image
                        source={{ uri: getValidLogoUrl(item.logo_url)! }}
                        style={styles.logo}
                        contentFit="contain"
                      />
                    </View>
                  )}
                  <Text style={styles.sourceName}>{item.name}</Text>
                  <View style={styles.spacer} />
                  <TouchableOpacity
                    style={[styles.followButton, isFollowed && styles.followButtonActive]}
                    onPress={() => toggle(item.slug)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.followButtonText, isFollowed && styles.followButtonTextActive]}>
                      {isFollowed ? 'Takipte' : 'Takip Et'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish} activeOpacity={0.85}>
          <Text style={styles.finishButtonText}>Başla</Text>
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

  card: {
    borderRadius: theme.rounded.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.gutter,
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
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logo: {
    width: 46,
    height: 22,
  },
  sourceName: {
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: 15,
    color: theme.colors.onSurface,
    flexShrink: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.stackLg,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.stackMd,
    paddingVertical: theme.spacing.stackSm,
    paddingHorizontal: theme.spacing.stackLg,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  retryButtonText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
  },
  spacer: {
    flex: 1,
  },
  followButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.rounded.full,
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  followButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  followButtonText: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  followButtonTextActive: {
    color: theme.colors.onPrimary,
  },

  footer: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  finishButton: {
    height: 52,
    borderRadius: theme.rounded.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: 16,
    color: theme.colors.onPrimary,
  },
});
}
