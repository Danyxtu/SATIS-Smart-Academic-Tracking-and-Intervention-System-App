import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GraduationCap,
  AlertTriangle,
  ClipboardCheck,
  BookCheck,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Mainmenu from "../../src/components/MainMenu";
import styles from "@styles/home";
import axios from "axios";
import SubjectCard from "../../src/components/SubjectCard";
import NotificationItem from "../../src/components/NotificationItem";
import MiniChart from "../../src/components/MiniChart";
import QuickActionCard from "../../src/components/QuickActionCard";
import SemesterToggle from "../../src/components/SemesterToggle";
import SchoolPic from "@assets/school.jpg";
// Helper function for time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
};

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState(getGreeting());
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const fetchDashboard = useCallback(async (semester = null) => {
    try {
      const params = semester ? { semester } : {};
      const res = await axios.get(`/student/dashboard`, { params });
      let dashboardData = res.data || {};
      let dashboardSubjects = normalizeList(dashboardData?.subjectPerformance);

      // Fallback: if dashboard response has no subject cards, use performance endpoint
      // so subject tiles still render for students with valid enrollments.
      if (dashboardSubjects.length === 0) {
        try {
          const perfRes = await axios.get(`/student/performance`, { params });
          const perfSubjects = normalizeList(perfRes.data?.subjectPerformance);

          if (perfSubjects.length > 0) {
            dashboardSubjects = perfSubjects;
            dashboardData = {
              ...dashboardData,
              subjectPerformance: perfSubjects,
              stats: {
                ...(dashboardData?.stats || {}),
                totalSubjects:
                  (dashboardData?.stats?.totalSubjects || 0) > 0
                    ? dashboardData.stats.totalSubjects
                    : (perfRes.data?.stats?.totalSubjects ??
                      perfSubjects.length),
              },
            };
          }
        } catch (fallbackErr) {
          console.warn(
            "Home: subjectPerformance fallback failed",
            fallbackErr?.response || fallbackErr,
          );
        }
      }

      if (!Array.isArray(dashboardData?.subjectPerformance)) {
        dashboardData = {
          ...dashboardData,
          subjectPerformance: dashboardSubjects,
        };
      }

      setData(dashboardData);
      // Set initial semester from response if not already set
      if (semester === null && dashboardData?.semesters?.selected) {
        setSelectedSemester(dashboardData.semesters.selected);
      }
    } catch (err) {
      console.warn("Home: failed to load dashboard", err?.response || err);
      setError(err?.response?.data?.message || "Failed to load dashboard");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await fetchDashboard();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [fetchDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard(selectedSemester);
    setRefreshing(false);
  }, [fetchDashboard, selectedSemester]);

  const handleSemesterChange = useCallback(
    async (semester) => {
      if (semester === selectedSemester) return;
      setSelectedSemester(semester);
      setLoading(true);
      await fetchDashboard(semester);
      setLoading(false);
    },
    [fetchDashboard, selectedSemester],
  );

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.post(`/student/notifications/${notificationId}/read`);
      // update local state
      setData((prev) => {
        if (!prev) return prev;
        const previousNotifications = normalizeList(prev.notifications);
        return {
          ...prev,
          notifications: previousNotifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n,
          ),
          unreadNotificationCount: Math.max(
            (prev.unreadNotificationCount || 0) - 1,
            0,
          ),
        };
      });
    } catch (err) {
      console.warn("Failed to mark notification read", err?.response || err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await axios.post(`/student/notifications/read-all`);
      setData((prev) => {
        if (!prev) return prev;
        const previousNotifications = normalizeList(prev.notifications);
        return {
          ...prev,
          notifications: previousNotifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadNotificationCount: 0,
        };
      });
    } catch (err) {
      console.warn("Failed to mark all read", err?.response || err);
    }
  };

  const subjectPerformance = normalizeList(data?.subjectPerformance);
  const notifications = normalizeList(data?.notifications);
  const upcomingTasks = normalizeList(data?.upcomingTasks);

  const totalNotifications = notifications.length;
  const unreadNotificationCount = data?.unreadNotificationCount || 0;
  const displayedNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, 3);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color="#FF6B9D" />
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
        contentContainerStyle={styles.scrollContent}
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
        {/* Welcome Section */}
        <ImageBackground
          source={SchoolPic}
          style={styles.welcomeCard}
          imageStyle={styles.welcomeCardImage}
        >
          <View style={styles.welcomeOverlay}>
            <Text style={styles.welcomeTitle}>
              {greeting}, {data?.student?.firstName || "Student"}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Here's a summary of your academic progress.
            </Text>
          </View>
        </ImageBackground>

        {/* Semester Toggle */}
        <SemesterToggle
          currentSemester={data?.semesters?.current || 1}
          selectedSemester={data?.semesters?.selected || selectedSemester || 1}
          schoolYear={data?.semesters?.schoolYear || ""}
          semester1Count={data?.semesters?.semester1Count || 0}
          semester2Count={data?.semesters?.semester2Count || 0}
          onSemesterChange={handleSemesterChange}
        />

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <GraduationCap size={24} color="#DB2777" />
            <Text style={styles.statValue}>
              {data?.stats?.overallGrade !== null &&
              data?.stats?.overallGrade !== undefined
                ? `${data.stats.overallGrade}%`
                : "N/A"}
            </Text>
            <Text style={styles.statLabel}>Overall Grade</Text>
          </View>
          <View style={styles.statCard}>
            <ClipboardCheck size={24} color="#10B981" />
            <Text style={styles.statValue}>
              {data?.stats?.overallAttendance ?? "N/A"}%
            </Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/performance",
                params: { risk: "at-risk" },
              })
            }
            style={styles.statCard}
            activeOpacity={0.7}
          >
            <AlertTriangle size={24} color="#F59E0B" />
            <Text style={styles.statValue}>
              {data?.stats?.subjectsAtRisk ?? 0}
            </Text>
            <Text style={styles.statLabel}>At Risk</Text>
            <Text style={styles.statSubLabel}>
              of {data?.stats?.totalSubjects ?? 0} subjects
            </Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <BookCheck size={24} color="#6366F1" />
            <Text style={styles.statValue}>
              {data?.stats?.completedTasks ?? 0}/{data?.stats?.totalTasks ?? 0}
            </Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
        </View>

        {/* Subject Performance */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
              Subject Performance
            </Text>
            <TouchableOpacity onPress={() => router.push("/performance")}>
              <Text style={{ color: "#6366F1", fontWeight: "600" }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {subjectPerformance.slice(0, 4).map((subject) => (
              <View key={subject.id} style={{ width: "48%", marginBottom: 12 }}>
                <SubjectCard subject={subject} />
              </View>
            ))}
            {subjectPerformance.length === 0 && (
              <View
                style={{
                  padding: 16,
                  backgroundColor: "#fff",
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#6B7280" }}>
                  No subjects enrolled yet
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Grade Trend & Pending Tasks */}
        <View style={{ marginBottom: 16 }}>
          {/* Grade Trend */}
          <View style={styles.trendSection}>
            <Text style={styles.trendTitle}>Grade Trend</Text>
            {data?.gradeTrend?.subjectName ? (
              <Text style={styles.trendSubtitle}>
                <Text style={{ fontWeight: "600", color: "#6366F1" }}>
                  {data.gradeTrend.subjectName}
                </Text>
                {" trend"}
              </Text>
            ) : (
              <Text style={styles.trendSubtitle}>Score by category</Text>
            )}
            <MiniChart data={data?.gradeTrend || {}} />
          </View>

          {/* Pending Tasks */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 14,
              marginTop: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}
              >
                Pending Tasks
              </Text>
              <View
                style={{
                  backgroundColor: "#DBEAFE",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ fontSize: 11, color: "#1D4ED8", fontWeight: "600" }}
                >
                  {upcomingTasks.length} pending
                </Text>
              </View>
            </View>
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => (
                <View
                  key={task.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    paddingVertical: 10,
                    borderBottomWidth: index < upcomingTasks.length - 1 ? 1 : 0,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      marginTop: 2,
                      borderRadius: 3,
                      borderWidth: 1.5,
                      borderColor: "#D1D5DB",
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#111827",
                        fontWeight: "500",
                      }}
                    >
                      {task.description}
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}
                    >
                      {task.subject}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 16 }}>
                <Text style={{ fontSize: 24, marginBottom: 6 }}>🎉</Text>
                <Text
                  style={{ color: "#10B981", fontWeight: "600", fontSize: 13 }}
                >
                  All tasks completed!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}
              >
                Notifications
              </Text>
              {unreadNotificationCount > 0 && (
                <View
                  style={{
                    backgroundColor: "#EF4444",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "700",
                    }}
                  >
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {unreadNotificationCount > 0 && (
                <TouchableOpacity onPress={markAllNotificationsRead}>
                  <Text
                    style={{
                      color: "#6366F1",
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    Mark all read
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => router.push("/intervention")}>
                <Text
                  style={{ color: "#6B7280", fontWeight: "600", fontSize: 12 }}
                >
                  View all →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {totalNotifications > 0 ? (
            <View>
              {displayedNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onPress={async () => {
                    await markNotificationRead(n.id);
                    router.push(`/intervention?highlight=${n.id}`);
                  }}
                  onMarkRead={async (id) => await markNotificationRead(id)}
                />
              ))}

              {totalNotifications > 3 && (
                <TouchableOpacity
                  onPress={() => setShowAllNotifications((prev) => !prev)}
                  style={{
                    marginTop: 4,
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: "#EEF2FF",
                  }}
                >
                  <Text
                    style={{
                      color: "#4F46E5",
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {showAllNotifications
                      ? "Show Less"
                      : `View ${totalNotifications - 3} More`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View
              style={{
                padding: 20,
                backgroundColor: "#fff",
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 28, marginBottom: 8 }}>📭</Text>
              <Text style={{ color: "#6B7280", fontSize: 13 }}>
                No notifications yet
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 10,
            }}
          >
            Quick Actions
          </Text>
          <QuickActionCard
            title="View Analytics"
            description="Detailed performance breakdown"
            onPress={() => router.push("/performance")}
            gradientColor="#6366F1"
          />
          <QuickActionCard
            title="Interventions & Feedback"
            description="Check teacher feedback"
            onPress={() => router.push("/intervention")}
            gradientColor="#DB2777"
          />
          <QuickActionCard
            title="At-Risk Subjects"
            description="Review risk overview"
            onPress={() =>
              router.push({
                pathname: "/performance",
                params: { risk: "at-risk" },
              })
            }
            gradientColor="#EF4444"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
