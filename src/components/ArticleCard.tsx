import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AppTheme } from '../theme/theme';
import { useAppTheme } from '../theme/ThemeContext';

export type ArticleVariant = 'featured' | 'standard' | 'horizontal';

interface ArticleCardProps {
  variant: ArticleVariant;
  imageUrl: string;
  category: string;
  title: string;
  source: string;
  timeAgo: string;
  description?: string;
  readTime?: string;
  url?: string;
}

export default function ArticleCard({
  variant,
  imageUrl,
  category,
  title,
  source,
  timeAgo,
  description,
  readTime,
  url,
}: ArticleCardProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(theme);

  const handlePress = () => {
    if (url) {
      WebBrowser.openBrowserAsync(url);
    }
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredShadowWrap} activeOpacity={0.9} onPress={handlePress}>
        <View style={styles.featuredContainer}>
          <Image source={{ uri: imageUrl }} style={styles.featuredImage} />
          <View style={styles.scrimLayer1} />
          <View style={styles.scrimLayer2} />
          <View style={styles.scrimLayer3} />
          <View style={styles.featuredContent}>
            <View style={styles.metaRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{category}</Text>
              </View>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.featuredTimeText}>{timeAgo}</Text>
              </View>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>{title}</Text>
            {description && (
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {description}
              </Text>
            )}
            <View style={styles.featuredFooter}>
              <Text style={styles.featuredFooterText}>Kaynak: {source}</Text>
              {readTime && (
                <>
                  <View style={styles.dot} />
                  <Text style={styles.featuredFooterText}>Okuma Süresi: {readTime}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.horizontalContainer} activeOpacity={0.8} onPress={handlePress}>
        <Image source={{ uri: imageUrl }} style={styles.horizontalImage} />
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalMeta}>
            <Text style={[styles.standardCategory, styles.noMarginRight]} numberOfLines={1}>{category}</Text>
            <Text style={styles.dotDark}>•</Text>
            <Text style={styles.standardTime} numberOfLines={1}>{timeAgo}</Text>
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={3}>{title}</Text>
          <View style={styles.horizontalFooter}>
            <Text style={styles.sourceText}>{source}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // standard variant
  return (
    <TouchableOpacity style={styles.standardContainer} activeOpacity={0.85} onPress={handlePress}>
      <View style={styles.standardImageWrap}>
        <Image source={{ uri: imageUrl }} style={styles.standardImage} />
        <View style={styles.sourceChip}>
          <Text style={styles.sourceChipText} numberOfLines={1}>{source}</Text>
        </View>
      </View>
      <View style={styles.standardContent}>
        <View style={styles.standardMetaRow}>
          <Text style={styles.standardCategory} numberOfLines={1}>{category}</Text>
          <Text style={styles.standardTime} numberOfLines={1}>{timeAgo}</Text>
        </View>
        <Text style={styles.standardTitle} numberOfLines={2}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function useStyles(theme: AppTheme) {
  return StyleSheet.create({
  // Featured Styles
  // iOS clips shadows on views with overflow: 'hidden', so the shadow lives on an
  // outer wrapper and the rounded image clipping happens on an inner view.
  featuredShadowWrap: {
    width: '100%',
    borderRadius: theme.rounded.xl,
    ...theme.shadows.card,
  },
  featuredContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: theme.rounded.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(11,28,48,0.08)',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  // Layered scrim approximates a bottom-to-top gradient without a native gradient dependency.
  scrimLayer1: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '90%',
    backgroundColor: 'rgba(4,8,20,0.20)',
  },
  scrimLayer2: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    backgroundColor: 'rgba(4,8,20,0.28)',
  },
  scrimLayer3: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '32%',
    backgroundColor: 'rgba(4,8,20,0.35)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.rounded.full,
    marginRight: 8,
  },
  categoryBadgeText: {
    color: theme.colors.onPrimary,
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredTimeText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
  },
  featuredTitle: {
    color: '#ffffff',
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    lineHeight: theme.typography.headlineMd.lineHeight,
    marginBottom: 8,
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredFooterText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // Standard Styles
  standardContainer: {
    flex: 1,
    borderRadius: theme.rounded.lg,
    backgroundColor: theme.colors.surfaceContainerLowest,
    ...theme.shadows.card,
  },
  standardImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderTopLeftRadius: theme.rounded.lg,
    borderTopRightRadius: theme.rounded.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceContainer,
  },
  standardImage: {
    width: '100%',
    height: '100%',
  },
  sourceChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: '70%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.rounded.full,
    backgroundColor: 'rgba(4,8,20,0.55)',
  },
  sourceChipText: {
    color: '#ffffff',
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: 11,
    fontWeight: '500',
  },
  standardContent: {
    padding: 12,
  },
  standardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  standardCategory: {
    flexShrink: 1,
    color: theme.colors.primary,
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    textTransform: 'uppercase',
    marginRight: 8,
  },
  standardTime: {
    flexShrink: 0,
    color: theme.colors.onSurfaceVariant,
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
  },
  noMarginRight: {
    marginRight: 0,
  },
  standardTitle: {
    color: theme.colors.onSurface,
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: 15,
    lineHeight: 19,
    marginBottom: 10,
  },
  sourceText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: theme.typography.labelSm.fontFamily,
    fontSize: theme.typography.labelSm.fontSize,
    fontWeight: '500',
  },

  // Horizontal Styles
  horizontalContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: theme.rounded.lg,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 16,
    ...theme.shadows.sm,
  },
  horizontalImage: {
    width: 96,
    height: 96,
    borderRadius: theme.rounded.md,
  },
  horizontalContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  horizontalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dotDark: {
    color: theme.colors.outline,
    fontSize: 12,
  },
  horizontalTitle: {
    color: theme.colors.onSurface,
    fontFamily: theme.typography.headlineMd.fontFamily,
    fontSize: theme.typography.headlineMd.fontSize,
    lineHeight: 24, // slightly tighter
    marginBottom: 8,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
}
