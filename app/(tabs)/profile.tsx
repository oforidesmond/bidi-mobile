// app/profile.tsx
import { logout as logoutAPI } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';

declare global {
  interface String {
    toTitleCase(): string;
  }
}

export default function Profile() {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutAPI();
            } catch (error) {
              console.log('Backend logout failed, continuing locally');
            }

            await logout();
            setSnackbarVisible(true);
            setTimeout(() => router.replace('/login'), 300);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 20, maxWidth: 480, width: '100%', alignSelf: 'center', flex: 1, marginTop: 20 }}>
        {/* Header Card */}
        <Card elevation={3} style={styles.card}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Avatar.Text
              size={80}
              label={user?.name ? getInitials(user.name) : 'S'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <Text variant="headlineSmall" style={{ marginTop: 16, fontWeight: '600' }}>
              {user?.name || 'User'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: 4 }}>
              {role ? role.replace('_', ' ').toTitleCase() : 'N/A'}
            </Text>
          </Card.Content>
        </Card>

        {/* User Info Card */}
        <Card elevation={2} style={[styles.card, { marginTop: 16 }]}>
          <Card.Title
            title="Account Details"
            titleStyle={{ fontWeight: '600' }}
            left={(props) => <List.Icon {...props} icon="account-circle" />}
          />
          <Divider />
          <Card.Content style={{ paddingTop: 8 }}>
            <List.Item
              title="Email"
              description={user?.email || 'Not provided'}
              left={() => <List.Icon icon="email" color={theme.colors.primary} />}
            />
            <Divider />
            <List.Item
              title="Contact"
              description={user?.contact || 'Not provided'}
              left={() => <List.Icon icon="phone" color={theme.colors.primary} />}
            />
            <Divider />
            <List.Item
              title="National ID"
              description={user?.nationalId || 'Not provided'}
              left={() => <List.Icon icon="card-account-details" color={theme.colors.primary} />}
            />
            <Divider />
            <List.Item
              title="User ID"
              description={user?.id || 'N/A'}
              descriptionStyle={{ fontFamily: 'monospace', fontSize: 12 }}
              left={() => <List.Icon icon="pound" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          onPress={handleLogout}
          contentStyle={{ height: 52 }}
          labelStyle={{ fontSize: 16, fontWeight: '600' }}
          style={{ marginTop: 24, borderRadius: 12, backgroundColor: '#dc2626' }}
        >
          Logout
        </Button>

        {/* Footer */}
        <Text
          variant="bodySmall"
          style={{ textAlign: 'center', marginTop: 32, color: theme.colors.outline }}
        >
          Secured by Bidi • © {new Date().getFullYear()}
        </Text>
      </View>

      {/* Logout Feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ bottom: 80 }}
      >
        Logged out successfully
      </Snackbar>
    </View>
  );
}

// Helper: String.toTitleCase()
String.prototype.toTitleCase = function () {
  return this.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});