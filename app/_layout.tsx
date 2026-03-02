import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/playfair-display/useFonts';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/theme';
import { cleanExpiredDrafts } from '../src/services/draftStorage';

function AuthGate() {
  const { user, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Pas connecté → rediriger vers welcome
      router.replace('/(auth)/welcome');
    } else if (user && inAuthGroup) {
      // Connecté → rediriger vers accueil
      router.replace('/(app)/(tabs)');
    }
  }, [user, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
  });

  useEffect(() => {
    initialize();
    // Nettoyage des brouillons expirés (> 1 an) au lancement
    cleanExpiredDrafts().catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthGate />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
