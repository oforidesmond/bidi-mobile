// app/driver/tokens.tsx
import { useAuth } from '@/context/AuthContext';
import { Transaction } from '@/types';
import { Asset } from 'expo-asset';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { FlatList, Modal, RefreshControl, TouchableOpacity, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Portal,
  SegmentedButtons,
  Snackbar,
  Text,
  useTheme
} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { getDriverTransactions } from '../../api/driver';

// Shorten token
const shortenToken = (token: string) => (token.length <= 8 ? token : `${token.slice(0, 4)}...${token.slice(-4)}`);

export default function Tokens() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<'ALL' | 'USED' | 'UNUSED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [qrVisible, setQrVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Transaction | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);

  const { user } = useAuth();
  const theme = useTheme();

  const fetchTransactions = async (isRefresh = false) => {
    if (!user?.id) return;
    if (!isRefresh) setLoading(true);
    try {
      const data = await getDriverTransactions(status === 'ALL' ? undefined : status);
      setTransactions(data);
    } catch (e) {
      console.log('getDriverTransactions failed', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.id, status]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const copyToken = async (token: string) => {
    await Clipboard.setStringAsync(token);
    setSnackbarMsg('Token copied to clipboard!');
  };

  const openQR = (token: Transaction) => {
    setSelectedToken(token);
    setQrVisible(true);
  };

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const asset = Asset.fromModule(require('@/assets/images/bidilogoblack.png'));
        await asset.downloadAsync();
        setLogoUri(asset.uri);
      } catch (error) {
        console.log('Failed to load logo', error);
      }
    };
    loadLogo();
  }, []);

  if (loading && transactions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: 8, marginTop: 40 }}>
          My Fuel Tokens
        </Text>

        <SegmentedButtons
          value={status}
          onValueChange={(value) => setStatus(value as any)}
          buttons={[
            { value: 'ALL', label: 'All' },
            { value: 'UNUSED', label: 'Unused' },
            { value: 'USED', label: 'Used' },
          ]}
          style={{ marginBottom: 16 }}
        />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Card style={{ margin: 16, padding: 32, alignItems: 'center' }}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              No tokens found
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: 4 }}>
              Buy your first token to get started!
            </Text>
          </Card>
        }
        renderItem={({ item }) => {
          const isUsed = !!item.deletedAt;
          return (
            <Card style={{ marginHorizontal: 16, marginVertical: 6, borderRadius: 16 }} elevation={2}>
              <Card.Content style={{ paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: '600', fontSize: 16, color: theme.colors.onSurface }}>
        Token ID: {shortenToken(item.token!)}
      </Text>
      <View style={{ marginTop: 6 }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 14 }}>
          Amount: GHS {item.amount}
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginTop: 2 }}>
          Issued: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {isUsed && (
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginTop: 2 }}>
            Used: {new Date(item.deletedAt!).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Chip
        mode="flat"
        textStyle={{ fontSize: 11, fontWeight: '600' }}
        style={{
          backgroundColor: isUsed ? '#ffebee' : '#3b8b42ff',
          borderColor: isUsed ? '#e57373' : '#81c784',
          marginRight: 8,
        }}
        disabled={isUsed}
      >
        {isUsed ? 'USED' : 'UNUSED'}
      </Chip>
    </View>
  </View>

  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
    <IconButton
      icon="qrcode-scan"
      size={20}
      onPress={() => openQR(item)}
      disabled={isUsed}
    />
    <IconButton
      icon="content-copy"
      size={20}
      onPress={() => copyToken(item.token!)}
    />
  </View>
</Card.Content>
            </Card>
          );
        }}
      />

      {/* QR Code Modal */}
      <Portal>
        <Modal
          visible={qrVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setQrVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => setQrVisible(false)}
          >
            <TouchableOpacity activeOpacity={1} style={{ alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 32,
                  borderRadius: 24,
                  alignItems: 'center',
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                {selectedToken && logoUri && (
                  <>
                    <QRCode
                       value={selectedToken.token}
                        size={240}
                        color="#000"
                        backgroundColor="#fff"
                        logo={{ uri: logoUri }}
                        logoSize={50}
                        logoBackgroundColor="white"
                        logoMargin={8}
                        logoBorderRadius={8}
                    />
                    <Text style={{ marginTop: 20, fontSize: 18, fontWeight: '600', color: '#3b8b42' }}>
                      GHS {selectedToken.amount}
                    </Text>
                    <Text style={{ marginTop: 4, color: '#666', fontSize: 14 }}>
                      {shortenToken(selectedToken.token!)}
                    </Text>
                    <Button
                      mode="text"
                      onPress={() => copyToken(selectedToken.token!)}
                      style={{ marginTop: 16 }}
                    >
                      Copy Token
                    </Button>
                  </>
                )}
              </View>
              <Text style={{ color: '#fff', marginTop: 24, fontSize: 14 }}>
                Tap anywhere to close
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={!!snackbarMsg}
        onDismiss={() => setSnackbarMsg('')}
        duration={2500}
        style={{ bottom: 80 }}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
}