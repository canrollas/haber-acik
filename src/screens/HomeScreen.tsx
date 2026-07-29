import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import TopAppBar from '../components/TopAppBar';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../types/article';
import { timeAgo } from '../utils/date';
import { getValidImageUrl } from '../utils/image';
import { usePreferences } from '../context/PreferencesContext';
import { fetchPersonalizedArticles } from '../services/personalizedArticles';
import AllArticlesScreen from './AllArticlesScreen';

const DISPLAY_SIZE = 8;
const PER_QUERY_LIMIT = 6;

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);
  const { followedSources, selectedCategories } = usePreferences();

  const loadArticles = async () => {
    try {
      // Strictly limited to what was actually followed/selected — no
      // unrelated articles get mixed in to pad out the feed.
      const data = await fetchPersonalizedArticles(followedSources, selectedCategories, PER_QUERY_LIMIT);
      setArticles(data.slice(0, DISPLAY_SIZE));
      setError(null);
    } catch (err) {
      setError('Haberler yüklenirken bir sorun oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedSources, selectedCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArticles();
    setRefreshing(false);
  }, []);

  const mapArticleToCard = (article: Article) => ({
    id: String(article.id),
    imageUrl: getValidImageUrl(article.image_url),
    category: article.category,
    timeAgo: timeAgo(article.publication_date || article.created_at),
    title: article.title,
    description: article.description,
    source: article.source,
    url: article.url,
    readTime: `${Math.max(1, Math.ceil((article.word_count || 200) / 200))} dk`, // Estimate read time
  });

  const featuredArticle = articles.length > 0 ? mapArticleToCard(articles[0]) : null;
  const standardArticles = articles.slice(1, 5).map(mapArticleToCard);
  const dailySummary = articles.slice(5, 8).map(mapArticleToCard);

  if (showAll) {
    return <AllArticlesScreen onBack={() => setShowAll(false)} />;
  }

  return (
    <View style={styles.container}>
      <TopAppBar />
      
      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && articles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadArticles}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>
            Takip ettiğiniz kaynak ve kategorilerde henüz yeni bir haber yok. Ayarlar'dan tercihlerinizi genişletebilirsiniz.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          {/* Senin İçin Section */}
          <View style={styles.section}>
            {featuredArticle && (
              <ArticleCard variant="featured" {...featuredArticle} />
            )}

            <View style={styles.standardGrid}>
              {standardArticles.map(article => (
                <View key={article.id} style={styles.standardColumn}>
                  <ArticleCard variant="standard" {...article} />
                </View>
              ))}
            </View>
          </View>

          {/* Günün Özeti Section */}
          {dailySummary.length > 0 && (
            <View style={[styles.section, styles.lastSection]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, styles.sectionTitleInRow]}>Günün Özeti</Text>
                <TouchableOpacity onPress={() => setShowAll(true)} hitSlop={8}>
                  <Text style={styles.seeAllText}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.horizontalList}>
                {dailySummary.map(article => (
                  <ArticleCard key={article.id} variant="horizontal" {...article} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function useStyles(theme: AppTheme) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.marginMobile,
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
    textAlign: 'center',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: 80, // Extra padding for bottom nav
  },
  section: {
    marginBottom: theme.spacing.stackLg,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontFamily: theme.typography.headlineLgMobile.fontFamily,
    fontSize: theme.typography.headlineLgMobile.fontSize,
    lineHeight: theme.typography.headlineLgMobile.lineHeight,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.stackMd,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primaryContainer,
    alignSelf: 'flex-start',
    paddingBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: theme.spacing.stackMd,
  },
  sectionTitleInRow: {
    marginBottom: 0,
  },
  seeAllText: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    color: theme.colors.primary,
  },
  standardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.gutter,
    marginTop: theme.spacing.gutter,
  },
  standardColumn: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  horizontalList: {
    gap: 16,
  },
});
}
