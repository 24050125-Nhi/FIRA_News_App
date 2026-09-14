import { newsApi } from '@/api/newsApi';
import { Article } from '@/data/news';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const getTimeAgo = (value?: string) => {
  if (!value) return 'Vừa xong';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
};

export default function ExploreScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showMoreHot, setShowMoreHot] = useState<boolean>(false);
  const { themeKey } = useTheme();
  const isDark = themeKey === 'dark';

  useEffect(() => {
    newsApi.getArticles().then(setArticles).catch(() => {});
  }, []);

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [articles]);

  const quanTamArticles = useMemo(() => {
    const list = sortedArticles.slice(0, showMoreHot ? 6 : 3);
    return list;
  }, [sortedArticles, showMoreHot]);

  const nong24hArticles = useMemo(() => {
    return sortedArticles.slice(3, 8);
  }, [sortedArticles]);

  const bgColor = isDark ? '#121214' : '#FFFFFF';
  const cardBorder = isDark ? '#1E1E22' : '#EFF2F5';
  const titleColor = isDark ? '#FFFFFF' : '#0F172A';
  const metaColor = isDark ? '#9CA3AF' : '#64748B';
  const sectionColor = isDark ? '#00D2B8' : '#009688';

  const renderArticleRow = (article: Article) => (
    <TouchableOpacity
      key={article.id}
      style={[styles.articleRow, { borderBottomColor: cardBorder }]}
      onPress={() => router.push({ pathname: '/article/[id]', params: { id: String(article.id) } })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: article.imageUrl }}
        style={styles.thumb}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.articleInfo}>
        <Text style={[styles.articleTitle, { color: titleColor }]} numberOfLines={3}>
          {article.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.sourceRed} numberOfLines={1}>
            {article.source || 'FIRA News'}
          </Text>
          <Text style={[styles.timeText, { color: metaColor }]}>
            {' '}· {getTimeAgo(article.publishedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      {/* Header bar */}
      <View style={[styles.headerBar, { borderBottomColor: cardBorder }]}>
        <Text style={[styles.headerTitle, { color: titleColor }]}>Xu hướng</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── SECTION 1: ĐANG ĐƯỢC QUAN TÂM ── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={16} color={sectionColor} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionHeading, { color: sectionColor }]}>
              ĐANG ĐƯỢC QUAN TÂM
            </Text>
          </View>

          {quanTamArticles.map(renderArticleRow)}

          {!showMoreHot && sortedArticles.length > 3 && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => setShowMoreHot(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.moreText}>Đọc thêm</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── SECTION 2: NÓNG 24H ── */}
        <View style={[styles.sectionWrap, { marginTop: 12 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={16} color={sectionColor} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionHeading, { color: sectionColor }]}>
              NÓNG 24H
            </Text>
          </View>

          {nong24hArticles.map(renderArticleRow)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionWrap: {
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  articleRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  thumb: {
    width: 98,
    height: 82,
    borderRadius: 8,
    backgroundColor: '#26262B',
  },
  articleInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  sourceRed: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  moreText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
});
