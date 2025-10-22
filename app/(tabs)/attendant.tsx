import { Transaction } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { List, Provider } from '@ant-design/react-native';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { getAttendantSales, sellFuel } from '../../api/attendant';

export default function AttendantDashboard() {
  const [sales, setSales] = useState<Transaction[]>([]);
  const [token, setToken] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const fetchSales = async () => {
      try {
        const data = await getAttendantSales(user.id);
        setSales(data);
      } catch (e) {
        console.log('getAttendantSales failed', e);
      }
    };
    fetchSales();
  }, [user?.id]);

  const handleSellFuel = async () => {
    try {
      await sellFuel(token);
      setToken('');
      if (user?.id) {
        const updatedSales = await getAttendantSales(user.id);
        setSales(updatedSales);
      }
    } catch (e) {
      console.log('sellFuel failed', e);
    }
  };

  return (
    <Provider>
      <View className="flex-1 p-4">
        <Text className="text-2xl mb-4">Attendant Dashboard</Text>

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
