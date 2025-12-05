import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mail, Phone, ArrowLeft, Send } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";

const InterventionDetails = () => {
  const router = useRouter();
  const {
    subject,
    priority,
    status,
    description,
    currentGrade,
    previousGrade,
    missingWork,
    teacher,
    actionPlan,
  } = useLocalSearchParams();

  const getPriorityColor = (priority) => {
    if (priority && priority.includes("Medium")) return "#FF9800";
    if (priority && priority.includes("Low")) return "#4CAF50";
    return "#F44336";
  };

  const getStatusColor = (status) => {
    if (status && status.includes("Critical")) return "#F44336";
    if (status && status.includes("In Progress")) return "#FF9800";
    return "#4CAF50";
  };

  const handleEmailTeacher = () => {
    Linking.openURL(
      `mailto:teacher@example.com?subject=Intervention for ${subject}`
    );
  };

  const handleContactTeacher = () => {
    Linking.openURL(`tel:1234567890`);
  };

  const gradeData = {
    labels: ["Previous", "Current"],
    datasets: [
      {
        data: [
          parseInt(previousGrade ? previousGrade.replace("%", "") : "0"),
          parseInt(currentGrade ? currentGrade.replace("%", "") : "0"),
        ],
      },
    ],
  };

  if (!subject) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Intervention Details</Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>No intervention data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Intervention Details</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{subject}</Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(priority) },
              ]}
            >
              <Text style={styles.priorityText}>{priority}</Text>
            </View>
          </View>

          <Text style={styles.cardDescription}>{description}</Text>

          <View style={styles.gradeContainer}>
            <View style={styles.gradeBox}>
              <Text style={styles.gradePercent}>{currentGrade}</Text>
              <Text style={styles.gradeLabel}>Current Grade</Text>
            </View>
            <View style={styles.gradeBox}>
              <Text style={styles.gradePercent}>{previousGrade}</Text>
              <Text style={styles.gradeLabel}>Previous Grade</Text>
            </View>
            <View style={styles.gradeBox}>
              <Text style={styles.gradePercent}>{missingWork}</Text>
              <Text style={styles.gradeLabel}>Missing Work</Text>
            </View>
          </View>

          <View style={styles.teacherInfo}>
            <Text style={styles.teacherLabel}>Teacher:</Text>
            <Text style={styles.teacherName}>{teacher}</Text>
          </View>

          <View style={styles.actionPlanContainer}>
            <Text style={styles.actionPlanTitle}>Action Plan:</Text>
            {(actionPlan ? actionPlan.split(",") : []).map((item, index) => (
              <Text key={index} style={styles.actionPlanItem}>
                - {item}
              </Text>
            ))}
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Grade Evolution</Text>
          <LineChart
            data={gradeData}
            width={350}
            height={220}
            chartConfig={chartConfig}
            bezier
          />
        </View>

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Teacher's Feedback</Text>
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>
              "The student needs to focus more on the assignments and ask for
              help when needed. I am available for extra help after school."
            </Text>
          </View>
        </View>

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Your Feedback</Text>
          <View style={styles.feedbackInputContainer}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Type your feedback here..."
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <Send size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.emailButton]}
            onPress={handleEmailTeacher}
          >
            <Mail size={24} color="#FF6B9D" />
            <Text style={styles.actionButtonText}>Email Teacher</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.scheduleButton]}
            onPress={handleContactTeacher}
          >
            <Phone size={24} color="#4169E1" />
            <Text style={styles.actionButtonText}>Contact Teacher</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const chartConfig = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 107, 157, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#FF6B9D",
  },
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff7fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  gradeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gradeBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  gradePercent: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gradeLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  teacherLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  teacherName: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  actionPlanContainer: {
    marginBottom: 16,
  },
  actionPlanTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  actionPlanItem: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  feedbackContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  feedbackBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
  },
  feedbackText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  feedbackInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 8,
  },
  feedbackInput: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    padding: 4,
  },
  sendButton: {
    backgroundColor: "#FF6B9D",
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  emailButton: {
    borderWidth: 2,
    borderColor: "#FF6B9D",
  },
  scheduleButton: {
    borderWidth: 2,
    borderColor: "#4169E1",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default InterventionDetails;
