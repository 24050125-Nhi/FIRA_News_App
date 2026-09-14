/**
 * giao-dien.tsx — Màn hình chọn Giao diện (Theme)
 * Layout: XEM TRƯỚC (carousel 3 màn mini phone mockup) → THEME swatches → Theo hệ thống
 */
import { THEME_META, ThemeColors, ThemeKey, THEMES, useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SW } = Dimensions.get('window');

// Kích thước chuẩn tỉ lệ điện thoại mini (Mockup phone)
const CARD_W = Math.min(225, Math.round(SW * 0.58));
const CARD_H = Math.round(CARD_W * 1.62);
const GAP = 14;

// ─── Component: Notch / Tai thỏ giả lập điện thoại ─────────────────────────────
function PhoneSpeaker() {
  return (
    <View style={styles.phoneSpeakerWrap}>
      <View style={styles.phoneSpeaker} />
    </View>
  );
}

// ─── Component: Home Bar giả lập điện thoại ───────────────────────────────────
function PhoneHomeBar({ color }: { color?: string }) {
  return (
    <View style={styles.homeBarWrap}>
      <View style={[styles.homeBar, color ? { backgroundColor: color } : null]} />
    </View>
  );
}

// ─── Card 1: Trang chủ / Tin tức ──────────────────────────────────────────────
function NewsCard({ t }: { t: ThemeColors }) {
  return (
    <View style={[styles.card, { backgroundColor: t.background, width: CARD_W, height: CARD_H, borderColor: t.border }]}>
      <PhoneSpeaker />

      {/* Header */}
      <LinearGradient colors={t.headerGradient} style={styles.cardHeader}>
        <View style={styles.cardHeaderTabs}>
          {['Tin nóng', 'Mới', 'Video'].map((tab, i) => (
            <Text
              key={i}
              style={[
                styles.cardHeaderTab,
                i === 0
                  ? { color: '#fff', fontWeight: '800', borderBottomWidth: 1.5, borderBottomColor: '#fff' }
                  : { color: 'rgba(255,255,255,0.75)' },
              ]}
            >
              {tab}
            </Text>
          ))}
          <Ionicons name="search" size={10} color="rgba(255,255,255,0.85)" style={{ marginLeft: 'auto' }} />
          <View style={[styles.cardAvatar, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
        </View>
        <View style={[styles.cardWeather, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
          <Ionicons name="partly-sunny" size={8} color="#FFD700" />
          <Text style={styles.cardWeatherText}> 31° • TP.HCM</Text>
          <View style={[styles.cardBadge, { backgroundColor: '#E53935' }]}>
            <Text style={styles.cardBadgeText}>24H</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Article row */}
      <View style={styles.cardArticle}>
        <View style={[styles.cardThumb, { backgroundColor: t.surface }]}>
          <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 6 }}>🏡</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[styles.cardArticleTitle, { color: t.text }]} numberOfLines={2}>
            Chàng trai lên rừng xây nhà, phát triển du lịch bền vững
          </Text>
          <Text style={[styles.cardSource, { color: t.textSub }]}>infonet • 15 phút</Text>
        </View>
      </View>

      {/* Featured image banner */}
      <View style={[styles.cardFeatured, { flex: 1, overflow: 'hidden' }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80' }}
          defaultSource={require('@/assets/images/preview_home.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>

      {/* See all */}
      <Text style={[styles.cardSeeAll, { color: t.primary }]}>Xem toàn cảnh ›</Text>

      {/* Tab bar */}
      <View style={[styles.cardTabBar, { backgroundColor: t.tabBar, borderTopColor: t.border }]}>
        {[
          { icon: 'list', label: 'Tin tức', active: true },
          { icon: 'play-circle-outline', label: 'Video' },
          { icon: 'trending-up', label: 'Xu hướng' },
          { icon: 'grid-outline', label: 'Tiện ích' },
        ].map((tab, i) => (
          <View key={i} style={styles.cardTabItem}>
            {tab.active ? (
              <View style={{
                backgroundColor: t.primary,
                borderRadius: 6,
                paddingHorizontal: 5,
                paddingVertical: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name={tab.icon as any} size={10} color="#fff" />
              </View>
            ) : (
              <Ionicons name={tab.icon as any} size={11} color={t.textSub} />
            )}
            <Text style={[styles.cardTabLabel, { color: tab.active ? t.primary : t.textSub, fontWeight: tab.active ? '700' : '400' }]}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <PhoneHomeBar color={t.textSub + '35'} />
    </View>
  );
}

// ─── Card 2: Chi tiết bài báo ─────────────────────────────────────────────────
function ArticleCard({ t }: { t: ThemeColors }) {
  return (
    <View style={[styles.card, { backgroundColor: t.background, width: CARD_W, height: CARD_H, borderColor: t.border }]}>
      <PhoneSpeaker />

      {/* Header */}
      <View style={styles.cardDetailHeader}>
        <Ionicons name="chevron-back" size={13} color={t.text} />
        <View style={styles.cardDetailLogo}>
          <Text style={[styles.cardDetailLogoText, { color: t.primary, fontWeight: '800' }]}>GIA ĐÌNH</Text>
          <Text style={[styles.cardDetailLogoText, { color: t.textSub }]}>VIỆT NAM</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={12} color={t.textSub} />
      </View>

      {/* Title */}
      <Text style={[styles.cardDetailTitle, { color: t.text }]} numberOfLines={2}>
        Bồi đắp tri thức qua những tủ sách quý
      </Text>

      {/* Lead */}
      <Text style={[styles.cardDetailLead, { color: t.textSub }]} numberOfLines={2}>
        &quot;Tủ sách vàng&quot; gắn bó với thiếu nhi, &quot;Việt Nam danh tác&quot; dành cho người yêu văn chương...
      </Text>

      {/* Image Banner */}
      <View style={[styles.cardDetailImg, { flex: 1, overflow: 'hidden' }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80' }}
          defaultSource={require('@/assets/images/preview_article.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>

      {/* Author */}
      <Text style={[styles.cardDetailAuthor, { color: t.textSub }]} numberOfLines={1}>
        Huỳnh Kim Liên, Phùng Nguyễn Quang...
      </Text>

      {/* Actions */}
      <View style={styles.cardDetailActions}>
        <View style={[styles.cardMoreBtn, { borderColor: t.primary }]}>
          <Ionicons name="layers-outline" size={8} color={t.primary} />
          <Text style={[styles.cardMoreBtnText, { color: t.primary }]}>XEM TIN KHÁC</Text>
        </View>
        <View style={styles.cardDetailIcons}>
          <View style={styles.cardDetailIconItem}>
            <Ionicons name="headset-outline" size={11} color={t.textSub} />
            <Text style={[styles.cardDetailIconLabel, { color: t.textSub }]}>Nghe</Text>
          </View>
          <View style={styles.cardDetailIconItem}>
            <Ionicons name="share-outline" size={11} color={t.textSub} />
            <Text style={[styles.cardDetailIconLabel, { color: t.textSub }]}>Chia sẻ</Text>
          </View>
        </View>
      </View>

      {/* Scroll indicator bar */}
      <View style={[styles.cardScrollBar, { backgroundColor: t.border }]}>
        <View style={[styles.cardScrollIndicator, { backgroundColor: t.primary }]} />
      </View>

      <PhoneHomeBar color={t.textSub + '35'} />
    </View>
  );
}

// ─── Card 3: Video / Đa phương tiện ───────────────────────────────────────────
function VideoCard({ t }: { t: ThemeColors }) {
  return (
    <View style={[styles.card, { backgroundColor: t.background, width: CARD_W, height: CARD_H, borderColor: t.border }]}>
      <PhoneSpeaker />

      {/* Category chips */}
      <View style={styles.videoChipRow}>
        {['Mới 🔥', 'OMG', '2tek', 'Du lịch'].map((chip, i) => (
          <View
            key={i}
            style={[
              styles.videoChip,
              {
                backgroundColor: i === 0 ? t.primary + '20' : t.surface,
                borderColor: i === 0 ? t.primary : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.videoChipText,
                { color: i === 0 ? t.primary : t.textSub, fontWeight: i === 0 ? '700' : '400' },
              ]}
            >
              {chip}
            </Text>
          </View>
        ))}
      </View>

      {/* Main video thumbnail */}
      <View style={[styles.videoMain, { flex: 1, overflow: 'hidden' }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' }}
          defaultSource={require('@/assets/images/preview_video.png')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.videoPlayBtn}>
          <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 1.5 }} />
        </View>
      </View>

      {/* Video info */}
      <View style={styles.videoInfo}>
        <View style={styles.videoInfoRow}>
          <Text style={[styles.videoCat, { color: t.primary }]}>XÂY DỰNG</Text>
          <Ionicons name="ellipsis-horizontal" size={11} color={t.textSub} />
        </View>
        <Text style={[styles.videoTitle, { color: t.text }]} numberOfLines={2}>
          Khu bảo tồn có rừng nhiệt đới triệu năm tuổi ở Malaysia
        </Text>
      </View>

      {/* Small thumbnail item */}
      <View style={styles.videoSmallRow}>
        <View style={[styles.videoSmallThumb, { backgroundColor: '#E65100' }]}>
          <Text style={{ fontSize: 11, textAlign: 'center', marginTop: 3 }}>🌅</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[styles.videoSmallText, { color: t.text }]} numberOfLines={1}>
            Bình minh tuyệt đẹp trên vịnh đảo ngọc
          </Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={[styles.cardTabBar, { backgroundColor: t.tabBar, borderTopColor: t.border }]}>
        {[
          { icon: 'list-outline', label: 'Tin Tức' },
          { icon: 'play-circle', label: 'Video', active: true },
          { icon: 'trending-up', label: 'Xu hướng' },
          { icon: 'grid-outline', label: 'Tiện ích' },
        ].map((tab, i) => (
          <View key={i} style={styles.cardTabItem}>
            <Ionicons name={tab.icon as any} size={12} color={tab.active ? t.primary : t.textSub} />
            <Text style={[styles.cardTabLabel, { color: tab.active ? t.primary : t.textSub }]}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <PhoneHomeBar color={t.textSub + '35'} />
    </View>
  );
}

// ─── Carousel wrapper ─────────────────────────────────────────────────────────
function AppPreview({ themeKey }: { themeKey: ThemeKey }) {
  const t = THEMES[themeKey];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToIndex = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * (CARD_W + GAP), animated: true });
    setActiveIndex(idx);
  };

  const labels = ['Trang chủ', 'Bài viết', 'Video'];

  return (
    <View style={styles.previewContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        snapToInterval={CARD_W + GAP}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.carouselContent,
          { paddingHorizontal: (SW - CARD_W) / 2 },
        ]}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + GAP));
          setActiveIndex(Math.max(0, Math.min(2, idx)));
        }}
      >
        <NewsCard t={t} />
        <ArticleCard t={t} />
        <VideoCard t={t} />
      </ScrollView>

      {/* 3 mini pill indicators */}
      <View style={styles.dotIndicators}>
        {labels.map((label, i) => {
          const isActive = activeIndex === i;
          return (
            <Pressable
              key={i}
              onPress={() => scrollToIndex(i)}
              style={[
                styles.indicatorPill,
                isActive
                  ? { backgroundColor: t.primary + '18', borderColor: t.primary }
                  : { backgroundColor: t.surface, borderColor: 'transparent' },
              ]}
            >
              <View
                style={[
                  styles.indicatorDot,
                  { backgroundColor: isActive ? t.primary : t.textSub + '50' },
                ]}
              />
              <Text
                style={[
                  styles.indicatorText,
                  { color: isActive ? t.primary : t.textSub, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function GiaoDienScreen() {
  const insets = useSafeAreaInsets();
  const { themeKey, setTheme, followSystem, setFollowSystem } = useTheme();

  const currentTheme = THEMES[themeKey];
  const visibleThemes = THEME_META;

  return (
    <View style={[styles.root, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 8,
        backgroundColor: currentTheme.headerBg,
        borderBottomColor: currentTheme.border,
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={currentTheme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Giao diện</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* XEM TRƯỚC */}
        <Text style={[styles.sectionLabel, { color: currentTheme.textSub }]}>XEM TRƯỚC</Text>
        <AppPreview themeKey={themeKey} />

        {/* THEME swatches */}
        <Text style={[styles.sectionLabel, { color: currentTheme.textSub }]}>THEME</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.swatchRow}
        >
          {visibleThemes.map((meta: { key: ThemeKey; label: string; swatch: string }) => {
            const isSelected = themeKey === meta.key;
            return (
              <Pressable key={meta.key} style={styles.swatchItem} onPress={() => setTheme(meta.key)}>
                <View style={[
                  styles.swatchColor,
                  { backgroundColor: meta.swatch },
                  isSelected && [styles.swatchSelected, { borderColor: currentTheme.primary }],
                ]} />
                <Text style={[
                  styles.swatchLabel,
                  { color: isSelected ? currentTheme.primary : currentTheme.textSub },
                  isSelected && styles.swatchLabelActive,
                ]}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Theo hệ thống */}
        <View style={[styles.systemRow, {
          backgroundColor: currentTheme.background,
          borderTopColor: currentTheme.border,
          borderBottomColor: currentTheme.border,
        }]}>
          <View style={styles.systemText}>
            <Text style={[styles.systemTitle, { color: currentTheme.text }]}>Theo hệ thống</Text>
            <Text style={[styles.systemSub, { color: currentTheme.textSub }]}>
              Giao diện sẽ thay đổi tự động theo tùy chọn hệ thống
            </Text>
          </View>
          <Switch
            value={followSystem}
            onValueChange={setFollowSystem}
            trackColor={{ false: '#ccc', true: currentTheme.primary }}
            thumbColor="#fff"
            ios_backgroundColor="#ccc"
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const SWATCH_W = 64;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scroll: { paddingTop: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },

  // ── Preview Container ──────────────────────────────────────────────────────
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  carouselContent: {
    gap: GAP,
    paddingVertical: 10,
    alignItems: 'center',
  },

  // ── Phone Mockup Card ──────────────────────────────────────────────────────
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  phoneSpeakerWrap: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 3,
    backgroundColor: 'transparent',
  },
  phoneSpeaker: {
    width: 34,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  homeBarWrap: {
    alignItems: 'center',
    paddingVertical: 3,
    backgroundColor: 'transparent',
  },
  homeBar: {
    width: 44,
    height: 2.5,
    borderRadius: 1.5,
  },

  // ── Indicators ────────────────────────────────────────────────────────────
  dotIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  indicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  indicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  indicatorText: {
    fontSize: 10,
  },

  // ── News card elements ────────────────────────────────────────────────────
  cardHeader: { paddingHorizontal: 7, paddingVertical: 5 },
  cardHeaderTabs: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  cardHeaderTab: { fontSize: 8.5 },
  cardAvatar: { width: 14, height: 14, borderRadius: 7, marginLeft: 3 },
  cardWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  cardWeatherText: { fontSize: 7.5, color: '#fff', flex: 1 },
  cardBadge: { borderRadius: 2.5, paddingHorizontal: 3, paddingVertical: 1 },
  cardBadgeText: { fontSize: 6.5, color: '#fff', fontWeight: '700' },
  cardArticle: { flexDirection: 'row', padding: 6, gap: 6 },
  cardThumb: { width: 44, height: 40, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  cardArticleTitle: { fontSize: 8.5, lineHeight: 11.5, fontWeight: '600' },
  cardSource: { fontSize: 7.5, marginTop: 2 },
  cardFeatured: {
    marginHorizontal: 6,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    minHeight: 50,
  },
  cardFeaturedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardSourceChip: {
    alignSelf: 'flex-start',
    margin: 4,
    borderRadius: 2.5,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  cardSourceChipText: { fontSize: 7, color: '#fff', fontWeight: '700' },
  cardFeaturedTitle: { fontSize: 9, lineHeight: 12, fontWeight: '700', color: '#fff', marginHorizontal: 5, marginBottom: 3 },
  cardDots: { flexDirection: 'row', gap: 3, marginHorizontal: 5, marginBottom: 4 },
  cardDot: { width: 4, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.6)' },
  cardSeeAll: { fontSize: 8.5, marginHorizontal: 6, marginVertical: 3, fontWeight: '600' },
  cardTabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingVertical: 4,
  },
  cardTabItem: { flex: 1, alignItems: 'center', gap: 1 },
  cardTabLabel: { fontSize: 7 },

  // ── Article card elements ─────────────────────────────────────────────────
  cardDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  cardDetailLogo: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  cardDetailLogoText: { fontSize: 8 },
  cardDetailTitle: { fontSize: 10, fontWeight: '800', lineHeight: 13, marginHorizontal: 6, marginBottom: 3 },
  cardDetailLead: { fontSize: 8, lineHeight: 11, marginHorizontal: 6, marginBottom: 4 },
  cardDetailImg: { marginHorizontal: 6, borderRadius: 6, marginBottom: 4, minHeight: 44, justifyContent: 'center' },
  cardDetailImgCaption: {
    position: 'absolute',
    bottom: 3,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  cardDetailImgCaptionText: { fontSize: 6.5, color: '#fff' },
  cardDetailAuthor: { fontSize: 7.5, marginHorizontal: 6, marginBottom: 3 },
  cardDetailActions: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6, marginBottom: 3 },
  cardMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  cardMoreBtnText: { fontSize: 7, fontWeight: '700' },
  cardDetailIcons: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  cardDetailIconItem: { alignItems: 'center', gap: 0.5 },
  cardDetailIconLabel: { fontSize: 6.5 },
  cardScrollBar: { height: 2, marginHorizontal: 6, borderRadius: 1, marginBottom: 2 },
  cardScrollIndicator: { width: 30, height: 2, borderRadius: 1 },

  // ── Video card elements ───────────────────────────────────────────────────
  videoChipRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 4,
  },
  videoChip: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  videoChipText: { fontSize: 7.5 },
  videoMain: {
    marginHorizontal: 6,
    borderRadius: 6,
    minHeight: 44,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayBtn: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 2.5,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  videoDurationText: { fontSize: 7, color: '#fff', fontWeight: '700' },
  videoInfo: { marginHorizontal: 6, marginTop: 4, marginBottom: 2 },
  videoInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 },
  videoCat: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },
  videoTitle: { fontSize: 8.5, lineHeight: 11.5, fontWeight: '600' },
  videoSmallRow: { flexDirection: 'row', paddingHorizontal: 6, gap: 5, marginBottom: 4 },
  videoSmallThumb: { width: 34, height: 22, borderRadius: 4 },
  videoSmallText: { fontSize: 7.5, lineHeight: 10 },

  // ── Swatches ───────────────────────────────────────────────────────────────
  swatchRow: { paddingHorizontal: 16, gap: 14 },
  swatchItem: { alignItems: 'center', width: SWATCH_W },
  swatchColor: {
    width: SWATCH_W,
    height: 52,
    borderRadius: 10,
    marginBottom: 6,
  },
  swatchSelected: { borderWidth: 3 },
  swatchLabel: { fontSize: 12 },
  swatchLabelActive: { fontWeight: '700' },

  // ── Theo hệ thống ──────────────────────────────────────────────────────────
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  systemText: { flex: 1, marginRight: 12 },
  systemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 3 },
  systemSub: { fontSize: 13, lineHeight: 18 },
});
