import { useAuth } from '@/context/AuthContext';
import { Provider } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { login } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      
      // Your backend returns { access_token: "jwt_token_here" }
      // We need to get user data separately using the token
      const token = response.access_token;
      
      // Set the token in API headers for subsequent requests
      const api = (await import('@/api/index')).default;
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      // Get user profile data
      const { getProfile } = await import('@/api/auth');
      const userProfile = await getProfile();
      
      // Store auth data
      await setAuth({
        user: userProfile,
        token: token
      });

      // Navigation will be handled by the auth guard in _layout.tsx
    } catch (error: any) {
      console.error('Login failed', error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
      <View className="flex-1 justify-center p-4">
        <Text className="text-2xl mb-4">Login</Text>
        <TextInput
          className="border p-2 mb-2"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="border p-2 mb-4"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      </View>
    </Provider>
  );
}
