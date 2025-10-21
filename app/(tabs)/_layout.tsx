import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="driver"
        options={{
          title: 'Driver Dashboard',
          tabBarIcon: () => <Text>🚗</Text>,
          href: {
            pathname: '/driver',
            // Conditionally show based on role
          },
        }}
      />
      <Tabs.Screen
        name="attendant"
        options={{
          title: 'Attendant Dashboard',
          tabBarIcon: () => <Text>⛽</Text>,
          href: {
            pathname: '/attendant',
            // props: { role: 'FUEL_ATTENDANT' },
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tabs>
  );
}