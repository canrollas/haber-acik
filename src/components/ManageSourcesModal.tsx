import { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { fetchSources } from '../services/api';
import { Source } from '../types/article';
import { getValidLogoUrl } from '../utils/image';

interface ManageSourcesModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ManageSourcesModal({ visible, onClose }: ManageSourcesModalProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(theme);
  const { followedSources, toggleSource } = usePreferences();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSources = () => {
    setLoading(true);
    fetchSources()
      .then(response => {
        setSources(response.data);
        setError(null);
      })
      .catch(err => {
        setError('Kaynaklar yüklenirken bir hata oluştu.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!visible || sources.length > 0) return;
    loadSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, sources.length]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Kaynakları Yönet</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Takip ettiğiniz kaynakların haberleri akışınızda öne çıkar.</Text>
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
          <ScrollView contentContainerStyle={styles.content}>
            {sources.map((item, index) => {
              const selected = followedSources.includes(item.slug);
              return (
                <TouchableOpacity
                  key={item.slug}
                  style={[styles.row, index === sources.length - 1 && styles.rowLast]}
                  onPress={() => toggleSource(item.slug)}
                  activeOpacity={0.7}
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
                  <Text style={styles.label}>{item.name}</Text>
                  <View style={styles.spacer} />
                  {selected && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.marginMobile,
      paddingVertical: theme.spacing.stackSm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.surfaceContainerLowest,
    },
    title: {
      fontFamily: theme.typography.headlineMd.fontFamily,
      fontSize: theme.typography.headlineMd.fontSize,
      color: theme.colors.onSurface,
    },
    hint: {
      fontFamily: theme.typography.labelSm.fontFamily,
      fontSize: theme.typography.labelSm.fontSize,
      color: theme.colors.onSurfaceVariant,
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: theme.spacing.stackSm,
    },
    content: {
      padding: theme.spacing.marginMobile,
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
    label: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 15,
      color: theme.colors.onSurface,
      flexShrink: 1,
    },
    spacer: {
      flex: 1,
    },
  });
}
