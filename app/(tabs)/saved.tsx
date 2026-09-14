import { newsApi } from '@/api/newsApi';
import { ArticleCard } from '@/components/common/ArticleCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Article } from '@/data/news';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router/react-navigation";
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SavedScreen() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = useCallback(() => {
    let mounted = true;
    setLoading(true);
    newsApi
      .getSavedArticles()
      .then((data) => mounted && setSavedArticles(data))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(loadSaved);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSaved} tintColor="#E11D48" />}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.iconWrap}>
              <Ionicons name="bookmark" size={25} color="#FFFFFF" />
            </View>
            <Pressable onPress={loadSaved} style={styles.refreshButton}>
              <Ionicons name="refresh" size={18} color="#E11D48" />
              <Text style={styles.refreshText}>Tải lại</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Tin đã lưu</Text>
          <Text style={styles.subtitle}>Các bài viết bạn đánh dấu sẽ nằm ở đây để đọc lại sau.</Text>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text style={styles.tipText}>Bấm biểu tượng lưu trong trang chi tiết bài viết để thêm hoặc bỏ lưu tin.</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#E11D48" />
            <Text style={styles.loadingText}>Đang mở danh sách đã lưu...</Text>
          </View>
        ) : savedArticles.length ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách của bạn</Text>
              <Text style={styles.sectionCount}>{savedArticles.length} tin</Text>
            </View>
            {savedArticles.map((article) => <ArticleCard key={article.id} article={article} compact saved />)}
          </>
        ) : (
          <EmptyState keyword="chưa có tin đã lưu" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 18, paddingBottom: 150 },
  headerCard: { backgroundColor: '#111827', borderRadius: 30, padding: 22, marginBottom: 14 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconWrap: { width: 54, height: 54, borderRadius: 19, backgroundColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  refreshButton: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 6, alignItems: 'center' },
  refreshText: { color: '#E11D48', fontWeight: '900', fontSize: 12 },
  title: { color: '#FFFFFF', fontSize: 31, fontWeight: '900' },
  subtitle: { color: '#CBD5E1', lineHeight: 20, fontWeight: '700', marginTop: 6 },
  tipBox: { backgroundColor: '#EFF6FF', borderRadius: 18, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#DBEAFE' },
  tipText: { color: '#1E3A8A', fontWeight: '700', flex: 1, lineHeight: 19 },
  loadingBox: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  loadingText: { color: '#64748B', fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#0F172A', fontSize: 23, fontWeight: '900' },
  sectionCount: { color: '#64748B', fontWeight: '900' },
});
