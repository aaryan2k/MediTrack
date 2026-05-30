import { Stack } from "expo-router";

export default function GlobalLayout() {
  return (
    <Stack> 
      <Stack.Screen 
        name="settings"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}