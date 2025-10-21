import { Transaction } from '@/types';
import { List, Provider } from '@ant-design/react-native';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { getAttendantSales, sellFuel } from '../../api/attendant';

export default function Profile() {
  const [sales, setSales] = useState<Transaction[]>([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchSales = async () => {
      const data = await getAttendantSales(1); // Replace with actual attendantId
      setSales(data);
    };
    fetchSales();
  }, []);

  const handleSellFuel = async () => {
    await sellFuel(token);
    setToken('');
    // Refresh sales
    const updatedSales = await getAttendantSales(1);
    setSales(updatedSales);
  };

  return (
    <Provider>
      <View className="flex-1 p-4">
        <Text className="text-2xl mb-4">Profile </Text>

        <TextInput
          className="border p-2 mb-2"
          placeholder="Enter Token"
          value={token}
          onChangeText={setToken}
        />

        <Button title="Sell Fuel" onPress={handleSellFuel} />

        <Text className="text-lg mt-4">Sales History</Text>

        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <List.Item>
              <Text>
                Token: {item.token} | {item.liters}L | {item.amount}
              </Text>
            </List.Item>
          )}
        />
      </View>
    </Provider>
  );
}
