import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  UserX,
  CircleAlert,
  ShieldCheck,
  BookOpen,
} from "lucide-react-native";
import axios from "axios";
import { StatusBadge, ErrorState } from "../components/attendance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

const toDateKey = (year, month, day) => {
  const monthPart = String(month + 1).padStart(2, "0");
  const dayPart = String(day).padStart(2, "0");
  return `${year}-${monthPart}-${dayPart}`;
};

const toStatusRaw = (record) => {
  if (record?.statusRaw) {
    return String(record.statusRaw).toLowerCase();
  }

  return String(record?.status || "").toLowerCase();
};

const aggregateDayStatus = (dayRecords) => {
  const statuses = dayRecords.map((record) => toStatusRaw(record));

  if (statuses.includes("absent")) return "absent";
  if (statuses.includes("late")) return "late";
  if (statuses.includes("excused")) return "excused";
  if (statuses.includes("present")) return "present";

  return null;
};

const statusDotColor = (status) => {
  switch (status) {
    case "present":
      return "#16A34A";
    case "absent":
      return "#DC2626";
    case "late":
      return "#D97706";
    case "excused":
      return "#2563EB";
    default:
      return "#9CA3AF";
  }
};

export default function AttendanceDetail() {
  const router = useRouter();
  const { enrollmentId, subjectName, instructor } = useLocalSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const now = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(now.getDate());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const normalizedEnrollmentId = useMemo(
    () => String(enrollmentId || "").trim(),
    [enrollmentId],
  );

  const fetchData = async (isRefresh = false) => {
    if (!normalizedEnrollmentId) {
      setError("Missing enrollment id.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await axios.get(
        `/student/attendance/${normalizedEnrollmentId}`,
      );
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load attendance details.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [normalizedEnrollmentId]);

  const summary = data?.summary || {};
  const records = data?.records || [];
  const subject = data?.subject || {};
  const hasStarted = Boolean(data?.hasStarted);

  const recordsByDate = useMemo(() => {
    return records.reduce((accumulator, record) => {
      if (!record?.dateRaw) {
        return accumulator;
      }

      if (!accumulator[record.dateRaw]) {
        accumulator[record.dateRaw] = [];
      }

      accumulator[record.dateRaw].push(record);
      return accumulator;
    }, {});
  }, [records]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i += 1) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i += 1) {
      days.push(i);
    }

    return days;
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    if (selectedDate > daysInCurrentMonth) {
      setSelectedDate(daysInCurrentMonth);
    }
  }, [currentMonth, currentYear, selectedDate]);

  const selectedDateKey = useMemo(
    () => toDateKey(currentYear, currentMonth, selectedDate),
    [currentYear, currentMonth, selectedDate],
  );

  const selectedDateRecords = recordsByDate[selectedDateKey] || [];
  const calendarCellSize = Math.floor((SCREEN_WIDTH - 32 - 6 * 8) / 7);

  const changeMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((value) => value - 1);
      } else {
        setCurrentMonth((value) => value - 1);
      }
      return;
    }

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((value) => value + 1);
    } else {
      setCurrentMonth((value) => value + 1);
    }
  };

  const titleSubject = subject.name || subjectName || "Attendance Details";
  const titleInstructor = subject.instructor || instructor || "N/A";

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#DB2777" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.scrollContent, { flex: 1 }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <View style={styles.backIconCircle}>
              <ArrowLeft color="#374151" size={20} />
            </View>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <ErrorState message={error} onRetry={() => fetchData()} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
          />
        }
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <View style={styles.backIconCircle}>
            <ArrowLeft color="#374151" size={20} />
          </View>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCard}>
          <View style={styles.headerIconBox}>
            <BookOpen color="#DB2777" size={20} />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>{titleSubject}</Text>
            <Text style={styles.headerSubtitle}>
              Instructor: {titleInstructor}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Rate"
            value={
              summary.rate !== null && summary.rate !== undefined
                ? `${summary.rate}%`
                : "N/A"
            }
            bg="#FFF1F2"
            color="#BE185D"
            Icon={CheckCircle}
          />
          <StatCard
            label="Total"
            value={summary.total ?? 0}
            bg="#EFF6FF"
            color="#1D4ED8"
            Icon={CalendarDays}
          />
          <StatCard
            label="Present"
            value={summary.present ?? 0}
            bg="#ECFDF5"
            color="#047857"
            Icon={CheckCircle}
          />
          <StatCard
            label="Absent"
            value={summary.absent ?? 0}
            bg="#FEF2F2"
            color="#B91C1C"
            Icon={UserX}
          />
          <StatCard
            label="Late"
            value={summary.late ?? 0}
            bg="#FFF7ED"
            color="#B45309"
            Icon={Clock}
          />
          <StatCard
            label="Excused"
            value={summary.excused ?? 0}
            bg="#EFF6FF"
            color="#1E40AF"
            Icon={ShieldCheck}
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.sectionTitle}>Subject Attendance Calendar</Text>
            <View style={styles.monthBtns}>
              <TouchableOpacity
                onPress={() => changeMonth("prev")}
                style={styles.monthButton}
                activeOpacity={0.85}
              >
                <Text style={styles.monthButtonText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeMonth("next")}
                style={styles.monthButton}
                activeOpacity={0.85}
              >
                <Text style={styles.monthButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.calendarMonthTitle}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Text>

          <View style={styles.weekRow}>
            {WEEK_DAYS.map((dayLabel) => (
              <View
                key={dayLabel}
                style={[styles.weekDayCell, { width: calendarCellSize }]}
              >
                <Text style={styles.weekDayText}>{dayLabel}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const isSelected = day === selectedDate;
              const isToday =
                day === now.getDate() &&
                currentMonth === now.getMonth() &&
                currentYear === now.getFullYear();
              const dateKey = day
                ? toDateKey(currentYear, currentMonth, day)
                : null;
              const dayRecords = dateKey ? recordsByDate[dateKey] || [] : [];
              const dayStatus = aggregateDayStatus(dayRecords);
              const hasRecords = dayRecords.length > 0;

              return (
                <TouchableOpacity
                  key={`${dateKey || "empty"}-${index}`}
                  onPress={() => day && setSelectedDate(day)}
                  style={[
                    styles.calendarCell,
                    { width: calendarCellSize, height: calendarCellSize },
                    !day ? styles.calendarCellEmpty : null,
                    dayStatus === "present" ? styles.calendarCellPresent : null,
                    dayStatus === "absent" ? styles.calendarCellAbsent : null,
                    dayStatus === "late" ? styles.calendarCellLate : null,
                    dayStatus === "excused" ? styles.calendarCellExcused : null,
                    isSelected ? styles.calendarCellSelected : null,
                    isToday && !isSelected ? styles.calendarCellToday : null,
                  ]}
                  activeOpacity={day ? 0.7 : 1}
                >
                  <Text
                    style={[
                      styles.calendarCellText,
                      isSelected ? styles.calendarCellTextSelected : null,
                      isToday && !isSelected
                        ? styles.calendarCellTextToday
                        : null,
                    ]}
                  >
                    {day || ""}
                  </Text>

                  {hasRecords && (
                    <View
                      style={[
                        styles.calendarDot,
                        { backgroundColor: statusDotColor(dayStatus) },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.calendarLegendRow}>
            <LegendItem color="#16A34A" label="Present" />
            <LegendItem color="#DC2626" label="Absent" />
            <LegendItem color="#D97706" label="Late" />
            <LegendItem color="#2563EB" label="Excused" />
          </View>

          <View style={styles.selectedDateCard}>
            <Text style={styles.selectedDateTitle}>
              {MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear}
            </Text>

            {selectedDateRecords.length > 0 ? (
              selectedDateRecords.map((record) => (
                <View key={record.id} style={styles.recordRow}>
                  <View style={styles.recordMain}>
                    <Text style={styles.recordDate}>{record.date}</Text>
                    <Text style={styles.recordTime}>
                      {record.recordedAt || "Recorded"}
                    </Text>
                  </View>
                  <StatusBadge status={record.status} />
                </View>
              ))
            ) : (
              <Text style={styles.selectedDateEmpty}>
                No attendance record for this date.
              </Text>
            )}
          </View>

          {!hasStarted && (
            <Text style={styles.selectedDateEmpty}>
              Attendance for this subject has not started yet.
            </Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Attendance Records</Text>

          {!hasStarted && (
            <View style={styles.emptyStateBox}>
              <CircleAlert size={32} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>Not yet Started</Text>
              <Text style={styles.emptyStateText}>
                Attendance for this subject has not started yet. Once your
                teacher records attendance, the summary and history will appear
                here.
              </Text>
            </View>
          )}

          {hasStarted && records.length === 0 && (
            <Text style={styles.emptyText}>No attendance records found.</Text>
          )}

          {records.map((record) => {
            return (
              <View key={record.id} style={styles.recordRow}>
                <View style={styles.recordMain}>
                  <Text style={styles.recordDate}>{record.date}</Text>
                  <Text style={styles.recordTime}>
                    {record.recordedAt || "-"}
                  </Text>
                </View>
                <StatusBadge status={record.status} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value, bg, color, Icon }) => (
  <View style={[styles.statCard, { backgroundColor: bg }]}>
    <View style={[styles.statIcon, { backgroundColor: color }]}>
      <Icon color="#fff" size={14} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const LegendItem = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff7fb",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  errorText: {
    marginTop: 6,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#DB2777",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  backText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statCard: {
    width: "48.5%",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7280",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  monthBtns: {
    flexDirection: "row",
    gap: 8,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCE7F3",
  },
  monthButtonText: {
    color: "#BE185D",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
  calendarMonthTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#BE185D",
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  weekDayCell: {
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  calendarCell: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  calendarCellEmpty: {
    opacity: 0,
  },
  calendarCellPresent: {
    backgroundColor: "#ECFDF5",
    borderColor: "#BBF7D0",
  },
  calendarCellAbsent: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  calendarCellLate: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  calendarCellExcused: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  calendarCellSelected: {
    backgroundColor: "#DB2777",
    borderColor: "#BE185D",
  },
  calendarCellToday: {
    borderColor: "#DB2777",
    borderWidth: 2,
  },
  calendarCellText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  calendarCellTextSelected: {
    color: "#FFFFFF",
  },
  calendarCellTextToday: {
    color: "#BE185D",
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    bottom: 4,
  },
  calendarLegendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  selectedDateCard: {
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  selectedDateTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  selectedDateEmpty: {
    color: "#6B7280",
    fontSize: 12,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 6,
  },
  emptyStateBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  recordMain: {
    flex: 1,
    paddingRight: 12,
  },
  recordDate: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  recordTime: {
    marginTop: 2,
    fontSize: 11,
    color: "#6B7280",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
