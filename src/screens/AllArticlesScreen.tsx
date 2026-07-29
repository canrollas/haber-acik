import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../types/article';
import { fetchPersonalizedArticles } from '../services/personalizedArticles';
import { timeAgo } from '../utils/date';
import { getValidImageUrl } from '../utils/image';

const PER_QUERY_LIMIT = 20;

interface AllArticlesScreenProps {
  onBack: () => void;
}

export default function AllArticlesScreen({ onBack }: AllArticlesScreenProps) {
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);
  const { followedSources, selectedCategories } = usePreferences();

  const loadArticles = async () => {
    try {
      const data = await fetchPersonalizedArticles(followedSources, selectedCategories, PER_QUERY_LIMIT);
      setArticles(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedSources, selectedCategories]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Günün Özeti</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && articles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Gösterilecek haber bulunamadı.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          {articles.map(item => (
            <ArticleCard
              key={item.id}
              variant="horizontal"
              imageUrl={getValidImageUrl(item.image_url)}
              category={item.category}
              timeAgo={timeAgo(item.publication_date || item.created_at)}
              title={item.title}
              source={item.source}
              url={item.url}
            />
          ))}
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
    header: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: theme.spacing.marginMobile,
      height: 52,
    },
    headerTitle: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: 'bold',
    },
    backButton: {
      marginLeft: -8,
      padding: 8,
    },
    scrollContent: {
      padding: theme.spacing.marginMobile,
      gap: 16,
      paddingBottom: 32,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.stackLg,
    },
    errorText: {
      color: theme.colors.error,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: theme.typography.bodyMd.fontSize,
    },
    emptyText: {
      color: theme.colors.onSurfaceVariant,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: theme.typography.bodyMd.fontSize,
    },
  });
}
