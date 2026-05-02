import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

export default function AdminHome() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name}</Text>

      <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin/users')}>
        <Ionicons name="people" size={22} color={Colors.primary} />
        <Text style={styles.btnText}>Manage Users</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin/create-course')}>
        <Ionicons name="book" size={22} color={Colors.primary} />
        <Text style={styles.btnText}>Create Course</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => router.push('/admin/create-news')}>
        <Ionicons name="newspaper" size={22} color={Colors.primary} />
        <Text style={styles.btnText}>Create News / Quiz / Poll</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.logoutBtn]}
        onPress={async () => { await logout(); router.replace('/login'); }}
      >
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <Text style={[styles.btnText, { color: Colors.error }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 36,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    gap: 14,
  },
  btnText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  logoutBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
});
