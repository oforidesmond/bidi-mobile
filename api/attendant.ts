import api from './index';

export const sellFuel = async (
  token: string,
  data: {
    productCatalogId?: number;
    pumpId: number;
    dispenserId: number;
    stationId: number;
  },
) => {
  const response = await api.patch(`/transactions/token/${token}`, data);
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

export const searchTokens = async (q: string): Promise<string[]> => {
  const response = await api.get('/transactions/tokens/search', {
    params: { q: (q || '').toUpperCase() },
  });
  return (response.data || []).map((t: { token: string }) => t.token);
};

export const getAvailableProducts = async () => {
  const response = await api.get('/user/available-products');
  return response.data;
};

export const calculateLiters = async (token: string, product: string) => {
  const response = await api.get(`/transactions/${token}/calculate-liters`, { params: { product } });
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get('/user/products');
  return response.data;
};