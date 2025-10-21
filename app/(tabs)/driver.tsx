import { Transaction } from '@/types';
import { List, Provider } from '@ant-design/react-native';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { buyFuelToken, getDriverTransactions } from '../../api/driver';

export default function DriverDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await getDriverTransactions(1); // Replace with actual driverId
      setTransactions(data);
    };
    fetchTransactions();
  }, []);

  const handleBuyToken = async () => {
    await buyFuelToken({
      productId: 1,
      liters: 10,
      amount: 100,
      mobileNumber: '1234567890',
    });
    // Refresh transactions after buying
    const updated = await getDriverTransactions(1);
    setTransactions(updated);
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
