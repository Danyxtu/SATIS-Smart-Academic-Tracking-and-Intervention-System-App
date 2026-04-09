import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="about" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="attendanceDetails" />
      <Stack.Screen name="subjectAnalytics" />
      <Stack.Screen name="subjectDetails" />
    </Stack>
  );
}
