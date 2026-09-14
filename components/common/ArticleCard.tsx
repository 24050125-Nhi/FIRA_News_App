import { Article, formatDate, getCategoryColor, getCategoryName } from '@/data/news';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  article: Article;
  compact?: boolean;
  horizontal?: boolean;
  saved?: boolean;
};

export function ArticleCard({ article, compact = false, horizontal = false, saved = false }: Props) {
  const categoryColor = getCategoryColor(article.category);

  if (horizontal) {
    return (
      <Pressable
        style={({ pressed }) => [styles.horizontalCard, pressed && styles.pressed]}
        onPress={() => router.push({ pathname: '/article/[id]', params: { id: String(article.id) } })}>
        <Image source={{ uri: article.imageUrl }} style={styles.horizontalImage} contentFit="cover" />
        <View style={styles.horizontalOverlay} />
        <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}> 
          <Text style={styles.categoryPillText}>{getCategoryName(article.category)}</Text>
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={3}>{article.title}</Text>
          <View style={styles.darkFooter}>
            <Ionicons name="eye-outline" size={14} color="#F8FAFC" />
            <Text style={styles.darkFooterText}>{article.views.toLocaleString('vi-VN')}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}
      onPress={() => router.push({ pathname: '/article/[id]', params: { id: String(article.id) } })}>
      <Image source={{ uri: article.imageUrl }} style={[styles.image, compact && styles.compactImage]} contentFit="cover" />
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={[styles.category, { color: categoryColor }]}>{getCategoryName(article.category)}</Text>
          {article.isBreaking ? <Text style={styles.breaking}>NÓNG</Text> : null}
          {saved ? <Ionicons name="bookmark" size={14} color="#E11D48" /> : null}
        </View>
        <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={compact ? 2 : 3}>
          {article.title}
        </Text>
        {!compact ? (
          <Text style={styles.summary} numberOfLines={2}>
            {article.summary}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.footerText}>{article.readTime}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="eye-outline" size={14} color="#64748B" />
            <Text style={styles.footerText}>{article.views.toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="heart-outline" size={14} color="#64748B" />
            <Text style={styles.footerText}>{Number(article.likes || 0).toLocaleString('vi-VN')}</Text>
          </View>
        </View>
        {!compact ? <Text style={styles.date}>{formatDate(article.publishedAt)}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  compactCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  image: {
    width: '100%',
    height: 190,
    backgroundColor: '#E2E8F0',
  },
  compactImage: {
    width: 118,
    height: 112,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  breaking: {
    backgroundColor: '#FFE4E6',
    color: '#BE123C',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  title: {
    color: '#0F172A',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '900',
  },
  compactTitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  summary: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  horizontalCard: {
    width: 238,
    height: 196,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111827',
    marginRight: 14,
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.42)',
  },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  horizontalContent: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    gap: 8,
  },
  horizontalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },
  darkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  darkFooterText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
});
