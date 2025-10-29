import { useAuth } from '@/context/AuthContext';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function TabsLayout() {
  const { role } = useAuth();

  const canAccessDriver = role === 'DRIVER' || role === 'ADMIN';
  const canAccessAttendant = role === 'FUEL_ATTENDANT' || role === 'ADMIN';
  const canAccessAdmin = role === 'ADMIN' || role === 'OMC_ADMIN';

  return (
     <Tabs
     initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: '#1976d2',
        // tabBarInactiveTintColor: '#bbb',
        tabBarStyle: {
        backgroundColor: '#e3e3e4ff',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
        // height: 60,
      },
        tabBarLabelStyle: { fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="driver"
        options={{
          title: 'Buy Token',
          tabBarIcon: ({ color }) => <MaterialIcons name="local-gas-station" size={24} color={color} />,
        }}
        // Only show if driver
        redirect={!canAccessDriver}
      />
           <Tabs.Screen
        name="tokens"
        options={{
          title: 'My Tokens',
          tabBarIcon: ({ color }) => <MaterialIcons name="confirmation-number" size={24} color={color} />,
        }}
        redirect={!canAccessDriver}
      />
      <Tabs.Screen
        name="attendant"
        options={{
          title: 'Attendant Dashboard',
          tabBarIcon: () => <Text>⛽</Text>,
        }}
        redirect={!canAccessAttendant}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: () => <Text>🔍</Text>,
        }}
        redirect={!canAccessAdmin}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide the index tab completely
        }}
      />
    </Tabs>
  );
}