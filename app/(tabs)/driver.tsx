// app/driver/index.tsx
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { buyFuelToken, getDriverMobileNumber } from '../../api/driver';

export default function BuyFuelTokenScreen() {
  const [amount, setAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;
    const fetchMobile = async () => {
      try {
        const number = await getDriverMobileNumber(user.id);
        if (number) setMobileNumber(String(number));
      } catch (e) {
        console.log('getDriverMobileNumber failed', e);
      }
    };
    fetchMobile();
  }, [user?.id]);

  const isValidAmount = amount && !isNaN(Number(amount)) && Number(amount) > 0;
  const isValidMobile = mobileNumber.length >= 10;

  const handleBuy = async () => {
    if (!isValidAmount) {
      Alert.alert('Invalid Input', 'Please check amount');
      return;
    }

    setLoading(true);
    try {
      await buyFuelToken({
        amount: Number(amount),
      });

      Alert.alert('Success', 'Fuel token purchased successfully!');
      setAmount('');
      router.push('/tokens');
    } catch (e: any) {
      Alert.alert('Failed', e.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ padding: 24, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
          <Text variant="headlineMedium" style={{ fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
            Buy Fuel Token
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.secondary, marginBottom: 32 }}>
            Enter amount and mobile number to purchase
          </Text>

          <Card elevation={3} style={{ borderRadius: 16 }}>
            <Card.Content style={{ padding: 20 }}>
              <TextInput
                label="Amount (GHS)"
                mode="outlined"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                left={<TextInput.Affix text="GHS" />}
                error={!isValidAmount && amount !== ''}
                style={{ marginBottom: 12 }}
                theme={{ roundness: 12 }}
              />
              <HelperText type="error" visible={!isValidAmount && amount !== ''}>
                Enter a valid amount
              </HelperText>

              <TextInput
                label="Mobile Number"
                mode="outlined"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                error={!isValidMobile && mobileNumber !== ''}
                style={{ marginBottom: 16 }}
                theme={{ roundness: 12 }}
              />
              <HelperText type="error" visible={!isValidMobile && mobileNumber !== ''}>
                Enter a valid mobile number
              </HelperText>

              <Button
                mode="contained"
                onPress={handleBuy}
                disabled={loading || !isValidAmount}
                loading={loading}
                contentStyle={{ height: 54 }}
                labelStyle={{ fontSize: 16, fontWeight: '600' }}
                style={{ borderRadius: 12 }}
              >
                {loading ? 'Processing...' : 'Buy Token'}
              </Button>
            </Card.Content>
          </Card>

          <Text variant="bodySmall" style={{ textAlign: 'center', marginTop: 24, color: theme.colors.outline }}>
            Secured by Bidi • Instant delivery via SMS
          </Text>
        </View>
      </ScrollView>

      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          pointerEvents="none"
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}