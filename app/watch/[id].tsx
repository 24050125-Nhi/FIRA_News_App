import { newsApi } from '@/api/newsApi';
import { EmbeddedNewsVideo } from '@/components/video/EmbeddedNewsVideo';
import { VideoNews, videos as fallbackVideos } from '@/data/news';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

export default function WatchVideoScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const videoId = Number(params.id);
  const [videos, setVideos] = useState<VideoNews[]>(fallbackVideos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Dùng 5 video local để màn hình xem hoạt động ổn định khi demo.
    setVideos(fallbackVideos);
    setLoading(false);
    if (Number.isFinite(videoId)) newsApi.watchVideo(videoId).catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [videoId]);

  const currentVideo = useMemo(() => videos.find((item) => item.id === videoId) || videos[0], [videoId, videos]);
  const related = useMemo(() => videos.filter((item) => item.id !== currentVideo?.id).slice(0, 5), [currentVideo?.id, videos]);

  if (!currentVideo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Ionicons name="videocam-off-outline" size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Không tìm thấy video</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    if (!currentVideo) return;
    try {
      const shareUrl = currentVideo.videoUrl || `https://firanews.vn/watch/${currentVideo.id}`;
      await Share.share({
        title: currentVideo.title,
        message: `${currentVideo.title}\n\nXem video tin tức trên FIRA News: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      Alert.alert('Chia sẻ', 'Không thể mở trình chia sẻ trên thiết bị.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Xem video</Text>
          <Text style={styles.headerSub}>{loading ? 'Đang tải...' : 'Bản tin phát trực tiếp trong app'}</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push('/profile' as any)}>
          <Ionicons name="person-circle" size={25} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EmbeddedNewsVideo video={currentVideo} />

        <View style={styles.metaRow}>
          <Text style={styles.category}>{currentVideo.category}</Text>
          {currentVideo.isLive ? <Text style={styles.liveBadge}>LIVE</Text> : null}
          <Text style={styles.metaText}>{currentVideo.duration}</Text>
        </View>

        <Text style={styles.title}>{currentVideo.title}</Text>
        <View style={styles.viewsRow}>
          <Ionicons name="eye-outline" size={16} color="#64748B" />
          <Text style={styles.views}>{Number(currentVideo.views || 0).toLocaleString('vi-VN')} lượt xem</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.views}>FIRA News Video</Text>
        </View>
        {currentVideo.description ? <Text style={styles.description}>{currentVideo.description}</Text> : null}

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color="#E11D48" />
            <Text style={styles.actionText}>Yêu thích</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0891B2" />
            <Text style={styles.actionText}>Bình luận</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#0F172A" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Video tin tức khác</Text>
        {related.map((item) => (
          <Pressable key={item.id} style={({ pressed }) => [styles.relatedCard, pressed && styles.pressed]} onPress={() => router.push({ pathname: '/watch/[id]', params: { id: String(item.id) } } as any)}>
            <Image source={{ uri: item.imageUrl }} style={styles.relatedImage} contentFit="cover" />
            <View style={styles.relatedPlay}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.relatedInfo}>
              <Text numberOfLines={2} style={styles.relatedTitle}>{item.title}</Text>
              <View style={styles.relatedMeta}>
                <Text style={styles.relatedSource}>{item.category}</Text>
                <Text style={styles.relatedTime}>• {item.duration}</Text>
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
  header: { backgroundColor: '#078EAA', paddingHorizontal: 14, paddingTop: 24, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  headerSub: { color: '#D9FFFD', fontSize: 12, fontWeight: '800', marginTop: 2 },
  content: { padding: 14, paddingBottom: 152 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  category: { color: '#009688', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  liveBadge: { color: '#FFFFFF', backgroundColor: '#E11D48', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, fontSize: 10, fontWeight: '900' },
  metaText: { color: '#64748B', fontSize: 12, fontWeight: '800' },
  title: { color: '#0F172A', fontSize: 25, lineHeight: 33, fontWeight: '900', marginTop: 8 },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  views: { color: '#64748B', fontSize: 13, fontWeight: '800' },
  dot: { color: '#94A3B8', fontWeight: '900' },
  description: { color: '#334155', fontSize: 15, lineHeight: 23, fontWeight: '700', marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionText: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  sectionTitle: { color: '#0F172A', fontSize: 20, fontWeight: '900', marginTop: 22, marginBottom: 10 },
  relatedCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, gap: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  pressed: { opacity: 0.82 },
  relatedImage: { width: 112, height: 78, borderRadius: 12, backgroundColor: '#E5E7EB' },
  relatedPlay: { position: 'absolute', left: 48, top: 34, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.58)', alignItems: 'center', justifyContent: 'center' },
  relatedInfo: { flex: 1, justifyContent: 'center' },
  relatedTitle: { color: '#0F172A', fontSize: 15, lineHeight: 21, fontWeight: '900' },
  relatedMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  relatedSource: { color: '#E11D48', fontSize: 12, fontWeight: '900' },
  relatedTime: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900', marginTop: 8 },
  backButton: { marginTop: 12, backgroundColor: '#009688', borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  backText: { color: '#FFFFFF', fontWeight: '900' },
});
