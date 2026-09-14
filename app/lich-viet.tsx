/**
 * lich-viet.tsx — Màn hình Lịch Việt (Âm lịch)
 * Hỗ trợ: Lịch ngày (daily view) + Lịch tháng (monthly view) + Date picker modal
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SW } = Dimensions.get('window');
const TEAL = '#4E9E8E';
const TEAL_DARK = '#3B7A6D';

// ─── Âm lịch (Hồng Kông algorithm) ────────────────────────────────────────────
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CAN_GIO = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân'];
const CHI_GIO = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

function jdFromDate(dd: number, mm: number, yy: number) {
  let a = Math.floor((14 - mm) / 12);
  let y = yy + 4800 - a;
  let m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  return jd;
}

function getNewMoonDay(k: number, timeZone: number) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 -= 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 += 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (M + 2 * Mpr));
  let deltaT = 0;
  if (T < -11) { deltaT = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3; }
  else { deltaT = -0.000278 + 0.000265 * T + 0.000262 * T2; }
  return Math.floor(Jd1 + C1 - deltaT + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number) {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L /= 360;
  return Math.floor((L - Math.floor(L)) * 12);
}

function getLunarMonth11(yy: number, timeZone: number) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) nm = getNewMoonDay(k - 1, timeZone);
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone = 7) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
  const a11 = getLunarMonth11(yy, timeZone);
  const b11 = a11 > monthStart ? getLunarMonth11(yy - 1, timeZone) : getLunarMonth11(yy + 1, timeZone);
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leapMonthDiff = 0;
  let lunarLeap = false;
  if (b11 - a11 > 365) {
    const leapOffset = getLeapMonthOffset(a11, timeZone);
    leapMonthDiff = leapOffset;
    if (diff >= leapMonthDiff - 1) leapMonthDiff--;
    if (diff === leapOffset - 1) lunarLeap = true;
  }
  const lunarMonth = (((diff + leapMonthDiff) % 12) + 11) % 12 + 1;
  const lunarYear = (diff >= leapMonthDiff - 1 ? a11 >= b11 : a11 < b11) ? yy : yy - 1;
  return { lunarDay, lunarMonth, lunarYear, lunarLeap };
}

function getStemBranch(year: number) {
  return `${CAN[(year + 6) % 10]} ${CHI[(year + 8) % 12]}`;
}

function getHourStemBranch(hour: number) {
  const idx = Math.floor(((hour + 1) % 24) / 2);
  return `${CAN_GIO[idx]} ${CHI_GIO[idx]}`;
}

function getDayStemBranch(jd: number) {
  return `${CAN[(jd + 9) % 10]} ${CHI[(jd + 1) % 12]}`;
}

function getMonthStemBranch(month: number, year: number) {
  const m = month - 1;
  const idx = ((year - 2000) * 12 + m + 252) % 10;
  return `${CAN[idx % 10]} ${CHI[(m + 2) % 12]}`;
}

const WEEKDAYS_FULL = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

const QUOTES = [
  'Thành công trong bất kì nỗ lực nào cũng đòi hỏi sự chú ý cao độ và sự tập trung hoàn toàn.\n- Hãy làm việc tập trung. -',
  'Người thành công không phải là người không bao giờ thất bại, mà là người biết đứng dậy sau mỗi lần vấp ngã.',
  'Hành trình vạn dặm bắt đầu từ một bước chân.\n- Lão Tử -',
  'Đừng chờ đợi cơ hội hoàn hảo, hãy nắm lấy cơ hội và làm cho nó hoàn hảo.',
  'Mỗi ngày là một trang mới trong cuốn sách cuộc đời bạn. Hãy viết thật đẹp!',
  'Sự kiên nhẫn và bền bỉ có sức mạnh thần kỳ trước những trở ngại không thể vượt qua.',
  'Học từ ngày hôm qua, sống cho ngày hôm nay, hy vọng cho ngày mai.',
];

// ─── Danh sách ngày lễ & sự kiện (Dương lịch & Âm lịch) ───────────────────────
const SOLAR_HOLIDAYS: Record<string, { isMajor: boolean }> = {
  '1-1': { isMajor: true },   // Tết Dương lịch
  '14-2': { isMajor: false }, // Valentine
  '8-3': { isMajor: false },  // 8/3
  '26-3': { isMajor: false }, // Đoàn
  '30-4': { isMajor: true },  // 30/4
  '1-5': { isMajor: true },   // 1/5
  '19-5': { isMajor: false }, // Sinh nhật Bác
  '1-6': { isMajor: false },  // Thiếu nhi
  '27-7': { isMajor: false }, // Thương binh liệt sĩ
  '19-8': { isMajor: false }, // Cách mạng tháng 8
  '2-9': { isMajor: true },   // Quốc khánh
  '10-9': { isMajor: false }, // Mặt trận TQ
  '10-10': { isMajor: true }, // Giải phóng Thủ đô
  '20-10': { isMajor: false },// Phụ nữ VN
  '20-11': { isMajor: false },// Nhà giáo VN
  '23-11': { isMajor: false },// Nam Kỳ khởi nghĩa
  '22-12': { isMajor: false },// Quân đội ND
  '24-12': { isMajor: false },// Giáng sinh
  '25-12': { isMajor: false },// Giáng sinh
};

const LUNAR_HOLIDAYS: Record<string, { isMajor: boolean }> = {
  '1-1': { isMajor: true },   // Tết
  '2-1': { isMajor: true },   // Tết
  '3-1': { isMajor: true },   // Tết
  '15-1': { isMajor: false }, // Rằm tháng Giêng
  '10-3': { isMajor: true },  // Giỗ Tổ Hùng Vương
  '15-4': { isMajor: false }, // Phật Đản
  '5-5': { isMajor: false },  // Đoan Ngọ
  '15-7': { isMajor: false }, // Vu Lan
  '15-8': { isMajor: false }, // Tết Trung Thu (rằm tháng 8)
  '23-12': { isMajor: false },// Ông Công Ông Táo
};

function getDayInfo(d: number, m: number, y: number) {
  const lun = convertSolar2Lunar(d, m, y);
  const solarKey = `${d}-${m}`;
  const lunarKey = `${lun.lunarDay}-${lun.lunarMonth}`;
  const solarHoli = SOLAR_HOLIDAYS[solarKey];
  const lunarHoli = LUNAR_HOLIDAYS[lunarKey];

  const isMajorHoliday = Boolean(solarHoli?.isMajor || lunarHoli?.isMajor);
  const hasStar = Boolean(solarHoli || lunarHoli || lun.lunarDay === 15);
  const isFirstLunar = lun.lunarDay === 1;
  const isFifteenLunar = lun.lunarDay === 15;
  const hasDot = isMajorHoliday || hasStar || isFirstLunar || (d % 3 === 0);

  return { lun, isMajorHoliday, hasStar, isFirstLunar, isFifteenLunar, hasDot };
}

// ─── Component ───────────────────────────────────────────────────────────────
// ─── Month Card Component (Memoized outside parent to avoid re-mounting on scroll) ──────
interface MonthCardProps {
  index: number;
  year: number;
  month: number;
  daysInMonth: number;
  startOffset: number;
  todayDateStr: string;
  onSelectDate: (d: Date) => void;
  onLayoutY: (index: number, y: number) => void;
}

const MonthCard = React.memo(function MonthCard({
  index,
  year,
  month,
  daysInMonth,
  startOffset,
  todayDateStr,
  onSelectDate,
  onLayoutY,
}: MonthCardProps) {
  const rows: number[][] = [];
  let row: number[] = Array(startOffset).fill(0);
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(d);
    if (row.length === 7) { rows.push(row); row = []; }
  }
  if (row.length) { while (row.length < 7) row.push(0); rows.push(row); }

  return (
    <View
      style={styles.monthCard}
      onLayout={(e) => {
        onLayoutY(index, e.nativeEvent.layout.y);
      }}
    >
      <Text style={styles.monthTitle}>Tháng {month + 1} - {year}</Text>
      <View style={styles.weekHeader}>
        {['HAI', 'BA', 'TƯ', 'NĂM', 'SÁU', 'BẢY', 'CN'].map((d, i) => (
          <Text key={d} style={[styles.weekHeaderText, i === 6 && styles.sundayHeader]}>{d}</Text>
        ))}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={styles.calRow}>
          {r.map((d, ci) => {
            if (!d) return <View key={ci} style={styles.calCell} />;
            const isSunday = ci === 6;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = dateStr === todayDateStr;
            const info = getDayInfo(d, month + 1, year);

            return (
              <Pressable
                key={ci}
                style={[
                  styles.calCell,
                  // CHỈ NỔI BẬT DUY NHẤT NGÀY HÔM NAY TRONG THÁNG
                  isToday && styles.calCellToday,
                ]}
                onPress={() => onSelectDate(new Date(year, month, d))}
              >
                <View style={styles.calCellInner}>
                  {/* Hàng số ngày + sao nếu là ngày lễ/sự kiện */}
                  <View style={styles.calDayRow}>
                    <Text
                      style={[
                        styles.calDay,
                        (isSunday || info.isMajorHoliday) && styles.calRedDay,
                        isToday && styles.calTodayDay,
                      ]}
                    >
                      {d}
                    </Text>
                    {info.hasStar ? (
                      <Text style={styles.calStar}>★</Text>
                    ) : null}
                  </View>

                  {/* Ngày âm lịch + chấm hoàng đạo */}
                  <View style={styles.calLunarRow}>
                    <Text
                      style={[
                        styles.calLunar,
                        isToday && styles.calTodayLunar,
                        info.isFirstLunar && styles.calLunarFirst,
                        info.isFifteenLunar && styles.calLunarFifteen,
                      ]}
                    >
                      {info.isFirstLunar ? `1/${info.lun.lunarMonth}` : info.lun.lunarDay}
                    </Text>
                    {info.hasDot ? (
                      <View
                        style={[
                          styles.calDot,
                          (info.isMajorHoliday || info.hasStar) ? styles.calDotRed : styles.calDotGold,
                        ]}
                      />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
});

