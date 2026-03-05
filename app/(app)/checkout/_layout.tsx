import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="summary" />
      <Stack.Screen name="address" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}
