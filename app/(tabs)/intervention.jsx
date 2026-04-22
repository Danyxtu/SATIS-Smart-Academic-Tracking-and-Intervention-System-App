import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Mainmenu from "../../src/components/MainMenu";
import {
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Target,
  BookOpen,
  Inbox,
  Bell,
  ListTodo,
  AlertCircle,
  Square,
  CheckSquare,
  RefreshCw,
  BarChart2,
  Upload,
  FileText,
  X,
} from "lucide-react-native";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";

const InterventionFeedback = () => {
  const { highlight } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [highlightedId, setHighlightedId] = useState(null);
  const [requestingCompletionId, setRequestingCompletionId] = useState(null);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [completionNotes, setCompletionNotes] = useState("");
  
  // Proof upload states
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofNotes, setProofNotes] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const scrollViewRef = useRef(null);
  const feedbackRefs = useRef({});

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get("/student/interventions");
      setData(res.data);
      setError(null);
    } catch (err) {
      console.warn("Intervention fetch error:", err?.response || err);
      setError(err?.response?.data?.message || "Failed to load interventions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle highlight parameter from notification click
  useEffect(() => {
    if (highlight && data) {
      setHighlightedId(highlight);
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlight, data]);

  const interventions = data?.interventions || [];
  const stats = data?.stats || {};
  const recentFeedback = data?.recentFeedback || [];

  // Filter interventions based on active tab
  const filteredInterventions = interventions.filter((intervention) => {
    if (activeTab === "all") return true;
    return intervention.status === activeTab;
  });

  const counts = {
    all: interventions.length,
    active: interventions.filter((i) => i.status === "active").length,
    completed: interventions.filter((i) => i.status === "completed").length,
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.post(`/student/interventions/tasks/${taskId}/complete`);
      fetchData(true);
    } catch (err) {
      console.warn("Task complete error:", err?.response || err);
    }
  };

  const handleMarkFeedbackRead = async (notificationId) => {
    try {
      await axios.post(`/student/feedback/${notificationId}/read`);
      fetchData(true);
    } catch (err) {
      console.warn("Mark read error:", err?.response || err);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofFile(result.assets[0]);
      }
    } catch (err) {
      console.warn("Document pick error:", err);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedTask || !proofFile) {
      Alert.alert("Error", "Please select a file to upload");
      return;
    }

    try {
      setIsSubmittingProof(true);

      const formData = new FormData();
      formData.append("proof", {
        uri: proofFile.uri,
        name: proofFile.name,
        type: proofFile.mimeType || "application/octet-stream",
      });

      if (proofNotes.trim()) {
        formData.append("notes", proofNotes.trim());
      }

      const res = await axios.post(
        `/student/interventions/tasks/${selectedTask.id}/complete`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Alert.alert(
        "Success",
        res?.data?.message || "Proof submitted successfully!",
      );

      setProofModalVisible(false);
      setSelectedTask(null);
      setProofFile(null);
      setProofNotes("");
      fetchData(true);
    } catch (err) {
      console.warn("Proof submission error:", err?.response || err);
      Alert.alert(
        "Submission Failed",
        err?.response?.data?.message || "Failed to submit proof.",
      );
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const openProofModal = (task) => {
    setSelectedTask(task);
    setProofFile(null);
    setProofNotes("");
    setProofModalVisible(true);
  };

  const openCompletionModal = (intervention) => {
    setSelectedIntervention(intervention);
    setCompletionNotes("");
    setCompletionModalVisible(true);
  };

  const closeCompletionModal = () => {
    if (requestingCompletionId) {
      return;
    }

    setCompletionModalVisible(false);
    setSelectedIntervention(null);
    setCompletionNotes("");
  };

  const handleRequestCompletion = async () => {
    if (!selectedIntervention?.id) {
      return;
    }

    try {
      setRequestingCompletionId(selectedIntervention.id);

      const payload = {};
      if (completionNotes.trim()) {
        payload.notes = completionNotes.trim();
      }

      const res = await axios.post(
        `/student/interventions/${selectedIntervention.id}/request-completion`,
        payload,
      );

      Alert.alert(
        "Request Submitted",
        res?.data?.message ||
          "Completion request submitted. Your teacher will review it.",
      );

      setCompletionModalVisible(false);
      setSelectedIntervention(null);
      setCompletionNotes("");
      fetchData(true);
    } catch (err) {
      Alert.alert(
        "Unable to Submit",
        err?.response?.data?.message || "Failed to submit completion request.",
      );
    } finally {
      setRequestingCompletionId(null);
    }
  };

  const isSubmittingCompletion =
    !!selectedIntervention &&
    requestingCompletionId === selectedIntervention.id;

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
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ListTodo color="#DB2777" size={24} />
            <Text style={styles.headerTitle}>Interventions & Feedback</Text>
          </View>
          <TouchableOpacity
            onPress={() => fetchData(true)}
            style={styles.refreshBtn}
          >
            <RefreshCw color="#6B7280" size={18} />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Track your academic interventions and teacher feedback
        </Text>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                activeTab === tab.key && styles.filterTabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeTab === tab.key && styles.filterTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {counts[tab.key] > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    activeTab === tab.key && styles.filterBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      activeTab === tab.key && styles.filterBadgeTextActive,
                    ]}
                  >
                    {counts[tab.key]}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Active"
            value={stats.activeInterventions || 0}
            icon={AlertTriangle}
            color="#DB2777"
            bgColor="#FDF2F8"
          />
          <StatCard
            label="Completed"
            value={stats.completedInterventions || 0}
            icon={CheckCircle}
            color="#10B981"
            bgColor="#ECFDF5"
          />
          <StatCard
            label="Feedback"
            value={stats.totalFeedback || 0}
            icon={MessageSquare}
            color="#3B82F6"
            bgColor="#EFF6FF"
          />
          <StatCard
            label="Success"
            value={`${stats.taskSuccessRate || 0}%`}
            icon={TrendingUp}
            color="#F59E0B"
            bgColor="#FFFBEB"
          />
        </View>

        {/* Interventions List */}
        {filteredInterventions.length > 0 ? (
          filteredInterventions.map((intervention) => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              onCompleteTask={handleCompleteTask}
              onOpenProofModal={openProofModal}
              onRequestCompletion={openCompletionModal}
              requestingCompletion={requestingCompletionId === intervention.id}
            />
          ))
        ) : (
          <EmptyState filter={activeTab} />
        )}

        {/* Recent Feedback Section */}
        <RecentFeedbackCard
          feedback={recentFeedback}
          onMarkRead={handleMarkFeedbackRead}
          highlightedId={highlightedId}
        />

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <BookOpen color="#FFF" size={20} />
            <Text style={styles.tipsTitle}>Quick Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <CheckCircle color="#FDE7F3" size={14} />
              <Text style={styles.tipText}>
                Complete tasks to improve your progress
              </Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle color="#FDE7F3" size={14} />
              <Text style={styles.tipText}>
                Communicate with your teachers regularly
              </Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle color="#FDE7F3" size={14} />
              <Text style={styles.tipText}>
                Check feedback daily for updates
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Proof Submission Modal */}
      <Modal
        visible={proofModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          !isSubmittingProof && setProofModalVisible(false)
        }
      >
        <View style={styles.completionModalOverlay}>
          <View style={styles.completionModalCard}>
            <View style={styles.completionModalHeader}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.completionModalTitle}>Submit Proof</Text>
                <TouchableOpacity
                  onPress={() => setProofModalVisible(false)}
                  disabled={isSubmittingProof}
                >
                  <X color="#6B7280" size={20} />
                </TouchableOpacity>
              </View>
              <Text style={styles.completionModalSubtitle}>
                {selectedTask?.text || "Task Proof"}
              </Text>
            </View>

            <View style={styles.proofUploadContainer}>
              <TouchableOpacity
                style={[
                  styles.filePickerBtn,
                  proofFile && styles.filePickerBtnSelected,
                ]}
                onPress={handlePickDocument}
                disabled={isSubmittingProof}
              >
                {proofFile ? (
                  <FileText color="#059669" size={24} />
                ) : (
                  <Upload color="#DB2777" size={24} />
                )}
                <Text
                  style={[
                    styles.filePickerText,
                    proofFile && styles.filePickerTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {proofFile ? proofFile.name : "Select Proof (PDF or Image)"}
                </Text>
              </TouchableOpacity>

              {proofFile && (
                <TouchableOpacity
                  style={styles.removeFileBtn}
                  onPress={() => setProofFile(null)}
                  disabled={isSubmittingProof}
                >
                  <Text style={styles.removeFileText}>Remove file</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Notes for teacher (optional)</Text>
            <TextInput
              style={styles.completionNotesInput}
              value={proofNotes}
              onChangeText={setProofNotes}
              placeholder="Add any details about your submission..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              textAlignVertical="top"
              editable={!isSubmittingProof}
            />

            <View style={styles.completionModalActions}>
              <TouchableOpacity
                style={styles.completionCancelBtn}
                onPress={() => setProofModalVisible(false)}
                disabled={isSubmittingProof}
              >
                <Text style={styles.completionCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.completionSubmitBtn,
                  (isSubmittingProof || !proofFile) &&
                    styles.completionSubmitBtnDisabled,
                  { backgroundColor: "#DB2777" },
                ]}
                onPress={handleSubmitProof}
                disabled={isSubmittingProof || !proofFile}
              >
                {isSubmittingProof ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.completionSubmitBtnText}>
                    Submit Proof
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={completionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCompletionModal}
      >
        <View style={styles.completionModalOverlay}>
          <View style={styles.completionModalCard}>
            <View style={styles.completionModalHeader}>
              <Text style={styles.completionModalTitle}>
                Request Completion
              </Text>
              <Text style={styles.completionModalSubtitle}>
                {selectedIntervention?.subjectName || "Intervention"}
              </Text>
            </View>

            <Text style={styles.completionModalBodyText}>
              You are requesting to mark this Tier 3 intervention as complete.
              Your teacher will review and approve your request.
            </Text>

            <Text style={styles.inputLabel}>
              Notes for your teacher (optional)
            </Text>
            <TextInput
              style={styles.completionNotesInput}
              value={completionNotes}
              onChangeText={setCompletionNotes}
              placeholder="Describe what you've accomplished or any additional information..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.completionCounter}>
              {completionNotes.length}/1000
            </Text>

            <View style={styles.completionModalActions}>
              <TouchableOpacity
                style={styles.completionCancelBtn}
                onPress={closeCompletionModal}
                disabled={isSubmittingCompletion}
              >
                <Text style={styles.completionCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.completionSubmitBtn,
                  isSubmittingCompletion && styles.completionSubmitBtnDisabled,
                ]}
                onPress={handleRequestCompletion}
                disabled={isSubmittingCompletion}
              >
                {isSubmittingCompletion ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.completionSubmitBtnText}>
                    Submit Request
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Stat Card Component ---
const StatCard = ({ label, value, icon: Icon, color, bgColor }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <View style={[styles.statIconBox, { backgroundColor: color }]}>
      <Icon color="#FFF" size={18} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// --- Intervention Card Component ---
const InterventionCard = ({
  intervention,
  onCompleteTask,
  onOpenProofModal,
  onRequestCompletion,
  requestingCompletion,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isPendingApproval =
    intervention.isPendingApproval ?? intervention.isPendingCompletionApproval;

  const getPriorityColor = (priority) => {
    if (priority === "High") return { bg: "#FEE2E2", text: "#DC2626" };
    if (priority === "Medium") return { bg: "#FEF3C7", text: "#D97706" };
    return { bg: "#D1FAE5", text: "#059669" };
  };

  const getStatusColor = (status) => {
    if (status === "active") return { bg: "#DBEAFE", text: "#2563EB" };
    if (status === "completed") return { bg: "#D1FAE5", text: "#059669" };
    return { bg: "#FEF3C7", text: "#D97706" };
  };

  const getGradeColor = (grade) => {
    if (grade === null) return "#DB2777";
    if (grade < 70) return "#DC2626";
    if (grade < 75) return "#D97706";
    return "#059669";
  };

  const priority = getPriorityColor(intervention.priority);
  const status = getStatusColor(intervention.status);

  const PriorityIcon =
    intervention.priority === "High"
      ? AlertTriangle
      : intervention.priority === "Medium"
        ? BarChart2
        : CheckCircle;

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{intervention.subjectName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>
                {intervention.status.charAt(0).toUpperCase() +
                  intervention.status.slice(1)}
              </Text>
            </View>
          </View>
          {intervention.subjectSection && (
            <Text style={styles.sectionText}>
              Section: {intervention.subjectSection}
            </Text>
          )}
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
          <PriorityIcon color={priority.text} size={12} />
          <Text style={[styles.priorityText, { color: priority.text }]}>
            {intervention.priority}
          </Text>
        </View>
      </View>

      {/* Meta Info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <User color="#6B7280" size={12} />
          <Text style={styles.metaText}>{intervention.teacherName}</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock color="#6B7280" size={12} />
          <Text style={styles.metaText}>{intervention.startDate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Target color="#DB2777" size={12} />
          <Text
            style={[styles.metaText, { color: "#DB2777", fontWeight: "600" }]}
          >
            {intervention.typeLabel}
          </Text>
        </View>
        {intervention.deadlineLabel && (
          <View style={styles.metaItem}>
            {intervention.isDeadlineOverdue ? (
              <AlertCircle color="#DC2626" size={12} />
            ) : (
              <Clock color="#D97706" size={12} />
            )}
            <Text
              style={[
                styles.metaText,
                intervention.isDeadlineOverdue
                  ? styles.deadlineMetaTextOverdue
                  : styles.deadlineMetaText,
              ]}
            >
              {intervention.isDeadlineOverdue
                ? "Deadline overdue"
                : `Deadline: ${intervention.deadlineLabel}`}
            </Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {intervention.notes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>{intervention.notes}</Text>
        </View>
      )}

      {intervention.deadlineLabel && (
        <View
          style={[
            styles.deadlineInfoBox,
            intervention.isDeadlineOverdue
              ? styles.deadlineInfoBoxOverdue
              : styles.deadlineInfoBoxUpcoming,
          ]}
        >
          <Text
            style={[
              styles.deadlineInfoTitle,
              intervention.isDeadlineOverdue
                ? styles.deadlineInfoTitleOverdue
                : styles.deadlineInfoTitleUpcoming,
            ]}
          >
            {intervention.isDeadlineOverdue
              ? "This intervention deadline has passed. Please contact your teacher immediately."
              : "Complete this intervention on or before:"}
          </Text>
          <Text
            style={[
              styles.deadlineInfoLabel,
              intervention.isDeadlineOverdue
                ? styles.deadlineInfoTitleOverdue
                : styles.deadlineInfoTitleUpcoming,
            ]}
          >
            {intervention.deadlineLabel}
          </Text>
        </View>
      )}

      {/* Mini Stats */}
      <View style={styles.miniStatsRow}>
        <View style={[styles.miniStat, { backgroundColor: "#FDF2F8" }]}>
          <Text
            style={[
              styles.miniStatValue,
              { color: getGradeColor(intervention.currentGrade) },
            ]}
          >
            {intervention.currentGrade !== null
              ? `${intervention.currentGrade}%`
              : "N/A"}
          </Text>
          <Text style={styles.miniStatLabel}>Current Grade</Text>
        </View>
        <View
          style={[
            styles.miniStat,
            {
              backgroundColor:
                intervention.attendanceRate < 80
                  ? "#FEE2E2"
                  : intervention.attendanceRate < 90
                    ? "#FEF3C7"
                    : "#D1FAE5",
            },
          ]}
        >
          <Text
            style={[
              styles.miniStatValue,
              {
                color:
                  intervention.attendanceRate < 80
                    ? "#DC2626"
                    : intervention.attendanceRate < 90
                      ? "#D97706"
                      : "#059669",
              },
            ]}
          >
            {intervention.attendanceRate}%
          </Text>
          <Text style={styles.miniStatLabel}>Attendance</Text>
        </View>
        <View
          style={[
            styles.miniStat,
            {
              backgroundColor:
                intervention.missingWork > 0 ? "#FEE2E2" : "#D1FAE5",
            },
          ]}
        >
          <Text
            style={[
              styles.miniStatValue,
              { color: intervention.missingWork > 0 ? "#DC2626" : "#059669" },
            ]}
          >
            {intervention.missingWork}
          </Text>
          <Text style={styles.miniStatLabel}>Missing Work</Text>
        </View>
      </View>

      {/* Tasks / Action Plan */}
      {intervention.tasks.length > 0 && (
        <View style={styles.tasksSection}>
          <TouchableOpacity
            style={styles.tasksHeader}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <View style={styles.tasksHeaderLeft}>
              <ListTodo color="#374151" size={16} />
              <Text style={styles.tasksTitle}>
                Action Plan ({intervention.completedTasks}/
                {intervention.totalTasks})
              </Text>
            </View>
            {isExpanded ? (
              <ChevronUp color="#6B7280" size={16} />
            ) : (
              <ChevronDown color="#6B7280" size={16} />
            )}
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.tasksList}>
              {intervention.tasks.map((task) => {
                const isRemote = task.delivery_mode === "remote";
                const isPendingReview = task.isPendingReview;

                return (
                  <View key={task.id} style={styles.taskItemContainer}>
                    <TouchableOpacity
                      style={styles.taskItem}
                      onPress={() => {
                        if (task.completed || isPendingReview) return;
                        if (isRemote) {
                          onOpenProofModal(task);
                        } else {
                          onCompleteTask(task.id);
                        }
                      }}
                      disabled={task.completed || isPendingReview}
                    >
                      {task.completed ? (
                        <CheckSquare color="#DB2777" size={18} />
                      ) : isPendingReview ? (
                        <Clock color="#F59E0B" size={18} />
                      ) : (
                        <Square color="#9CA3AF" size={18} />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.taskText,
                            task.completed && styles.taskTextCompleted,
                            isPendingReview && styles.taskTextPending,
                          ]}
                        >
                          {task.text}
                          {isRemote && !task.completed && !isPendingReview && (
                            <Text style={styles.remoteBadge}> (Remote)</Text>
                          )}
                        </Text>
                        {isPendingReview && (
                          <Text style={styles.pendingReviewText}>
                            Proof submitted, awaiting review
                          </Text>
                        )}
                      </View>
                      {isRemote && !task.completed && !isPendingReview && (
                        <Upload color="#DB2777" size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    intervention.totalTasks > 0
                      ? (intervention.completedTasks /
                          intervention.totalTasks) *
                        100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {intervention.tasks.length === 0 && (
        <Text style={styles.noTasksText}>No action plan assigned yet.</Text>
      )}

      {intervention.isTier3 && isPendingApproval && (
        <View style={styles.completionInfoBox}>
          <Text style={styles.completionInfoTitle}>
            Completion request pending teacher approval
          </Text>
          <Text style={styles.completionInfoMeta}>
            {intervention.completionRequestedAtLabel ||
              "Awaiting teacher review."}
          </Text>
          {!!intervention.completionRequestNotes && (
            <Text style={styles.completionInfoMeta}>
              Notes: {intervention.completionRequestNotes}
            </Text>
          )}
        </View>
      )}

      {intervention.isTier3 &&
        intervention.rejectedAt &&
        !intervention.hasCompletionRequest && (
          <View style={styles.rejectedInfoBox}>
            <Text style={styles.rejectedInfoTitle}>
              Previous completion request was not approved
            </Text>
            <Text style={styles.rejectedInfoMeta}>
              Rejected on {intervention.rejectedAt}
            </Text>
            {!!intervention.rejectionReason && (
              <Text style={styles.rejectedInfoMeta}>
                Reason: {intervention.rejectionReason}
              </Text>
            )}
          </View>
        )}

      {intervention.status === "completed" && intervention.approvedAt && (
        <View style={styles.approvedInfoBox}>
          <Text style={styles.approvedInfoTitle}>Intervention Completed</Text>
          <Text style={styles.completionInfoMeta}>
            Approved on {intervention.approvedAt}
          </Text>
        </View>
      )}

      {intervention.canRequestCompletion &&
        !intervention.hasCompletionRequest && (
          <View style={styles.completionRequestBox}>
            <Text style={styles.completionRequestText}>
              This Tier 3 intervention is eligible for completion review.
            </Text>
            <TouchableOpacity
              style={[
                styles.completionRequestBtn,
                requestingCompletion && styles.completionRequestBtnDisabled,
              ]}
              onPress={() => onRequestCompletion(intervention)}
              disabled={requestingCompletion}
            >
              {requestingCompletion ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.completionRequestBtnText}>
                  Request Completion Review
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
};

// --- Recent Feedback Card Component ---
const RecentFeedbackCard = ({ feedback, onMarkRead, highlightedId }) => {
  const [showAll, setShowAll] = useState(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (highlightedId) {
      // Create blink animation
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 },
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [highlightedId, blinkAnim]);

  const displayedFeedback = showAll ? feedback : feedback.slice(0, 3);

  const getTypeIcon = (type) => {
    switch (type) {
      case "feedback":
        return MessageSquare;
      case "nudge":
        return Bell;
      case "task":
        return ListTodo;
      case "alert":
        return AlertCircle;
      default:
        return MessageSquare;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "feedback":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "nudge":
        return { bg: "#F3E8FF", text: "#9333EA" };
      case "task":
        return { bg: "#D1FAE5", text: "#059669" };
      case "alert":
        return { bg: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#DBEAFE", text: "#2563EB" };
    }
  };

  if (feedback.length === 0) {
    return (
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackHeader}>
          <MessageSquare color="#DB2777" size={20} />
          <Text style={styles.feedbackTitle}>Recent Feedback</Text>
        </View>
        <View style={styles.emptyFeedback}>
          <Inbox color="#D1D5DB" size={40} />
          <Text style={styles.emptyFeedbackTitle}>No feedback yet</Text>
          <Text style={styles.emptyFeedbackText}>
            Teacher feedback will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <MessageSquare color="#DB2777" size={20} />
        <Text style={styles.feedbackTitle}>Recent Feedback</Text>
      </View>

      {displayedFeedback.map((fb) => {
        const Icon = getTypeIcon(fb.type);
        const typeColor = getTypeColor(fb.type);
        const isHighlighted = String(fb.id) === String(highlightedId);

        return (
          <Animated.View
            key={fb.id}
            style={{ opacity: isHighlighted ? blinkAnim : 1 }}
          >
            <View
              style={[
                styles.feedbackItem,
                !fb.isRead && styles.feedbackItemUnread,
                isHighlighted && styles.feedbackItemHighlighted,
              ]}
            >
              <View
                style={[
                  styles.feedbackIconBox,
                  { backgroundColor: typeColor.bg },
                ]}
              >
                <Icon color={typeColor.text} size={14} />
              </View>
              <View style={styles.feedbackContent}>
                <View style={styles.feedbackTopRow}>
                  <View>
                    <Text style={styles.feedbackSender}>{fb.senderName}</Text>
                    {fb.subjectName && (
                      <Text style={styles.feedbackSubject}>
                        {fb.subjectName}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.feedbackTime}>{fb.time}</Text>
                </View>
                {fb.title && (
                  <Text style={styles.feedbackItemTitle}>{fb.title}</Text>
                )}
                <Text style={styles.feedbackMessage}>{fb.message}</Text>
                {!fb.isRead && (
                  <TouchableOpacity
                    style={styles.markReadBtn}
                    onPress={() => onMarkRead(fb.id)}
                  >
                    <CheckCircle color="#DB2777" size={12} />
                    <Text style={styles.markReadText}>Mark as read</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        );
      })}

      {feedback.length > 3 && (
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={styles.viewAllText}>
            {showAll ? "Show Less" : `View All (${feedback.length})`}
          </Text>
          {showAll ? (
            <ChevronUp color="#6B7280" size={16} />
          ) : (
            <ChevronDown color="#6B7280" size={16} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// --- Empty State Component ---
const EmptyState = ({ filter }) => {
  const messages = {
    all: {
      title: "No Interventions Yet",
      description:
        "You're doing great! No interventions have been assigned to you.",
      Icon: CheckCircle,
      color: "#10B981",
    },
    active: {
      title: "No Active Interventions",
      description:
        "You have no active interventions at the moment. Keep up the good work!",
      Icon: TrendingUp,
      color: "#3B82F6",
    },
    completed: {
      title: "No Completed Interventions",
      description: "Completed interventions will appear here.",
      Icon: Clock,
      color: "#9CA3AF",
    },
  };

  const msg = messages[filter] || messages.all;
  const { Icon } = msg;

  return (
    <View style={styles.emptyState}>
      <Icon color={msg.color} size={56} />
      <Text style={styles.emptyStateTitle}>{msg.title}</Text>
      <Text style={styles.emptyStateText}>{msg.description}</Text>
    </View>
  );
};

export default InterventionFeedback;

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
    marginBottom: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  refreshBtn: {
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#FCE7F3",
    borderRadius: 24,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  filterTextActive: { color: "#DB2777" },
  filterBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeActive: { backgroundColor: "#FCE7F3" },
  filterBadgeText: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  filterBadgeTextActive: { color: "#DB2777" },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },

  // Intervention Card
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleContainer: { flex: 1 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionText: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: { fontSize: 11, fontWeight: "600" },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#6B7280" },
  deadlineMetaText: { color: "#D97706", fontWeight: "600" },
  deadlineMetaTextOverdue: { color: "#DC2626", fontWeight: "600" },

  notesBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  notesText: { fontSize: 13, color: "#4B5563", lineHeight: 18 },
  deadlineInfoBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  deadlineInfoBoxUpcoming: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  deadlineInfoBoxOverdue: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  deadlineInfoTitle: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  deadlineInfoTitleUpcoming: {
    color: "#B45309",
  },
  deadlineInfoTitleOverdue: {
    color: "#B91C1C",
  },
  deadlineInfoLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
  },

  miniStatsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  miniStat: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  miniStatValue: { fontSize: 16, fontWeight: "700" },
  miniStatLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },

  tasksSection: { marginTop: 4 },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tasksHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  tasksTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  tasksList: { marginBottom: 8 },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  taskText: { fontSize: 13, color: "#4B5563", flex: 1 },
  taskTextCompleted: { textDecorationLine: "line-through", color: "#9CA3AF" },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#DB2777", borderRadius: 4 },
  noTasksText: { fontSize: 13, color: "#9CA3AF", fontStyle: "italic" },
  taskItemContainer: {
    marginBottom: 4,
  },
  taskTextPending: {
    color: "#D97706",
    fontStyle: "italic",
  },
  pendingReviewText: {
    fontSize: 11,
    color: "#F59E0B",
    marginTop: 2,
    fontWeight: "500",
  },
  remoteBadge: {
    fontSize: 11,
    color: "#DB2777",
    fontWeight: "700",
  },
  proofUploadContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  filePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#DB2777",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    backgroundColor: "#FFF1F2",
  },
  filePickerBtnSelected: {
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
    borderStyle: "solid",
  },
  filePickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DB2777",
    flex: 1,
    textAlign: "center",
  },
  filePickerTextSelected: {
    color: "#059669",
  },
  removeFileBtn: {
    marginTop: 8,
    padding: 4,
  },
  removeFileText: {
    fontSize: 12,
    color: "#DC2626",
    textDecorationLine: "underline",
  },
  completionRequestBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FBCFE8",
  },
  completionRequestText: {
    fontSize: 12,
    color: "#9D174D",
    marginBottom: 8,
    lineHeight: 18,
  },
  completionRequestBtn: {
    backgroundColor: "#DB2777",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  completionRequestBtnDisabled: {
    opacity: 0.7,
  },
  completionRequestBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  completionInfoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  completionInfoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 4,
  },
  completionInfoMeta: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 18,
  },
  rejectedInfoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  rejectedInfoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 4,
  },
  rejectedInfoMeta: {
    fontSize: 12,
    color: "#991B1B",
    lineHeight: 18,
  },
  approvedInfoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  approvedInfoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 4,
  },

  // Completion request modal
  completionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completionModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
  },
  completionModalHeader: {
    marginBottom: 10,
  },
  completionModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  completionModalSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#DB2777",
    fontWeight: "600",
  },
  completionModalBodyText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 19,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
  },
  completionNotesInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 10,
    minHeight: 92,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#FFF",
  },
  completionCounter: {
    marginTop: 4,
    textAlign: "right",
    fontSize: 11,
    color: "#9CA3AF",
  },
  completionModalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  completionCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  completionCancelBtnText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  completionSubmitBtn: {
    flex: 1,
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  completionSubmitBtnDisabled: {
    opacity: 0.7,
  },
  completionSubmitBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // Feedback Card
  feedbackCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  feedbackTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  feedbackItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 8,
  },
  feedbackItemUnread: { backgroundColor: "#FDF2F8", borderColor: "#FBCFE8" },
  feedbackItemHighlighted: {
    backgroundColor: "#FDF2F8",
    borderColor: "#DB2777",
    borderWidth: 2,
    shadowColor: "#DB2777",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  feedbackContent: { flex: 1 },
  feedbackTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  feedbackSender: { fontSize: 13, fontWeight: "600", color: "#111827" },
  feedbackSubject: { fontSize: 11, color: "#DB2777" },
  feedbackTime: { fontSize: 11, color: "#9CA3AF" },
  feedbackItemTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  feedbackMessage: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  markReadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  markReadText: { fontSize: 12, color: "#DB2777", fontWeight: "500" },
  emptyFeedback: { alignItems: "center", paddingVertical: 24 },
  emptyFeedbackTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
  },
  emptyFeedbackText: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    gap: 4,
  },
  viewAllText: { fontSize: 13, fontWeight: "500", color: "#6B7280" },

  // Empty State
  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },

  // Tips Card
  tipsCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#DB2777",
    marginTop: 8,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: { fontSize: 16, fontWeight: "600", color: "#FFF" },
  tipsList: { gap: 8 },
  tipItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  tipText: { fontSize: 13, color: "#FDE7F3", flex: 1, lineHeight: 18 },
});
