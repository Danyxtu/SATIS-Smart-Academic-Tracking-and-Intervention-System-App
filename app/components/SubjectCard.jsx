import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const getGradeColor = (grade) => {
  if (grade === null || grade === undefined) return "#9CA3AF";
  if (grade >= 85) return "#10B981"; // green
  if (grade >= 75) return "#F59E0B"; // amber
  return "#EF4444"; // red
};

export default function SubjectCard({ subject }) {
  const router = useRouter();

  const grade = subject?.grade ?? null;
  const gradeDisplay = subject?.gradeDisplay ?? "N/A";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Header with Icon and Grade */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        {/* Subject Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#E91E63",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ fontSize: 18, color: "#FFF", fontWeight: "700" }}>
            {subject?.name?.[0] ?? "S"}
          </Text>
        </View>

        {/* Grade Badge */}
        <View style={{ marginLeft: "auto", alignItems: "flex-end" }}>
          <Text style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>
            Grade
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: getGradeColor(grade),
            }}
          >
            {gradeDisplay}
          </Text>
        </View>
      </View>

      {/* Subject Name */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: "#1A1A1A",
          marginBottom: 4,
        }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {subject?.name}
      </Text>

      {/* Section/Teacher */}
      {subject?.section && (
        <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>
          {subject.section}
        </Text>
      )}

      {/* Progress Bar */}
      <View style={{ marginTop: 4 }}>
        <View
          style={{
            height: 6,
            backgroundColor: "#E5E7EB",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${subject?.grade ?? 0}%`,
              backgroundColor: getGradeColor(subject?.grade),
              borderRadius: 4,
            }}
          />
        </View>

        {/* Attendance */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <Text style={{ fontSize: 11, color: "#6B7280" }}>Attendance</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#374151" }}>
            {subject?.attendance ?? "N/A"}%
          </Text>
        </View>
      </View>

      {/* View Details Button */}
      <TouchableOpacity
        onPress={() =>
          router.push(`/SubjectAnalytics?enrollmentId=${subject?.id}`)
        }
        style={{
          marginTop: 10,
          backgroundColor: "#F3F4F6",
          paddingVertical: 8,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#374151", fontWeight: "600", fontSize: 12 }}>
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
}
