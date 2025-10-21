import { logout as logoutAPI } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { Provider } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import { Alert, Button, Text, View } from 'react-native';

export default function Profile() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call backend logout endpoint
              await logoutAPI();
            } catch (error) {
              console.log('Backend logout failed, but continuing with local logout');
            }
            
            // Clear local auth state
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <Provider>
      <View className="flex-1 p-4">
        <Text className="text-2xl mb-4">Profile</Text>
        
        <View className="mb-6">
          <Text className="text-lg mb-2">User Information</Text>
          <Text className="mb-1">Name: {user?.name || 'N/A'}</Text>
          <Text className="mb-1">Email: {user?.email || 'N/A'}</Text>
          <Text className="mb-1">Contact: {user?.contact || 'N/A'}</Text>
          <Text className="mb-1">National ID: {user?.nationalId || 'N/A'}</Text>
          <Text className="mb-1">Role: {role || 'N/A'}</Text>
          <Text className="mb-1">User ID: {user?.id || 'N/A'}</Text>
        </View>

        <Button 
          title="Logout" 
          onPress={handleLogout}
          color="#dc2626"
        />
      </View>
    </Provider>
  );
}
