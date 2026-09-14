import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export function EmptyState({ keyword }: { keyword?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="search-outline" size={34} color="#DC2626" />
      </View>
      <Text style={styles.title}>Không tìm thấy tin phù hợp</Text>
      <Text style={styles.text}>{keyword ? `Từ khóa “${keyword}” chưa có trong dữ liệu.` : 'Bạn thử chọn chuyên mục khác nhé.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '900',
  },
  text: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
