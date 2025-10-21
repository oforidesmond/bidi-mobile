import api from './index';

//Consumed by app/(tabs)/driver.tsx
export const buyFuelToken = async (data: { productId: number; liters: number; amount: number; mobileNumber: string }) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

//Consumed by app/(tabs)/driver.tsx
export const getDriverTransactions = async (driverId: number) => {
  const response = await api.get(`/transactions?driverId=${driverId}`);
  return response.data;
};