/**
 * chinh-sach.tsx — Chính sách bảo mật FIRA News
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TEAL = '#009688';

const SECTIONS = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    content: `FIRA News thu thập các loại thông tin sau:\n\n• Thông tin tài khoản: tên, địa chỉ email, mật khẩu (đã mã hóa)\n• Thông tin thiết bị: loại thiết bị, hệ điều hành, số nhận dạng thiết bị\n• Dữ liệu sử dụng: bài viết đã đọc, thời gian sử dụng, tìm kiếm\n• Vị trí địa lý (khi bạn cấp phép): để hiển thị tin tức địa phương`,
  },
  {
    title: '2. Mục đích sử dụng thông tin',
    content: `Chúng tôi sử dụng thông tin thu thập để:\n\n• Cung cấp và cải thiện dịch vụ cho bạn\n• Cá nhân hóa nội dung tin tức phù hợp sở thích\n• Gửi thông báo về tin tức mới và cập nhật ứng dụng\n• Phân tích xu hướng sử dụng để cải thiện trải nghiệm\n• Phát hiện và ngăn chặn hoạt động gian lận`,
  },
  {
    title: '3. Chia sẻ thông tin',
    content: `FIRA News không bán thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:\n\n• Với đối tác cung cấp dịch vụ kỹ thuật (máy chủ, phân tích)\n• Khi có yêu cầu từ cơ quan pháp luật có thẩm quyền\n• Khi bạn đồng ý chia sẻ\n• Để bảo vệ quyền lợi hợp pháp của FIRA News`,
  },
  {
    title: '4. Bảo mật dữ liệu',
    content: `Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn công nghiệp để bảo vệ thông tin của bạn:\n\n• Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải\n• Mật khẩu được mã hóa bằng bcrypt\n• Kiểm tra bảo mật định kỳ\n• Giới hạn quyền truy cập nội bộ theo nguyên tắc tối thiểu đặc quyền`,
  },
  {
    title: '5. Cookie và công nghệ theo dõi',
    content: `Ứng dụng sử dụng các công nghệ tương tự cookie để:\n\n• Lưu trữ tùy chọn của bạn (chế độ tối, cỡ chữ)\n• Duy trì phiên đăng nhập\n• Phân tích hành vi sử dụng ẩn danh\n\nBạn có thể xóa dữ liệu cache trong phần Cài đặt ứng dụng.`,
  },
  {
    title: '6. Quyền của bạn',
    content: `Bạn có các quyền sau đối với dữ liệu cá nhân:\n\n• Quyền truy cập: xem dữ liệu chúng tôi lưu về bạn\n• Quyền chỉnh sửa: cập nhật thông tin không chính xác\n• Quyền xóa: yêu cầu xóa tài khoản và dữ liệu liên quan\n• Quyền từ chối: không cho phép xử lý dữ liệu cho mục đích marketing\n• Quyền di chuyển dữ liệu: nhận bản sao dữ liệu của bạn`,
  },
  {
    title: '7. Lưu trữ dữ liệu',
    content: `Chúng tôi lưu trữ dữ liệu của bạn trong thời gian tài khoản còn hoạt động và trong vòng 30 ngày sau khi xóa tài khoản (để có thể khôi phục nếu cần).\n\nDữ liệu log và phân tích ẩn danh được giữ tối đa 24 tháng.`,
  },
  {
    title: '8. Trẻ em',
    content: `FIRA News không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn phát hiện con em mình đã cung cấp thông tin cho chúng tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó ngay lập tức.`,
  },
  {
    title: '9. Thay đổi chính sách',
    content: `Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua ứng dụng hoặc email đã đăng ký.\n\nNgày có hiệu lực của phiên bản hiện tại: 01/09/2026.`,
  },
  {
    title: '10. Liên hệ',
    content: `Nếu bạn có thắc mắc về Chính sách bảo mật hoặc muốn thực hiện quyền của mình, hãy liên hệ:\n\n📧 Email: privacy@firanews.vn\n🌐 Website: www.firanews.vn/privacy\n📍 Địa chỉ: Tầng 12, Tòa nhà FIRA Center, TP. Hồ Chí Minh`,
  },
];

export default function ChinhSachScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={36} color={TEAL} />
          <Text style={styles.bannerTitle}>Chính sách bảo mật</Text>
          <Text style={styles.bannerSub}>Cập nhật lần cuối: 01/09/2026</Text>
        </View>

        {/* Intro note */}
        <View style={styles.introBox}>
          <Ionicons name="information-circle" size={18} color={TEAL} style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={styles.introText}>
            FIRA News cam kết bảo vệ quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
          </Text>
        </View>

        {SECTIONS.map((sec, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <Text style={styles.sectionContent}>{sec.content}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 FIRA News. Tất cả các quyền được bảo lưu.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
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
  scroll: { flex: 1 },
  content: { padding: 20 },
  banner: {
    alignItems: 'center',
    backgroundColor: '#F0FAF8',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#009688', marginTop: 10 },
  bannerSub: { fontSize: 13, color: '#888', marginTop: 4 },
  introBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  introText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 21 },
  section: {
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: TEAL,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  footerText: { fontSize: 12, color: '#AAA' },
});
