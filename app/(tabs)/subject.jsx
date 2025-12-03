import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Mainmenu from "../components/mainMenu";
import {
  ShieldAlert,
  ShieldHalf,
  ShieldCheck,
  Book,
  HelpCircle,
  TrendingUp,
  Calendar,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  RefreshCw,
} from "lucide-react-native";
import axios from "axios";

export default function SubjectRisk() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // API State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get("/student/subjects-at-risk");
      setData(res.data);
      setError(null);
    } catch (err) {
      console.warn("Subjects at risk fetch error", err?.response || err);
      setError(
        err?.response?.data?.message || "Failed to load subjects at risk"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = data?.stats || { highRisk: 0, mediumRisk: 0, lowRisk: 0 };
  const allSubjects = data?.subjects || [];

  const getRiskColor = (risk) => {
    if (risk === "High Risk") return "#fb7185";
    if (risk === "Medium Risk") return "#fb923c";
    return "#10b981";
  };

  const getRiskBgColor = (risk) => {
    if (risk === "High Risk") return "#fff1f2";
    if (risk === "Medium Risk") return "#fff7ed";
    return "#ecfdf5";
  };

  const getTrendColor = (trend) => {
    // Normalize trend to lowercase for comparison (matches backend format)
    const t = trend?.toLowerCase() || "";
    if (t === "improving") return "#10b981";
    if (t === "stable" || t === "new") return "#fb923c";
    if (t === "declining") return "#fb7185";
    return "#6b7280"; // default gray
  };

  // Helper to get readable trend label
  const getTrendLabel = (trend) => {
    const t = trend?.toLowerCase() || "";
    if (t === "improving") return "Improving";
    if (t === "stable") return "Stable";
    if (t === "declining") return "Declining";
    if (t === "new") return "New";
    return trend || "N/A";
  };

  const filteredSubjects = allSubjects.filter((subject) => {
    if (selectedFilter === "All") return true;
    return subject.risk === selectedFilter;
  });

  const displayedSubjects = showAll
    ? filteredSubjects
    : filteredSubjects.slice(0, 3);

  const SubjectCard = ({ subject }) => {
    const riskColor = getRiskColor(subject.risk);
    const riskBgColor = getRiskBgColor(subject.risk);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedSubject(subject)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View
              style={[styles.subjectIcon, { backgroundColor: riskBgColor }]}
            >
              {subject.risk === "High Risk" && (
                <ShieldAlert color={riskColor} size={18} />
              )}
              {subject.risk === "Low Risk" && (
                <ShieldCheck color={riskColor} size={18} />
              )}
              {subject.risk === "Medium Risk" && (
                <ShieldHalf color={riskColor} size={18} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{subject.name}</Text>
              <Text style={styles.instructor}>{subject.instructor}</Text>
            </View>
          </View>

          <View style={[styles.riskBadge, { backgroundColor: riskBgColor }]}>
            <Text style={[styles.riskLabel, { color: riskColor }]}>
              {subject.risk}
            </Text>
          </View>
        </View>

        <View style={styles.gradeRow}>
          <Text style={styles.gradeLabel}>Current Grade</Text>
          <Text style={[styles.grade, { color: riskColor }]}>
            {subject.grade !== null ? `${subject.grade}%` : "N/A"}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${subject.grade ?? 0}%`, backgroundColor: riskColor },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const SubjectDetailModal = () => {
    if (!selectedSubject) return null;

    const riskColor = getRiskColor(selectedSubject.risk);
    const riskBgColor = getRiskBgColor(selectedSubject.risk);
    const trendColor = getTrendColor(selectedSubject.trend);
    const isFailing =
      selectedSubject.grade !== null && selectedSubject.grade < 75;

    return (
      <Modal
        visible={!!selectedSubject}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSubject(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedSubject(null)}
              >
                <View style={styles.backIconCircle}>
                  <ArrowLeft size={18} color="#333" />
                </View>
                <Text style={styles.backText}>Back to Subject at Risk</Text>
              </TouchableOpacity>

              {/* Subject Info Card */}
              <View style={styles.detailCard}>
                <Text style={styles.detailSubjectName}>
                  {selectedSubject.name}
                </Text>
                <View
                  style={[
                    styles.detailRiskBadge,
                    { backgroundColor: riskBgColor },
                  ]}
                >
                  <Text style={[styles.detailRiskText, { color: riskColor }]}>
                    {selectedSubject.risk}
                  </Text>
                </View>

                <Text style={styles.detailInstructor}>
                  Instructor: {selectedSubject.instructor}
                </Text>

                {/* Grade Circle */}
                <View style={styles.gradeCircleContainer}>
                  <View
                    style={[styles.gradeCircle, { borderColor: riskColor }]}
                  >
                    <Text
                      style={[styles.gradeCircleText, { color: riskColor }]}
                    >
                      {selectedSubject.grade !== null
                        ? `${selectedSubject.grade}%`
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Course Progress */}
                <Text style={styles.progressLabel}>Course Progress</Text>
                <View style={styles.detailProgressBar}>
                  <View
                    style={[
                      styles.detailProgressFill,
                      {
                        width: `${selectedSubject.courseProgress ?? 0}%`,
                        backgroundColor: riskColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercentage}>
                  {selectedSubject.courseProgress ?? 0}%
                </Text>

                {/* Info Column */}
                <View style={styles.infoColumn}>
                  <View
                    style={[styles.infoBox, { backgroundColor: "#ecfdf5" }]}
                  >
                    <View style={styles.infoRow}>
                      <TrendingUp size={20} color="#10b981" />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Trend</Text>
                        <Text style={[styles.infoValue, { color: trendColor }]}>
                          {getTrendLabel(selectedSubject.trend)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[styles.infoBox, { backgroundColor: "#fff7ed" }]}
                  >
                    <View style={styles.infoRow}>
                      <Calendar size={20} color="#fb923c" />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Attendance</Text>
                        <Text style={styles.infoValue}>
                          {selectedSubject.attendanceRate}% (
                          {selectedSubject.presentDays}/
                          {selectedSubject.totalClasses} days)
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[styles.infoBox, { backgroundColor: "#eff6ff" }]}
                  >
                    <View style={styles.infoRow}>
                      <Lightbulb size={20} color="#3b82f6" />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Advice</Text>
                        <Text style={styles.infoValue}>
                          {selectedSubject.advice}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Risk Reasons */}
                {selectedSubject.riskReasons &&
                  selectedSubject.riskReasons.length > 0 && (
                    <View style={styles.riskReasonsContainer}>
                      <Text style={styles.riskReasonsTitle}>Risk Factors:</Text>
                      {selectedSubject.riskReasons.map((reason, idx) => (
                        <View key={idx} style={styles.riskReasonItem}>
                          <View
                            style={[
                              styles.riskReasonDot,
                              { backgroundColor: riskColor },
                            ]}
                          />
                          <Text style={styles.riskReasonText}>{reason}</Text>
                        </View>
                      ))}
                    </View>
                  )}
              </View>

              {/* Warning Card - Only show if failing */}
              {isFailing && (
                <View style={styles.warningCard}>
                  <View style={styles.warningHeader}>
                    <ShieldAlert size={24} color="#dc2626" />
                    <Text style={styles.warningTitle}>
                      You have a failing grade
                    </Text>
                  </View>
                  <Text style={styles.warningText}>
                    Your current grade of {selectedSubject.grade}% is below the
                    passing mark. Immediate action is recommended.
                  </Text>

                  <Text style={styles.suggestedTitle}>Suggested Actions:</Text>
                  <View style={styles.actionList}>
                    <View style={styles.actionItem}>
                      <Text style={styles.actionNumber}>1</Text>
                      <Text style={styles.actionText}>
                        Maintain consistent study habits and review course
                        materials regularly
                      </Text>
                    </View>
                    <View style={styles.actionItem}>
                      <Text style={styles.actionNumber}>2</Text>
                      <Text style={styles.actionText}>
                        Schedule a meeting with {selectedSubject.instructor} for
                        guidance
                      </Text>
                    </View>
                    <View style={styles.actionItem}>
                      <Text style={styles.actionNumber}>3</Text>
                      <Text style={styles.actionText}>
                        Complete any missing assignments to boost your grade
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.interventionButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedSubject(null);
                      router.push("/intervention");
                    }}
                  >
                    <Text style={styles.interventionButtonText}>
                      Go to Intervention Page
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
          />
        }
      >
        {/* Header with Refresh */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ShieldAlert color="#DB2777" size={24} />
            <Text style={styles.headerTitle}>Subjects at Risk</Text>
          </View>
          <TouchableOpacity
            onPress={() => fetchData(true)}
            style={styles.refreshBtn}
          >
            <RefreshCw color="#6B7280" size={18} />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Risk Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: "#fff1f2" }]}>
              <View
                style={[styles.statIconBox, { backgroundColor: "#fb7185" }]}
              >
                <ShieldAlert size={18} color="#fff" />
              </View>
              <Text style={styles.statNumber}>{stats.highRisk}</Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: "#fff7ed" }]}>
              <View
                style={[styles.statIconBox, { backgroundColor: "#fb923c" }]}
              >
                <ShieldHalf size={18} color="#fff" />
              </View>
              <Text style={styles.statNumber}>{stats.mediumRisk}</Text>
              <Text style={styles.statLabel}>Medium Risk</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: "#ecfdf5" }]}>
              <View
                style={[styles.statIconBox, { backgroundColor: "#10b981" }]}
              >
                <ShieldCheck size={18} color="#fff" />
              </View>
              <Text style={styles.statNumber}>{stats.lowRisk}</Text>
              <Text style={styles.statLabel}>Low Risk</Text>
            </View>
          </View>
        </View>

        {/* Subjects Section */}
        <View style={styles.subjectsCard}>
          <View style={styles.subjectsHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.subjectsIconBox}>
                <Book size={18} color="#db2777" />
              </View>
              <Text style={styles.subjectsTitle}>Subject Status</Text>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setSelectedFilter("All")}
              style={[
                styles.filterButton,
                selectedFilter === "All" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={
                  selectedFilter === "All"
                    ? styles.filterTextActive
                    : styles.filterText
                }
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFilter("High Risk")}
              style={[
                styles.filterButton,
                selectedFilter === "High Risk" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={
                  selectedFilter === "High Risk"
                    ? styles.filterTextActive
                    : styles.filterText
                }
              >
                High ({stats.highRisk})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFilter("Medium Risk")}
              style={[
                styles.filterButton,
                selectedFilter === "Medium Risk" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={
                  selectedFilter === "Medium Risk"
                    ? styles.filterTextActive
                    : styles.filterText
                }
              >
                Medium ({stats.mediumRisk})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFilter("Low Risk")}
              style={[
                styles.filterButton,
                selectedFilter === "Low Risk" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={
                  selectedFilter === "Low Risk"
                    ? styles.filterTextActive
                    : styles.filterText
                }
              >
                Low ({stats.lowRisk})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subject Cards */}
          {displayedSubjects.length > 0 ? (
            displayedSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ShieldCheck color="#10b981" size={48} />
              <Text style={styles.emptyStateText}>
                {selectedFilter === "All"
                  ? "No subjects enrolled yet."
                  : `No ${selectedFilter.toLowerCase()} subjects.`}
              </Text>
            </View>
          )}

          {/* View More */}
          {filteredSubjects.length > 3 && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => setShowAll(!showAll)}
            >
              <Text style={styles.viewMoreText}>
                {showAll
                  ? "Show less"
                  : `View ${filteredSubjects.length - 3} more`}
              </Text>
              {showAll ? (
                <ChevronUp size={12} color="#fb923c" />
              ) : (
                <ChevronDown size={12} color="#fb923c" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpCard}>
          <View style={styles.helpIconWrapper}>
            <HelpCircle size={24} color="#fb923c" />
          </View>

          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              Contact your instructors or visit the support section for
              assistance with your studies.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Subject Detail Modal */}
      <SubjectDetailModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff7fb" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  retryText: { color: "#FFF", fontWeight: "600" },
  mainMenuWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#fff7fb",
  },
  container: { padding: 16, paddingBottom: 40 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  refreshBtn: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  statsHeader: { marginBottom: 12 },
  statsTitle: { fontSize: 16, fontWeight: "700" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, borderRadius: 16, padding: 12, alignItems: "center" },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: { fontSize: 24, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 4 },

  subjectsCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  subjectsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectsIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#fff0f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  subjectsTitle: { fontSize: 16, fontWeight: "700" },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  filterButtonActive: { backgroundColor: "#fb923c" },
  filterText: { color: "#6b7280", fontWeight: "600", fontSize: 12 },
  filterTextActive: { color: "#fff", fontWeight: "600", fontSize: 12 },

  card: {
    backgroundColor: "#fafafa",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  subjectIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  instructor: { fontSize: 12, color: "#6b7280" },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  riskLabel: { fontSize: 11, fontWeight: "700" },
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gradeLabel: { fontSize: 13, color: "#6b7280" },
  grade: { fontWeight: "700", fontSize: 16 },
  progressBar: {
    height: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 8 },

  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },

  viewMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fb923c",
    marginRight: 6,
  },

  helpCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    elevation: 2,
    borderWidth: 2,
    borderColor: "#fff7ed",
  },
  helpIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff7ed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  helpContent: { flex: 1 },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  helpText: { fontSize: 13, color: "#6b7280", lineHeight: 18 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff7fb",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    padding: 16,
  },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  backText: { fontSize: 14, color: "#333", fontWeight: "600" },

  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  detailSubjectName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  detailRiskBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailRiskText: { fontSize: 12, fontWeight: "700" },
  detailInstructor: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
  gradeCircleContainer: { alignItems: "center", marginVertical: 16 },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeCircleText: { fontSize: 28, fontWeight: "800" },
  progressLabel: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
  detailProgressBar: {
    height: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
  },
  detailProgressFill: { height: "100%", borderRadius: 8 },
  progressPercentage: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },

  infoColumn: { marginTop: 16 },
  infoBox: { padding: 14, borderRadius: 12, marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoTextContainer: { marginLeft: 12, flex: 1 },
  infoLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#111827" },

  riskReasonsContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
  },
  riskReasonsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 8,
  },
  riskReasonItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  riskReasonDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  riskReasonText: { fontSize: 13, color: "#7F1D1D", flex: 1 },

  warningCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#fee2e2",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },
  warningText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 16,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  actionList: { marginBottom: 16 },
  actionItem: { flexDirection: "row", marginBottom: 12 },
  actionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fb923c",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "700",
    marginRight: 10,
  },
  actionText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },
  interventionButton: {
    backgroundColor: "#fb7185",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  interventionButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
