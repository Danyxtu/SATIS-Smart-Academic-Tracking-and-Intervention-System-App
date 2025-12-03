import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ChevronRight,
  BarChart2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react-native";

const getIcon = (title) => {
  if (title.toLowerCase().includes("analytics")) return BarChart2;
  if (
    title.toLowerCase().includes("intervention") ||
    title.toLowerCase().includes("feed")
  )
    return MessageSquare;
  if (title.toLowerCase().includes("risk")) return AlertTriangle;
  return BarChart2;
};

export default function QuickActionCard({
  title,
  description,
  onPress,
  gradientColor = "#6366F1",
}) {
  const Icon = getIcon(title);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: `${gradientColor}15`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Icon size={22} color={gradientColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
