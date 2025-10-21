import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect based on role
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
        // If no role or unknown role, stay on this page
        break;
    }
  }, [role, loading]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl mb-4">Welcome to Bidi Mobile</Text>
      <Text className="text-center">
        Redirecting you to your dashboard based on your role...
      </Text>
    </View>
  );
}
