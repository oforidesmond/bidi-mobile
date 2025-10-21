import { useAuth } from '@/context/AuthContext';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  const { role } = useAuth();

  const canAccessDriver = role === 'DRIVER' || role === 'ADMIN';
  const canAccessAttendant = role === 'FUEL_ATTENDANT' || role === 'ADMIN';
  const canAccessAdmin = role === 'ADMIN' || role === 'OMC_ADMIN';

  return (
    <Tabs>
      <Tabs.Screen
        name="driver"
        options={{
          title: 'Driver Dashboard',
          tabBarIcon: () => <Text>🚗</Text>,
          href: canAccessDriver ? '/driver' : null,
        }}
      />
      <Tabs.Screen
        name="attendant"
        options={{
          title: 'Attendant Dashboard',
          tabBarIcon: () => <Text>⛽</Text>,
          href: canAccessAttendant ? '/attendant' : null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: () => <Text>🔍</Text>,
          href: canAccessAdmin ? '/explore' : null,
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