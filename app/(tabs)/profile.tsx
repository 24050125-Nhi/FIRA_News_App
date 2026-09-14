/**
 * app/(tabs)/profile.tsx — Màn hình Cá nhân
 * Thiết kế giao diện Dark Mode chuẩn theo hình ảnh mẫu:
 * Header Cá nhân, Avatar Uyển Nhi, Khung 4 nút thao tác nhanh (Đã lưu, Đang theo dõi, Tin đã tải, Đọc gần đây),
 * Nhóm CÀI ĐẶT (Chế độ đọc, Giao diện, Giọng đọc, Tin địa phương, Nâng cao, Quản lý tài khoản),
 * Nhóm TIỆN ÍCH (Lịch Việt).
 * Đã bỏ: Thời tiết, Kết quả xổ số, Giá vàng & Ngoại tệ theo yêu cầu.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';

import { useTheme } from '@/context/ThemeContext';
import { newsApi, UserProfile, BackendDashboard } from '@/api/newsApi';
import { Article } from '@/data/news';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const TEAL_ACCENT = '#009688';
const DARK_BG = '#121214';
const CARD_BG = '#1A1A1E';
const BORDER_COLOR = '#26262B';
const TEXT_MUTED = '#9CA3AF';
const TEXT_SUBTLE = '#6B7280';

export default function ProfileScreen() {
  const { themeKey, setTheme, theme } = useTheme();
  const isDark = themeKey === 'dark';

  const dynamicTheme = {
    bg: isDark ? DARK_BG : '#FFFFFF',
    cardBg: isDark ? CARD_BG : '#FFFFFF',
    border: isDark ? BORDER_COLOR : '#F3F4F6',
    divider: isDark ? BORDER_COLOR : '#F3F4F6',
    headerBg: isDark ? DARK_BG : '#FFFFFF',
    headerTitle: isDark ? '#FFFFFF' : '#111827',
    backBtn: isDark ? '#FFFFFF' : '#111827',
    userName: isDark ? '#FFFFFF' : '#111827',
    userSub: isDark ? TEXT_MUTED : '#6B7280',
    quickLabel: isDark ? '#FFFFFF' : '#1F2937',
    quickIconBg: isDark ? '#009688' : 'transparent',
    quickIconColor: isDark ? '#FFFFFF' : (theme?.primary || '#009688'),
    sectionTitle: isDark ? '#00D2B8' : (theme?.primary || '#009688'),
    menuLabel: isDark ? '#FFFFFF' : '#1F2937',
    menuIcon: isDark ? TEXT_MUTED : '#6B7280',
    menuRightText: isDark ? TEXT_SUBTLE : '#9CA3AF',
    chevron: isDark ? TEXT_SUBTLE : '#D1D5DB',
    switchBtnBg: isDark ? CARD_BG : '#F9FAFB',
    switchBtnBorder: isDark ? BORDER_COLOR : '#E5E7EB',
    modalBg: isDark ? CARD_BG : '#FFFFFF',
    modalBorder: isDark ? BORDER_COLOR : '#E5E7EB',
    modalTitle: isDark ? '#FFFFFF' : '#111827',
    modalOptionText: isDark ? '#FFFFFF' : '#1F2937',
    modalOptionBorder: isDark ? BORDER_COLOR : '#F3F4F6',
  };

  const [profile, setProfile] = useState<UserProfile | undefined>(newsApi.getCurrentUser());
  const [selectedCity, setSelectedCity] = useState<string>('Chọn địa phương');
  const [selectedVoice, setSelectedVoice] = useState<string>('Nhanh (Tiết kiệm thời gian)');
  
  // Modals state
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showFollowModal, setShowFollowModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Auth bottom sheet states (Hình 1 & Hình 2)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState<string>('reader@firanews.local');
  const [loginPassword, setLoginPassword] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // Auth / History state
  const [historyList, setHistoryList] = useState<Article[]>([]);

  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState<boolean>(false);

  const loadData = useCallback(() => {
    const user = newsApi.getCurrentUser();
    setProfile(user);
    newsApi.getHistory().then(setHistoryList);
  }, []);

  useEffect(loadData, [loadData]);
  useFocusEffect(
    useCallback(() => {
      setProfile(newsApi.getCurrentUser());
      return () => {
        Speech.stop();
        setIsPlayingTestVoice(false);
      };
    }, [])
  );

  const isAdmin = profile?.role === 'admin';
  const displayName = profile?.name || 'Uyển Nhi';
  const displayAvatar = profile?.avatar || DEFAULT_AVATAR;

  const handleTestVoice = async (rate = 1.0) => {
    try {
      await Speech.stop();
      setIsPlayingTestVoice(true);

      const availableVoices = await Speech.getAvailableVoicesAsync().catch(() => [] as Speech.Voice[]);
      const viVoices = availableVoices.filter((v) =>
        v.language?.toLowerCase().replace('_', '-').startsWith('vi')
      );
      const preferred =
        viVoices.find((v) => /google/i.test(`${v.name} ${v.identifier}`)) ??
        viVoices.find((v) => /linh|vietnam|siri/i.test(`${v.name} ${v.identifier}`)) ??
        viVoices[0];

      const sampleText = 'Chào mừng bạn đến với ứng dụng đọc báo FIRA News. Chúc bạn có trải nghiệm đọc tin tức tuyệt vời!';

      const speakOptions: Speech.SpeechOptions = {
        language: 'vi-VN',
        rate: rate,
        pitch: 1.0,
        volume: 1.0,
        useApplicationAudioSession: false,
        onStart: () => setIsPlayingTestVoice(true),
        onDone: () => setIsPlayingTestVoice(false),
        onStopped: () => setIsPlayingTestVoice(false),
        onError: (err) => {
          console.warn('Test voice error:', err);
          // Fallback retry without voice identifier
          Speech.speak(sampleText, {
            language: 'vi-VN',
            rate: rate,
            pitch: 1.0,
            volume: 1.0,
            useApplicationAudioSession: false,
            onDone: () => setIsPlayingTestVoice(false),
            onError: () => {
              setIsPlayingTestVoice(false);
              Alert.alert(
                'Lưu ý âm thanh',
                'Nếu bạn không nghe thấy âm thanh:\n1. Hãy kiểm tra cần gạt im lặng (Silent switch) bên hông iPhone (gạt sang chế độ Chuông có tiếng).\n2. Tăng âm lượng loa ngoài của máy.'
              );
            },
          });
        },
      };

      if (preferred?.identifier) {
        speakOptions.voice = preferred.identifier;
      }

      Speech.speak(sampleText, speakOptions);
    } catch (err) {
      console.warn('handleTestVoice error:', err);
      setIsPlayingTestVoice(false);
    }
  };

  const handleLoginSubmit = async () => {
    const cleanEmail = loginEmail.trim();
    const cleanPass = loginPassword.trim();
    if (!cleanEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ Email hoặc Gmail.');
      return;
    }
    if (!cleanPass) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }
    try {
      setIsSubmittingAuth(true);
      const user = await newsApi.login({
        email: cleanEmail,
        password: cleanPass,
        name: cleanEmail.split('@')[0],
      });
      setProfile(user);
      setShowLoginModal(false);
      Alert.alert('✅ Đăng nhập thành công', `Chào mừng ${user.name} đã đăng nhập!`);
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err?.message || 'Vui lòng kiểm tra lại email hoặc mật khẩu.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleRegisterSubmit = async () => {
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPass = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();

    if (cleanName.length < 2) {
      Alert.alert('Lỗi', 'Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ (ví dụ: yourname@gmail.com).');
      return;
    }
    if (cleanPass.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (cleanPass !== cleanConfirm) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setIsSubmittingAuth(true);
      const user = await newsApi.register({
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
      });
      setProfile(user);
      setShowLoginModal(false);
      Alert.alert('✅ Đăng ký thành công', `Chào mừng ${user.name}! Tài khoản của bạn đã sẵn sàng.`);
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleOtherMethods = () => {
    Alert.alert(
      'Chọn phương thức khác',
      'Bạn có thể chuyển nhanh sang tài khoản mẫu hoặc đăng nhập bằng Gmail:',
      [
        {
          text: 'Đăng nhập nhanh Gmail mẫu',
          onPress: () => {
            setLoginEmail('leductai@gmail.com');
            setLoginPassword('123456');
            setAuthTab('login');
          },
        },
        {
          text: 'Tài khoản Độc giả (reader@firanews.local)',
          onPress: () => {
            setLoginEmail('reader@firanews.local');
            setLoginPassword('123456');
            setAuthTab('login');
          },
        },
        {
          text: 'Tài khoản Quản trị (admin@firanews.local)',
          onPress: () => {
            setLoginEmail('admin@firanews.local');
            setLoginPassword('123456');
            setAuthTab('login');
          },
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleQuickLogin = async (role: 'reader' | 'admin') => {
    try {
      const email = role === 'admin' ? 'admin@firanews.local' : 'reader@firanews.local';
      const name = role === 'admin' ? 'Admin FIRA' : 'Uyển Nhi';
      const user = await newsApi.login({ email, password: '123456', name });
      setProfile(user);
      setShowLoginModal(false);
      Alert.alert('✅ Thành công', `Đã chuyển sang tài khoản ${user.name} (${user.role})`);
    } catch {
      Alert.alert('Thông báo', 'Đã chuyển trạng thái tài khoản mô phỏng.');
    }
  };

  const handleLogout = () => {
    newsApi.logout();
    setProfile(newsApi.getCurrentUser());
    Alert.alert('Đăng xuất', 'Bạn đã đăng xuất tài khoản.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: dynamicTheme.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* ── 1. HEADER BAR: Cá nhân ── */}
      <View style={[styles.headerBar, { backgroundColor: dynamicTheme.headerBg, borderBottomColor: dynamicTheme.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
          hitSlop={12}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={dynamicTheme.backBtn} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: dynamicTheme.headerTitle }]}>Cá nhân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 2. USER PROFILE INFO: Avatar & Tên ── */}
        <TouchableOpacity
          style={styles.userSection}
          onPress={() => setShowLoginModal(true)}
          activeOpacity={0.8}
        >
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} contentFit="cover" />
          ) : !isDark ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <View style={styles.avatarSilhouetteBox}>
              <Ionicons name="person" size={44} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.userInfoCol}>
            <Text style={[styles.userName, { color: dynamicTheme.userName }]}>{profile?.name ? profile.name : 'Uyển Nhi'}</Text>
            {profile?.email ? (
              <Text style={[styles.userSubText, { color: dynamicTheme.userSub }]}>{profile.email}</Text>
            ) : null}
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                <Text style={styles.adminBadgeText}>Quản trị viên</Text>
              </View>
            )}
          </View>
          <View style={[styles.switchAccountBtn, { backgroundColor: dynamicTheme.switchBtnBg, borderColor: dynamicTheme.switchBtnBorder }]}>
            <Ionicons name="swap-horizontal" size={18} color={dynamicTheme.sectionTitle} />
          </View>
        </TouchableOpacity>

        {/* ── 3. 4 QUICK ACTION BUTTONS (2x2 GRID) ── */}
        <View style={styles.quickGrid}>
          {/* Row 1 */}
          <View style={styles.quickRow}>
            {/* Đã lưu */}
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => router.push('/saved')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconBox, { backgroundColor: dynamicTheme.quickIconBg }]}>
                <Ionicons name="bookmark" size={isDark ? 18 : 22} color={dynamicTheme.quickIconColor} />
              </View>
              <Text style={[styles.quickLabel, { color: dynamicTheme.quickLabel }]}>Đã lưu</Text>
            </TouchableOpacity>

            {/* Đang theo dõi */}
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => setShowFollowModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconBox, { backgroundColor: dynamicTheme.quickIconBg }]}>
                <Ionicons name="checkbox" size={isDark ? 19 : 22} color={dynamicTheme.quickIconColor} />
              </View>
              <Text style={[styles.quickLabel, { color: dynamicTheme.quickLabel }]}>Đang theo dõi</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.quickRow}>
            {/* Tin đã tải */}
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => setShowDownloadModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconBox, { backgroundColor: dynamicTheme.quickIconBg }]}>
                <Ionicons name="arrow-down-circle" size={isDark ? 19 : 22} color={dynamicTheme.quickIconColor} />
              </View>
              <Text style={[styles.quickLabel, { color: dynamicTheme.quickLabel }]}>Tin đã tải</Text>
            </TouchableOpacity>

            {/* Đọc gần đây */}
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => setShowHistoryModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconBox, { backgroundColor: dynamicTheme.quickIconBg }]}>
                <Ionicons name="time" size={isDark ? 19 : 22} color={dynamicTheme.quickIconColor} />
              </View>
              <Text style={[styles.quickLabel, { color: dynamicTheme.quickLabel }]}>Đọc gần đây</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: dynamicTheme.divider }]} />

        {/* ── 4. NHÓM: CÀI ĐẶT ── */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: dynamicTheme.sectionTitle }]}>CÀI ĐẶT</Text>

          {/* Chế độ đọc */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/reading-mode')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="book-outline" size={22} color={dynamicTheme.menuIcon} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: dynamicTheme.menuLabel }]}>Chế độ đọc</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={dynamicTheme.chevron} />
          </TouchableOpacity>

          {/* Giao diện */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/giao-dien')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="color-palette-outline" size={22} color={dynamicTheme.menuIcon} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: dynamicTheme.menuLabel }]}>Giao diện</Text>
            </View>
            <TouchableOpacity
              hitSlop={10}
              onPress={() => setTheme(isDark ? 'teal' : 'dark')}
            >
              <Ionicons
                name="radio-button-on"
                size={22}
                color={dynamicTheme.sectionTitle}
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Giọng đọc */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowVoiceModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="chatbox-ellipses-outline" size={22} color={dynamicTheme.menuIcon} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: dynamicTheme.menuLabel }]}>Giọng đọc</Text>
            </View>
            <View style={styles.menuRowRight}>
              <Text style={[styles.menuRightText, { color: dynamicTheme.menuRightText }]}>{selectedVoice}</Text>
              <Ionicons name="chevron-forward" size={16} color={dynamicTheme.chevron} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          {/* Tin địa phương */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="location-outline" size={22} color={dynamicTheme.menuIcon} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: dynamicTheme.menuLabel }]}>Tin địa phương</Text>
            </View>
            <View style={styles.menuRowRight}>
              <Text style={[styles.menuRightText, { color: dynamicTheme.menuRightText }]}>{selectedCity}</Text>
              <Ionicons name="chevron-forward" size={16} color={dynamicTheme.chevron} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>

          {/* Nâng cao */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/nang-cao')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="settings-outline" size={22} color={dynamicTheme.menuIcon} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: dynamicTheme.menuLabel }]}>Nâng cao</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={dynamicTheme.chevron} />
          </TouchableOpacity>

          {/* Quản lý tài khoản */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/users')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="person-outline" size={22} color={dynamicTheme.menuIcon} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: dynamicTheme.menuLabel }]}>Quản lý tài khoản</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={dynamicTheme.chevron} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: dynamicTheme.divider }]} />

        {/* ── 5. NHÓM: TIỆN ÍCH ── */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: dynamicTheme.sectionTitle }]}>TIỆN ÍCH</Text>

          {/* Lịch Việt */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/lich-viet')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <Ionicons name="calendar-outline" size={22} color={dynamicTheme.menuIcon} style={styles.menuIcon} />
              <Text style={[styles.menuLabel, { color: dynamicTheme.menuLabel }]}>Lịch Việt</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={dynamicTheme.chevron} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: dynamicTheme.divider }]} />

        {/* ── 6. NHÓM: SẢN PHẨM ── */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: dynamicTheme.sectionTitle }]}>SẢN PHẨM</Text>

          {/* Liên hệ */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/lien-he')}
            activeOpacity={0.7}
          >
            <Text style={[styles.productMenuLabel, { color: dynamicTheme.menuLabel }]}>Liên hệ</Text>
          </TouchableOpacity>

          {/* Kiểm tra phiên bản mới */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Phiên bản ứng dụng', 'Bạn đang sử dụng phiên bản mới nhất: 26.07.01.')}
            activeOpacity={0.7}
          >
            <Text style={[styles.productMenuLabel, { color: dynamicTheme.menuLabel }]}>Kiểm tra phiên bản mới</Text>
            <Text style={[styles.menuRightText, { color: dynamicTheme.menuRightText }]}>26.07.01</Text>
          </TouchableOpacity>

          {/* Điều khoản sử dụng */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/dieu-khoan')}
            activeOpacity={0.7}
          >
            <Text style={[styles.productMenuLabel, { color: dynamicTheme.menuLabel }]}>Điều khoản sử dụng</Text>
          </TouchableOpacity>

          {/* Chính sách bảo mật */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/chinh-sach')}
            activeOpacity={0.7}
          >
            <Text style={[styles.productMenuLabel, { color: dynamicTheme.menuLabel }]}>Chính sách bảo mật</Text>
          </TouchableOpacity>

          {/* Bình chọn cho FIRA News */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Đánh giá ứng dụng', 'Cảm ơn bạn đã luôn đồng hành và đánh giá 5 sao cho FIRA News!')}
            activeOpacity={0.7}
          >
            <Text style={[styles.productMenuLabel, { color: dynamicTheme.menuLabel }]}>Bình chọn cho FIRA News</Text>
          </TouchableOpacity>

          {/* Email góp ý, báo lỗi */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Góp ý & Báo lỗi', 'Mọi phản hồi xin gửi về email: contact.firanews@fira.com.vn hoặc hotline: (0708) 460 364.')}
            activeOpacity={0.7}
          >
            <Text style={[styles.productMenuLabel, { color: dynamicTheme.menuLabel }]}>Email góp ý, báo lỗi</Text>
          </TouchableOpacity>
        </View>

        {/* ── 7. THÔNG TIN PHIÊN BẢN & ĐĂNG XUẤT ── */}
        <View style={styles.footerWrap}>
          <Text style={[styles.versionText, { color: dynamicTheme.menuRightText }]}>FIRA News v1.2.0 • Đọc báo thông minh</Text>
          {profile && (
            <TouchableOpacity
              style={[styles.logoutBtn, !isDark && { backgroundColor: '#FEE2E2' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={[styles.logoutText, !isDark && { color: '#DC2626' }]}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODALS TIỆN ÍCH & TÍNH NĂNG ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* 1. Modal Tin địa phương */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: dynamicTheme.modalBg, borderColor: dynamicTheme.modalBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dynamicTheme.modalTitle }]}>Chọn khu vực tin tức</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color={dynamicTheme.modalTitle} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khánh Hòa', 'Lâm Đồng', 'Quảng Ninh'].map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.optionRow, { borderBottomColor: dynamicTheme.modalOptionBorder }]}
                  onPress={() => {
                    setSelectedCity(city);
                    setShowCityModal(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: dynamicTheme.modalOptionText }, selectedCity === city && { color: TEAL_ACCENT, fontWeight: '700' }]}>
                    {city}
                  </Text>
                  {selectedCity === city && <Ionicons name="checkmark" size={20} color={TEAL_ACCENT} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Modal Giọng đọc AI */}
      <Modal visible={showVoiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: dynamicTheme.modalBg, borderColor: dynamicTheme.modalBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dynamicTheme.modalTitle }]}>Tùy chỉnh giọng đọc</Text>
              <TouchableOpacity
                onPress={async () => {
                  await Speech.stop();
                  setIsPlayingTestVoice(false);
                  setShowVoiceModal(false);
                }}
              >
                <Ionicons name="close" size={24} color={dynamicTheme.modalTitle} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: dynamicTheme.menuRightText }]}>Chọn tốc độ và nhấn để nghe thử giọng nói tiếng Việt:</Text>

            {isPlayingTestVoice && (
              <View style={styles.voicePlayingBanner}>
                <Ionicons name="volume-high" size={18} color={TEAL_ACCENT} />
                <Text style={styles.voicePlayingText}>Đang phát âm thanh thử nghiệm...</Text>
                <TouchableOpacity
                  onPress={async () => {
                    await Speech.stop();
                    setIsPlayingTestVoice(false);
                  }}
                  style={styles.stopVoiceBtn}
                >
                  <Text style={styles.stopVoiceText}>Dừng</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ gap: 10, marginVertical: 14 }}>
              {[
                { name: 'Mặc định (Chuẩn)', rate: 1.0 },
                { name: 'Chậm rãi (Dễ nghe)', rate: 0.85 },
                { name: 'Nhanh (Tiết kiệm thời gian)', rate: 1.25 },
              ].map((v) => (
                <TouchableOpacity
                  key={v.name}
                  style={[
                    styles.optionRow,
                    { borderBottomColor: dynamicTheme.modalOptionBorder },
                    selectedVoice === v.name && { borderColor: TEAL_ACCENT, borderWidth: 1 }
                  ]}
                  onPress={() => {
                    setSelectedVoice(v.name);
                    handleTestVoice(v.rate);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons
                      name={selectedVoice === v.name ? "checkmark-circle" : "radio-button-off"}
                      size={20}
                      color={selectedVoice === v.name ? TEAL_ACCENT : TEXT_SUBTLE}
                    />
                    <Text style={[styles.optionText, { color: dynamicTheme.modalOptionText }, selectedVoice === v.name && { color: TEAL_ACCENT, fontWeight: '700' }]}>
                      {v.name}
                    </Text>
                  </View>
                  <Ionicons name="volume-medium-outline" size={20} color={TEAL_ACCENT} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.iosTipBox, !isDark && { backgroundColor: '#F0FDFA', borderLeftColor: TEAL_ACCENT }]}>
              <Ionicons name="information-circle-outline" size={18} color="#009688" style={{ marginTop: 2 }} />
              <Text style={[styles.iosTipText, !isDark && { color: '#0F766E' }]}>
                Mẹo iPhone: Hãy đảm bảo cần gạt im lặng/rung bên sườn máy đang gạt sang chế độ Chuông và tăng âm lượng máy để nghe rõ.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={async () => {
                await Speech.stop();
                setIsPlayingTestVoice(false);
                setShowVoiceModal(false);
              }}
            >
              <Text style={styles.primaryActionText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Modal Đọc gần đây */}
      <Modal visible={showHistoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: dynamicTheme.modalBg, borderColor: dynamicTheme.modalBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dynamicTheme.modalTitle }]}>Lịch sử đọc gần đây</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color={dynamicTheme.modalTitle} />
              </TouchableOpacity>
            </View>
            {historyList.length === 0 ? (
              <Text style={[styles.emptyNotice, { color: dynamicTheme.menuRightText }]}>Chưa có bài viết nào trong lịch sử.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 340 }}>
                {historyList.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.historyRow, { borderBottomColor: dynamicTheme.modalOptionBorder }]}
                    onPress={() => {
                      setShowHistoryModal(false);
                      router.push(`/article/${item.id}`);
                    }}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.historyThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.historyTitle, { color: dynamicTheme.modalTitle }]} numberOfLines={2}>{item.title}</Text>
                      <Text style={[styles.historyMeta, { color: dynamicTheme.menuRightText }]}>{item.author} • {item.readTime}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 4. Modal Tài khoản: Đăng nhập & Đăng ký (Khớp chuẩn 100% Hình 1 & Hình 2) */}
      <Modal visible={showLoginModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetOverlay}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowLoginModal(false)} />
          <View style={styles.sheetContainer}>
            {/* Thanh kéo xám trên cùng */}
            <View style={styles.sheetHandle} />

            {/* Tiêu đề Tài khoản */}
            <Text style={styles.sheetTitle}>Tài khoản</Text>

            {/* Hai tab Đăng nhập / Đăng ký có đường gạch chân xanh */}
            <View style={styles.sheetTabsRow}>
              <TouchableOpacity
                style={[styles.sheetTabItem, authTab === 'login' && styles.sheetTabItemActive]}
                onPress={() => setAuthTab('login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.sheetTabText, authTab === 'login' && styles.sheetTabTextActive]}>
                  Đăng nhập
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sheetTabItem, authTab === 'register' && styles.sheetTabItemActive]}
                onPress={() => setAuthTab('register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.sheetTabText, authTab === 'register' && styles.sheetTabTextActive]}>
                  Đăng ký
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nội dung Form chuyển đổi theo Tab */}
            {authTab === 'login' ? (
              /* TAB ĐĂNG NHẬP (HÌNH 2) */
              <View style={styles.sheetFormWrap}>
                {/* Ô nhập Email / Gmail */}
                <View style={styles.sheetInputBox}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.sheetInputIcon} />
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Ô nhập Mật khẩu kèm nút ẩn hiện mắt */}
                <View style={styles.sheetInputBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.sheetInputIcon} />
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={10}
                    style={styles.sheetEyeBtn}
                  >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Nút Đăng nhập xanh ngọc */}
                <TouchableOpacity
                  style={styles.sheetMainBtn}
                  onPress={handleLoginSubmit}
                  disabled={isSubmittingAuth}
                  activeOpacity={0.8}
                >
                  {isSubmittingAuth ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.sheetMainBtnText}>Đăng nhập</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Dòng gợi ý tài khoản mẫu */}
                <Text style={styles.sheetSampleHint}>
                  Tài khoản mẫu: reader@firanews.local / 123456
                </Text>

                {/* Chọn phương thức khác */}
                <TouchableOpacity
                  style={styles.sheetLinkBtn}
                  onPress={handleOtherMethods}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sheetLinkText}>← Chọn phương thức khác</Text>
                </TouchableOpacity>

                {/* Nút Đóng */}
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={() => setShowLoginModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sheetCloseText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* TAB ĐĂNG KÝ (HÌNH 1) */
              <View style={styles.sheetFormWrap}>
                {/* Ô Họ và tên */}
                <View style={styles.sheetInputBox}>
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.sheetInputIcon} />
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="Họ và tên (ít nhất 2 ký tự)"
                    placeholderTextColor="#9CA3AF"
                    value={regName}
                    onChangeText={setRegName}
                  />
                </View>

                {/* Ô Email / Gmail */}
                <View style={styles.sheetInputBox}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.sheetInputIcon} />
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={regEmail}
                    onChangeText={setRegEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Ô Mật khẩu */}
                <View style={styles.sheetInputBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.sheetInputIcon} />
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
                    placeholderTextColor="#9CA3AF"
                    value={regPassword}
                    onChangeText={setRegPassword}
                    secureTextEntry={!showRegPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowRegPassword(!showRegPassword)}
                    hitSlop={10}
                    style={styles.sheetEyeBtn}
                  >
                    <Ionicons name={showRegPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Ô Xác nhận mật khẩu */}
                <View style={styles.sheetInputBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" style={styles.sheetInputIcon} />
                  <TextInput
                    style={styles.sheetInput}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={regConfirmPassword}
                    onChangeText={setRegConfirmPassword}
                    secureTextEntry={!showRegPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowRegPassword(!showRegPassword)}
                    hitSlop={10}
                    style={styles.sheetEyeBtn}
                  >
                    <Ionicons name={showRegPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Nút Tạo tài khoản */}
                <TouchableOpacity
                  style={styles.sheetMainBtn}
                  onPress={handleRegisterSubmit}
                  disabled={isSubmittingAuth}
                  activeOpacity={0.8}
                >
                  {isSubmittingAuth ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.sheetMainBtnText}>Tạo tài khoản</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Chọn phương thức khác */}
                <TouchableOpacity
                  style={styles.sheetLinkBtn}
                  onPress={handleOtherMethods}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sheetLinkText}>← Chọn phương thức khác</Text>
                </TouchableOpacity>

                {/* Nút Đóng */}
                <TouchableOpacity
                  style={styles.sheetCloseBtn}
                  onPress={() => setShowLoginModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sheetCloseText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 5. Modal Đang theo dõi */}
      <Modal visible={showFollowModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: dynamicTheme.modalBg, borderColor: dynamicTheme.modalBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dynamicTheme.modalTitle }]}>Chuyên mục đang theo dõi</Text>
              <TouchableOpacity onPress={() => setShowFollowModal(false)}>
                <Ionicons name="close" size={24} color={dynamicTheme.modalTitle} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSub, { color: dynamicTheme.menuRightText }]}>Bạn đang quan tâm đến các chủ đề sau:</Text>
            <View style={styles.tagWrap}>
              {['Công nghệ', 'Thời sự', 'Giáo dục', 'Kinh tế số', 'Bóng đá VN', 'Trí tuệ nhân tạo'].map((tag) => (
                <View key={tag} style={styles.tagBadge}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryActionBtn} onPress={() => setShowFollowModal(false)}>
              <Text style={styles.primaryActionText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 6. Modal Tin đã tải */}
      <Modal visible={showDownloadModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: dynamicTheme.modalBg, borderColor: dynamicTheme.modalBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dynamicTheme.modalTitle }]}>Tin đọc ngoại tuyến (Offline)</Text>
              <TouchableOpacity onPress={() => setShowDownloadModal(false)}>
                <Ionicons name="close" size={24} color={dynamicTheme.modalTitle} />
              </TouchableOpacity>
            </View>
            <View style={styles.offlineBox}>
              <Ionicons name="cloud-done-outline" size={48} color={TEAL_ACCENT} />
              <Text style={[styles.offlineTitle, { color: dynamicTheme.modalTitle }]}>Đã đồng bộ 20 bài viết</Text>
              <Text style={[styles.offlineSub, { color: dynamicTheme.menuRightText }]}>
                Toàn bộ dữ liệu tin tức và video đã được lưu sẵn trong bộ nhớ đệm, bạn có thể đọc báo ngay cả khi không có mạng Internet.
              </Text>
            </View>
            <TouchableOpacity style={styles.primaryActionBtn} onPress={() => setShowDownloadModal(false)}>
              <Text style={styles.primaryActionText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  backBtnSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* User section */
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27272A',
  },
  userInfoCol: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E11D48',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 4,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  switchAccountBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 4 Quick Action buttons */
  quickGrid: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 16,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginVertical: 14,
  },

  /* Sections */
  sectionWrap: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: TEAL_ACCENT,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 24,
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  productMenuLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuRightText: {
    color: TEXT_SUBTLE,
    fontSize: 14,
    fontWeight: '500',
  },

  /* Footer */
  footerWrap: {
    marginTop: 26,
    alignItems: 'center',
    gap: 12,
  },
  versionText: {
    color: TEXT_SUBTLE,
    fontSize: 12,
    fontWeight: '500',
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#27272A',
  },
  logoutText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  modalSub: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  primaryActionBtn: {
    backgroundColor: TEAL_ACCENT,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* History modal */
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  historyThumb: {
    width: 60,
    height: 45,
    borderRadius: 6,
    backgroundColor: '#27272A',
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  historyMeta: {
    color: TEXT_SUBTLE,
    fontSize: 12,
    marginTop: 4,
  },
  emptyNotice: {
    color: TEXT_MUTED,
    textAlign: 'center',
    paddingVertical: 20,
  },

  /* Accounts */
  accountChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#242429',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  accountChoiceActive: {
    borderColor: TEAL_ACCENT,
    backgroundColor: '#1E2B28',
  },
  accountDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  accountChoiceName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  accountChoiceEmail: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginTop: 2,
  },

  /* Tags */
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#009688',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Offline */
  offlineBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  offlineTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  offlineSub: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  voicePlayingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#162D29',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#009688',
    marginBottom: 6,
  },
  voicePlayingText: {
    color: '#00D2B8',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  stopVoiceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#264E47',
    borderRadius: 4,
  },
  stopVoiceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  iosTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E1E24',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: TEAL_ACCENT,
  },
  iosTipText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },

  /* Blue settings button in header */
  settingsCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0088FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0088FF',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Avatar silhouette */
  avatarSilhouetteBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#26262B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSubText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 3,
  },

  /* Bottom sheet modal for Login / Register */
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 18,
  },
  sheetTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 18,
  },
  sheetTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  sheetTabItemActive: {
    borderBottomColor: '#009688',
  },
  sheetTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  sheetTabTextActive: {
    color: '#009688',
    fontWeight: '800',
  },
  sheetFormWrap: {
    marginTop: 4,
  },
  sheetInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  sheetInputIcon: {
    marginRight: 10,
  },
  sheetInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: '100%',
  },
  sheetEyeBtn: {
    padding: 4,
  },
  sheetMainBtn: {
    height: 50,
    backgroundColor: '#009688',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#009688',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sheetMainBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetSampleHint: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
  },
  sheetLinkBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  sheetLinkText: {
    color: '#009688',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetCloseBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  sheetCloseText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '700',
  },
});
