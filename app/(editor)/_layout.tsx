import { Stack } from 'expo-router';

export default function EditorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
      <Stack.Screen name="[projectId]" />
    </Stack>
  );
}
