import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { BarChart3, CheckCircle } from "lucide-react-native";
import { router } from "expo-router";

const Screen2 = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <BarChart3 size={80} color="#007AFF" />
        <CheckCircle size={80} color="#28a745" style={{ marginLeft: 20 }} />
      </View>
      <Text style={styles.title}>Track Your Success</Text>
      <Text style={styles.description}>
        Stay on top of your studies. Easily monitor your attendance and analyze
        your academic performance in every subject.
      </Text>

      <Button title="Next" onPress={() => router.push("/(landing)/screen3")} />
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
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
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

export default Screen2;
