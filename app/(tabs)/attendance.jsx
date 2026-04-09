import React, { useEffect, useState } from "react";
import Mainmenu from "../../src/components/MainMenu";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  CalendarDays,
  UserX,
  Clock,
  BookOpen,
  Check,
  X,
  ShieldCheck,
} from "lucide-react-native";
import styles from "@styles/attendance";
import axios from "axios";
import {
  SubjectAttendanceCard,
  EmptyState,
  ErrorState,
  StatusBadge,
} from "../../src/components/attendance";

export default function AttendanceDashboard() {
  // API data state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get("/student/attendance");
      setData(res.data);
      setError(null);
    } catch (err) {
      console.warn("Attendance fetch error", err?.response || err);
      setError(err?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived values
  const stats = data?.stats || {
    overallAttendance: 0,
    daysPresent: 0,
    totalDays: 0,
    daysAbsent: 0,
    tardiness: 0,
  };
  const subjects = data?.subjects || [];
  const attendanceLog = data?.attendanceLog || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.mainMenuWrapper}>
          <Mainmenu />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { flex: 1 }]}
        >
          <ErrorState message={error} onRetry={() => fetchData()} />
        </ScrollView>
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
            onRefresh={() => fetchData(true)}
          />
        }
      >
        {/* Attendance Overview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CalendarDays color="#db2777" size={24} />
            <Text style={styles.cardHeaderTitle}>Attendance Overview</Text>
          </View>

          <View style={styles.grid2}>
            <View style={[styles.smallCard, { backgroundColor: "#fff7ed" }]}>
              <View style={styles.smallCardHeader}>
                <View style={[styles.iconBox, { backgroundColor: "#fb923c" }]}>
                  <TrendingUp color="#fff" size={24} />
                </View>
              </View>
              <Text style={styles.bigNumber}>{stats.overallAttendance}%</Text>
              <Text style={styles.smallMuted}>Overall Attendance</Text>
            </View>

            <View style={[styles.smallCard, { backgroundColor: "#eff6ff" }]}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "#60a5fa", marginBottom: 8 },
                ]}
              >
                <CalendarDays color="#fff" size={24} />
              </View>
              <Text style={styles.bigNumber}>{stats.daysPresent}</Text>
              <Text style={styles.smallMuted}>Days Present</Text>
              <Text style={styles.smallMutedExtra}>
                Out of {stats.totalDays} days
              </Text>
            </View>
          </View>

          <View style={styles.grid2}>
            <View style={[styles.smallCard, { backgroundColor: "#fff1f2" }]}>
              <View style={styles.smallCardHeader}>
                <View style={[styles.iconBox, { backgroundColor: "#f87171" }]}>
                  <UserX color="#fff" size={24} />
                </View>
              </View>
              <Text style={styles.bigNumber}>{stats.daysAbsent}</Text>
              <Text style={styles.smallMuted}>Days Absent</Text>
            </View>

            <View style={[styles.smallCard, { backgroundColor: "#faf5ff" }]}>
              <View style={[styles.iconBox, { backgroundColor: "#a78bfa" }]}>
                <Clock color="#fff" size={24} />
              </View>
              <Text style={styles.bigNumber}>{stats.tardiness}</Text>
              <Text style={styles.smallMuted}>Tardiness</Text>
            </View>
          </View>
        </View>

        {/* Attendance by Subject */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen color="#db2777" size={24} />
            <Text style={styles.cardHeaderTitle}>Attendance by Subject</Text>
          </View>

          {subjects.length > 0 ? (
            <View>
              {subjects.map((subject, i) => (
                <SubjectAttendanceCard key={subject.id || i} item={subject} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No Subjects Found"
              message="You're not enrolled in any subjects yet. Contact your teacher or administrator for enrollment."
              icon={BookOpen}
            />
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock color="#db2777" size={24} />
            <Text style={styles.cardHeaderTitle}>Recent Activity</Text>
          </View>

          {attendanceLog.length > 0 ? (
            <View>
              {attendanceLog.map((record, idx) => {
                const status = record.status;
                const bg =
                  status === "Present"
                    ? "#ecfdf5"
                    : status === "Absent"
                      ? "#fee2e2"
                      : status === "Excused"
                        ? "#eff6ff"
                        : "#fff7ed";
                const icon =
                  status === "Present" ? (
                    <Check color="#16a34a" size={22} />
                  ) : status === "Absent" ? (
                    <X color="#dc2626" size={22} />
                  ) : status === "Excused" ? (
                    <ShieldCheck color="#2563eb" size={22} />
                  ) : (
                    <Clock color="#f97316" size={22} />
                  );

                return (
                  <View
                    key={record.id || idx}
                    style={[styles.activityRow, { backgroundColor: "#fafafa" }]}
                  >
                    <View
                      style={[styles.statusCircle, { backgroundColor: bg }]}
                    >
                      {icon}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityName}>{record.subject}</Text>
                      <Text style={styles.smallMuted}>{record.date}</Text>
                      <Text style={styles.smallMutedExtra}>
                        {record.time || "-"}
                      </Text>
                    </View>
                    <StatusBadge status={status} />
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: "#6B7280" }}>
              No attendance activity recorded yet.
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
