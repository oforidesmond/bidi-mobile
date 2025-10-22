import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Redirect based on role - stay within tabs to avoid loops
    switch (role) {
      case 'DRIVER':
        router.replace('/(tabs)/driver');
        break;
      case 'FUEL_ATTENDANT':
        router.replace('/(tabs)/attendant');
        break;
      case 'ADMIN':
      case 'OMC_ADMIN':
        router.replace('/(tabs)/explore');
        break;
      default:
        // Fallback: show profile within tabs instead of bouncing to login
        router.replace('/(tabs)/profile');
        break;
    }
  }, [user, role, loading]);

  // This page should never be visible as users are immediately redirected
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Redirecting...</Text>
    </View>
  );
}
