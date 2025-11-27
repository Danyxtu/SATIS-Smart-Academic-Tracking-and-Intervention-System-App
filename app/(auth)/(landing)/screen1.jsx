import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { LayoutDashboard } from "lucide-react-native";
import { Link } from "expo-router";
import { router } from "expo-router";

const Screen1 = () => {
  return (
    <View style={styles.container}>
      <LayoutDashboard size={100} color="#007AFF" />
      <Text style={styles.title}>Welcome to SATIS</Text>
      <Text style={styles.description}>
        Your personal academic assistant. Get a clear and complete overview of
        your progress, all in one place.
      </Text>
      <Button title="Next" onPress={() => router.push("/(landing)/screen2")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 40,
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default Screen1;
