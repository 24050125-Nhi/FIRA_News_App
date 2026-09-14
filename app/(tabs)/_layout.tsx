import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/context/ThemeContext';

const tabIcon = (name: keyof typeof Ionicons.glyphMap) => {
  const baseName = (name as string).replace(/-outline$/, '');
  return ({ color, focused }: { color: any; focused: boolean }) => (
    <Ionicons
      name={(focused ? baseName : `${baseName}-outline`) as keyof typeof Ionicons.glyphMap}
      size={24}
      color={color}
    />
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme, themeKey } = useTheme();
  const isDark = themeKey === 'dark';

  const androidSafeBottom = Math.max(insets.bottom, 26);
  const iosSafeBottom = Math.max(insets.bottom, 18);
  const safeBottom = Platform.OS === 'android' ? androidSafeBottom : iosSafeBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: isDark ? '#00D2B8' : theme.primary,
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#8A8F98',
        tabBarStyle: {
          height: 64 + safeBottom,
          paddingTop: 8,
          paddingBottom: safeBottom,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#222226' : '#E5E7EB',
          backgroundColor: isDark ? '#141416' : '#FFFFFF',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 10,
          elevation: 16,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Tin tức', tabBarIcon: tabIcon('newspaper') }} />
      <Tabs.Screen name="video" options={{ title: 'Video', tabBarIcon: tabIcon('play-circle') }} />
      <Tabs.Screen name="explore" options={{ title: 'Xu hướng', tabBarIcon: tabIcon('analytics') }} />
      <Tabs.Screen name="profile" options={{ title: 'Tiện ích', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
    </Tabs>
  );
}
