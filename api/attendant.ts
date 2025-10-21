import api from './index';

//Consumed by app/(tabs)/attendant.tsx
export const sellFuel = async (token: string) => {
  const response = await api.patch(`/transactions/${token}`, { deletedAt: new Date().toISOString() }); // Mark token as used
  return response.data;
};

//Consumed by app/(tabs)/attendant.tsx
export const getAttendantSales = async (attendantId: number) => {
  const response = await api.get(`/transactions?pumpAttendantId=${attendantId}`);
  return response.data;
};