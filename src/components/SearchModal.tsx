import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import { fetchArticles } from '../services/api';
import { Article } from '../types/article';
import { timeAgo } from '../utils/date';
import { getValidImageUrl } from '../utils/image';
import * as WebBrowser from 'expo-web-browser';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SearchModal({ visible, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetchArticles({ search: trimmed, limit: 15 });
        setResults(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [trimmed]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  const handlePress = async (url: string) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: theme.colors.primary,
      });
    } catch (e) {
      console.log('Browser error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.inputWrap}>
            <Ionicons name="search" size={18} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={styles.input}
              placeholder="Haberlerde ara..."
              placeholderTextColor={theme.colors.outline}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={theme.colors.outline} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {trimmed === '' && (
            <Text style={styles.hintText}>Başlık veya kategoriye göre arayın.</Text>
          )}
          {trimmed !== '' && results.length === 0 && !loading && (
            <Text style={styles.hintText}>“{query}” ile eşleşen bir haber bulunamadı.</Text>
          )}
          {loading && trimmed !== '' && (
            <Text style={styles.hintText}>Aranıyor...</Text>
          )}
          {results.map(article => (
            <TouchableOpacity 
              key={article.id} 
              style={styles.resultRow} 
              activeOpacity={0.8}
              onPress={() => handlePress(article.url)}
            >
              <Image source={{ uri: getValidImageUrl(article.image_url) }} style={styles.resultImage} />
              <View style={styles.resultText}>
                <Text style={styles.resultCategory}>{article.category || article.source}</Text>
                <Text style={styles.resultTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={styles.resultMeta}>
                  {article.source} · {timeAgo(article.publication_date || article.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.stackSm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.rounded.full,
    paddingHorizontal: 14,
    height: 44,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    color: theme.colors.onSurface,
    padding: 0,
  },
  cancelText: {
    fontFamily: theme.typography.labelMd.fontFamily,
    fontSize: theme.typography.labelMd.fontSize,
    color: theme.colors.primary,
  },

  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
  },
  hintText: {
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: theme.spacing.stackLg,
  },

  resultRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: theme.rounded.md,
    backgroundColor: theme.colors.surfaceContainer,
  },
  resultText: {
    flex: 1,
  },
  resultCategory: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  resultTitle: {
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: 15,
    lineHeight: 19,
    color: theme.colors.onBackground,
    marginBottom: 4,
  },
  resultMeta: {
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
});
}
