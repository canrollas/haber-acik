import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import TopAppBar from '../components/TopAppBar';
import { CATEGORIES, IoniconName, toBackendCategoryParam } from '../data/categories';
import { fetchArticles } from '../services/api';
import { Article } from '../types/article';
import { timeAgo } from '../utils/date';
import { getValidImageUrl } from '../utils/image';
import { usePreferences } from '../context/PreferencesContext';

const getSourceIcon = (source: string): IoniconName => {
  const s = source.toLowerCase();
  if (s.includes('aa') || s.includes('dha') || s.includes('iha') || s.includes('reuters')) return 'globe-outline';
  if (s.includes('spor')) return 'trophy-outline';
  if (s.includes('ekonomi') || s.includes('bloomberg')) return 'storefront-outline';
  return 'document-text-outline';
};

export default function DiscoverScreen() {
  const { selectedCategories } = usePreferences();
  const [selectedCategory, setSelectedCategory] = useState(selectedCategories[0] || 'teknoloji');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  const loadArticles = async (categorySlug: string) => {
    try {
      setLoading(true);
      const response = await fetchArticles({ category: toBackendCategoryParam(categorySlug), limit: 15 });
      setArticles(response.data);
      setError(null);
    } catch (err) {
      setError('Haberler yüklenirken bir sorun oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(selectedCategory);
  }, [selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArticles(selectedCategory);
    setRefreshing(false);
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <TopAppBar />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >

        {/* Category chips */}
        <View style={styles.chipsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CATEGORIES.map(cat => {
              const selected = cat.slug === selectedCategory;
              return (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
                  onPress={() => setSelectedCategory(cat.slug)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                  />
                  <Text style={selected ? styles.chipTextSelected : styles.chipTextUnselected}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Trend Haberler */}
        <View style={styles.trendSection}>
          <View style={styles.trendHeader}>
            <Ionicons name="flame" size={26} color={theme.colors.primary} />
            <Text style={styles.trendTitle}>Haberler</Text>
          </View>

          {loading && !refreshing ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : error && articles.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadArticles(selectedCategory)}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : articles.length === 0 ? (
             <View style={styles.centerContent}>
               <Text style={styles.emptyText}>Bu kategoride henüz haber bulunmuyor.</Text>
             </View>
          ) : (
            <View>
              {articles.map((article, index) => (
                <TouchableOpacity
                  key={article.id}
                  style={[
                    styles.trendCard,
                    index === articles.length - 1 && styles.trendCardLast,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (article.url) WebBrowser.openBrowserAsync(article.url);
                  }}
                >
                  <View style={styles.trendCardBody}>
                    <View>
                      <View style={styles.trendMetaRow}>
                        <Text style={styles.trendCategory}>{article.category}</Text>
                        <View style={styles.trendDot} />
                        <Text style={styles.trendTime}>{timeAgo(article.publication_date || article.created_at)}</Text>
                      </View>
                      <Text style={styles.trendCardTitle} numberOfLines={3}>
                        {article.title}
                      </Text>
                    </View>
                    <View style={styles.trendSourceRow}>
                      <View style={styles.trendSourceIconWrap}>
                        <Ionicons name={getSourceIcon(article.source)} size={12} color={theme.colors.onSurfaceVariant} />
                      </View>
                      <Text style={styles.trendSourceText}>{article.source}</Text>
                    </View>
                  </View>
                  <Image source={{ uri: getValidImageUrl(article.image_url) }} style={styles.trendImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 80,
  },
  centerContent: {
    padding: theme.spacing.stackLg,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
  },

  // Category chips
  chipsSection: {
    paddingVertical: theme.spacing.stackMd,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: theme.spacing.marginMobile,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.rounded.full,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
  },
  chipUnselected: {
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  chipTextSelected: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    color: theme.colors.onPrimary,
  },
  chipTextUnselected: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    color: theme.colors.onSurfaceVariant,
  },

  // Trend section
  trendSection: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.stackMd,
  },
  trendTitle: {
    fontFamily: theme.typography.headlineLgMobile.fontFamily,
    fontSize: theme.typography.headlineLgMobile.fontSize,
    lineHeight: theme.typography.headlineLgMobile.lineHeight,
    color: theme.colors.onBackground,
  },
  trendCard: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  trendCardLast: {
    borderBottomWidth: 0,
  },
  trendCardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  trendMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  trendCategory: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.outlineVariant,
  },
  trendTime: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  trendCardTitle: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    lineHeight: theme.typography.headlineMd.lineHeight,
    color: theme.colors.onBackground,
  },
  trendSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: theme.spacing.stackSm,
  },
  trendSourceIconWrap: {
    width: 20,
    height: 20,
    borderRadius: theme.rounded.full,
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendSourceText: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
  trendImage: {
    width: 100,
    height: 100,
    borderRadius: theme.rounded.lg,
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
});
}
