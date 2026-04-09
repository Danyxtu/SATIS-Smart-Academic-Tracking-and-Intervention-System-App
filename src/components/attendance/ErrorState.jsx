import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";

const ErrorState = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <AlertCircle size={48} color="#DC2626" />
      </View>
      <Text style={styles.title}>Unable to Load Attendance</Text>
      <Text style={styles.message}>
        {message || "Something went wrong. Please try again."}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <RefreshCw size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 32,
    alignItems: "center",
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
    maxWidth: 300,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ErrorState;
