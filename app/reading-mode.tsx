/**
 * reading-mode.tsx — Màn hình Chế độ đọc
 * Cho phép người dùng chọn kiểu hiển thị danh sách tin tức
 */
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReadingMode } from '@/context/ReadingModeContext';

// ─── Layout Preview Components ─────────────────────────────────────────────────

/** Preview thumbnail cho "Danh sách to" – card lớn có hình + text */
function LargeListPreview({ selected, primaryColor }: { selected: boolean; primaryColor: string }) {
  return (
    <View style={[previewStyles.phoneFrame, selected && [previewStyles.phoneFrameActive, { borderColor: primaryColor }]]}>
      {/* Header bar */}
      <View style={previewStyles.miniHeader}>
        <View style={[previewStyles.dot, { backgroundColor: primaryColor + '60' }]} />
        <View style={previewStyles.miniHeaderBar} />
      </View>

      {/* Large image placeholder */}
      <View style={previewStyles.largeImageBox}>
        <View style={previewStyles.largeImagePlaceholder} />
      </View>

      {/* Text lines */}
      <View style={previewStyles.textGroup}>
        <View style={[previewStyles.textLine, { width: '90%' }]} />
        <View style={[previewStyles.textLine, { width: '70%' }]} />
      </View>

      {/* Separator */}
      <View style={previewStyles.separator} />

      {/* Small row */}
      <View style={previewStyles.smallRow}>
        <View style={previewStyles.smallThumb} />
        <View style={previewStyles.smallTextGroup}>
          <View style={[previewStyles.textLineSmall, { width: '85%' }]} />
          <View style={[previewStyles.textLineSmall, { width: '60%' }]} />
        </View>
      </View>
    </View>
  );
}

/** Preview thumbnail cho "Danh sách nhỏ" – compact list rows */
function SmallListPreview({ selected, primaryColor }: { selected: boolean; primaryColor: string }) {
  return (
    <View style={[previewStyles.phoneFrame, selected && [previewStyles.phoneFrameActive, { borderColor: primaryColor }]]}>
      {/* Header bar */}
      <View style={previewStyles.miniHeader}>
        <View style={[previewStyles.dot, { backgroundColor: primaryColor + '60' }]} />
        <View style={previewStyles.miniHeaderBar} />
      </View>

      {/* Row 1 */}
      <View style={previewStyles.compactRow}>
        <View style={previewStyles.compactTextGroup}>
          <View style={[previewStyles.textLineSmall, { width: '95%' }]} />
          <View style={[previewStyles.textLineSmall, { width: '80%' }]} />
          <View style={[previewStyles.textLineSmall, { width: '50%', marginTop: 4 }]} />
        </View>
        <View style={previewStyles.compactThumb} />
      </View>

      <View style={previewStyles.separator} />

      {/* Row 2 */}
      <View style={previewStyles.compactRow}>
        <View style={previewStyles.compactTextGroup}>
          <View style={[previewStyles.textLineSmall, { width: '90%' }]} />
          <View style={[previewStyles.textLineSmall, { width: '70%' }]} />
          <View style={[previewStyles.textLineSmall, { width: '45%', marginTop: 4 }]} />
        </View>
        <View style={previewStyles.compactThumb} />
      </View>

      <View style={previewStyles.separator} />

      {/* Row 3 */}
      <View style={previewStyles.compactRow}>
        <View style={previewStyles.compactTextGroup}>
          <View style={[previewStyles.textLineSmall, { width: '85%' }]} />
          <View style={[previewStyles.textLineSmall, { width: '65%' }]} />
        </View>
        <View style={previewStyles.compactThumb} />
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────────

export default function ReadingModeScreen() {
  const { theme } = useTheme();
  const { layout, simpleMode, setLayout, setSimpleMode } = useReadingMode();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          hitSlop={12}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Chế độ đọc</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* ── Chế độ đơn giản ────────────────────────────── */}
      <View style={styles.simpleRow}>
        <View style={styles.simpleLabelRow}>
          <Text style={[styles.simpleLabel, { color: theme.text }]}>Chế độ đơn giản</Text>
          <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.newBadgeText}>MỚI</Text>
          </View>
        </View>
        <Switch
          value={simpleMode}
          onValueChange={setSimpleMode}
          trackColor={{ false: '#D1D5DB', true: theme.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D1D5DB"
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* ── Chế độ thường ──────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>Chế độ thường</Text>

      <View style={styles.layoutOptionsRow}>
        {/* Option: Danh sách to */}
        <Pressable
          style={styles.layoutOption}
          onPress={() => setLayout('large')}
        >
          <LargeListPreview selected={layout === 'large'} primaryColor={theme.primary} />
          <View style={styles.radioRow}>
            <View style={[styles.radioOuter, layout === 'large' && [styles.radioOuterActive, { borderColor: theme.primary }]]}>
              {layout === 'large' && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
            </View>
          </View>
          <Text style={[styles.layoutLabel, { color: layout === 'large' ? theme.primary : theme.textSub, fontWeight: layout === 'large' ? '700' : '400' }]}>
            Danh sách to
          </Text>
        </Pressable>

        {/* Option: Danh sách nhỏ */}
        <Pressable
          style={styles.layoutOption}
          onPress={() => setLayout('small')}
        >
          <SmallListPreview selected={layout === 'small'} primaryColor={theme.primary} />
          <View style={styles.radioRow}>
            <View style={[styles.radioOuter, layout === 'small' && [styles.radioOuterActive, { borderColor: theme.primary }]]}>
              {layout === 'small' && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
            </View>
          </View>
          <Text style={[styles.layoutLabel, { color: layout === 'small' ? theme.primary : theme.textSub, fontWeight: layout === 'small' ? '700' : '400' }]}>
            Danh sách nhỏ
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Main Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 40, // offset the back button to center title
  },
  headerSpacer: {
    width: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  /* Chế độ đơn giản */
  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  simpleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  simpleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  newBadge: {
    backgroundColor: '#FF5252',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Chế độ thường */
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
  },

  layoutOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 24,
  },

  layoutOption: {
    alignItems: 'center',
    gap: 12,
  },

  /* Radio button */
  radioRow: {
    marginTop: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#009688',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#009688',
  },

  layoutLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  layoutLabelActive: {
    color: '#009688',
    fontWeight: '600',
  },
});

// ─── Preview Styles ─────────────────────────────────────────────────────────────

const previewStyles = StyleSheet.create({
  phoneFrame: {
    width: 130,
    height: 170,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFBFC',
    padding: 10,
    overflow: 'hidden',
  },
  phoneFrameActive: {
    borderColor: '#009688',
    borderWidth: 2,
  },

  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniHeaderBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },

  /* Large list preview */
  largeImageBox: {
    marginBottom: 8,
  },
  largeImagePlaceholder: {
    width: '100%',
    height: 52,
    backgroundColor: '#E0E4E8',
    borderRadius: 4,
  },
  textGroup: {
    gap: 4,
    marginBottom: 8,
  },
  textLine: {
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },

  separator: {
    height: 1,
    backgroundColor: '#EDEFF2',
    marginVertical: 6,
  },

  smallRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallThumb: {
    width: 28,
    height: 22,
    backgroundColor: '#E0E4E8',
    borderRadius: 3,
  },
  smallTextGroup: {
    flex: 1,
    gap: 3,
  },
  textLineSmall: {
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },

  /* Compact list preview */
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  compactTextGroup: {
    flex: 1,
    gap: 3,
  },
  compactThumb: {
    width: 30,
    height: 24,
    backgroundColor: '#E0E4E8',
    borderRadius: 3,
  },
});
