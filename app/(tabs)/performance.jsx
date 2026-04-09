import React, { useState, useEffect, useCallback } from "react";
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
import Mainmenu from "../../src/components/MainMenu";
import SemesterToggle from "../../src/components/SemesterToggle";
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
  const [selectedSemester, setSelectedSemester] = useState(null);

  const fetchData = useCallback(async (semester = null, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (!semester) setLoading(true);

      const params = semester ? { semester } : {};
      const res = await axios.get("/student/performance", { params });
      setData(res.data);
      setError(null);

      // Set initial semester from response if not already set
      if (semester === null && res.data?.semesters?.selected) {
        setSelectedSemester(res.data.semesters.selected);
      }
    } catch (err) {
      console.warn("Performance fetch error", err?.response || err);
      setError(
        err?.response?.data?.message || "Failed to load performance data",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSemesterChange = useCallback(
    async (semester) => {
      if (semester === selectedSemester) return;
      setSelectedSemester(semester);
      setLoading(true);
      await fetchData(semester);
    },
    [fetchData, selectedSemester],
  );

  const onRefresh = useCallback(async () => {
    await fetchData(selectedSemester, true);
  }, [fetchData, selectedSemester]);

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

  const getRiskCategory = (subject) => {
    if (subject?.riskCategory) {
      return subject.riskCategory;
    }

    const status = String(subject?.status || "").toLowerCase();
    const grade = subject?.grade;

    if (status === "critical" || (grade !== null && grade < 70)) {
      return "at_risk";
    }

    if (status === "warning" || (grade !== null && grade >= 70 && grade < 75)) {
      return "needs_attention";
    }

    return "on_track";
  };

  const riskCounts = subjects.reduce(
    (acc, subject) => {
      const category = getRiskCategory(subject);
      if (category === "at_risk") acc.atRisk += 1;
      if (category === "needs_attention") acc.needsAttention += 1;
      if (category === "recent_decline") acc.recentDecline += 1;
      if (category === "on_track") acc.onTrack += 1;
      return acc;
    },
    { atRisk: 0, needsAttention: 0, recentDecline: 0, onTrack: 0 },
  );
  riskCounts.priority =
    riskCounts.atRisk + riskCounts.needsAttention + riskCounts.recentDecline;

  const filteredSubjects = subjects.filter((subject) => {
    const riskCategory = getRiskCategory(subject);

    if (activeFilter === "at-risk") {
      return ["at_risk", "needs_attention", "recent_decline"].includes(
        riskCategory,
      );
    }

    if (activeFilter === "needs_attention") {
      return riskCategory === "needs_attention";
    }

    if (activeFilter === "at_risk") {
      return riskCategory === "at_risk";
    }

    if (activeFilter === "recent_decline") {
      return riskCategory === "recent_decline";
    }

    if (activeFilter === "on_track") {
      return riskCategory === "on_track";
    }

    return true;
  });

  const getStatusMessage = () => {
    const totalPrioritySubjects =
      (stats.subjectsAtRisk || 0) +
      (stats.subjectsNeedingAttention || 0) +
      (stats.subjectsRecentDecline || 0);

    if (totalPrioritySubjects > 0) {
      return {
        icon: "alert",
        title: "Needs Attention",
        message: `You have ${totalPrioritySubjects} subject(s) in priority watch statuses. Focus on these areas first.`,
        color: "#FEF3C7",
        textColor: "#92400E",
      };
    }
    if (stats.overallGrade >= 85) {
      return {
        icon: "star",
        title: "You're on the right track",
        message:
          "You're doing well. Focus on the subjects that need attention to boost your overall grade.",
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

  if (loading && !refreshing) {
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#DB2777"]}
            tintColor="#DB2777"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <BarChart color="#DB2777" size={28} />
              <Text style={styles.title}>Performance Analytics</Text>
            </View>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
              <RefreshCw color="#6B7280" size={20} />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Semester Toggle */}
        <SemesterToggle
          currentSemester={data?.semesters?.current || 1}
          selectedSemester={data?.semesters?.selected || selectedSemester || 1}
          schoolYear={data?.semesters?.schoolYear || ""}
          semester1Count={data?.semesters?.semester1Count || 0}
          semester2Count={data?.semesters?.semester2Count || 0}
          onSemesterChange={handleSemesterChange}
        />

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
        <View
          style={[styles.statusCard, { backgroundColor: statusMessage.color }]}
        >
          <View style={styles.statusIconBox}>
            <TrendingUp color={statusMessage.textColor} size={24} />
          </View>
          <View style={styles.statusContent}>
            <Text
              style={[styles.statusTitle, { color: statusMessage.textColor }]}
            >
              {statusMessage.title}
            </Text>
            <Text
              style={[styles.statusMessage, { color: statusMessage.textColor }]}
            >
              {statusMessage.message}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: "all", label: "All Subjects" },
              {
                key: "at-risk",
                label: `Priority (${riskCounts.priority})`,
              },
              { key: "at_risk", label: `At Risk (${riskCounts.atRisk})` },
              {
                key: "needs_attention",
                label: `Needs Attention (${riskCounts.needsAttention})`,
              },
              {
                key: "recent_decline",
                label: `Recent Decline (${riskCounts.recentDecline})`,
              },
              { key: "on_track", label: `On Track (${riskCounts.onTrack})` },
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
                    pathname: "/subjectAnalytics",
                    params: {
                      enrollmentId: subject.id,
                      // pass subject name so detail screens that expect it don't show Unknown Subject
                      subjectName:
                        subject.name ??
                        subject.subject_name ??
                        subject.subjectName ??
                        "Unknown Subject",
                    },
                  })
                }
              >
                {/* Prefer `name`, fall back to other possible keys returned by different APIs */}
                <Text style={styles.subjectName}>
                  {subject.name ??
                    subject.subject_name ??
                    subject.subjectName ??
                    "Unknown Subject"}
                </Text>
                <View style={styles.teacherRow}>
                  <User color="#6B7280" size={14} />
                  <Text style={styles.teacherName}>
                    {subject.teacher ?? subject.teacher_name ?? "N/A"}
                  </Text>
                </View>
                <Text style={styles.gradeLabel}>CURRENT GRADE</Text>
                <View style={styles.gradeRow}>
                  <Text
                    style={[
                      styles.gradeValue,
                      { color: getGradeColor(subject.grade) },
                    ]}
                  >
                    {subject.grade ?? "--"}
                  </Text>
                  <Text
                    style={[
                      styles.remarksText,
                      { color: getRemarksColor(subject.remarks) },
                    ]}
                  >
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
              <Text style={styles.emptyStateText}>
                No subjects match this filter.
              </Text>
            </View>
          )}
        </View>

        {/* Footer hint */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Click on any subject card to view detailed analytics, grade
            breakdown, and personalized study suggestions.
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