// ── Date picker modal constants & WheelPicker ──────────────────────────────
const ITEM_H = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);

function WheelPicker({ data, selected, onSelect }: { data: number[]; selected: number; onSelect: (v: number) => void }) {
  const ref = useRef<FlatList>(null);
  useEffect(() => {
    const idx = data.indexOf(selected);
    if (idx >= 0) setTimeout(() => ref.current?.scrollToIndex({ index: idx, viewOffset: ITEM_H * PAD }), 100);
  }, [selected, data]);
  return (
    <FlatList
      ref={ref}
      data={[...Array(PAD).fill(null), ...data, ...Array(PAD).fill(null)]}
      keyExtractor={(_, i) => String(i)}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      style={{ height: ITEM_H * VISIBLE, width: (SW - 64) / 3 }}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
        if (idx >= 0 && idx < data.length) onSelect(data[idx]);
      }}
      renderItem={({ item }) => {
        const isSelected = item !== null && item === selected;
        return (
          <View style={[styles.wheelItem, isSelected && styles.wheelItemSelected]}>
            <Text style={[styles.wheelText, isSelected && styles.wheelTextSelected]}>
              {item === null ? '' : item}
            </Text>
          </View>
        );
      }}
      getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
    />
  );
}

// ─── Main Screen Component ──────────────────────────────────────────────────
export default function LichVietScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'day' | 'month'>('day');
  const [today, setToday] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDay, setPickerDay] = useState(today.getDate());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth() + 1);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerType, setPickerType] = useState<'solar' | 'lunar'>('solar');

  // ── Đồng hồ thực: chỉ chạy khi ở tab "day" để tránh re-render khi đang lướt "month" ──
  useEffect(() => {
    if (tab !== 'day') return;
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [tab]);

  // ── Tự động qua ngày mới lúc 00:00:00 ────────────────────────────────────
  useEffect(() => {
    function scheduleNextMidnight() {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
      );
      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      const timer = setTimeout(() => {
        const newToday = new Date();
        setToday(newToday);
        setSelectedDate(prev => {
          const prevStr = `${prev.getFullYear()}-${prev.getMonth()}-${prev.getDate()}`;
          const tStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
          return prevStr === tStr ? newToday : prev;
        });
        scheduleNextMidnight();
      }, msUntilMidnight);

      return timer;
    }

    const timer = scheduleNextMidnight();
    return () => clearTimeout(timer);
  }, []);

  const lunar = useMemo(() => {
    return convertSolar2Lunar(selectedDate.getDate(), selectedDate.getMonth() + 1, selectedDate.getFullYear());
  }, [selectedDate]);

  const jd = useMemo(() => jdFromDate(selectedDate.getDate(), selectedDate.getMonth() + 1, selectedDate.getFullYear()), [selectedDate]);
  const quote = useMemo(() => QUOTES[jd % QUOTES.length], [jd]);
  const dayName = WEEKDAYS_FULL[selectedDate.getDay()];
  const stemBranchYear = getStemBranch(lunar.lunarYear);
  const stemBranchDay = getDayStemBranch(jd);
  const stemBranchMonth = getMonthStemBranch(lunar.lunarMonth, lunar.lunarYear);
  const stemBranchHour = getHourStemBranch(currentTime.getHours());

  const hourStr = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');

  // ── Monthly calendar state & helpers ──────────────────────────────────────
  const monthScrollRef = useRef<ScrollView>(null);
  const monthLayouts = useRef<{ [key: number]: number }>({});
  const [showTodayFab, setShowTodayFab] = useState(false);
  const showFabRef = useRef(false);
  const hasScrolledInitialRef = useRef(false);

  const todayDateStr = useMemo(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, [today]);

  // Tạo danh sách 16 tháng (từ 2 tháng trước tháng hiện tại đến 13 tháng sau)
  const months = useMemo(() => {
    const list = [];
    const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    for (let i = 0; i < 16; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const y = d.getFullYear();
      const mo = d.getMonth();
      const daysInMonth = new Date(y, mo + 1, 0).getDate();
      const firstDay = new Date(y, mo, 1).getDay();
      const startOffset = (firstDay + 6) % 7;
      const isCurrentMonth = y === today.getFullYear() && mo === today.getMonth();
      list.push({ index: i, year: y, month: mo, daysInMonth, startOffset, isCurrentMonth });
    }
    return list;
  }, [today]);

  const currentMonthIndex = useMemo(() => {
    const idx = months.findIndex((m) => m.isCurrentMonth);
    return idx >= 0 ? idx : 2;
  }, [months]);

  const handleLayoutY = useCallback((index: number, y: number) => {
    monthLayouts.current[index] = y;
    if (index === currentMonthIndex && !hasScrolledInitialRef.current) {
      hasScrolledInitialRef.current = true;
      requestAnimationFrame(() => {
        monthScrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: false });
      });
    }
  }, [currentMonthIndex]);

  // Reset scroll flag khi đổi tab để khi quay lại tab tháng sẽ cuộn lại về tháng hiện tại
  useEffect(() => {
    if (tab === 'day') {
      hasScrolledInitialRef.current = false;
    }
  }, [tab]);

  const handleSelectDate = useCallback((d: Date) => {
    setSelectedDate(d);
  }, []);

  // Cuộn về tháng hiện tại (ngày hôm nay)
  const scrollToTodayMonth = useCallback(() => {
    const targetY = monthLayouts.current[currentMonthIndex] ?? 0;
    monthScrollRef.current?.scrollTo({ y: Math.max(0, targetY - 12), animated: true });
    setSelectedDate(new Date());
    showFabRef.current = false;
    setShowTodayFab(false);
  }, [currentMonthIndex]);

  // Lắng nghe cuộn mượt mà: chỉ set state khi trạng thái FAB thực sự đổi
  const handleMonthScroll = useCallback(
    (e: any) => {
      const y = e.nativeEvent.contentOffset.y;
      const targetY = monthLayouts.current[currentMonthIndex] ?? 0;
      const shouldShow = Math.abs(y - targetY) > 90;
      if (shouldShow !== showFabRef.current) {
        showFabRef.current = shouldShow;
        setShowTodayFab(shouldShow);
      }
    },
    [currentMonthIndex]
  );

  // Picker data
  const years = Array.from({ length: 200 }, (_, i) => 1924 + i);

  function openPicker() {
    setPickerDay(selectedDate.getDate());
    setPickerMonth(selectedDate.getMonth() + 1);
    setPickerYear(selectedDate.getFullYear());
    setShowPicker(true);
  }

  function confirmPicker() {
    const d = new Date(pickerYear, pickerMonth - 1, pickerDay);
    setSelectedDate(d);
    setShowPicker(false);
  }

  const pickerLunar = useMemo(
    () => convertSolar2Lunar(pickerDay, pickerMonth, pickerYear),
    [pickerDay, pickerMonth, pickerYear]
  );

  const daysInPickerMonth = new Date(pickerYear, pickerMonth, 0).getDate();
  const dayOptions = Array.from({ length: daysInPickerMonth }, (_, i) => i + 1);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#2D8C9A', '#3C7E8A', '#53646F', '#6E5860', '#3D7A86']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>

        {/* Tab switcher */}
        <View style={styles.tabSwitcher}>
          <Pressable
            style={[styles.tabItem, tab === 'day' && styles.tabItemActive]}
            onPress={() => setTab('day')}
          >
            <Text style={[styles.tabText, tab === 'day' && styles.tabTextActive]}>Lịch ngày</Text>
          </Pressable>
          <Pressable
            style={[styles.tabItem, tab === 'month' && styles.tabItemActive]}
            onPress={() => setTab('month')}
          >
            <Text style={[styles.tabText, tab === 'month' && styles.tabTextActive]}>Lịch tháng</Text>
          </Pressable>
        </View>

        {/* Spacer giữ cân bằng thanh chuyển tab ở giữa */}
        <View style={styles.headerBtn} />
      </View>

      {/* Content */}
      {tab === 'day' ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.dayScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Illustration placeholder */}
          <View style={styles.illustBox}>
            <View style={styles.illustCloud} />
            <View style={styles.illustInner}>
              <Text style={styles.illustEmoji}>🧒🏻</Text>
              <Text style={styles.illustEmoji2}>🐉</Text>
            </View>
          </View>

          {/* Date card */}
          <View style={styles.dateCard}>
            <Text style={styles.dateCardWeekday}>{dayName.toUpperCase()}</Text>
            <Text style={styles.dateCardDay}>{selectedDate.getDate()}</Text>
            <Text style={styles.dateCardMonthYear}>
              TH.{selectedDate.getMonth() + 1} - {selectedDate.getFullYear()}
            </Text>
          </View>

          {/* Quote */}
          <Text style={styles.quoteText}>{quote}</Text>

          {/* Can Chi */}
          <View style={styles.canChiCard}>
            <Text style={styles.canChiTitle}>Năm {stemBranchYear}</Text>
            <View style={styles.canChiRow}>
              <View style={styles.canChiCol}>
                <Text style={styles.canChiLabel}>GIỜ</Text>
                <Text style={styles.canChiValue}>{hourStr}</Text>
                <Text style={styles.canChiSub}>{stemBranchHour}</Text>
              </View>
              <View style={styles.canChiDivider} />
              <View style={styles.canChiCol}>
                <Text style={styles.canChiLabel}>NGÀY</Text>
                <Text style={styles.canChiValue}>{lunar.lunarDay}</Text>
                <Text style={styles.canChiSub}>{stemBranchDay}</Text>
              </View>
              <View style={styles.canChiDivider} />
              <View style={styles.canChiCol}>
                <Text style={styles.canChiLabel}>THÁNG</Text>
                <Text style={styles.canChiValue}>{lunar.lunarMonth}</Text>
                <Text style={styles.canChiSub}>{stemBranchMonth}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={monthScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: insets.bottom + 40,
              paddingTop: 6,
            }}
            showsVerticalScrollIndicator={false}
            onScroll={handleMonthScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
          >
            {months.map((m) => (
              <MonthCard
                key={`${m.year}-${m.month}`}
                index={m.index}
                year={m.year}
                month={m.month}
                daysInMonth={m.daysInMonth}
                startOffset={m.startOffset}
                todayDateStr={todayDateStr}
                onSelectDate={handleSelectDate}
                onLayoutY={handleLayoutY}
              />
            ))}
          </ScrollView>

          {/* Nút tròn đỏ "HÔM NAY" nổi ở góc dưới phải khi cuộn rời xa tháng hiện tại */}
          {showTodayFab && (
            <TouchableOpacity
              style={[styles.todayFab, { bottom: insets.bottom + 24 }]}
              onPress={scrollToTodayMonth}
              activeOpacity={0.85}
            >
              <Text style={styles.todayFabText}>HÔM{'\n'}NAY</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Date Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setShowPicker(false)} />
        <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.pickerTitle}>Chọn ngày</Text>

          {/* Info */}
          <View style={styles.pickerInfo}>
            <Text style={styles.pickerInfoLabel}>Dương lịch</Text>
            <Text style={styles.pickerInfoValue}>
              {WEEKDAYS_FULL[new Date(pickerYear, pickerMonth - 1, pickerDay).getDay()]}, ngày {pickerDay} tháng {pickerMonth}, năm {pickerYear}
            </Text>
            <Text style={styles.pickerInfoLabel}>Âm lịch</Text>
            <Text style={styles.pickerInfoValue}>
              Ngày {pickerLunar.lunarDay} tháng {pickerLunar.lunarMonth}{pickerLunar.lunarLeap ? ' (T)' : ''}, năm {getStemBranch(pickerLunar.lunarYear)}
            </Text>
          </View>

          {/* Type toggle */}
          <View style={styles.pickerTypeRow}>
            <Pressable
              style={[styles.pickerTypeBtn, pickerType === 'solar' && styles.pickerTypeBtnActive]}
              onPress={() => setPickerType('solar')}
            >
              <Text style={[styles.pickerTypeText, pickerType === 'solar' && styles.pickerTypeTextActive]}>Dương lịch</Text>
            </Pressable>
            <Pressable
              style={[styles.pickerTypeBtn, pickerType === 'lunar' && styles.pickerTypeBtnActive]}
              onPress={() => setPickerType('lunar')}
            >
              <Text style={[styles.pickerTypeText, pickerType === 'lunar' && styles.pickerTypeTextActive]}>Âm lịch</Text>
            </Pressable>
          </View>

          {/* Wheels */}
          <View style={styles.pickerWheels}>
            <WheelPicker data={dayOptions} selected={pickerDay} onSelect={setPickerDay} />
            <WheelPicker data={monthOptions} selected={pickerMonth} onSelect={setPickerMonth} />
            <WheelPicker data={years} selected={pickerYear} onSelect={setPickerYear} />
          </View>

          <TouchableOpacity style={styles.pickerConfirmBtn} onPress={confirmPicker}>
            <Text style={styles.pickerConfirmText}>Xem chi tiết</Text>
          </TouchableOpacity>
          <Pressable onPress={() => setShowPicker(false)}>
            <Text style={styles.pickerClose}>Đóng</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 20,
    padding: 3,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 17,
  },
  tabItemActive: { backgroundColor: 'rgba(255,255,255,0.88)' },
  tabText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  tabTextActive: { color: '#1E293B', fontWeight: '800' },

  // Day view
  dayScroll: { alignItems: 'center', paddingBottom: 40, paddingTop: 8 },

  illustBox: {
    width: SW - 60,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  illustCloud: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
  },
  illustInner: { flexDirection: 'row', alignItems: 'flex-end' },
  illustEmoji: { fontSize: 90, lineHeight: 110 },
  illustEmoji2: { fontSize: 60, lineHeight: 80, marginLeft: -8 },

  dateCard: {
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingHorizontal: 36,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  dateCardWeekday: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', letterSpacing: 2 },
  dateCardDay: { color: '#fff', fontSize: 64, fontWeight: '800', lineHeight: 70 },
  dateCardMonthYear: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },

  quoteText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginHorizontal: 24,
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  canChiCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16,
    padding: 16,
    width: SW - 40,
  },
  canChiTitle: { textAlign: 'center', fontWeight: '700', fontSize: 15, color: '#333', marginBottom: 12 },
  canChiRow: { flexDirection: 'row', justifyContent: 'space-around' },
  canChiCol: { alignItems: 'center', flex: 1 },
  canChiDivider: { width: 1, backgroundColor: '#ddd' },
  canChiLabel: { fontSize: 11, color: '#888', letterSpacing: 1, marginBottom: 4 },
  canChiValue: { fontSize: 28, fontWeight: '700', color: '#222' },
  canChiSub: { fontSize: 12, color: '#666', marginTop: 2 },

  // Month view
  monthCard: {
    backgroundColor: 'rgba(38, 52, 60, 0.72)',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  monthTitle: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.68)',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  sundayHeader: { color: '#F87171' },
  calRow: { flexDirection: 'row', marginBottom: 2 },
  calCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginHorizontal: 1,
    marginVertical: 1,
    borderRadius: 8,
  },
  // Nền bo góc xanh navy DUY NHẤT cho ngày hôm nay
  calCellToday: {
    backgroundColor: '#264870',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  calCellInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  calDayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  calDay: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  calRedDay: {
    color: '#F87171', // Ngày lễ hoặc Chủ nhật: số đỏ
    fontWeight: '700',
  },
  calTodayDay: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calStar: {
    color: '#FF4D4D', // Sao đỏ cạnh số ngày lễ/sự kiện
    fontSize: 8,
    marginLeft: 1,
    marginTop: -2,
  },
  calLunarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    gap: 2,
  },
  calLunar: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '400',
  },
  calTodayLunar: {
    color: '#FF6464',
    fontWeight: '700',
  },
  calLunarFirst: {
    color: '#FF6464',
    fontWeight: '700',
  },
  calLunarFifteen: {
    color: '#FF7B7B',
    fontWeight: '600',
  },
  calDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    marginLeft: 1,
  },
  calDotGold: {
    backgroundColor: '#F59E0B',
  },
  calDotRed: {
    backgroundColor: '#FF5454',
  },

  // Floating Action Button "HÔM NAY"
  todayFab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF5454',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    zIndex: 99,
  },
  todayFabText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Picker modal
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerTitle: { textAlign: 'center', fontWeight: '700', fontSize: 17, marginBottom: 12, color: '#222' },
  pickerInfo: { marginBottom: 16 },
  pickerInfoLabel: { fontSize: 13, color: '#888', marginTop: 6 },
  pickerInfoValue: { fontSize: 15, color: '#222', fontWeight: '500' },
  pickerTypeRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  pickerTypeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  pickerTypeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  pickerTypeText: { fontSize: 14, color: '#888' },
  pickerTypeTextActive: { color: '#222', fontWeight: '600' },
  pickerWheels: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  wheelItem: { height: 44, justifyContent: 'center', alignItems: 'center' },
  wheelItemSelected: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ddd' },
  wheelText: { fontSize: 16, color: '#aaa' },
  wheelTextSelected: { fontSize: 18, color: '#222', fontWeight: '600' },
  pickerConfirmBtn: {
    backgroundColor: '#E8685A',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerConfirmText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  pickerClose: { textAlign: 'center', color: '#888', fontSize: 15 },
});
