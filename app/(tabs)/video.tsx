import { newsApi } from '@/api/newsApi';
import { EmbeddedNewsVideo } from '@/components/video/EmbeddedNewsVideo';
import { VideoNews, videos as fallbackVideos } from '@/data/news';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function VideoScreen() {
  const [videos, setVideos] = useState<VideoNews[]>(fallbackVideos);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(fallbackVideos[0]?.id ?? null);
  const [loading, setLoading] = useState(false);

  const { themeKey } = useTheme();
  const isDark = themeKey === 'dark';

  useEffect(() => {
    let mounted = true;
    setVideos(fallbackVideos);
    setActiveVideoId((current) => current ?? fallbackVideos[0]?.id ?? null);
    setLoading(false);

    return () => {
      mounted = false;
    };
  }, []);

  const activeVideo = useMemo(() => videos.find((item) => item.id === activeVideoId) || videos[0], [activeVideoId, videos]);
  const otherVideos = useMemo(() => videos.filter((item) => item.id !== activeVideo?.id), [activeVideo?.id, videos]);

  const selectVideo = async (item: VideoNews) => {
    setActiveVideoId(item.id);
    newsApi.watchVideo(item.id).catch(() => undefined);
  };

  const openFullScreen = async (item: VideoNews) => {
    await selectVideo(item);
    router.push({ pathname: '/watch/[id]', params: { id: String(item.id) } } as any);
  };

  const bgColor = isDark ? '#121214' : '#F5F7FA';
  const cardBg = isDark ? '#18181C' : '#FFFFFF';
  const cardBorder = isDark ? '#242429' : '#E5E7EB';
  const titleColor = isDark ? '#FFFFFF' : '#0F172A';
  const subColor = isDark ? '#9CA3AF' : '#64748B';
  const headerBg = isDark ? '#15181C' : '#078EAA';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.playIcon, isDark && { backgroundColor: '#202024' }]}>
            <Ionicons name="play" size={22} color={isDark ? '#00D2B8' : '#078EAA'} />
          </View>
          <View style={styles.headerTextBox}>
            <Text style={styles.title}>Video</Text>
            <Text style={[styles.subtitle, isDark && { color: '#9CA3AF' }]}>
              {loading ? 'Đang tải video...' : 'Bản tin video xem trực tiếp như app báo'}
            </Text>
          </View>
        </View>
        <Pressable style={styles.headerButton} onPress={() => router.push('/profile' as any)}>
          <Ionicons name="person-circle" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeVideo ? (
          <View style={[styles.featuredCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.featuredTopRow}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Đang phát</Text>
              </View>
              <Text style={[styles.durationText, { color: subColor }]}>{activeVideo.duration}</Text>
            </View>
            <EmbeddedNewsVideo video={activeVideo} />
            <Text style={[styles.featuredTitle, { color: titleColor }]}>{activeVideo.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.sourceText}>{activeVideo.category}</Text>
              <Text style={[styles.metaText, { color: subColor }]}>• {Number(activeVideo.views || 0).toLocaleString('vi-VN')} lượt xem</Text>
            </View>
            {activeVideo.description ? (
              <Text style={[styles.description, { color: subColor }]}>{activeVideo.description}</Text>
            ) : null}
            <View style={styles.featuredActions}>
              <Pressable style={styles.mainButton} onPress={() => openFullScreen(activeVideo)}>
                <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
                <Text style={styles.mainButtonText}>Mở màn xem lớn</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, isDark && { backgroundColor: '#202024' }]} onPress={() => selectVideo(activeVideo)}>
                <Ionicons name="refresh" size={18} color={isDark ? '#00D2B8' : '#009688'} />
                <Text style={[styles.secondaryText, isDark && { color: '#00D2B8' }]}>Tải lại</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>Video tin tức mới</Text>
          <Text style={[styles.sectionHint, { color: subColor }]}>Bấm ảnh hoặc nút xem</Text>
        </View>

        {otherVideos.map((item, index) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.videoItem,
              { backgroundColor: cardBg, borderColor: cardBorder },
              pressed && styles.pressed,
            ]}
            onPress={() => selectVideo(item)}
          >
            <View style={styles.thumbBox}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} contentFit="cover" />
              <View style={styles.thumbOverlay} />
              <View style={styles.playSmall}>
                <Ionicons name="play" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.durationBadge}>{item.duration}</Text>
            </View>
            <View style={styles.itemInfo}>
              <View style={styles.itemTopRow}>
                <Text style={[styles.itemCategory, isDark && { color: '#00D2B8' }]}>{item.category}</Text>
                {index < 2 || item.isLive ? <Text style={styles.hotBadge}>HOT</Text> : null}
              </View>
              <Text numberOfLines={3} style={[styles.itemTitle, { color: titleColor }]}>{item.title}</Text>
              <View style={styles.itemBottomRow}>
                <View style={styles.viewsRow}>
                  <Ionicons name="eye-outline" size={14} color={subColor} />
                  <Text style={[styles.viewsText, { color: subColor }]}>{Number(item.views || 0).toLocaleString('vi-VN')}</Text>
                </View>
                <Pressable style={styles.watchButton} onPress={() => openFullScreen(item)}>
                  <Ionicons name="play-circle" size={17} color="#FFFFFF" />
                  <Text style={styles.watchText}>Xem</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#078EAA',
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  playIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  headerTextBox: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  subtitle: { color: '#D9FFFD', fontWeight: '700', marginTop: 2, fontSize: 12 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 14, paddingBottom: 160 },
  featuredCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  featuredTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E11D48', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  liveText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  durationText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
  featuredTitle: { color: '#0F172A', fontSize: 19, lineHeight: 26, fontWeight: '800', marginTop: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 7 },
  sourceText: { color: '#E11D48', fontSize: 13, fontWeight: '900' },
  metaText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  description: { color: '#475569', fontSize: 13, lineHeight: 20, fontWeight: '600', marginTop: 8 },
  featuredActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  mainButton: { flex: 1, backgroundColor: '#009688', borderRadius: 999, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  mainButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#ECFEFF', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  secondaryText: { color: '#009688', fontSize: 13, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20, marginBottom: 10 },
  sectionTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  sectionHint: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  videoItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 10, gap: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  pressed: { opacity: 0.84 },
  thumbBox: { width: 120, height: 86, borderRadius: 10, overflow: 'hidden', backgroundColor: '#CBD5E1' },
  thumbnail: { width: '100%', height: '100%' },
  thumbOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.22)' },
  playSmall: { position: 'absolute', left: 44, top: 26, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', right: 6, bottom: 6, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, fontSize: 10, fontWeight: '800', overflow: 'hidden' },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemCategory: { color: '#0891B2', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  hotBadge: { color: '#FFFFFF', backgroundColor: '#F97316', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, fontSize: 9, fontWeight: '900' },
  itemTitle: { color: '#0F172A', fontSize: 14, lineHeight: 20, fontWeight: '700', marginTop: 4 },
  itemBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  watchButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#009688', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  watchText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
