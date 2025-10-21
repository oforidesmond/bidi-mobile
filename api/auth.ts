import api from './index';

//Consumed by app/login.tsx to route users by role.
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password }); // Adjust endpoint as needed
  return response.data;
};