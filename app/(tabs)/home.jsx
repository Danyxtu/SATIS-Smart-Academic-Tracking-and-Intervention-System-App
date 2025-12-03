import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GraduationCap,
  AlertTriangle,
  ClipboardCheck,
  BookCheck,
  BarChart2,
  CheckSquare,
  TrendingUp,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Mainmenu from "../components/mainMenu";
import styles from "@styles/home";
import axios from "axios";
import SubjectCard from "../components/SubjectCard";
import NotificationItem from "../components/NotificationItem";
import MiniChart from "../components/MiniChart";
import QuickActionCard from "../components/QuickActionCard";

// Helper function for time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/student/dashboard`);
        if (!mounted) return;
        setData(res.data);
      } catch (err) {
        console.warn("Home: failed to load dashboard", err?.response || err);
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.post(`/student/notifications/${notificationId}/read`);
      // update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadNotificationCount: Math.max(
            (prev.unreadNotificationCount || 0) - 1,
            0
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
        return {
          ...prev,
          notifications: (prev.notifications || []).map((n) => ({
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

  if (loading) {
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
      >
        {/* Welcome Section */}
        <ImageBackground
          source={require("../../assets/school.jpg")}
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
            onPress={() => router.push("/subject")}
            style={styles.statCard}
            activeOpacity={0.7}
          >
            <AlertTriangle size={24} color="#F59E0B" />
            <Text style={styles.statValue}>
              {data?.stats?.subjectsAtRisk ?? 0}
            </Text>
            <Text style={styles.statLabel}>At Risk</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <BookCheck size={24} color="#6366F1" />
            <Text style={styles.statValue}>
              {data?.stats?.completedTasks ?? 0}/{data?.stats?.totalTasks ?? 0}
            </Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <BarChart2 size={20} color="#DB2777" />
            <Text style={styles.performanceTitle}>Performance Overview</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Academic Performance</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  { width: `${data?.stats?.overallGrade ?? 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data?.stats?.overallGrade ?? "N/A"}%
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Attendance Rate</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  { width: `${data?.stats?.overallAttendance ?? 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data?.stats?.overallAttendance ?? "N/A"}%
            </Text>
          </View>
          <View style={[styles.performanceItem, { marginBottom: 0 }]}>
            <Text style={styles.performanceLabel}>Task Completion</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  {
                    width:
                      data?.stats?.totalTasks > 0
                        ? `${Math.round(
                            (data?.stats?.completedTasks /
                              (data?.stats?.totalTasks || 1)) *
                              100
                          )}%`
                        : "0%",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {data?.stats?.totalTasks > 0
                ? `${Math.round(
                    (data?.stats?.completedTasks /
                      (data?.stats?.totalTasks || 1)) *
                      100
                  )}%`
                : "N/A"}
            </Text>
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
            {(data?.subjectPerformance || []).slice(0, 4).map((subject) => (
              <View key={subject.id} style={{ width: "48%", marginBottom: 12 }}>
                <SubjectCard subject={subject} />
              </View>
            ))}
            {(!data?.subjectPerformance ||
              data.subjectPerformance.length === 0) && (
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

        {/* Grade Trend & Pending Tasks - Stacked for mobile */}
        <View style={{ marginBottom: 16 }}>
          {/* Grade Trend */}
          <View style={styles.trendSection}>
            <View style={styles.trendHeader}>
              <TrendingUp size={18} color="#DB2777" />
              <Text style={styles.trendTitle}>Grade Trend</Text>
            </View>
            <Text style={styles.trendSubtitle}>Your weekly performance</Text>
            <MiniChart data={data?.gradeTrend || []} />
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
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <CheckSquare size={18} color="#DB2777" />
                <Text
                  style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}
                >
                  Pending Tasks
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#FCE7F3",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ fontSize: 11, color: "#DB2777", fontWeight: "600" }}
                >
                  {(data?.upcomingTasks || []).length} pending
                </Text>
              </View>
            </View>
            {(data?.upcomingTasks || []).length > 0 ? (
              (data.upcomingTasks || []).slice(0, 3).map((task, index) => (
                <View
                  key={task.id}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth:
                      index < Math.min((data.upcomingTasks || []).length, 3) - 1
                        ? 1
                        : 0,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#111827",
                      fontWeight: "500",
                    }}
                    numberOfLines={1}
                  >
                    {task.description}
                  </Text>
                  <Text
                    style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}
                  >
                    {task.subject}
                  </Text>
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
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              Notifications
            </Text>
            {(data?.notifications || []).length > 0 && (
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ fontSize: 11, color: "#DC2626", fontWeight: "600" }}
                >
                  {data?.unreadNotificationCount || 0} new
                </Text>
              </View>
            )}
          </View>
          {(data?.notifications || []).length > 0 ? (
            (data.notifications || []).slice(0, 3).map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onPress={async () => {
                  await markNotificationRead(n.id);
                  router.push(`/intervention?highlight=${n.id}`);
                }}
                onMarkRead={async (id) => await markNotificationRead(id)}
              />
            ))
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
            title="Subjects at Risk"
            description="View struggling areas"
            onPress={() => router.push("/subject")}
            gradientColor="#EF4444"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
