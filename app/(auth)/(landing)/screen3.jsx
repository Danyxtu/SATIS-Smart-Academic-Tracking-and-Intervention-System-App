import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Siren, ShieldQuestion } from "lucide-react-native";
import { useRouter } from "expo-router";

const Screen3 = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Siren size={80} color="#dc3545" />
        <ShieldQuestion size={80} color="#ffc107" style={{ marginLeft: 20 }}/>
      </View>
      <Text style={styles.title}>Get Support & Take Action</Text>
      <Text style={styles.description}>
        Identify subjects where you might need help and easily access
        intervention resources to get back on track.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Screen3;