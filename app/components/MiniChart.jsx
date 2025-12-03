import React from "react";
import { View, Text } from "react-native";

export default function MiniChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <View
        style={{
          height: 80,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
          No data available
        </Text>
      </View>
    );
  }

  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const weekLabels = ["W1", "W2", "W3", "W4"];

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          height: 70,
          alignItems: "flex-end",
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
          padding: 10,
          paddingBottom: 6,
        }}
      >
        {data.map((v, i) => {
          const height = ((v - min) / range) * 100;
          const isLast = i === data.length - 1;
          return (
            <View key={i} style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "700",
                  color: isLast ? "#DB2777" : "#6B7280",
                  marginBottom: 4,
                }}
              >
                {Math.round(v)}%
              </Text>
              <View
                style={{
                  width: "65%",
                  height: `${Math.max(8, height)}%`,
                  backgroundColor: isLast ? "#DB2777" : "#E5E7EB",
                  borderRadius: 4,
                }}
              />
            </View>
          );
        })}
      </View>
      {/* Week labels */}
      <View style={{ flexDirection: "row", marginTop: 6 }}>
        {data.map((_, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10, color: "#9CA3AF", fontWeight: "500" }}>
              {weekLabels[i] || `W${i + 1}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
