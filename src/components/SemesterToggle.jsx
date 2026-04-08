import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, AlertCircle } from "lucide-react-native";

/**
 * SemesterToggle - A reusable component for switching between semesters
 * @param {Object} props
 * @param {number} props.currentSemester - The current semester (1 or 2)
 * @param {number} props.selectedSemester - The currently selected semester (1 or 2)
 * @param {string} props.schoolYear - The school year (e.g., "2024-2025")
 * @param {number} props.semester1Count - Number of subjects in semester 1
 * @param {number} props.semester2Count - Number of subjects in semester 2
 * @param {function} props.onSemesterChange - Callback when semester is changed
 */
export default function SemesterToggle({
  currentSemester = 1,
  selectedSemester = 1,
  schoolYear = "",
  semester1Count = 0,
  semester2Count = 0,
  onSemesterChange,
}) {
  // Don't show if no subjects in either semester
  if (semester1Count === 0 && semester2Count === 0) {
    return null;
  }

  const isViewingPastSemester = selectedSemester !== currentSemester;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Calendar size={18} color="#DB2777" />
          <Text style={styles.schoolYear}>Academic Year {schoolYear}</Text>
        </View>
        {isViewingPastSemester && (
          <View style={styles.pastBadge}>
            <AlertCircle size={12} color="#D97706" />
            <Text style={styles.pastBadgeText}>Viewing past semester</Text>
          </View>
        )}
      </View>

      {/* Semester Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 1, label: "1st Semester", count: semester1Count },
          { id: 2, label: "2nd Semester", count: semester2Count },
        ].map((sem) => {
          const isActive = selectedSemester === sem.id;
          const isCurrent = currentSemester === sem.id;
          // Consider a semester "future" (not started) when its id is greater than the current semester
          const isFutureSemester = currentSemester && sem.id > currentSemester;

          return (
            <TouchableOpacity
              key={sem.id}
              style={[
                styles.tab,
                isFutureSemester && styles.tabDisabled,
                isActive && !isFutureSemester && styles.tabActive,
              ]}
              onPress={() => {
                if (isFutureSemester) return;
                onSemesterChange && onSemesterChange(sem.id);
              }}
              activeOpacity={isFutureSemester ? 1 : 0.7}
              disabled={isFutureSemester}
            >
              <View style={styles.tabContent}>
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {sem.label}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    isActive && styles.countBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isActive && styles.countTextActive,
                    ]}
                  >
                    {sem.count}
                  </Text>
                </View>
              </View>
              {isCurrent && (
                <View
                  style={[
                    styles.currentIndicator,
                    isActive && styles.currentIndicatorActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.currentText,
                      isActive && styles.currentTextActive,
                    ]}
                  >
                    Current
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  schoolYear: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  pastBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pastBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#D97706",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#DB2777",
  },
  tabDisabled: {
    backgroundColor: "#F9FAFB",
    opacity: 0.6,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  tabLabelActive: {
    color: "#FFFFFF",
  },
  countBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  countTextActive: {
    color: "#FFFFFF",
  },
  currentIndicator: {
    marginTop: 4,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentIndicatorActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  currentText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#6B7280",
  },
  currentTextActive: {
    color: "#FFFFFF",
  },
});
