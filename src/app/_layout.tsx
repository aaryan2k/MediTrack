import { Stack } from "expo-router";
import "./globals.css"

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}> 
      <Stack.Screen 
        name="(tabs)"
        options={{ animation: "slide_from_left" }}
      />
      <Stack.Screen 
        name="(auth)"
      />
      <Stack.Screen 
        name="(global)"
      />
      <Stack.Screen 
        name="meds/[id]"
        options={{ animation: "slide_from_left" }}
      />
      <Stack.Screen 
        name="reminder/[id]"
      />
      <Stack.Screen 
        name="interactions/[id]"
      />
    </Stack>
  );
}
