import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { login } from '../api/auth';

const LOGO_PATH = require('@/assets/images/bidilogowhite.png');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { setAuth } = useAuth();
  const theme = useTheme();

  const hasEmailError = email.length > 0 && !/\S+@\S+\.\S+/.test(email);
  const hasPasswordError = password.length > 0 && password.length < 6;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    if (hasEmailError || hasPasswordError) return;

    setLoading(true);
    try {
      const response = await login(email, password);
      const token = response.access_token;

      const api = (await import('@/api/index')).default;
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const { getProfile } = await import('@/api/auth');
      const userProfile = await getProfile();

      await setAuth({
        user: userProfile,
        token: token,
      });
    } catch (error: any) {
      console.error('Login failed', error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ padding: 24, maxWidth: 420, width: '100%', alignSelf: 'center' }}>
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Image
              source={LOGO_PATH}
              style={{
                width: 140,
                height: 140,
                resizeMode: 'contain',
              }}
            />
            <Text variant="headlineSmall" style={{ marginTop: 16, fontWeight: '600' }}>
              Welcome Back
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: 4 }}>
              Sign in to continue
            </Text>
          </View>

          {/* Login Card */}
          <Card elevation={4} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <Card.Content style={{ padding: 24 }}>
              {/* Email Field */}
              <TextInput
                label="Email"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                left={<TextInput.Icon icon="email" />}
                error={hasEmailError}
                style={{ marginBottom: 12 }}
                theme={{ roundness: 12 }}
              />
              <HelperText type="error" visible={hasEmailError}>
                Enter a valid email address
              </HelperText>

              {/* Password Field */}
              <TextInput
                label="Password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                error={hasPasswordError}
                style={{ marginBottom: 8 }}
                theme={{ roundness: 12 }}
              />
              <HelperText type="error" visible={hasPasswordError}>
                Password must be at least 6 characters
              </HelperText>

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                disabled={loading || !email || !password || hasEmailError || hasPasswordError}
                loading={loading}
                contentStyle={{ height: 52 }}
                labelStyle={{ fontSize: 16, fontWeight: '600' }}
                style={{ marginTop: 16, borderRadius: 12 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Loading Overlay */}
              {loading && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                  }}
                  pointerEvents="none"
                >
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Footer */}
          <Text
            variant="bodySmall"
            style={{ textAlign: 'center', marginTop: 24, color: theme.colors.outline }}
          >
            Secured by Bidi • © {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}