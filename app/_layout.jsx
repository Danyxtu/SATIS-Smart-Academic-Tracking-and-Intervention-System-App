import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { Stack } from "expo-router";
import { View, Text } from "react-native";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Don't redirect until auth state is loaded

    const inTabsGroup = segments[0] === "(tabs)";
    const inAuthGroup = segments[0] === "(auth)";

    // List of allowed screens outside of tabs for authenticated users
    const allowedScreens = ["SubjectDetail", "SubjectAnalytics", "Screens"];
    const isAllowedScreen = allowedScreens.includes(segments[0]);

    if (user && inAuthGroup) {
      // User is signed in but in auth screens, redirect to home
      router.replace("/home");
    } else if (!user && inTabsGroup) {
      // User is signed out but in the main app stack.
      // Redirect them to the login screen.
      router.replace("/login");
    } else if (!user && isAllowedScreen) {
      // User is signed out but trying to access protected screens
      router.replace("/login");
    }
    // If user is authenticated and on allowed screens or tabs, do nothing
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="SubjectDetail" />
      <Stack.Screen name="SubjectAnalytics" />
      <Stack.Screen name="Screens/about" />
      <Stack.Screen name="Screens/profile" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
