import { Provider } from '@ant-design/react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { login } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      if (response.user.role.name === 'DRIVER') {
        router.replace('/(tabs)/driver');
      } else if (response.user.role.name === 'FUEL_ATTENDANT') {
        router.replace('/(tabs)/attendant');
      }
    } catch (error) {
      console.error('Login failed', error);
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
        <Button title="Login" onPress={handleLogin} />
      </View>
    </Provider>
  );
}
