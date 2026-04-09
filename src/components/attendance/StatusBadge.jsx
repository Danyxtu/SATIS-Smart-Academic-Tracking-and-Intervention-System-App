import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react-native";

const StatusBadge = ({ status }) => {
  const getConfig = () => {
    switch (status) {
      case "Present":
        return {
          Icon: CheckCircle,
          bg: "#ECFDF5",
          color: "#047857",
        };
      case "Absent":
        return {
          Icon: XCircle,
          bg: "#FEF2F2",
          color: "#B91C1C",
        };
      case "Late":
        return {
          Icon: Clock,
          bg: "#FFF7ED",
          color: "#B45309",
        };
      case "Excused":
        return {
          Icon: ShieldCheck,
          bg: "#EFF6FF",
          color: "#1E40AF",
        };
      default:
        return {
          Icon: CheckCircle,
          bg: "#ECFDF5",
          color: "#047857",
        };
    }
  };

  const config = getConfig();
  const Icon = config.Icon;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Icon size={14} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default StatusBadge;
