import { getAttendantSales } from '@/api/attendant';
import { useAuth } from '@/context/AuthContext';
import { Transaction } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ActivityIndicator, Card, Divider, List, Text, useTheme } from 'react-native-paper';

export default function SalesScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSales = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    if (!isRefresh) setLoading(true);
    try {
      const data = await getAttendantSales(user.id);
      setSales(Array.isArray(data) ? data : []);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales(true);
  };

  if (loading && sales.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, marginTop: 24 }}>
        <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: 8 }}>Sales</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
          Your recent completed fuel transactions
        </Text>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <Card style={{ marginHorizontal: 16, padding: 32, alignItems: 'center' }}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              No sales yet
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: 4 }}>
              Completed transactions will appear here
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={{ marginHorizontal: 16, marginVertical: 6, borderRadius: 16 }} elevation={2}>
            <Card.Content style={{ paddingVertical: 12 }}>
              <List.Item
                title={`GHS ${item.amount}`}
                description={`${item.liters ?? 0} L • ${new Date(item.createdAt).toLocaleString()}`}
                left={(props) => <List.Icon {...props} icon="gas-station" />}
                right={() => (
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '600' }}>{item.productCatalog?.name || item.product?.type || 'Product'}</Text>
                    <Text style={{ color: theme.colors.outline }}>{item.token ? `${item.token.slice(0,4)}...${item.token.slice(-4)}` : ''}</Text>
                  </View>
                )}
              />
              <Divider style={{ marginTop: 8 }} />
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}
