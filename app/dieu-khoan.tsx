/**
 * dieu-khoan.tsx — Điều khoản sử dụng FIRA News
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TEAL = '#009688';

const SECTIONS = [
  {
    title: '1. Giới thiệu',
    content: `Chào mừng bạn đến với FIRA News — ứng dụng đọc tin tức tổng hợp được phát triển bởi đội ngũ FIRA. Bằng việc sử dụng ứng dụng, bạn đồng ý tuân thủ các Điều khoản sử dụng dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.`,
  },
  {
    title: '2. Điều kiện sử dụng',
    content: `Bạn phải từ 13 tuổi trở lên để sử dụng ứng dụng. Nếu bạn chưa đủ 13 tuổi, bạn cần có sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp.\n\nBạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu, và chịu trách nhiệm về tất cả các hoạt động xảy ra dưới tài khoản của bạn.`,
  },
  {
    title: '3. Quyền sở hữu trí tuệ',
    content: `Tất cả nội dung trên FIRA News, bao gồm nhưng không giới hạn ở văn bản, hình ảnh, âm thanh, video, giao diện và thiết kế đồ họa đều thuộc quyền sở hữu của FIRA hoặc các đối tác cung cấp nội dung.\n\nBạn không được sao chép, phân phối, sửa đổi, truyền tải hoặc khai thác thương mại bất kỳ nội dung nào mà không có sự cho phép bằng văn bản từ chúng tôi.`,
  },
  {
    title: '4. Nội dung người dùng',
    content: `Khi bạn gửi, đăng hoặc chia sẻ nội dung thông qua ứng dụng, bạn cấp cho FIRA News quyền không độc quyền, miễn phí bản quyền để sử dụng, hiển thị và phân phối nội dung đó trong phạm vi dịch vụ.\n\nBạn đảm bảo rằng nội dung bạn chia sẻ không vi phạm quyền của bên thứ ba, không chứa nội dung bất hợp pháp, thù địch, phân biệt đối xử hoặc xúc phạm.`,
  },
  {
    title: '5. Hành vi bị cấm',
    content: `Khi sử dụng FIRA News, bạn không được:\n\n• Sử dụng dịch vụ cho mục đích bất hợp pháp\n• Phát tán mã độc, virus hoặc phần mềm gây hại\n• Cố gắng truy cập trái phép vào hệ thống\n• Đăng nội dung sai lệch, gây hiểu nhầm hoặc lừa đảo\n• Thu thập thông tin người dùng khác mà không được phép`,
  },
  {
    title: '6. Tuyên bố miễn trách nhiệm',
    content: `FIRA News cung cấp dịch vụ theo nguyên tắc "như hiện tại". Chúng tôi không đảm bảo rằng dịch vụ sẽ không bị gián đoạn, kịp thời, an toàn hoặc không có lỗi.\n\nChúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.`,
  },
  {
    title: '7. Thay đổi điều khoản',
    content: `FIRA News có quyền sửa đổi Điều khoản sử dụng này bất kỳ lúc nào. Chúng tôi sẽ thông báo cho bạn về các thay đổi quan trọng thông qua ứng dụng hoặc email.\n\nViệc tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới.`,
  },
  {
    title: '8. Liên hệ',
    content: `Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi qua:\n\n📧 Email: support@firanews.vn\n🌐 Website: www.firanews.vn\n📍 Địa chỉ: Tầng 12, Tòa nhà FIRA Center, TP. Hồ Chí Minh`,
  },
];

export default function DieuKhoanScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Điều khoản sử dụng</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="document-text" size={36} color={TEAL} />
          <Text style={styles.bannerTitle}>Điều khoản sử dụng</Text>
          <Text style={styles.bannerSub}>Cập nhật lần cuối: 01/09/2026</Text>
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
    marginBottom: 24,
  },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#009688', marginTop: 10 },
  bannerSub: { fontSize: 13, color: '#888', marginTop: 4 },
  section: {
    marginBottom: 20,
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
