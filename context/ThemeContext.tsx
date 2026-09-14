import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeKey = 'teal' | 'dark' | 'blue' | 'purple' | 'red' | 'orange' | 'light';

export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSub: string;
  primary: string;
  headerBg: string;
  headerGradient: [string, string];
  tabBar: string;
};

export const THEMES: Record<ThemeKey, ThemeColors> = {
  teal: {
    background: '#FFFFFF',
    surface: '#F0FDFA',
    border: '#E2E8F0',
    text: '#0F172A',
    textSub: '#64748B',
    primary: '#009688',
    headerBg: '#078EAA',
    headerGradient: ['#078EAA', '#009688'],
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#121214',
    surface: '#18181C',
    border: '#222226',
    text: '#FFFFFF',
    textSub: '#9CA3AF',
    primary: '#00D2B8',
    headerBg: '#15181C',
    headerGradient: ['#16161A', '#121214'],
    tabBar: '#141416',
  },
  blue: {
    background: '#FFFFFF',
    surface: '#EFF6FF',
    border: '#DBEAFE',
    text: '#1E3A8A',
    textSub: '#60A5FA',
    primary: '#2563EB',
    headerBg: '#1D4ED8',
    headerGradient: ['#1D4ED8', '#2563EB'],
    tabBar: '#FFFFFF',
  },
  purple: {
    background: '#FFFFFF',
    surface: '#FAF5FF',
    border: '#F3E8FF',
    text: '#581C87',
    textSub: '#A855F7',
    primary: '#7C3AED',
    headerBg: '#6D28D9',
    headerGradient: ['#6D28D9', '#7C3AED'],
    tabBar: '#FFFFFF',
  },
  red: {
    background: '#FFFFFF',
    surface: '#FFF1F2',
    border: '#FFE4E6',
    text: '#881337',
    textSub: '#FB7185',
    primary: '#E11D48',
    headerBg: '#BE123C',
    headerGradient: ['#BE123C', '#E11D48'],
    tabBar: '#FFFFFF',
  },
  orange: {
    background: '#FFFFFF',
    surface: '#FFF7ED',
    border: '#FFEDD5',
    text: '#7C2D12',
    textSub: '#FB923C',
    primary: '#EA580C',
    headerBg: '#C2410C',
    headerGradient: ['#C2410C', '#EA580C'],
    tabBar: '#FFFFFF',
  },
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    textSub: '#6B7280',
    primary: '#009688',
    headerBg: '#FFFFFF',
    headerGradient: ['#FFFFFF', '#F3F4F6'],
    tabBar: '#FFFFFF',
  },
};

export const THEME_META: { key: ThemeKey; label: string; swatch: string }[] = [
  { key: 'teal', label: 'Xanh ngọc', swatch: '#009688' },
  { key: 'dark', label: 'Tối', swatch: '#121212' },
  { key: 'blue', label: 'Xanh dương', swatch: '#2563EB' },
  { key: 'purple', label: 'Tím mộng mơ', swatch: '#7C3AED' },
  { key: 'red', label: 'Đỏ ruby', swatch: '#E11D48' },
  { key: 'orange', label: 'Cam hoàng hôn', swatch: '#EA580C' },
  { key: 'light', label: 'Sáng', swatch: '#FFFFFF' },
];

type ThemeContextType = {
  themeKey: ThemeKey;
  theme: ThemeColors;
  setTheme: (key: ThemeKey) => void;
  followSystem: boolean;
  setFollowSystem: (val: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeKey: 'teal',
  theme: THEMES.teal,
  setTheme: () => {},
  followSystem: false,
  setFollowSystem: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeKey, setThemeKey] = useState<ThemeKey>('dark');
  const [followSystem, setFollowSystem] = useState(false);

  useEffect(() => {
    if (followSystem) {
      setThemeKey(systemColorScheme === 'dark' ? 'dark' : 'teal');
    }
  }, [followSystem, systemColorScheme]);

  const value = {
    themeKey,
    theme: THEMES[themeKey] || THEMES.teal,
    setTheme: setThemeKey,
    followSystem,
    setFollowSystem,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
