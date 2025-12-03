import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FileDown,
} from "lucide-react-native";
import { LineChart } from "react-native-gifted-charts";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import styles from "@styles/subjectDetail";

const SubjectDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const subjectName = params.subjectName ?? "Unknown Subject";
  const teacher = params.teacher ?? "Unknown Teacher";
  const grade = params.grade ?? "N/A";

  const [expandedSections, setExpandedSections] = useState({
    writtenWorks: true,
    performanceTasks: false,
    quarterlyExam: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  // Minimal sample data (keeps the file stable)
  const quarterData = {
    q1: {
      writtenWorks: [
        {
          title: "Quiz",
          description: "Speech Styles and Context",
          score: 18,
          total: 20,
          status: "Passed",
        },
      ],
      performanceTasks: [],
      quarterlyExam: [],
    },
  };

  // Basic render to avoid build/runtime syntax errors. The full UI can be restored later.
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={20} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>🔔</Text>
          </View>
          <View style={styles.avatar} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.subjectCard}>
          <View style={styles.subjectIconContainer}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectIconText}>
                {subjectName?.[0] ?? "S"}
              </Text>
            </View>
            <View style={styles.subjectInfo}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectTitle}>{subjectName}</Text>
                <View style={styles.finalGradeBadge}>
                  <Text style={styles.finalGradeLabel}>Final</Text>
                  <Text style={styles.finalGradeValue}>{grade}</Text>
                  <Text style={styles.finalGradeTotal}>/100</Text>
                </View>
              </View>
              <Text style={styles.teacherText}>{teacher}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubjectDetail;
