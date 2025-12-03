import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Mainmenu from "../components/mainMenu";
import {
  BarChart,
  Target,
  AlertTriangle,
  TrendingUp,
  Filter,
  User,
  BookOpen,
  Award,
  RefreshCw,
} from "lucide-react-native";
import axios from "axios";

const PerformanceAnalytics = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get("/student/performance");
      setData(res.data);
      setError(null);
    } catch (err) {
      console.warn("Performance fetch error", err?.response || err);
      setError(err?.response?.data?.message || "Failed to load performance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = data?.stats || {};
  const subjects = data?.subjectPerformance || [];

  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined) return "#9CA3AF";
    if (grade >= 90) return "#10B981";
    if (grade >= 85) return "#3B82F6";
    if (grade >= 75) return "#F59E0B";
    return "#EF4444";
  };

  const getRemarksColor = (remarks) => {
    switch (remarks) {
      case "Excellent":
        return "#10B981";
      case "Very Good":
        return "#3B82F6";
      case "Good":
        return "#6366F1";
      case "Satisfactory":
        return "#F59E0B";
      case "Needs Improvement":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    if (activeFilter === "excellent") return subject.grade !== null && subject.grade >= 90;
    if (activeFilter === "good") return subject.grade !== null && subject.grade >= 85 && subject.grade < 90;
    if (activeFilter === "at-risk") return subject.grade !== null && subject.grade < 75;
    return true;
  });

  const getStatusMessage = () => {
    if (stats.subjectsAtRisk > 0) {
      return {
        icon: "alert",
        title: "Needs Attention",
        message: `You have ${stats.subjectsAtRisk} subject(s) at risk. Focus on improving these areas.`,
        color: "#FEF3C7",
        textColor: "#92400E",
      };
    }
    if (stats.overallGrade >= 85) {
      return {
        icon: "star",
        title: "You're on the right track",
        message: "You're doing well. Focus on the subjects that need attention to boost your overall grade.",
        color: "#D1FAE5",
        textColor: "#065F46",
      };
    }
    return {
      icon: "info",
      title: "Keep Going",
      message: "Stay focused and consistent with your studies.",
      color: "#DBEAFE",
      textColor: "#1E40AF",
    };
  };

  const statusMessage = getStatusMessage();

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchData()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.mainMenuWrapper}>
        <Mainmenu />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <BarChart color="#DB2777" size={28} />
              <Text style={styles.title}>Performance Analytics</Text>
            </View>
            <TouchableOpacity onPress={() => fetchData(true)} style={styles.refreshBtn}>
              <RefreshCw color="#6B7280" size={20} />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardQuarter]}>
            <View style={[styles.statIconBox, { backgroundColor: "#FEE2E2" }]}>
              <BarChart color="#DB2777" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.overallGrade ?? "--"}%</Text>
            <Text style={styles.statLabel}>Overall Grade</Text>
          </View>

          <View style={[styles.statCard, styles.statCardQuarter]}>
            <View style={[styles.statIconBox, { backgroundColor: "#DBEAFE" }]}>
              <BookOpen color="#3B82F6" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.totalSubjects ?? 0}</Text>
            <Text style={styles.statLabel}>Total Subjects</Text>
          </View>

          <View style={[styles.statCard, styles.statCardQuarter]}>
            <View style={[styles.statIconBox, { backgroundColor: "#D1FAE5" }]}>
              <Award color="#10B981" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.subjectsExcelling ?? 0}</Text>
            <Text style={styles.statLabel}>Subjects Excelling</Text>
          </View>

          <View style={[styles.statCard, styles.statCardQuarter]}>
            <View style={[styles.statIconBox, { backgroundColor: "#FEE2E2" }]}>
              <AlertTriangle color="#EF4444" size={20} />
            </View>
            <Text style={styles.statValue}>{stats.subjectsAtRisk ?? 0}</Text>
            <Text style={styles.statLabel}>Subjects at Risk</Text>
          </View>
        </View>

        {/* Status Message */}
        <View style={[styles.statusCard, { backgroundColor: statusMessage.color }]}>
          <View style={styles.statusIconBox}>
            <TrendingUp color={statusMessage.textColor} size={24} />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: statusMessage.textColor }]}>
              {statusMessage.title}
            </Text>
            <Text style={[styles.statusMessage, { color: statusMessage.textColor }]}>
              {statusMessage.message}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: "all", label: "All Subjects" },
              { key: "excellent", label: "Excellent (90+)" },
              { key: "good", label: "Good (85-89)" },
              { key: "at-risk", label: "At Risk (<75)" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  activeFilter === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter.key && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Subject Cards */}
        <View style={styles.subjectsContainer}>
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={styles.subjectCard}
                onPress={() =>
                  router.push({
                    pathname: "/SubjectAnalytics",
                    params: { enrollmentId: subject.id },
                  })
                }
              >
                <Text style={styles.subjectName}>{subject.name}</Text>
                <View style={styles.teacherRow}>
                  <User color="#6B7280" size={14} />
                  <Text style={styles.teacherName}>{subject.teacher}</Text>
                </View>
                <Text style={styles.gradeLabel}>CURRENT GRADE</Text>
                <View style={styles.gradeRow}>
                  <Text style={[styles.gradeValue, { color: getGradeColor(subject.grade) }]}>
                    {subject.grade ?? "--"}
                  </Text>
                  <Text style={[styles.remarksText, { color: getRemarksColor(subject.remarks) }]}>
                    {subject.remarks}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${subject.grade ?? 0}%`,
                        backgroundColor: getGradeColor(subject.grade),
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <BookOpen color="#9CA3AF" size={48} />
              <Text style={styles.emptyStateText}>No subjects match this filter.</Text>
            </View>
          )}
        </View>

        {/* Footer hint */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Click on any subject card to view detailed analytics, grade breakdown, and
            personalized study suggestions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FDF2F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  mainMenuWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#FDF2F8",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  refreshText: {
    fontSize: 12,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  statCardQuarter: {
    width: "47%",
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
  },
  statusCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonActive: {
    backgroundColor: "#DB2777",
    borderColor: "#DB2777",
  },
  filterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
  },
  subjectsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subjectCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 13,
    color: "#6B7280",
  },
  gradeLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 12,
  },
  gradeValue: {
    fontSize: 36,
    fontWeight: "bold",
  },
  remarksText: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default PerformanceAnalytics;
