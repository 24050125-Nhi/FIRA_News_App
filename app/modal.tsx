import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="newspaper-outline" size={32} color="#DC2626" />
        </View>
        <Text style={styles.title}>FIRA News</Text>
        <Text style={styles.text}>Ứng dụng đọc báo mẫu gồm giao diện mobile, backend API và database JSON có thể chạy local.</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Đóng</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '900',
  },
  text: {
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
