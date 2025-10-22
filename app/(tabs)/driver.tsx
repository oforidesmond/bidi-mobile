import { Transaction } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { List, Provider } from '@ant-design/react-native';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { buyFuelToken, getDriverTransactions } from '../../api/driver';

export default function DriverDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const fetchTransactions = async () => {
      try {
        const data = await getDriverTransactions(user.id);
        setTransactions(data);
      } catch (e) {
        console.log('getDriverTransactions failed', e);
      }
    };
    fetchTransactions();
  }, [user?.id]);

  const handleBuyToken = async () => {
    try {
      await buyFuelToken({
        productId: 1,
        liters: 10,
        amount: 100,
        mobileNumber: '1234567890',
      });
      if (user?.id) {
        const updated = await getDriverTransactions(user.id);
        setTransactions(updated);
      }
    } catch (e) {
      console.log('buyFuelToken failed', e);
    }
  };

  return (
    <Provider>
      <View className="flex-1 p-4">
        <Text className="text-2xl mb-4">Driver Dashboard</Text>

        <Button title="Buy Fuel Token" onPress={handleBuyToken} />

        <Text className="text-lg mt-4">Your Tokens</Text>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <List.Item>
              <Text>
                Token: {item.token} | {item.liters}L | {item.amount} |{' '}
                {item.deletedAt ? 'Used' : 'Unused'}
              </Text>
            </List.Item>
          )}
        />
      </View>
    </Provider>
  );
}
