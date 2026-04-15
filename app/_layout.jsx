import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { Stack } from "expo-router";
import { View, Text } from "react-native";

function RootLayoutNav() {
  const { user, loading, mustChangePassword, requiresEmailVerification } =
    useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Don't redirect until auth state is loaded

    const inTabsGroup = segments[0] === "(tabs)";
    const inAuthGroup = segments[0] === "(auth)";
    const isForceChangePassword = segments
      .join("/")
      .includes("force-change-password");
    const isStudentEmailVerification = segments
      .join("/")
      .includes("student-email-verification");

    // List of allowed screens outside of tabs for authenticated users
    const allowedScreens = [
      "SubjectDetail",
      "SubjectAnalytics",
      "Screens",
      "(screens)",
    ];
    const isAllowedScreen = allowedScreens.includes(segments[0]);

    // If user must change password, redirect to force-change-password screen
    if (user && mustChangePassword && !isForceChangePassword) {
      router.replace("/(auth)/force-change-password");
      return;
    }

    if (
      user &&
      !mustChangePassword &&
      requiresEmailVerification &&
      !isStudentEmailVerification
    ) {
      router.replace("/(auth)/student-email-verification");
      return;
    }

    // If user has changed password, redirect away from force-change-password
    if (user && !mustChangePassword && isForceChangePassword) {
      if (requiresEmailVerification) {
        router.replace("/(auth)/student-email-verification");
        return;
      }

      router.replace("/home");
      return;
    }

    if (user && !requiresEmailVerification && isStudentEmailVerification) {
      router.replace("/home");
      return;
    }

    if (
      user &&
      inAuthGroup &&
      !isForceChangePassword &&
      !isStudentEmailVerification
    ) {
      // User is signed in but in auth screens (not force-change-password), redirect to home
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
  }, [
    user,
    loading,
    mustChangePassword,
    requiresEmailVerification,
    segments,
    router,
  ]);

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
      <Stack.Screen name="(screens)" />
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
