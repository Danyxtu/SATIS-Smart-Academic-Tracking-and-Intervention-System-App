import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AttendanceProgressBar from "./AttendanceProgressBar";

const SubjectAttendanceCard = ({ item }) => {
  const router = useRouter();
  const hasStarted = Number(item.total) > 0;

  const handlePress = () => {
    router.push({
      pathname: "/(screens)/attendanceDetails",
      params: {
        enrollmentId: String(item.enrollmentId || item.id),
        subjectName: item.name || "Unknown Subject",
        instructor: item.instructor || "N/A",
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.subjectName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.instructor} numberOfLines={1}>
            {item.instructor}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {hasStarted ? (
            <Text
              style={[
                styles.rateText,
                item.attendanceRate >= 90
                  ? styles.rateGood
                  : item.attendanceRate >= 80
                    ? styles.rateWarning
                    : styles.ratePoor,
              ]}
            >
              {item.attendanceRate}%
            </Text>
          ) : (
            <Text style={styles.notStarted}>Not yet Started</Text>
          )}
        </View>
      </View>

      <AttendanceProgressBar rate={hasStarted ? item.attendanceRate : 0} />

      <View style={styles.statsGrid}>
        <View style={[styles.statBox, styles.statBoxGreen]}>
          <Text style={styles.statValue}>{item.attended || 0}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxRed]}>
          <Text style={styles.statValue}>{item.absent || 0}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxYellow]}>
          <Text style={styles.statValue}>{item.late || 0}</Text>
          <Text style={styles.statLabel}>Late</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBlue]}>
          <Text style={styles.statValue}>{item.excused || 0}</Text>
          <Text style={styles.statLabel}>Excused</Text>
        </View>
      </View>

      <Text style={styles.tapHint}>Tap to view attendance summary</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  instructor: {
    fontSize: 13,
    color: "#6B7280",
  },
  rateText: {
    fontSize: 20,
    fontWeight: "800",
  },
  rateGood: {
    color: "#059669",
  },
  rateWarning: {
    color: "#D97706",
  },
  ratePoor: {
    color: "#DC2626",
  },
  notStarted: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6B7280",
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
  },
  statBoxGreen: {
    backgroundColor: "#ECFDF5",
  },
  statBoxRed: {
    backgroundColor: "#FEF2F2",
  },
  statBoxYellow: {
    backgroundColor: "#FFF7ED",
  },
  statBoxBlue: {
    backgroundColor: "#EFF6FF",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  tapHint: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "500",
    color: "#DB2777",
    textAlign: "center",
  },
});

export default SubjectAttendanceCard;
