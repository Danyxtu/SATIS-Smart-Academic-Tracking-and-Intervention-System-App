import React, { useEffect, useMemo, useState } from "react";
import Mainmenu from "../components/mainMenu";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  CalendarDays,
  UserX,
  Clock,
  Book,
  PenSquare,
  ClipboardList,
  Check,
  X,
} from "lucide-react-native";
import styles from "@styles/attendance";
import axios from "axios";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AttendanceDashboard() {
  // Date state
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [currentMonth, setCurrentMonth] = useState(todayMonth);
  const [currentYear, setCurrentYear] = useState(todayYear);
  const [showPercentage, setShowPercentage] = useState(true);

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
  const events = data?.events || {};

  // Events for selected date (API uses 'YYYY-M-D' format with 1-based month)
  const selectedEvents =
    events[`${currentYear}-${currentMonth + 1}-${selectedDate}`] || [];

  const monthNames = [
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

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentMonth, currentYear]);

  const changeMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    }
  };

  // layout sizing
  const calendarCellSize = Math.floor((SCREEN_WIDTH - 40 - 6 * 8) / 7); // padding at gaps

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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ color: "#dc2626", fontSize: 16, textAlign: "center" }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchData()}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: "#2563EB", fontWeight: "600" }}>Retry</Text>
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

        {/* Calendar */}
        <View style={styles.card}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <View style={styles.monthBtns}>
              <TouchableOpacity
                onPress={() => changeMonth("prev")}
                style={styles.monthButton}
              >
                <Text style={styles.monthButtonText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeMonth("next")}
                style={styles.monthButton}
              >
                <Text style={styles.monthButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <View
                key={d}
                style={[styles.weekDayCell, { width: calendarCellSize }]}
              >
                <Text style={styles.weekDayText}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, idx) => {
              const isSelected = day === selectedDate;
              const isToday =
                day === todayDate &&
                currentMonth === todayMonth &&
                currentYear === todayYear;
              // API uses 1-based month: 'YYYY-M-D'
              const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
              const hasEvents = day && events[dateKey];

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => day && setSelectedDate(day)}
                  style={[
                    styles.calendarCell,
                    { width: calendarCellSize, height: calendarCellSize },
                    !day ? styles.calendarCellEmpty : null,
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
                  {hasEvents && <View style={styles.eventDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Events modal */}
        {selectedEvents.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <PenSquare color="#db2777" size={24} />
              <Text style={styles.cardHeaderTitle}>
                Events on {monthNames[currentMonth]} {selectedDate},{" "}
                {currentYear}
              </Text>
            </View>

            <View>
              {selectedEvents.map((event, idx) => {
                const isCompleted = event.status === "completed";
                const eventIcon =
                  event.type === "assignment" ? (
                    <PenSquare color="#fb923c" size={24} />
                  ) : event.type === "exam" ? (
                    <ClipboardList color="#fb923c" size={24} />
                  ) : event.type === "project" ? (
                    <Book color="#fb923c" size={24} />
                  ) : (
                    <CalendarDays color="#fb923c" size={24} />
                  );

                return (
                  <View
                    key={idx}
                    style={[
                      styles.eventCard,
                      isCompleted && styles.eventCardCompleted,
                    ]}
                  >
                    <View style={{ marginRight: 12 }}>{eventIcon}</View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.eventTitle,
                          isCompleted && styles.eventTitleCompleted,
                        ]}
                      >
                        {event.title}
                      </Text>
                      <Text style={styles.eventType}>
                        {event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isCompleted
                          ? styles.statusCompleted
                          : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isCompleted && styles.statusTextCompleted,
                        ]}
                      >
                        {isCompleted ? "Done" : "Pending"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Subject Attendance modal */}
        <View style={styles.card}>
          <View style={styles.subjectHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.subjectIconBox}>
                <Book color="#db2777" size={24} />
              </View>
              <Text style={styles.subjectTitle}>Subject Attendance</Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowPercentage((s) => !s)}
              style={[
                styles.toggleTrack,
                showPercentage ? styles.toggleOn : styles.toggleOff,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleKnob,
                  showPercentage ? styles.toggleKnobOn : styles.toggleKnobOff,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 6 }}>
            {subjects.length > 0 ? (
              subjects.map((subject, i) => {
                const absences = subject.total - subject.attended;
                return (
                  <View key={subject.id || i} style={{ marginBottom: 16 }}>
                    <View style={styles.subjectRow}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text style={styles.subjectStat}>
                        {showPercentage
                          ? `${subject.attendanceRate}%`
                          : `${subject.attended}/${subject.total}`}
                      </Text>
                    </View>

                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${subject.attendanceRate}%`,
                            backgroundColor: subject.color || "#3b82f6",
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.absencesText}>
                      Absences: {absences}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: "#6B7280" }}>
                No subjects enrolled yet.
              </Text>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock color="#db2777" size={24} />
            <Text style={styles.cardHeaderTitle}>Recent Activity</Text>
          </View>

          {subjects.length > 0 ? (
            <View>
              {subjects.map((subject, idx) => {
                const status = subject.status;
                const bg =
                  status === "Present"
                    ? "#ecfdf5"
                    : status === "Absent"
                    ? "#fee2e2"
                    : "#fff7ed";
                const icon =
                  status === "Present" ? (
                    <Check color="#16a34a" size={24} />
                  ) : status === "Absent" ? (
                    <X color="#dc2626" size={24} />
                  ) : (
                    <Clock color="#f97316" size={24} />
                  );
                const color =
                  status === "Present"
                    ? "#16a34a"
                    : status === "Absent"
                    ? "#dc2626"
                    : "#f97316";

                return (
                  <View
                    key={subject.id || idx}
                    style={[styles.activityRow, { backgroundColor: "#fafafa" }]}
                  >
                    <View
                      style={[styles.statusCircle, { backgroundColor: bg }]}
                    >
                      {icon}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityName}>{subject.name}</Text>
                      <Text style={[styles.activityStatus, { color }]}>
                        {status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: "#6B7280" }}>No recent activity.</Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
