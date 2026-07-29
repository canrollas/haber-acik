import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import TopAppBar from '../components/TopAppBar';
import NewspaperDetailScreen from './NewspaperDetailScreen';
import { fetchSources } from '../services/api';
import { Source } from '../types/article';
import { getValidLogoUrl } from '../utils/image';

const LOGO_ROW_HEIGHT = 26;

export default function GazetelerScreen() {
  const [selected, setSelected] = useState<Source | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  const loadSources = async () => {
    try {
      const response = await fetchSources();
      setSources(response.data);
      setError(null);
    } catch (err) {
      setError('Kaynaklar yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSources();
    setRefreshing(false);
  }, []);

  if (selected) {
    return <NewspaperDetailScreen source={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <View style={styles.container}>
      <TopAppBar />
      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && sources.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSources}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : sources.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Henüz haber kaynağı bulunmuyor.</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          {sources.map((item, index) => (
            <TouchableOpacity
              key={item.slug}
              style={[styles.row, index === sources.length - 1 && styles.rowLast]}
              activeOpacity={0.7}
              onPress={() => setSelected(item)}
            >
              <View style={styles.sourceInfo}>
                {getValidLogoUrl(item.logo_url) && (
                  <View style={styles.logoContainer}>
                    <Image
                      source={{ uri: getValidLogoUrl(item.logo_url)! }}
                      style={{ width: LOGO_ROW_HEIGHT * 1.8, height: LOGO_ROW_HEIGHT * 1.2 }}
                      contentFit="contain"
                    />
                  </View>
                )}
                <Text style={styles.sourceName}>{item.name}</Text>
              </View>
              <View style={styles.spacer} />
              <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
            </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackSm,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  spacer: {
    flex: 1,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cbd5e1', // slate-300, a perfect middle ground
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sourceName: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: 16,
    color: theme.colors.onSurface,
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
