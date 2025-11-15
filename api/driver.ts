import api from './index';

//Consumed by app/(tabs)/driver.tsx
export const buyFuelToken = async (data: { amount: number }) => {
  const response = await api.post('/user/buy-token', { amount: data.amount });
  return response.data;
};

//Consumed by app/(tabs)/driver.tsx
export const getDriverTransactions = async (status?: 'USED' | 'UNUSED') => {
  const response = await api.get('/user/driver-tokens', {
    params: status ? { status } : {},
  });
  return response.data;
};

// Fetch driver's mobile number to prefill the form
export const getDriverMobileNumber = async (userId: number) => {
  const response = await api.get('/user/driver-mobile-number', {
    params: { userId },
  });
  return response.data;
};