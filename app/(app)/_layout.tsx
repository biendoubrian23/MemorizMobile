import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="menu"
        options={{
          presentation: 'modal',
          animation: 'slide_from_left',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="thematiques"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
