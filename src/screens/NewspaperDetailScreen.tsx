import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import ArticleCard from '../components/ArticleCard';
import { Source, Article } from '../types/article';
import { fetchArticles } from '../services/api';
import { timeAgo } from '../utils/date';
import { getValidImageUrl, getValidLogoUrl } from '../utils/image';

const HEADER_LOGO_HEIGHT = 24;

interface NewspaperDetailScreenProps {
  source: Source;
  onBack: () => void;
}

export default function NewspaperDetailScreen({ source, onBack }: NewspaperDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetchArticles({ source: source.slug, limit: 15 });
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
    loadArticles();
  }, [source.slug]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadArticles();
    setRefreshing(false);
  }, [source.slug]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            {getValidLogoUrl(source.logo_url) && (
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: getValidLogoUrl(source.logo_url)! }}
                  style={{ width: HEADER_LOGO_HEIGHT * 1.8, height: HEADER_LOGO_HEIGHT * 1.2 }}
                  contentFit="contain"
                />
              </View>
            )}
            <Text style={styles.headerTitle}>{source.name}</Text>
          </View>
        </View>
      </View>
      
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
          <Text style={styles.emptyText}>Bu kaynağa ait haber bulunmuyor.</Text>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cbd5e1', // slate-300, a perfect middle ground
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
});
}
