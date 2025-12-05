import React from "react";
import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="performance" />
      <Stack.Screen name="intervention" />
      <Stack.Screen name="subject" />
    </Stack>
  );
}
