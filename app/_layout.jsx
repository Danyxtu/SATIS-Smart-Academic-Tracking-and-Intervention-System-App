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

    if (user && !inTabsGroup) {
      // User is signed in but not in the main app stack.
      // Redirect them to the main app screen.
      router.replace("/home");
    } else if (!user && inTabsGroup) {
      // User is signed out but somehow in the main app stack.
      // Redirect them to the login screen.
      router.replace("/login");
    }
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
