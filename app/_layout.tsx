import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Button, LogBox, ScrollView, Text, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function useGlobalErrorHandling() {
  useEffect(() => {
    // Catch unhandled promise rejections
    const rejectionHandler = (event: any) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason || event);
    };
    // @ts-ignore
    window.addEventListener?.('unhandledrejection', rejectionHandler);

    // Catch uncaught JS errors
    const errorHandler = (message: any, source: any, lineno: any, colno: any, error: any) => {
      console.error('💥 Uncaught Error:', { message, source, lineno, colno, error });
      return false; // allow default handling too
    };
    // @ts-ignore
    window.addEventListener?.('error', errorHandler);

    // Ignore noisy warnings (optional)
    LogBox.ignoreLogs(['Setting a timer', 'Warning: ...']);

    return () => {
      // cleanup
      // @ts-ignore
      window.removeEventListener?.('unhandledrejection', rejectionHandler);
      // @ts-ignore
      window.removeEventListener?.('error', errorHandler);
    };
  }, []);
}

// 🧱 Global Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: '#fee2e2',
            padding: 16,
          }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#b91c1c', marginBottom: 8 }}>
              😞 Something went wrong
            </Text>
            <Text selectable style={{ color: '#7f1d1d', marginBottom: 16 }}>
              {this.state.error.message}
            </Text>
            <Text selectable style={{ fontSize: 12, color: '#991b1b', marginBottom: 16 }}>
              {this.state.error.stack}
            </Text>
            <Button title="Try Again" onPress={this.handleReset} />
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}


// 🌐 Navigation logic
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inLogin = segments[0] === 'login';

    if (!user && !inLogin) {
      router.replace('/login');
    } else if (user && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return <Slot />;
}


// 🏗️ Root layout wrapper
export default function RootLayout() {
   useGlobalErrorHandling();
  return (
   <PaperProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <ErrorBoundary>
            <RootLayoutNav />
          </ErrorBoundary>
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
