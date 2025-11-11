import api from './index';

export const sellFuel = async (
  token: string,
  data: {
    productId?: number;
    pumpId: number;
    dispenserId: number;
    stationId: number;
  },
) => {
  const response = await api.patch(`/transactions/${token}`, data);
  return response.data;
};

export const getAttendantSales = async (attendantId: number) => {
  const response = await api.get('/transactions', {
    params: { pumpAttendantId: attendantId, sales: true },
  });
  return response.data;
};

export const getTokenDetails = async (token: string) => {
  const response = await api.get(`/transactions/${token}`);
  return response.data;
};

export const getAvailableProducts = async (attendantId: number) => {
  const response = await api.get('/user/available-products', { params: { attendantId } });
  return response.data;
};

export const calculateLiters = async (token: string, product: string) => {
  const response = await api.get(`/transactions/${token}/calculate-liters`, { params: { product } });
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get('/user/attendant-products');
  return response.data;
};