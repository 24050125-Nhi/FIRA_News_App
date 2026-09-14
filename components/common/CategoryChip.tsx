import { Category } from '@/data/news';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  item: Category;
  active: boolean;
  onPress: () => void;
};

export function CategoryChip({ item, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? { backgroundColor: item.color, borderColor: item.color } : undefined,
        pressed && styles.pressed,
      ]}>
      <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={active ? '#FFFFFF' : item.color} />
      <Text style={[styles.text, active ? styles.activeText : undefined]}>{item.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
