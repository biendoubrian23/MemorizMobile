import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../../src/theme';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Custom "+" button that floats above the tab bar.
 * It intercepts the tab press and navigates to the create flow.
 */
function CreateTabButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.fabContainer} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.fab}>
        <Ionicons name="add" size={32} color={Colors.white} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          ...Typography.tabLabel,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarButton: (props) => (
            <CreateTabButton onPress={() => router.push('/(app)/create/setup')} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
