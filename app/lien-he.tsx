/**
 * lien-he.tsx — Màn hình Liên hệ FIRA News
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TEAL = '#009688';

const CONTACT_ITEMS = [
  {
    label: 'Công ty',
    value: 'Công ty Cổ phần Công nghệ Fira * Chịu trách nhiệm quản lý nội dung: Nhóm 13',
  },
  {
    label: 'Giấy phép',
    value: 'Giấy phép số: 0001/GP-TTĐT do Sở Thông tin và Truyền thông Hồ Chí Minh cấp ngày 09/09/2026',
  },
  {
    label: 'Địa chỉ',
    value: 'Tầng 2, Đại học Bình Dương, số 504 Đại lộ Bình Dương, Phường Phú Lợi, Thành Phố Hồ Chí Minh',
  },
  {
    label: 'Tel',
    value: '(0708) 460 364',
    onPress: () => Linking.openURL('tel:0708460364'),
  },
  {
    label: 'Email',
    value: 'contact.firanews@fira.com.vn',
    onPress: () => Linking.openURL('mailto:contact.firanews@fira.com.vn'),
  },
  {
    label: 'Website',
    value: 'www.firanews.vn',
    onPress: () => Linking.openURL('https://www.firanews.vn'),
  },
];

export default function LienHeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Liên hệ</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Card liên hệ chính — thiết kế theo hình mẫu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>LIÊN HỆ</Text>

          {CONTACT_ITEMS.map((item, idx) => (
            <View key={idx}>
              {idx > 0 && <View style={styles.itemDivider} />}
              {item.onPress ? (
                <TouchableOpacity onPress={item.onPress} activeOpacity={0.7}>
                  <Text style={styles.itemText}>
                    <Text style={styles.itemLabel}>{item.label}:</Text>{' '}
                    <Text style={styles.itemLink}>{item.value}</Text>
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.itemText}>
                  <Text style={styles.itemLabel}>{item.label}:</Text>{' '}
                  {item.value}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Thông tin hỗ trợ */}
        <View style={styles.supportCard}>
          <Ionicons name="headset-outline" size={28} color={TEAL} style={{ marginBottom: 8 }} />
          <Text style={styles.supportTitle}>Hỗ trợ khách hàng</Text>
          <Text style={styles.supportSub}>
            Phản hồi trong vòng 24 giờ làm việc{'\n'}(Thứ 2 – Thứ 6, 8:00 – 17:30)
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Fira News. Tất cả các quyền được bảo lưu.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },

  /* Content */
  scroll: { flex: 1 },
  content: { padding: 16 },

  /* Card liên hệ chính */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEAL,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ECECEC',
    marginVertical: 14,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  itemLabel: {
    fontWeight: '600',
    color: '#111',
  },
  itemLink: {
    color: TEAL,
    textDecorationLine: 'underline',
  },

  /* Card hỗ trợ */
  supportCard: {
    backgroundColor: '#F0FAF8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEAL,
    marginBottom: 6,
  },
  supportSub: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Footer */
  footer: {
    marginTop: 8,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  footerText: { fontSize: 12, color: '#AAA' },
});
