import { newsApi } from '@/api/newsApi';
import { Article, Category, articles as localArticles, categories as localCategories } from '@/data/news';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

type TopTab = {
  id: string;
  label: string;
  category?: string;
  onlyBreaking?: boolean;
  sort?: 'latest' | 'views';
};

const topTabs: TopTab[] = [
  { id: 'hot', label: 'Nóng', onlyBreaking: true },
  { id: 'latest', label: 'Mới', sort: 'latest' },
  { id: 'football', label: 'Bóng đá VN', category: 'the-thao' },
  { id: 'football_intl', label: 'Bóng đá QT', category: 'the-thao' },
  { id: 'tech', label: 'Công nghệ', category: 'cong-nghe' },
  { id: 'life', label: 'Đời sống', category: 'doi-song' },
];

const hashTags = ['Việt Nam', 'Khám phá thế giới', 'Lũ quét ở Nepal - Trung Quốc', 'Thể thao 24h', 'Kinh tế & Thị trường'];

const getTimeAgo = (value: string) => {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
};

const getVietnameseDate = () => {
  const date = new Date();
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date).replace('.', '');
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${weekday}, ${day} tháng ${month}, ${year}`;
};

export default function HomeScreen() {
  const [articles, setArticles] = useState<Article[]>(localArticles);
  const [categories, setCategories] = useState<Category[]>(localCategories);
  const [activeTab, setActiveTab] = useState('hot');
  const [keyword, setKeyword] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 380;

  const { themeKey } = useTheme();
  const isDark = themeKey === 'dark';

  const userAvatar = newsApi.getCurrentUser()?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  useEffect(() => {
    let mounted = true;
    setArticles(localArticles);
    setCategories(localCategories);
    setLoading(false);

    Promise.all([newsApi.getArticles({ sort: 'latest' }), newsApi.getCategories()])
      .then(([articleData, categoryData]) => {
        if (!mounted) return;
        if (articleData.length) setArticles(articleData);
        if (categoryData.length) setCategories(categoryData);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const feedArticles = useMemo(() => {
    const tab = topTabs.find((item) => item.id === activeTab) ?? topTabs[0];
    const lowerKeyword = keyword.trim().toLowerCase();

    let list = articles.filter((article) => !hiddenIds.includes(article.id));

    if (tab.category) {
      list = list.filter((article) => article.category === tab.category);
    } else if (tab.onlyBreaking) {
      list = list.filter((article) => article.isBreaking || article.isFeatured || (article.views || 0) > 1000);
    }

    if (lowerKeyword) {
      list = list.filter((article) =>
        article.title.toLowerCase().includes(lowerKeyword) ||
        article.summary.toLowerCase().includes(lowerKeyword) ||
        article.category.toLowerCase().includes(lowerKeyword)
      );
    }

    if (tab.sort === 'views') {
      return [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return list;
  }, [activeTab, articles, hiddenIds, keyword]);

  const videoArticles = useMemo(() => {
    return articles.filter((item) => item.tags?.includes('video') || item.category === 'the-thao' || item.category === 'giai-tri').slice(0, 6);
  }, [articles]);

  const clearOne = (id: number) => {
    setHiddenIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  const handleTabPress = (tab: TopTab) => {
    setActiveTab(tab.id);
    setKeyword('');
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const openCategory = (categoryId: string) => {
    const mapped = topTabs.find((tab) => tab.category === categoryId);
    if (mapped) setActiveTab(mapped.id);
    setMenuOpen(false);
  };

  const bgColor = isDark ? '#121214' : '#FFFFFF';
  const headerBg = isDark ? '#15181C' : '#078EAA';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar style="light" />
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        {!isDark && (
          <>
            <View style={styles.headerDecorOne} />
            <View style={styles.headerDecorTwo} />
          </>
        )}
        <View style={styles.topNavRow}>
          <Pressable style={styles.iconButton} onPress={() => setMenuOpen((value) => !value)} hitSlop={10}>
            <Ionicons name={menuOpen ? 'close' : 'menu'} size={30} color="#FFFFFF" />
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topTabsRow}>
            {topTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable key={tab.id} onPress={() => handleTabPress(tab)} style={styles.topTabButton} hitSlop={6}>
                  <Text style={[styles.topTabText, active && styles.topTabTextActive, isSmallPhone && styles.topTabTextSmall]}>
                    {tab.label}
                  </Text>
                  {active ? <View style={styles.topTabUnderline} /> : <View style={styles.topTabUnderlineGhost} />}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.iconButton} onPress={() => setSearchOpen((value) => !value)} hitSlop={10}>
            <Ionicons name="search" size={26} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.avatarButton} onPress={() => router.push('/profile')} hitSlop={10}>
            <Image source={{ uri: userAvatar }} style={styles.avatarImg} contentFit="cover" />
          </Pressable>
        </View>

        {searchOpen ? (
          <View style={[styles.searchBox, isDark && styles.searchBoxDark]}>
            <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#0997A6'} />
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Nhập từ khóa tìm kiếm tin tức..."
              placeholderTextColor="#94A3B8"
              style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
              autoFocus
            />
            {keyword ? (
              <Pressable onPress={() => setKeyword('')} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.dateRow}>
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={[styles.dateText, isDark && { color: '#CBD5E1' }]}>{getVietnameseDate()}</Text>
          </View>
        )}
      </View>

      {menuOpen ? (
        <View style={[styles.menuPanel, isDark && styles.menuPanelDark]}>
          <Text style={[styles.menuTitle, isDark && { color: '#FFFFFF' }]}>Chuyên mục nhanh</Text>
          <View style={styles.menuGrid}>
            {categories.filter((item) => item.id !== 'all').slice(0, 8).map((category) => (
              <Pressable
                key={category.id}
                style={[styles.menuItem, isDark && styles.menuItemDark]}
                onPress={() => openCategory(category.id)}
              >
                <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={18} color="#00D2B8" />
                <Text style={[styles.menuItemText, isDark && { color: '#FFFFFF' }]}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.savedShortcut} onPress={() => router.push('/saved')}>
            <Ionicons name="bookmark" size={18} color="#FFFFFF" />
            <Text style={styles.savedShortcutText}>Mở tin đã lưu</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView style={[styles.body, { backgroundColor: bgColor }]} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator>
        <MarqueeTopics
          tags={hashTags}
          width={width}
          isDark={isDark}
          onSelect={(item) => {
            setKeyword(item);
            setSearchOpen(true);
          }}
        />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#00D2B8" />
            <Text style={[styles.loadingText, isDark && { color: '#9CA3AF' }]}>Đang tải tin tức...</Text>
          </View>
        ) : null}

        {!loading && feedArticles.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="newspaper-outline" size={36} color="#94A3B8" />
            <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>Không có tin phù hợp</Text>
            <Text style={styles.emptyText}>Bạn thử đổi chuyên mục hoặc xóa từ khóa tìm kiếm nha.</Text>
            <Pressable style={styles.reloadButton} onPress={() => { setKeyword(''); setHiddenIds([]); setActiveTab('hot'); }}>
              <Text style={styles.reloadText}>Tải lại trang chủ</Text>
            </Pressable>
          </View>
        ) : null}

        {feedArticles.map((article, index) => (
          <View key={article.id}>
            <NewsRow article={article} onHide={clearOne} isSmallPhone={isSmallPhone} isDark={isDark} />
            {index === 1 ? <SponsoredCard compact isDark={isDark} /> : null}
            {index === 4 ? <VideoStrip articles={videoArticles} isDark={isDark} /> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MarqueeTopics({ tags, width, onSelect, isDark }: { tags: string[]; width: number; onSelect: (tag: string) => void; isDark: boolean }) {
  const slideX = useRef(new Animated.Value(0)).current;
  const topicList = useMemo(() => [...tags, ...tags, ...tags], [tags]);
  const travelDistance = Math.max(width * 1.6, 760);

  useEffect(() => {
    slideX.setValue(0);
    const animation = Animated.loop(
      Animated.timing(slideX, {
        toValue: -travelDistance,
        duration: 26000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [slideX, travelDistance]);

  return (
    <View style={[styles.marqueeOuter, isDark && styles.marqueeOuterDark]}>
      <Animated.View style={[styles.marqueeTrack, { transform: [{ translateX: slideX }] }]}>
        {topicList.map((tag, idx) => (
          <Pressable
            key={`${tag}-${idx}`}
            style={[styles.hashChip, isDark && styles.hashChipDark]}
            onPress={() => onSelect(tag)}
          >
            <Text style={[styles.hashText, isDark && styles.hashTextDark]}># {tag}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

function NewsRow({ article, onHide, isSmallPhone, isDark }: { article: Article; onHide: (id: number) => void; isSmallPhone: boolean; isDark: boolean }) {
  const isVideo = article.tags?.includes('video') || article.category === 'giai-tri';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.newsRow,
        isDark && styles.newsRowDark,
        pressed && (isDark ? styles.rowPressedDark : styles.rowPressed),
      ]}
      onPress={() => router.push({ pathname: '/article/[id]', params: { id: String(article.id) } })}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri: article.imageUrl }} style={styles.thumb} contentFit="cover" />
        {isVideo ? (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={14} color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <View style={styles.rowTextBox}>
        <Text style={[styles.rowTitle, isDark && styles.rowTitleDark, isSmallPhone && styles.rowTitleSmall]} numberOfLines={3}>
          {article.title}
        </Text>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceText} numberOfLines={1}>{article.source ?? 'FIRA News'}</Text>
          <Text style={[styles.timeText, isDark && styles.timeTextDark]}>· {getTimeAgo(article.publishedAt)}</Text>
        </View>
      </View>
      <Pressable
        style={[styles.closeNewsButton, isDark && styles.closeNewsButtonDark]}
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation?.();
          onHide(article.id);
        }}>
        <Ionicons name="close" size={13} color={isDark ? '#64748B' : '#B8BEC8'} />
      </Pressable>
    </Pressable>
  );
}

function SponsoredCard({ compact = false, isDark }: { compact?: boolean; isDark: boolean }) {
  return (
    <Pressable
      style={[
        styles.sponsoredRow,
        compact && styles.sponsoredRowCompact,
        isDark && styles.sponsoredRowDark,
      ]}
      onPress={() => router.push('/profile')}
    >
      <View style={styles.adImageBox}>
        <Ionicons name="megaphone" size={24} color="#FFFFFF" />
        <Text style={styles.adImageText}>ADS</Text>
      </View>
      <View style={styles.rowTextBox}>
        <Text style={[styles.rowTitle, isDark && styles.rowTitleDark]} numberOfLines={2}>
          Tối ưu kinh doanh với giải pháp Marketing số cho sinh viên
        </Text>
        <View style={styles.sourceRow}>
          <Text style={styles.adPill}>Tài trợ</Text>
          <Text style={[styles.timeText, isDark && styles.timeTextDark]}>· FIRA Business</Text>
        </View>
      </View>
    </Pressable>
  );
}

function VideoStrip({ articles, isDark }: { articles: Article[]; isDark: boolean }) {
  if (!articles.length) return null;
  return (
    <View style={[styles.videoSection, isDark && styles.videoSectionDark]}>
      <View style={styles.videoHeader}>
        <View style={styles.videoSourceIcon}>
          <Ionicons name="play" size={16} color="#FFFFFF" />
        </View>
        <Text style={[styles.videoTitle, isDark && styles.videoTitleDark]}>Zalo Video</Text>
        <Text style={styles.suggestPill}>Đề xuất</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videoList}>
        {articles.map((article) => (
          <Pressable key={article.id} style={styles.videoCard} onPress={() => router.push({ pathname: '/article/[id]', params: { id: String(article.id) } })}>
            <Image source={{ uri: article.imageUrl }} style={styles.videoImage} contentFit="cover" />
            <View style={styles.videoPlayCircle}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
            <Text style={[styles.videoCardTitle, isDark && styles.videoCardTitleDark]} numberOfLines={2}>
              {article.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#078EAA',
    paddingTop: Platform.OS === 'android' ? 26 : 6,
    paddingHorizontal: 12,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  headerDecorOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,196,176,0.28)',
    left: -70,
    top: -84,
  },
  headerDecorTwo: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0,73,162,0.32)',
    right: -80,
    top: -88,
  },
  topNavRow: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 38, height: 42, alignItems: 'center', justifyContent: 'center' },
  avatarButton: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', marginLeft: 6 },
  avatarImg: { width: '100%', height: '100%' },
  topTabsRow: { alignItems: 'center', paddingHorizontal: 4 },
  topTabButton: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, height: 46 },
  topTabText: { color: 'rgba(255,255,255,0.65)', fontSize: 18, fontWeight: '700' },
  topTabTextSmall: { fontSize: 16 },
  topTabTextActive: { color: '#FFFFFF', fontWeight: '900' },
  topTabUnderline: { height: 3, width: 32, borderRadius: 999, backgroundColor: '#FFFFFF', marginTop: 4 },
  topTabUnderlineGhost: { height: 3, width: 32, marginTop: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  calendarIcon: { fontSize: 16 },
  dateText: { color: '#E9FFFE', fontSize: 14, fontWeight: '700' },
  searchBox: {
    marginTop: 8,
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBoxDark: {
    backgroundColor: '#222226',
  },
  searchInput: { flex: 1, color: '#111827', fontSize: 14, fontWeight: '700' },
  menuPanel: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 9,
  },
  menuPanelDark: {
    backgroundColor: '#18181C',
    borderBottomColor: '#26262B',
  },
  menuTitle: { color: '#111827', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#F1F8F8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  menuItemDark: { backgroundColor: '#242429' },
  menuItemText: { color: '#0F172A', fontWeight: '800' },
  savedShortcut: { marginTop: 12, backgroundColor: '#009688', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  savedShortcutText: { color: '#FFFFFF', fontWeight: '900' },
  body: { flex: 1, backgroundColor: '#FFFFFF' },
  bodyContent: { paddingBottom: 146 },
  marqueeOuter: { height: 48, borderBottomWidth: 1, borderBottomColor: '#EFF2F5', overflow: 'hidden', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  marqueeOuterDark: { backgroundColor: '#121214', borderBottomColor: '#1E1E22' },
  marqueeTrack: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 10 },
  hashChip: { backgroundColor: '#F1F3F5', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  hashChipDark: { backgroundColor: '#202024' },
  hashText: { color: '#6B7280', fontSize: 13, fontWeight: '700' },
  hashTextDark: { color: '#CBD5E1' },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  loadingText: { color: '#64748B', fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 50 },
  emptyTitle: { color: '#111827', fontSize: 18, fontWeight: '900', marginTop: 10 },
  emptyText: { color: '#6B7280', textAlign: 'center', lineHeight: 20, marginTop: 5 },
  reloadButton: { backgroundColor: '#009688', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11, marginTop: 14 },
  reloadText: { color: '#FFFFFF', fontWeight: '900' },
  newsRow: { minHeight: 118, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EFF2F5', backgroundColor: '#FFFFFF' },
  newsRowDark: { backgroundColor: '#121214', borderBottomColor: '#1E1E22' },
  rowPressed: { backgroundColor: '#F8FAFC' },
  rowPressedDark: { backgroundColor: '#1A1A1E' },
  thumbWrap: { width: 104, height: 84, borderRadius: 8, overflow: 'hidden', backgroundColor: '#E5E7EB' },
  thumb: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', left: 6, bottom: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(17,24,39,0.7)', alignItems: 'center', justifyContent: 'center' },
  rowTextBox: { flex: 1, paddingLeft: 12, paddingRight: 6, alignSelf: 'stretch', justifyContent: 'center' },
  rowTitle: { color: '#202124', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  rowTitleDark: { color: '#FFFFFF' },
  rowTitleSmall: { fontSize: 14, lineHeight: 19 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 4 },
  sourceText: { color: '#EF4444', fontSize: 12, fontWeight: '800', maxWidth: 140 },
  timeText: { color: '#8B8F98', fontSize: 12, fontWeight: '600' },
  timeTextDark: { color: '#9CA3AF' },
  closeNewsButton: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#DCDDDF', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  closeNewsButtonDark: { borderColor: '#2E2E34', backgroundColor: '#18181C' },
  sponsoredRow: { minHeight: 118, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EFF2F5', backgroundColor: '#FFFFFF' },
  sponsoredRowDark: { backgroundColor: '#15181C', borderBottomColor: '#1E1E22' },
  sponsoredRowCompact: { backgroundColor: '#FBFCFD' },
  adImageBox: { width: 104, height: 84, borderRadius: 8, backgroundColor: '#1677FF', alignItems: 'center', justifyContent: 'center', gap: 4 },
  adImageText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  adPill: { color: '#8B8F98', fontSize: 12, borderWidth: 1, borderColor: '#D5D8DE', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, fontWeight: '600' },
  videoSection: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFF2F5', paddingVertical: 12 },
  videoSectionDark: { backgroundColor: '#15181C', borderBottomColor: '#1E1E22' },
  videoHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 10, gap: 8 },
  videoSourceIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  videoTitle: { color: '#374151', fontSize: 15, fontWeight: '700' },
  videoTitleDark: { color: '#9CA3AF' },
  suggestPill: { color: '#8B8F98', borderWidth: 1, borderColor: '#D8DBE1', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, fontSize: 11, fontWeight: '700' },
  videoList: { paddingHorizontal: 14, gap: 10 },
  videoCard: { width: 170 },
  videoImage: { width: 170, height: 96, borderRadius: 8, backgroundColor: '#E5E7EB' },
  videoPlayCircle: { position: 'absolute', top: 32, left: 69, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(17,24,39,0.6)', alignItems: 'center', justifyContent: 'center' },
  videoCardTitle: { color: '#202124', fontSize: 13, lineHeight: 18, fontWeight: '700', marginTop: 6 },
  videoCardTitleDark: { color: '#FFFFFF' },
});
