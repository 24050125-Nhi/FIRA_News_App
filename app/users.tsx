/**
 * users.tsx — Bảng Quản lý Tài khoản Người dùng
 * Kết nối: Frontend (Expo) ↔ Backend (Node.js :4000) ↔ MySQL Workbench (fira_news.users)
 * Hiển thị tất cả users đã đăng ký, hỗ trợ: xóa, đổi quyền, tìm kiếm, làm mới
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { newsApi, UserProfile } from '@/api/newsApi';

// ── Màu sắc ───────────────────────────────────────────────────────────────────
const C = {
  teal:    '#009688',
  tealBg:  '#E0F2F1',
  admin:   '#F44336',
  adminBg: '#FFEBEE',
  reader:  '#1976D2',
  readerBg:'#E3F2FD',
  warn:    '#FF9800',
  bg:      '#F5F7FA',
  card:    '#FFFFFF',
  text:    '#1A1A2E',
  sub:     '#6B7280',
  border:  '#E5E7EB',
  mysql:   '#00897B',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, bg }: {
  icon: string; label: string; value: number; color: string; bg: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: color + '40' }]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({
  user, onDelete, onToggleRole, isCurrentAdmin,
}: {
  user: UserProfile & { totalBookmarks?: number; createdAt?: string };
  onDelete: (u: UserProfile) => void;
  onToggleRole: (u: UserProfile) => void;
  isCurrentAdmin: boolean;
}) {
  const isAdmin = user.role === 'admin';
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';
  const isSeed = user.id <= 2; // tài khoản hệ thống, không xóa được

  return (
    <View style={styles.userRow}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: isAdmin ? C.admin + '22' : C.reader + '22' }]}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
        ) : (
          <Text style={[styles.avatarInitials, { color: isAdmin ? C.admin : C.reader }]}>
            {initials}
          </Text>
        )}
      </View>

      {/* Thông tin */}
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? C.adminBg : C.readerBg }]}>
            <Text style={[styles.roleText, { color: isAdmin ? C.admin : C.reader }]}>
              {isAdmin ? '👑 Admin' : '👤 Reader'}
            </Text>
          </View>
        </View>
        <Text style={styles.userEmail} numberOfLines={1}>📧 {user.email}</Text>
        <View style={styles.userMeta}>
          <Text style={styles.metaItem}>🕐 {joinDate}</Text>
          <Text style={styles.metaItem}>🔖 {user.totalBookmarks ?? 0} tin lưu</Text>
          {isSeed && <Text style={styles.seedBadge}>Hệ thống</Text>}
        </View>
      </View>

      {/* Hành động (chỉ admin mới thấy) */}
      {isCurrentAdmin && (
        <View style={styles.actions}>
          {/* Nút đổi role */}
          <TouchableOpacity
            onPress={() => onToggleRole(user)}
            style={[styles.actionBtn, { backgroundColor: isAdmin ? C.readerBg : C.adminBg }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isAdmin ? 'person-outline' : 'shield-outline'}
              size={15}
              color={isAdmin ? C.reader : C.admin}
            />
          </TouchableOpacity>

          {/* Nút xóa */}
          {!isSeed && (
            <TouchableOpacity
              onPress={() => onDelete(user)}
              style={[styles.actionBtn, { backgroundColor: '#FFF3F3' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={15} color="#E53935" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function UsersScreen() {
  const [users,     setUsers]     = useState<(UserProfile & { totalBookmarks?: number; createdAt?: string })[]>([]);
  const [meta,      setMeta]      = useState({ total: 0, admins: 0, readers: 0 });
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [filter,    setFilter]    = useState<'all' | 'admin' | 'reader'>('all');
  const [dbStatus,  setDbStatus]  = useState<'ok' | 'error' | 'loading'>('loading');
  // Giả lập "đang đăng nhập với quyền admin" để test — thực tế lấy từ newsApi.getCurrentUser()
  const [isAdmin] = useState(true);

  // ── Tải danh sách users từ MySQL ──────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      const res = await newsApi.getUsers();
      // getUsers trả về { data, meta } hoặc array (fallback cũ)
      if (Array.isArray(res)) {
        setUsers(res as any);
        setMeta({ total: (res as any).length, admins: 0, readers: 0 });
      } else {
        setUsers((res as any).data ?? []);
        setMeta((res as any).meta ?? { total: 0, admins: 0, readers: 0 });
      }
      setDbStatus('ok');
    } catch {
      setDbStatus('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await newsApi.getUsers();
        if (!isMounted) return;
        if (Array.isArray(res)) {
          setUsers(res as any);
          setMeta({ total: (res as any).length, admins: 0, readers: 0 });
        } else {
          setUsers((res as any).data ?? []);
          setMeta((res as any).meta ?? { total: 0, admins: 0, readers: 0 });
        }
        setDbStatus('ok');
      } catch {
        if (isMounted) setDbStatus('error');
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = () => { setRefreshing(true); loadUsers(); };

  // ── Tìm kiếm + lọc ───────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  // ── Xóa user ─────────────────────────────────────────────────
  function confirmDelete(user: UserProfile) {
    Alert.alert(
      '🗑️ Xóa tài khoản',
      `Bạn có chắc muốn xóa "${user.name}" (${user.email})?\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa', style: 'destructive',
          onPress: async () => {
            const res = await newsApi.deleteUser(user.id);
            if (res.success) {
              setUsers(prev => prev.filter(u => u.id !== user.id));
              setMeta(prev => ({
                ...prev,
                total: prev.total - 1,
                admins: user.role === 'admin' ? prev.admins - 1 : prev.admins,
                readers: user.role === 'reader' ? prev.readers - 1 : prev.readers,
              }));
              Alert.alert('✅ Thành công', res.message);
            } else {
              Alert.alert('❌ Lỗi', res.message);
            }
          },
        },
      ]
    );
  }

  // ── Đổi quyền ────────────────────────────────────────────────
  function confirmToggleRole(user: UserProfile) {
    const newRole = user.role === 'admin' ? 'reader' : 'admin';
    Alert.alert(
      '🔑 Đổi quyền',
      `Đổi quyền "${user.name}" từ ${user.role} → ${newRole}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const updated = await newsApi.updateUserRole(user.id, newRole as 'reader' | 'admin');
            if (updated) {
              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
              setMeta(prev => ({
                ...prev,
                admins:  newRole === 'admin'  ? prev.admins + 1  : prev.admins  - 1,
                readers: newRole === 'reader' ? prev.readers + 1 : prev.readers - 1,
              }));
              Alert.alert('✅ Thành công', `Đã đổi quyền ${user.name} → ${newRole}`);
            } else {
              Alert.alert('❌ Lỗi', 'Không thể đổi quyền, thử lại sau');
            }
          },
        },
      ]
    );
  }

  // ── Filter tabs ───────────────────────────────────────────────
  const filterBtns: { key: 'all' | 'admin' | 'reader'; label: string }[] = [
    { key: 'all',    label: `Tất cả (${meta.total})` },
    { key: 'admin',  label: `Admin (${meta.admins})` },
    { key: 'reader', label: `Reader (${meta.readers})` },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Tài khoản người dùng</Text>
          <Text style={styles.headerSub}>MySQL Workbench · fira_news.users</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>


      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <StatCard icon="👥" label="Tổng cộng" value={meta.total}   color={C.teal}   bg={C.tealBg} />
        <StatCard icon="👑" label="Admin"     value={meta.admins}  color={C.admin}  bg={C.adminBg} />
        <StatCard icon="👤" label="Reader"    value={meta.readers} color={C.reader} bg={C.readerBg} />
      </View>

      {/* ── Search ─────────────────────────────────────────────── */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={17} color="#aaa" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tên hoặc email..."
          placeholderTextColor="#bbb"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={17} color="#ccc" />
          </Pressable>
        )}
      </View>

      {/* ── Filter Tabs ────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {filterBtns.map(btn => (
          <Pressable
            key={btn.key}
            onPress={() => setFilter(btn.key)}
            style={[styles.filterBtn, filter === btn.key && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === btn.key && styles.filterTextActive]}>
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Danh sách users ────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.teal} />
          <Text style={styles.loadingText}>Đang tải từ MySQL...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.teal} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🔍</Text>
              <Text style={styles.emptyText}>Không tìm thấy tài khoản nào</Text>
              <Text style={styles.emptySub}>
                {search ? `Không có kết quả cho "${search}"` : 'Chưa có tài khoản nào được đăng ký'}
              </Text>
            </View>
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>
                  Hiển thị {filtered.length}/{meta.total} tài khoản
                </Text>
                {isAdmin && (
                  <Text style={styles.tableHeaderHint}>
                    <Ionicons name="information-circle-outline" size={12} /> Nhấn icon để đổi quyền / xóa
                  </Text>
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <UserRow
              user={item as any}
              onDelete={confirmDelete}
              onToggleRole={confirmToggleRole}
              isCurrentAdmin={isAdmin}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.teal, paddingHorizontal: 12, paddingVertical: 12,
  },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  /* DB Status */
  dbBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  dbDot:  { width: 8, height: 8, borderRadius: 4 },
  dbText: { fontSize: 12, flex: 1, fontWeight: '500' },

  /* Stats */
  statsRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14,
    borderWidth: 1, gap: 2,
  },
  statVal:   { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, color: C.sub, fontWeight: '500' },

  /* Search */
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 14, marginBottom: 10,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 11 : 8,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  /* Filter */
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 14, gap: 8, marginBottom: 10,
  },
  filterBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: C.border,
  },
  filterBtnActive: { backgroundColor: C.teal, borderColor: C.teal },
  filterText:      { fontSize: 12, fontWeight: '600', color: C.sub },
  filterTextActive:{ color: '#fff' },

  /* List */
  listContent:  { paddingHorizontal: 14, paddingBottom: 80 },
  tableHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tableHeaderText: { fontSize: 12, color: C.sub, fontWeight: '500' },
  tableHeaderHint: { fontSize: 11, color: C.teal },

  /* User Row */
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  avatar:       { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarImg:    { width: 52, height: 52, borderRadius: 26 },
  avatarInitials: { fontSize: 20, fontWeight: '800' },
  userInfo:     { flex: 1, gap: 3 },
  userNameRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userName:     { fontSize: 15, fontWeight: '700', color: C.text, flexShrink: 1 },
  roleBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  roleText:     { fontSize: 11, fontWeight: '700' },
  userEmail:    { fontSize: 12, color: C.sub },
  userMeta:     { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  metaItem:     { fontSize: 11, color: '#9CA3AF' },
  seedBadge:    { fontSize: 10, color: C.warn, fontWeight: '700', backgroundColor: '#FFF3E0', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },

  /* Actions */
  actions:   { gap: 6 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  separator: { height: 8 },

  /* Loading */
  loadingBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  loadingText: { fontSize: 14, color: C.sub },

  /* Empty */
  emptyBox:  { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: C.text },
  emptySub:  { fontSize: 13, color: C.sub, textAlign: 'center' },

  /* Footer */
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
    backgroundColor: '#E0F2F1', paddingVertical: 8, paddingHorizontal: 14,
    borderTopWidth: 1, borderTopColor: '#B2DFDB',
  },
  footerText: { fontSize: 10, color: C.mysql, fontWeight: '500', flexShrink: 1 },
});
