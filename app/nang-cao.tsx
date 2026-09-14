/**
 * nang-cao.tsx — Màn hình Cài đặt nâng cao
 */
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Section header (màu xám nhạt như hình mẫu) ──────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionLabelText}>{title}</Text>
    </View>
  );
}

// ─── Row có toggle ────────────────────────────────────────────────────────────
function ToggleRow({
  label, sub, value, onValueChange, tintColor,
}: {
  label: string; sub?: string; value: boolean;
  onValueChange: (v: boolean) => void; tintColor?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D1D6', true: tintColor ?? theme.primary }}
        thumbColor="#fff"
        ios_backgroundColor="#D1D1D6"
      />
    </View>
  );
}

// ─── Row thông thường (có thể bấm, có thể có mũi tên) ────────────────────────
function SimpleRow({
  label, sub, onPress, arrow,
}: {
  label: string; sub?: string; onPress?: () => void; arrow?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#f2f2f2' }]}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {arrow && <Ionicons name="chevron-forward" size={17} color="#C7C7CC" />}
    </Pressable>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────
function Sep() {
  return <View style={styles.sep} />;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function NangCaoScreen() {
  const insets = useSafeAreaInsets();

  const [autoPlayVideo, setAutoPlayVideo] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);
  const [breaking, setBreaking] = useState(false);

  function handleClearImages() {
    Alert.alert(
      'Xóa dữ liệu ảnh',
      'Tất cả ảnh đã cache sẽ bị xóa. Bạn có chắc?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa', style: 'destructive',
          onPress: () => Alert.alert('✅ Đã xóa', 'Dữ liệu ảnh đã được dọn sạch.'),
        },
      ]
    );
  }

  function handleUpdateProfile() {
    Alert.alert('Tính năng', 'Sắp ra mắt!');
  }

  function handleHideSource() {
    Alert.alert('Tính năng', 'Sắp ra mắt!');
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Cài đặt nâng cao</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── DỮ LIỆU VÀ BỘ NHỚ ── */}
        <SectionLabel title="DỮ LIỆU VÀ BỘ NHỚ" />
        <View style={styles.group}>
          <ToggleRow
            label="Tự động phát video"
            sub="Chỉ khi có kết nối Wi-Fi"
            value={autoPlayVideo}
            onValueChange={setAutoPlayVideo}
          />
          <Sep />
          <SimpleRow label="Xóa tất cả dữ liệu ảnh" onPress={handleClearImages} />
          <Sep />
          <ToggleRow
            label="Chế độ offline"
            value={offlineMode}
            onValueChange={setOfflineMode}
            tintColor="#009688"
          />
        </View>

        {/* Mô tả chế độ offline */}
        <Text style={styles.offlineDesc}>
          Chế độ offline cho phép người dùng đọc các tin đã lưu lại khi không có kết nối mạng.
          FIRA News chỉ lưu lại phần nội dung chữ để không tốn bộ nhớ máy.
        </Text>

        {/* ── CÁ NHÂN ── */}
        <SectionLabel title="CÁ NHÂN" />
        <View style={styles.group}>
          <SimpleRow label="Cập nhật thông tin cá nhân" onPress={handleUpdateProfile} />
          <Sep />
          <SimpleRow label="Ẩn tin từ nguồn báo" onPress={handleHideSource} arrow />
        </View>

        {/* ── THÔNG BÁO ── */}
        <SectionLabel title="THÔNG BÁO" />
        <View style={styles.group}>
          <ToggleRow
            label="Báo tin nổi bật"
            value={breaking}
            onValueChange={setBreaking}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EFEFF4' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10,
    backgroundColor: '#EFEFF4',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D1D1D6',
  },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },

  scroll: { flex: 1 },

  /* Section label */
  sectionLabel: { paddingHorizontal: 18, paddingTop: 26, paddingBottom: 6 },
  sectionLabelText: {
    fontSize: 13, fontWeight: '500', color: '#6B6B6B', letterSpacing: 0.3, textTransform: 'uppercase',
  },

  /* Group card */
  group: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6',
  },

  /* Row */
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 13,
    backgroundColor: '#FFFFFF', minHeight: 50,
  },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, color: '#000', fontWeight: '400' },
  rowSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },

  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 18,
  },

  /* Offline description */
  offlineDesc: {
    fontSize: 13, color: '#6B6B6B', lineHeight: 19,
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4,
  },
});
