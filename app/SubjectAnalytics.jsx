import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  FileDown,
  Info,
  CheckCircle,
  Clock,
  User,
  Target,
  AlertTriangle,
  Lightbulb,
  X,
  ChevronRight,
  BookOpen,
  Users,
  Zap,
} from "lucide-react-native";
import axios from "axios";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SubjectAnalytics() {
  const router = useRouter();
  const { enrollmentId } = useLocalSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("grades");
  const [showApproachModal, setShowApproachModal] = useState(false);

  // ============================================
  // DYNAMIC INSIGHTS COMPUTATION
  // "For Your Case" - Real-time Performance Analysis
  // ============================================
  const personalizedInsights = useMemo(() => {
    if (!data) return null;

    const { performance, attendance, gradeTrend } = data;
    const gradeBreakdown = performance?.gradeBreakdown || {};

    // =============================================
    // STEP 1: GATHER RAW METRICS FROM API DATA
    // =============================================

    // Current Grade (from actual scores)
    const currentGrade = performance?.overallGrade ?? 0;

    // Attendance metrics
    const attendanceRate = attendance?.rate ?? 100;
    const totalDays = attendance?.totalDays ?? 0;
    const presentDays = attendance?.presentDays ?? 0;
    const absentDays = attendance?.absentDays ?? 0;

    // Task completion metrics
    const writtenWorksItems = gradeBreakdown.writtenWorks?.items || [];
    const performanceTaskItems = gradeBreakdown.performanceTask?.items || [];
    const quarterlyExamItems = gradeBreakdown.quarterlyExam?.items || [];

    const totalCompletedTasks =
      writtenWorksItems.length +
      performanceTaskItems.length +
      quarterlyExamItems.length;
    const estimatedTotalTasks = Math.max(totalCompletedTasks, 15); // Assume ~15 tasks per quarter
    const completionRate =
      estimatedTotalTasks > 0
        ? Math.round((totalCompletedTasks / estimatedTotalTasks) * 100)
        : 0;

    // Category averages
    const writtenWorksAvg =
      gradeBreakdown.writtenWorks?.average ||
      (writtenWorksItems.length > 0
        ? writtenWorksItems.reduce((sum, i) => sum + (i.percentage || 0), 0) /
          writtenWorksItems.length
        : 0);
    const performanceTaskAvg =
      gradeBreakdown.performanceTask?.average ||
      (performanceTaskItems.length > 0
        ? performanceTaskItems.reduce(
            (sum, i) => sum + (i.percentage || 0),
            0
          ) / performanceTaskItems.length
        : 0);
    const quarterlyExamAvg =
      gradeBreakdown.quarterlyExam?.average ||
      (quarterlyExamItems.length > 0
        ? quarterlyExamItems.reduce((sum, i) => sum + (i.percentage || 0), 0) /
          quarterlyExamItems.length
        : 0);

    // =============================================
    // STEP 2: CALCULATE PERFORMANCE LEVEL (DepEd Scale)
    // =============================================
    let performanceLevel = "N/A";
    let performanceLevelColor = "#6B7280";
    if (currentGrade >= 90) {
      performanceLevel = "Outstanding";
      performanceLevelColor = "#10B981";
    } else if (currentGrade >= 85) {
      performanceLevel = "Very Satisfactory";
      performanceLevelColor = "#3B82F6";
    } else if (currentGrade >= 80) {
      performanceLevel = "Satisfactory";
      performanceLevelColor = "#6366F1";
    } else if (currentGrade >= 75) {
      performanceLevel = "Fairly Satisfactory";
      performanceLevelColor = "#F59E0B";
    } else if (currentGrade > 0) {
      performanceLevel = "Did Not Meet Expectations";
      performanceLevelColor = "#EF4444";
    }

    // =============================================
    // STEP 3: CALCULATE SUBJECT STANDING
    // =============================================
    let subjectStanding = "N/A";
    let standingColor = "#6B7280";
    if (currentGrade >= 90) {
      subjectStanding = "Excelling";
      standingColor = "#10B981";
    } else if (currentGrade >= 85) {
      subjectStanding = "Above Average";
      standingColor = "#3B82F6";
    } else if (currentGrade >= 80) {
      subjectStanding = "Average";
      standingColor = "#6366F1";
    } else if (currentGrade >= 75) {
      subjectStanding = "At Risk";
      standingColor = "#F59E0B";
    } else if (currentGrade > 0) {
      subjectStanding = "Critical";
      standingColor = "#EF4444";
    }

    // =============================================
    // STEP 4: RISK ASSESSMENT (Weighted Scoring)
    // =============================================
    /*
     * RISK SCORE FORMULA (0-100 scale):
     * ================================
     * Risk = Grade_Risk(40%) + Attendance_Risk(30%) + Trend_Risk(20%) + Completion_Risk(10%)
     *
     * Grade Risk:
     *   - < 75: +40 points
     *   - 75-79: +20 points
     *   - 80-84: +10 points
     *   - ≥85: 0 points
     *
     * Attendance Risk:
     *   - < 80%: +30 points
     *   - 80-89%: +15 points
     *   - ≥90%: 0 points
     *
     * Trend Risk:
     *   - 2+ consecutive declines: +20 points
     *   - 1 decline: +10 points
     *   - Stable/improving: 0 points
     *
     * Completion Risk:
     *   - < 50% tasks: +10 points
     *   - 50-79%: +5 points
     *   - ≥80%: 0 points
     */

    const riskFactors = [];
    let riskScore = 0;

    // Grade Risk (40% weight)
    let gradeRiskPoints = 0;
    if (currentGrade > 0 && currentGrade < 75) {
      gradeRiskPoints = 40;
      riskFactors.push({ text: "Below passing grade (75%)", severity: "high" });
    } else if (currentGrade >= 75 && currentGrade < 80) {
      gradeRiskPoints = 20;
      riskFactors.push({ text: "Near failing threshold", severity: "medium" });
    } else if (currentGrade >= 80 && currentGrade < 85) {
      gradeRiskPoints = 10;
    }
    riskScore += gradeRiskPoints;

    // Attendance Risk (30% weight)
    let attendanceRiskPoints = 0;
    if (attendanceRate < 80) {
      attendanceRiskPoints = 30;
      riskFactors.push({
        text: `Critical attendance: ${attendanceRate}%`,
        severity: "high",
      });
    } else if (attendanceRate < 90) {
      attendanceRiskPoints = 15;
      riskFactors.push({
        text: `Low attendance: ${attendanceRate}%`,
        severity: "medium",
      });
    }
    riskScore += attendanceRiskPoints;

    // Trend Risk (20% weight)
    let trendRiskPoints = 0;
    let trendDirection = "stable";
    let trendChange = 0;
    if (gradeTrend && gradeTrend.length >= 2) {
      const validTrends = gradeTrend.filter((t) => t.value > 0);
      if (validTrends.length >= 2) {
        const first = validTrends[0].value;
        const last = validTrends[validTrends.length - 1].value;
        trendChange = last - first;

        let decliningCount = 0;
        for (let i = 1; i < validTrends.length; i++) {
          if (validTrends[i].value < validTrends[i - 1].value) decliningCount++;
        }

        if (decliningCount >= 2) {
          trendRiskPoints = 20;
          trendDirection = "declining";
          riskFactors.push({
            text: "Consistent grade decline",
            severity: "medium",
          });
        } else if (decliningCount === 1 && trendChange < 0) {
          trendRiskPoints = 10;
          trendDirection = "slightly declining";
        } else if (trendChange > 0) {
          trendDirection = "improving";
        }
      }
    }
    riskScore += trendRiskPoints;

    // Completion Risk (10% weight)
    let completionRiskPoints = 0;
    if (completionRate < 50) {
      completionRiskPoints = 10;
      riskFactors.push({
        text: `Low task completion: ${completionRate}%`,
        severity: "low",
      });
    } else if (completionRate < 80) {
      completionRiskPoints = 5;
    }
    riskScore += completionRiskPoints;

    // Classify Risk Level
    let riskLevel = "Low";
    let riskColor = "#10B981";
    if (riskScore >= 50) {
      riskLevel = "High";
      riskColor = "#EF4444";
    } else if (riskScore >= 25) {
      riskLevel = "Moderate";
      riskColor = "#F59E0B";
    }

    // =============================================
    // STEP 5: EXPECTED GRADE CALCULATION
    // =============================================
    /*
     * EXPECTED GRADE FORMULA:
     * =======================
     * Expected = Current + Attendance_Adj + Trend_Adj + Completion_Adj + Improvement_Potential
     *
     * FORMULA BREAKDOWN:
     *
     * 1. BASE: Current Grade
     *    - Starting point is the student's actual current grade
     *
     * 2. ATTENDANCE ADJUSTMENT:
     *    - If attendance ≥ 90%: +1 point (good standing)
     *    - If attendance 80-89%: 0 points (neutral)
     *    - If attendance < 80%: -(90 - attendance) × 0.3 (penalty)
     *    - Formula: Students with >90% attendance typically perform 3-5% better
     *
     * 3. TREND ADJUSTMENT:
     *    - Improving trend: +trendChange × 0.4 (momentum bonus)
     *    - Declining trend: trendChange × 0.3 (projected decline)
     *    - Formula: Recent trajectory indicates future performance
     *
     * 4. COMPLETION ADJUSTMENT:
     *    - If completion ≥ 80%: +1 point (engaged student)
     *    - If completion 60-79%: 0 points
     *    - If completion < 60%: -2 points (missing opportunities)
     *
     * 5. IMPROVEMENT POTENTIAL:
     *    - Based on gap between current grade and category performance
     *    - If weakest category is 10+ points below average: +2 (room to grow)
     *    - Formula: Students who improve weak areas see 2-4% overall gain
     *
     * FINAL: Clamp result between 60 and 100
     */

    const gradeExplanation = [];
    let expectedGrade = currentGrade > 0 ? currentGrade : 75;

    // Base Grade
    gradeExplanation.push({
      label: "Base (Current Grade)",
      value: currentGrade || 75,
      impact: 0,
      formula: "Starting point from actual scores",
    });

    // Attendance Adjustment
    let attendanceAdj = 0;
    let attendanceReason = "";
    if (attendanceRate >= 90) {
      attendanceAdj = 1;
      attendanceReason = `${attendanceRate}% attendance (≥90% bonus)`;
    } else if (attendanceRate >= 80) {
      attendanceAdj = 0;
      attendanceReason = `${attendanceRate}% attendance (neutral range)`;
    } else {
      attendanceAdj = -Math.round((90 - attendanceRate) * 0.3);
      attendanceReason = `${attendanceRate}% attendance (below 80% penalty)`;
    }
    expectedGrade += attendanceAdj;
    gradeExplanation.push({
      label: "Attendance Effect",
      value: attendanceRate,
      impact: attendanceAdj,
      formula:
        attendanceAdj >= 0
          ? "≥90%: +1 | 80-89%: 0"
          : "(90 - rate) × 0.3 penalty",
    });

    // Trend Adjustment
    let trendAdj = 0;
    let trendReason = "";
    if (trendDirection === "improving" && trendChange > 0) {
      trendAdj = Math.min(3, Math.round(trendChange * 0.4));
      trendReason = `Improving +${Math.round(trendChange)}% (momentum)`;
    } else if (
      trendDirection === "declining" ||
      trendDirection === "slightly declining"
    ) {
      trendAdj = Math.max(-3, Math.round(trendChange * 0.3));
      trendReason = `Declining ${Math.round(trendChange)}% (projected)`;
    } else {
      trendReason = "Stable performance";
    }
    expectedGrade += trendAdj;
    gradeExplanation.push({
      label: "Trend Projection",
      value: trendDirection,
      impact: trendAdj,
      formula: "Improving: +change×0.4 | Declining: change×0.3",
    });

    // Completion Adjustment
    let completionAdj = 0;
    if (completionRate >= 80) {
      completionAdj = 1;
    } else if (completionRate < 60) {
      completionAdj = -2;
    }
    expectedGrade += completionAdj;
    gradeExplanation.push({
      label: "Task Completion",
      value: `${completionRate}%`,
      impact: completionAdj,
      formula: "≥80%: +1 | <60%: -2",
    });

    // Improvement Potential (from weak categories)
    let improvementAdj = 0;
    const categoryScores = {
      writtenWorksAvg,
      performanceTaskAvg,
      quarterlyExamAvg,
    };
    const validCategoryScores = Object.values(categoryScores).filter(
      (s) => s > 0
    );
    const avgCategoryScore =
      validCategoryScores.length > 0
        ? validCategoryScores.reduce((a, b) => a + b, 0) /
          validCategoryScores.length
        : 0;

    let weakestCategory = null;
    let weakestScore = 100;
    if (writtenWorksAvg > 0 && writtenWorksAvg < weakestScore) {
      weakestScore = writtenWorksAvg;
      weakestCategory = "writtenWorks";
    }
    if (performanceTaskAvg > 0 && performanceTaskAvg < weakestScore) {
      weakestScore = performanceTaskAvg;
      weakestCategory = "performanceTask";
    }
    if (quarterlyExamAvg > 0 && quarterlyExamAvg < weakestScore) {
      weakestScore = quarterlyExamAvg;
      weakestCategory = "quarterlyExam";
    }

    if (weakestCategory && avgCategoryScore - weakestScore >= 10) {
      improvementAdj = 2;
      gradeExplanation.push({
        label: "Improvement Potential",
        value: `Gap: ${Math.round(avgCategoryScore - weakestScore)}pts`,
        impact: improvementAdj,
        formula: "Weak category 10+ below avg: +2 potential",
      });
      expectedGrade += improvementAdj;
    }

    // Clamp and round
    expectedGrade = Math.max(60, Math.min(100, Math.round(expectedGrade)));

    // =============================================
    // STEP 6: GAP ANALYSIS
    // =============================================
    const gapTo90 = currentGrade > 0 ? Math.max(0, 90 - currentGrade) : null;
    const gapTo85 = currentGrade > 0 ? Math.max(0, 85 - currentGrade) : null;
    const gapTo75 = currentGrade > 0 ? Math.max(0, 75 - currentGrade) : null;

    // Gap from expected to target (85)
    const expectedTo85Gap = Math.max(0, 85 - expectedGrade);

    return {
      // Raw metrics
      currentGrade,
      attendanceRate,
      completionRate,
      totalCompletedTasks,
      estimatedTotalTasks,
      absentDays,
      presentDays,
      totalDays,

      // Category scores
      writtenWorksAvg: Math.round(writtenWorksAvg),
      performanceTaskAvg: Math.round(performanceTaskAvg),
      quarterlyExamAvg: Math.round(quarterlyExamAvg),
      weakestCategory,
      weakestScore: Math.round(weakestScore),

      // Computed metrics
      performanceLevel,
      performanceLevelColor,
      subjectStanding,
      standingColor,

      // Risk assessment
      riskLevel,
      riskColor,
      riskScore,
      riskFactors,
      gradeRiskPoints,
      attendanceRiskPoints,
      trendRiskPoints,
      completionRiskPoints,

      // Trend analysis
      trendDirection,
      trendChange: Math.round(trendChange),

      // Expected grade calculation
      expectedGrade,
      gradeExplanation,

      // Gap analysis
      gapTo90,
      gapTo85,
      gapTo75,
      expectedTo85Gap,

      // Category data
      categoryScores: {
        writtenWorks: Math.round(writtenWorksAvg),
        performanceTask: Math.round(performanceTaskAvg),
        quarterlyExam: Math.round(quarterlyExamAvg),
      },
      totalItems: totalCompletedTasks,
    };
  }, [data]);

  // ============================================
  // SYSTEM-GENERATED IMPROVEMENT PLAN
  // How to go from Expected Grade → 85 (Very Satisfactory)
  // ============================================
  const improvementPlan = useMemo(() => {
    if (!personalizedInsights) return null;

    const {
      currentGrade,
      expectedGrade,
      attendanceRate,
      completionRate,
      weakestCategory,
      weakestScore,
      categoryScores,
      trendDirection,
      riskFactors,
      absentDays,
      totalDays,
    } = personalizedInsights;

    const targetGrade = 85; // Very Satisfactory
    const gapToTarget = Math.max(0, targetGrade - expectedGrade);

    if (gapToTarget === 0) {
      return {
        targetGrade,
        gapToTarget: 0,
        isAlreadyMet: true,
        steps: [],
        conclusion: {
          currentGrade,
          expectedGrade,
          projectedGrade: expectedGrade,
          message:
            "You're already on track to achieve Very Satisfactory level!",
        },
      };
    }

    const steps = [];
    let projectedGradeGain = 0;

    // =============================================
    // IMPROVEMENT STEP 1: ATTENDANCE TARGET
    // =============================================
    /*
     * ATTENDANCE IMPROVEMENT FORMULA:
     * ================================
     * If current < 90%:
     *   Required attendance = min(95%, current + 10%)
     *   Grade impact = (target - current) × 0.5
     *
     * Example:
     *   Current: 85% → Target: 95%
     *   Impact: (95 - 85) × 0.5 = +5 points potential
     */
    if (attendanceRate < 95) {
      const targetAttendance = Math.min(95, attendanceRate + 10);
      const attendanceGain = Math.round(
        (targetAttendance - attendanceRate) * 0.5
      );
      const remainingDays = Math.max(0, 20 - totalDays); // Assume ~20 class days remaining
      const requiredPresentDays =
        Math.ceil((targetAttendance / 100) * (totalDays + remainingDays)) -
        (totalDays - absentDays);

      projectedGradeGain += Math.min(attendanceGain, 2); // Cap at +2 from attendance

      steps.push({
        icon: Calendar,
        iconBg: "#DBEAFE",
        iconColor: "#2563EB",
        title: "Improve Attendance",
        currentValue: `${attendanceRate}%`,
        targetValue: `${targetAttendance}%`,
        action: `Attend ${
          requiredPresentDays > 0 ? requiredPresentDays : "all"
        } more class sessions without absence`,
        gradeImpact: `+${Math.min(attendanceGain, 2)} points`,
        formula: "Grade Impact = (Target% - Current%) × 0.5",
        details: [
          `Current: ${attendanceRate}% (${
            totalDays - absentDays
          }/${totalDays} days)`,
          `Target: ${targetAttendance}% attendance`,
          `Each 1% increase ≈ 0.5 point grade improvement`,
        ],
      });
    }

    // =============================================
    // IMPROVEMENT STEP 2: TASK COMPLETION
    // =============================================
    /*
     * COMPLETION IMPROVEMENT FORMULA:
     * ================================
     * Missing tasks represent lost grade opportunities
     * Each completed task at 85%+ adds to overall grade
     *
     * Impact = (remaining tasks × avg score) / total tasks weight
     */
    if (completionRate < 90) {
      const targetCompletion = Math.min(100, completionRate + 20);
      const completionGain = targetCompletion >= 90 ? 2 : 1;
      projectedGradeGain += completionGain;

      steps.push({
        icon: CheckCircle,
        iconBg: "#D1FAE5",
        iconColor: "#059669",
        title: "Complete All Remaining Tasks",
        currentValue: `${completionRate}%`,
        targetValue: `${targetCompletion}%`,
        action: "Submit all pending assignments and activities on time",
        gradeImpact: `+${completionGain} points`,
        formula: "Completion ≥90%: +2 | ≥70%: +1",
        details: [
          `Current completion: ${completionRate}%`,
          `Missing tasks = missed grade opportunities`,
          `Aim for 100% submission rate`,
        ],
      });
    }

    // =============================================
    // IMPROVEMENT STEP 3: FOCUS ON WEAK CATEGORY
    // =============================================
    /*
     * CATEGORY IMPROVEMENT FORMULA:
     * ================================
     * DepEd Grading Weight:
     *   Written Works: 25%
     *   Performance Tasks: 50%
     *   Quarterly Exam: 25%
     *
     * Improving weakest category by 10 points:
     *   Impact = improvement × category_weight
     *   Example: WW +10 pts × 0.25 = +2.5 overall
     */
    if (weakestCategory) {
      const categoryNames = {
        writtenWorks: "Written Works",
        performanceTask: "Performance Tasks",
        quarterlyExam: "Quarterly Exam",
      };
      const categoryWeights = {
        writtenWorks: 0.25,
        performanceTask: 0.5,
        quarterlyExam: 0.25,
      };
      const categoryStrategies = {
        writtenWorks: [
          "Review notes 10 minutes daily before class",
          "Practice past quiz questions",
          "Ask teacher for clarification on confusing topics",
        ],
        performanceTask: [
          "Start projects early - avoid last-minute work",
          "Follow rubric requirements exactly",
          "Seek feedback before final submission",
        ],
        quarterlyExam: [
          "Create a 2-week study schedule before exam",
          "Use practice tests and past exams",
          "Focus on frequently tested topics",
        ],
      };

      const targetCategoryScore = Math.min(90, weakestScore + 15);
      const categoryWeight = categoryWeights[weakestCategory];
      const categoryGain = Math.round(
        (targetCategoryScore - weakestScore) * categoryWeight
      );
      projectedGradeGain += Math.min(categoryGain, 3);

      steps.push({
        icon: Target,
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        title: `Improve ${categoryNames[weakestCategory]}`,
        currentValue: `${weakestScore}%`,
        targetValue: `${targetCategoryScore}%`,
        action: `This is your weakest area - focused improvement here yields highest returns`,
        gradeImpact: `+${Math.min(categoryGain, 3)} points`,
        formula: `Impact = (Target - Current) × ${categoryWeight} weight`,
        details: categoryStrategies[weakestCategory],
      });
    }

    // =============================================
    // IMPROVEMENT STEP 4: MAINTAIN UPWARD TREND
    // =============================================
    /*
     * TREND MOMENTUM FORMULA:
     * ================================
     * Consistent improvement creates positive trajectory
     * 3+ consecutive improvements: +1 bonus
     * Each week of improvement: +0.5 trend score
     */
    if (trendDirection !== "improving") {
      projectedGradeGain += 1;

      steps.push({
        icon: TrendingUp,
        iconBg: "#E0E7FF",
        iconColor: "#4F46E5",
        title: "Build Positive Momentum",
        currentValue: trendDirection === "stable" ? "Stable" : "Declining",
        targetValue: "Consistently Improving",
        action: "Score higher than your previous assessment each time",
        gradeImpact: "+1 point",
        formula: "3+ consecutive improvements = +1 trend bonus",
        details: [
          "Track your scores after each activity",
          "Aim to beat your last score by 2-3 points",
          "Consistent small gains compound over time",
        ],
      });
    }

    // =============================================
    // IMPROVEMENT STEP 5: SCORE TARGET ON UPCOMING TASKS
    // =============================================
    /*
     * REQUIRED SCORE FORMULA:
     * ================================
     * To raise grade from Current to Target:
     *
     * Required_Avg = Current + (Target - Expected) × adjustment_factor
     *
     * Where adjustment_factor accounts for:
     *   - Remaining task weight
     *   - Current grade momentum
     *   - Typical score variability
     */
    const remainingTasks = 5; // Estimated remaining graded activities
    const requiredAvgScore = Math.min(95, expectedGrade + gapToTarget * 1.5);

    steps.push({
      icon: Award,
      iconBg: "#FCE7F3",
      iconColor: "#DB2777",
      title: "Target Scores for Upcoming Tasks",
      currentValue: `${currentGrade}% avg`,
      targetValue: `${Math.round(requiredAvgScore)}% avg needed`,
      action: `Score an average of ${Math.round(
        requiredAvgScore
      )}% on your next ${remainingTasks} graded activities`,
      gradeImpact: `+${
        gapToTarget - projectedGradeGain > 0
          ? gapToTarget - projectedGradeGain
          : 1
      } points`,
      formula: `Required = Expected + (Target - Expected) × 1.5`,
      details: [
        `Current average: ${currentGrade}%`,
        `Need: ${Math.round(requiredAvgScore)}% average on remaining tasks`,
        `This closes the gap to ${targetGrade}% (Very Satisfactory)`,
      ],
    });

    // Calculate projected final grade
    const projectedGrade = Math.min(100, expectedGrade + projectedGradeGain);

    // =============================================
    // CONCLUSION SUMMARY
    // =============================================
    const conclusion = {
      currentGrade,
      expectedGrade,
      targetGrade,
      projectedGrade,
      gapClosed: projectedGradeGain,
      remainingGap: Math.max(0, targetGrade - projectedGrade),
      message:
        projectedGrade >= targetGrade
          ? `By following this plan, your expected grade can improve from ${expectedGrade}% to approximately ${projectedGrade}%, reaching Very Satisfactory level!`
          : `This plan can raise your expected grade from ${expectedGrade}% to ${projectedGrade}%. Continue these strategies to reach ${targetGrade}%.`,
    };

    return {
      targetGrade,
      gapToTarget,
      isAlreadyMet: false,
      steps,
      projectedGradeGain,
      conclusion,
    };
  }, [personalizedInsights]);

  // ============================================
  // LEGACY: Keep recommendations for backward compatibility
  // ============================================
  const recommendations = useMemo(() => {
    return improvementPlan?.steps || [];
  }, [improvementPlan]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get(`/student/performance/${enrollmentId}`);
      setData(res.data);
      setError(null);
    } catch (err) {
      console.warn("SubjectAnalytics fetch error", err?.response || err);
      setError(
        err?.response?.data?.message || "Failed to load subject analytics"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (enrollmentId) {
      fetchData();
    }
  }, [enrollmentId]);

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

  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined) return "#6B7280";
    if (grade >= 90) return "#10B981";
    if (grade >= 85) return "#3B82F6";
    if (grade >= 80) return "#6366F1";
    if (grade >= 75) return "#F59E0B";
    return "#EF4444";
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

  const { subject, performance, attendance, gradeTrend } = data || {};
  const quarterlyGrades = performance?.quarterlyGrades || [];
  const gradeBreakdown = performance?.gradeBreakdown || {};

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#111827" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.breadcrumb}>
            Performance Analytics › {subject?.name || "Subject"}
          </Text>
          <Text style={styles.subjectTitle}>{subject?.name || "Subject"}</Text>
          <Text style={styles.teacherText}>
            {subject?.teacher} • {subject?.schoolYear} •{" "}
            {subject?.section || ""}
          </Text>
        </View>
      </View>

      {/* Grade Badge - Top Right Style */}
      <View style={styles.gradeHeaderRow}>
        <TouchableOpacity style={styles.exportBtn}>
          <FileDown color="#DB2777" size={16} />
          <Text style={styles.exportText}>Export PDF</Text>
        </TouchableOpacity>
        <View style={styles.gradeBox}>
          <Text style={styles.gradeBoxLabel}>CURRENT GRADE</Text>
          <View style={styles.gradeBoxRow}>
            <Text
              style={[
                styles.gradeBoxValue,
                { color: getGradeColor(performance?.overallGrade) },
              ]}
            >
              {performance?.overallGrade ?? "--"}
            </Text>
            <Text
              style={[
                styles.gradeBoxRemarks,
                { color: getRemarksColor(performance?.remarks) },
              ]}
            >
              {performance?.remarks || "N/A"}
            </Text>
          </View>
        </View>
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
        {/* Main Content Row: Quarterly Grades + Sidebar */}
        <View style={styles.mainRow}>
          {/* Left: Quarterly Grades */}
          <View style={styles.leftColumn}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Calendar color="#DB2777" size={20} />
                <Text style={styles.cardTitle}>Quarterly Grades</Text>
              </View>
              <View style={styles.quarterGrid}>
                {quarterlyGrades.slice(0, 2).map((q, idx) => {
                  const isQ2NotStarted =
                    q.quarter === 2 && q.grade === null && q.itemCount === 0;

                  if (isQ2NotStarted) {
                    // Q2 Not Started - Simplified placeholder card
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.quarterCard,
                          styles.quarterCardNotStarted,
                        ]}
                      >
                        <View style={styles.quarterHeaderRow}>
                          <View
                            style={[
                              styles.quarterBadge,
                              { backgroundColor: "#E5E7EB" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.quarterBadgeText,
                                { color: "#9CA3AF" },
                              ]}
                            >
                              Q{q.quarter}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.quarterLabel}>{q.label}</Text>
                            <Text
                              style={[
                                styles.quarterRemarks,
                                { color: "#9CA3AF" },
                              ]}
                            >
                              Not Started
                            </Text>
                          </View>
                        </View>

                        <View style={styles.notStartedContent}>
                          <Clock color="#9CA3AF" size={32} />
                          <Text style={styles.notStartedText}>
                            Quarter 2 has not started yet
                          </Text>
                          <Text style={styles.notStartedSubtext}>
                            Grades and predictions will appear once Q2 begins
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  // Normal quarter card (Q1 or Q2 with data)
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.quarterCard,
                        q.grade !== null && styles.quarterCardActive,
                      ]}
                    >
                      <View style={styles.quarterHeaderRow}>
                        <View
                          style={[
                            styles.quarterBadge,
                            {
                              backgroundColor:
                                q.grade !== null ? "#DB2777" : "#E5E7EB",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.quarterBadgeText,
                              { color: q.grade !== null ? "#FFF" : "#9CA3AF" },
                            ]}
                          >
                            Q{q.quarter}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.quarterLabel}>{q.label}</Text>
                          <Text
                            style={[
                              styles.quarterRemarks,
                              { color: getRemarksColor(q.remarks) },
                            ]}
                          >
                            {q.remarks}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.quarterGradeLabel}>
                        CURRENT GRADE
                      </Text>
                      <Text
                        style={[
                          styles.quarterGradeValue,
                          { color: getGradeColor(q.grade) },
                        ]}
                      >
                        {q.grade ?? "--"}
                      </Text>

                      <View style={styles.quarterExpectedRow}>
                        <TrendingUp color="#10B981" size={14} />
                        <Text style={styles.quarterExpectedLabel}>
                          Expected
                        </Text>
                        <Text style={styles.quarterExpectedValue}>
                          {q.expectedGrade}
                        </Text>
                      </View>

                      <View style={styles.quarterFooter}>
                        <View style={styles.quarterFooterItem}>
                          <Text style={styles.quarterFooterValue}>
                            {q.attendance ?? "--"}%
                          </Text>
                          <Text style={styles.quarterFooterLabel}>
                            Attendance
                          </Text>
                        </View>
                        <View style={styles.quarterFooterItem}>
                          <Text style={styles.quarterFooterValue}>
                            {q.itemCount}
                          </Text>
                          <Text style={styles.quarterFooterLabel}>Items</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Expected Grade Explanation Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Info color="#DB2777" size={20} />
                <Text style={styles.cardTitle}>Expected Grade Factors</Text>
              </View>
              <Text style={styles.factorsDescription}>
                Your expected grade is calculated based on these key factors:
              </Text>
              <View style={styles.factorsList}>
                <View style={styles.factorItem}>
                  <View
                    style={[styles.factorIcon, { backgroundColor: "#DBEAFE" }]}
                  >
                    <TrendingUp color="#2563EB" size={16} />
                  </View>
                  <View style={styles.factorContent}>
                    <Text style={styles.factorTitle}>Current Performance</Text>
                    <Text style={styles.factorText}>
                      Your current grade serves as the baseline for predictions
                    </Text>
                  </View>
                </View>
                <View style={styles.factorItem}>
                  <View
                    style={[styles.factorIcon, { backgroundColor: "#D1FAE5" }]}
                  >
                    <Calendar color="#059669" size={16} />
                  </View>
                  <View style={styles.factorContent}>
                    <Text style={styles.factorTitle}>Attendance Rate</Text>
                    <Text style={styles.factorText}>
                      Attendance below 90% may reduce your expected grade by up
                      to 5% per 10% drop
                    </Text>
                  </View>
                </View>
                <View style={styles.factorItem}>
                  <View
                    style={[styles.factorIcon, { backgroundColor: "#FEF3C7" }]}
                  >
                    <Award color="#D97706" size={16} />
                  </View>
                  <View style={styles.factorContent}>
                    <Text style={styles.factorTitle}>Grade Trend</Text>
                    <Text style={styles.factorText}>
                      Improving trends project continued growth; declining
                      trends suggest areas needing attention
                    </Text>
                  </View>
                </View>
                <View style={styles.factorItem}>
                  <View
                    style={[styles.factorIcon, { backgroundColor: "#FCE7F3" }]}
                  >
                    <CheckCircle color="#DB2777" size={16} />
                  </View>
                  <View style={styles.factorContent}>
                    <Text style={styles.factorTitle}>Previous Quarter</Text>
                    <Text style={styles.factorText}>
                      Q1 performance helps predict Q2 expectations based on
                      historical patterns
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* FOR YOUR CASE - Personalized Insights Card */}
            {personalizedInsights && (
              <View style={styles.forYourCaseCard}>
                <View style={styles.cardHeader}>
                  <User color="#DB2777" size={20} />
                  <Text style={styles.cardTitle}>For Your Case</Text>
                </View>

                {/* Grade Summary Row */}
                <View style={styles.gradeSummaryRow}>
                  {/* Current Grade */}
                  <View style={styles.gradeSummaryBox}>
                    <Text style={styles.gradeSummaryLabel}>CURRENT GRADE</Text>
                    <Text
                      style={[
                        styles.gradeSummaryValue,
                        {
                          color: getGradeColor(
                            personalizedInsights.currentGrade
                          ),
                        },
                      ]}
                    >
                      {personalizedInsights.currentGrade || "--"}%
                    </Text>
                    <Text style={styles.gradeSummaryRemarks}>
                      {personalizedInsights.performanceLevel}
                    </Text>
                  </View>

                  {/* Arrow */}
                  <View style={styles.gradeArrowContainer}>
                    <ChevronRight color="#DB2777" size={24} />
                  </View>

                  {/* Expected Grade */}
                  <View style={[styles.gradeSummaryBox, styles.expectedBox]}>
                    <Text style={styles.gradeSummaryLabel}>EXPECTED GRADE</Text>
                    <Text
                      style={[
                        styles.gradeSummaryValue,
                        {
                          color: getGradeColor(
                            personalizedInsights.expectedGrade
                          ),
                        },
                      ]}
                    >
                      {personalizedInsights.expectedGrade}%
                    </Text>
                    <Text style={styles.gradeSummaryRemarks}>
                      Computed Projection
                    </Text>
                  </View>
                </View>

                {/* Why Expected Grade Section */}
                <View style={styles.whyExpectedSection}>
                  <Text style={styles.whyExpectedTitle}>
                    📊 Why is your expected grade{" "}
                    {personalizedInsights.expectedGrade}%?
                  </Text>
                  <Text style={styles.whyExpectedSubtitle}>
                    Your expected grade is calculated using multiple performance
                    factors:
                  </Text>

                  {/* Formula Breakdown */}
                  <View style={styles.formulaBreakdown}>
                    {personalizedInsights.gradeExplanation?.map((item, idx) => (
                      <View key={idx} style={styles.formulaRow}>
                        <View style={styles.formulaLabelRow}>
                          <Text style={styles.formulaLabel}>{item.label}</Text>
                          <Text
                            style={[
                              styles.formulaImpact,
                              {
                                color:
                                  item.impact > 0
                                    ? "#10B981"
                                    : item.impact < 0
                                    ? "#EF4444"
                                    : "#6B7280",
                              },
                            ]}
                          >
                            {item.impact > 0 ? "+" : ""}
                            {item.impact !== 0 ? item.impact : "—"}
                          </Text>
                        </View>
                        <Text style={styles.formulaDetail}>{item.formula}</Text>
                      </View>
                    ))}

                    {/* Final Calculation */}
                    <View style={styles.finalCalculation}>
                      <Text style={styles.finalCalcLabel}>
                        Final Expected Grade
                      </Text>
                      <Text
                        style={[
                          styles.finalCalcValue,
                          {
                            color: getGradeColor(
                              personalizedInsights.expectedGrade
                            ),
                          },
                        ]}
                      >
                        {personalizedInsights.expectedGrade}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Key Metrics Grid */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricBox}>
                    <Calendar color="#2563EB" size={16} />
                    <Text style={styles.metricLabel}>Attendance</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color:
                            personalizedInsights.attendanceRate >= 90
                              ? "#10B981"
                              : personalizedInsights.attendanceRate >= 80
                              ? "#F59E0B"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {personalizedInsights.attendanceRate}%
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <CheckCircle color="#059669" size={16} />
                    <Text style={styles.metricLabel}>Completion</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color:
                            personalizedInsights.completionRate >= 80
                              ? "#10B981"
                              : personalizedInsights.completionRate >= 60
                              ? "#F59E0B"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {personalizedInsights.completionRate}%
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <TrendingUp color="#8B5CF6" size={16} />
                    <Text style={styles.metricLabel}>Trend</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color:
                            personalizedInsights.trendDirection === "improving"
                              ? "#10B981"
                              : personalizedInsights.trendDirection === "stable"
                              ? "#6B7280"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {personalizedInsights.trendDirection === "improving"
                        ? "↑ Up"
                        : personalizedInsights.trendDirection === "declining"
                        ? "↓ Down"
                        : "→ Stable"}
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <AlertTriangle color="#D97706" size={16} />
                    <Text style={styles.metricLabel}>Risk</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: personalizedInsights.riskColor },
                      ]}
                    >
                      {personalizedInsights.riskLevel}
                    </Text>
                  </View>
                </View>

                {/* Category Scores */}
                {personalizedInsights.weakestCategory && (
                  <View style={styles.categorySection}>
                    <Text style={styles.categorySectionTitle}>
                      Category Performance:
                    </Text>
                    <View style={styles.categoryRow}>
                      <View style={styles.categoryItem}>
                        <Text style={styles.categoryName}>Written Works</Text>
                        <Text
                          style={[
                            styles.categoryScore,
                            {
                              color: getGradeColor(
                                personalizedInsights.writtenWorksAvg
                              ),
                            },
                          ]}
                        >
                          {personalizedInsights.writtenWorksAvg || "--"}%
                        </Text>
                      </View>
                      <View style={styles.categoryItem}>
                        <Text style={styles.categoryName}>Performance</Text>
                        <Text
                          style={[
                            styles.categoryScore,
                            {
                              color: getGradeColor(
                                personalizedInsights.performanceTaskAvg
                              ),
                            },
                          ]}
                        >
                          {personalizedInsights.performanceTaskAvg || "--"}%
                        </Text>
                      </View>
                      <View style={styles.categoryItem}>
                        <Text style={styles.categoryName}>Exam</Text>
                        <Text
                          style={[
                            styles.categoryScore,
                            {
                              color: getGradeColor(
                                personalizedInsights.quarterlyExamAvg
                              ),
                            },
                          ]}
                        >
                          {personalizedInsights.quarterlyExamAvg || "--"}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.weakestIndicator}>
                      <AlertCircle color="#D97706" size={14} />
                      <Text style={styles.weakestText}>
                        Weakest:{" "}
                        {personalizedInsights.weakestCategory === "writtenWorks"
                          ? "Written Works"
                          : personalizedInsights.weakestCategory ===
                            "performanceTask"
                          ? "Performance Tasks"
                          : "Quarterly Exam"}{" "}
                        ({personalizedInsights.weakestScore}%)
                      </Text>
                    </View>
                  </View>
                )}

                {/* Risk Factors (if any) */}
                {personalizedInsights.riskFactors.length > 0 && (
                  <View style={styles.riskFactorsSection}>
                    <Text style={styles.riskFactorsTitle}>
                      ⚠️ Risk Indicators:
                    </Text>
                    {personalizedInsights.riskFactors.map((risk, idx) => (
                      <View key={idx} style={styles.riskFactorItem}>
                        <View
                          style={[
                            styles.riskDot,
                            {
                              backgroundColor:
                                risk.severity === "high"
                                  ? "#EF4444"
                                  : risk.severity === "medium"
                                  ? "#F59E0B"
                                  : "#6B7280",
                            },
                          ]}
                        />
                        <Text style={styles.riskFactorText}>{risk.text}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Gap to Target */}
                {personalizedInsights.expectedTo85Gap > 0 && (
                  <View style={styles.gapToTargetSection}>
                    <Text style={styles.gapToTargetTitle}>
                      🎯 Gap to Very Satisfactory (85%):
                    </Text>
                    <View style={styles.gapToTargetRow}>
                      <View
                        style={[
                          styles.gapBadge,
                          { backgroundColor: "#DBEAFE" },
                        ]}
                      >
                        <Text
                          style={[styles.gapBadgeText, { color: "#2563EB" }]}
                        >
                          +{personalizedInsights.expectedTo85Gap} points needed
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* System-Generated Approach Button */}
                <TouchableOpacity
                  style={styles.approachButton}
                  onPress={() => setShowApproachModal(true)}
                >
                  <Lightbulb color="#FFF" size={18} />
                  <Text style={styles.approachButtonText}>
                    System-Generated Approach
                  </Text>
                  <ChevronRight color="#FFF" size={18} />
                </TouchableOpacity>

                <Text style={styles.approachHint}>
                  Tap to see how to improve from{" "}
                  {personalizedInsights.expectedGrade}% → 85%
                </Text>
              </View>
            )}
          </View>

          {/* Right: Grade Trend + Attendance */}
          <View style={styles.rightColumn}>
            {/* Grade Trend */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <TrendingUp color="#DB2777" size={20} />
                <Text style={styles.cardTitle}>Grade Trend</Text>
              </View>
              <View style={styles.trendChart}>
                <View style={styles.trendYAxis}>
                  <Text style={styles.trendYLabel}>100</Text>
                  <Text style={styles.trendYLabel}>75</Text>
                  <Text style={styles.trendYLabel}>50</Text>
                  <Text style={styles.trendYLabel}>0</Text>
                </View>
                <View style={styles.trendBars}>
                  {(gradeTrend || []).slice(0, 4).map((item, idx) => (
                    <View key={idx} style={styles.trendBarContainer}>
                      <View style={styles.trendBarBg}>
                        <View
                          style={[
                            styles.trendBarFill,
                            { height: `${item.value || 0}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.trendBarLabel}>{item.label}</Text>
                    </View>
                  ))}
                  {(!gradeTrend || gradeTrend.length === 0) && (
                    <Text style={styles.emptyText}>No trend data</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Attendance */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Calendar color="#DB2777" size={20} />
                <Text style={styles.cardTitle}>Attendance</Text>
              </View>
              <View style={styles.attendanceGrid}>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: "#FEF3C7" },
                  ]}
                >
                  <Text style={[styles.attendanceValue, { color: "#D97706" }]}>
                    {attendance?.rate ?? "--"}%
                  </Text>
                  <Text style={styles.attendanceLabel}>Rate</Text>
                </View>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: "#D1FAE5" },
                  ]}
                >
                  <Text style={[styles.attendanceValue, { color: "#059669" }]}>
                    {attendance?.presentDays ?? 0}
                  </Text>
                  <Text style={styles.attendanceLabel}>Present</Text>
                </View>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: "#FEE2E2" },
                  ]}
                >
                  <Text style={[styles.attendanceValue, { color: "#DC2626" }]}>
                    {attendance?.absentDays ?? 0}
                  </Text>
                  <Text style={styles.attendanceLabel}>Absent</Text>
                </View>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: "#FEF9C3" },
                  ]}
                >
                  <Text style={[styles.attendanceValue, { color: "#CA8A04" }]}>
                    {attendance?.lateDays ?? 0}
                  </Text>
                  <Text style={styles.attendanceLabel}>Late</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Grade Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText color="#DB2777" size={20} />
            <Text style={styles.cardTitle}>Grade Breakdown</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {[
              {
                key: "grades",
                label: "Written Works",
                count: gradeBreakdown.writtenWorks?.count || 0,
              },
              {
                key: "performance",
                label: "Performance Task",
                count: gradeBreakdown.performanceTask?.count || 0,
              },
              {
                key: "exam",
                label: "Quarterly Exam",
                count: gradeBreakdown.quarterlyExam?.count || 0,
              },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
                <Text
                  style={[
                    styles.tabCount,
                    activeTab === tab.key && styles.tabCountActive,
                  ]}
                >
                  {tab.count} items
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.gradeList}>
            {activeTab === "grades" &&
              (gradeBreakdown.writtenWorks?.items || []).length > 0 &&
              gradeBreakdown.writtenWorks.items.map((item) => (
                <View key={item.id} style={styles.gradeItem}>
                  <View style={styles.gradeItemLeft}>
                    <Text style={styles.gradeItemName}>{item.name}</Text>
                    <Text style={styles.gradeItemDate}>
                      {item.date} • Q{item.quarter}
                    </Text>
                  </View>
                  <View style={styles.gradeItemRight}>
                    <Text style={styles.gradeItemScore}>
                      {item.score}/{item.totalScore}
                    </Text>
                    <Text
                      style={[
                        styles.gradeItemPercent,
                        { color: getGradeColor(item.percentage) },
                      ]}
                    >
                      {item.percentage}%
                    </Text>
                  </View>
                </View>
              ))}

            {activeTab === "performance" &&
              (gradeBreakdown.performanceTask?.items || []).length > 0 &&
              gradeBreakdown.performanceTask.items.map((item) => (
                <View key={item.id} style={styles.gradeItem}>
                  <View style={styles.gradeItemLeft}>
                    <Text style={styles.gradeItemName}>{item.name}</Text>
                    <Text style={styles.gradeItemDate}>
                      {item.date} • Q{item.quarter}
                    </Text>
                  </View>
                  <View style={styles.gradeItemRight}>
                    <Text style={styles.gradeItemScore}>
                      {item.score}/{item.totalScore}
                    </Text>
                    <Text
                      style={[
                        styles.gradeItemPercent,
                        { color: getGradeColor(item.percentage) },
                      ]}
                    >
                      {item.percentage}%
                    </Text>
                  </View>
                </View>
              ))}

            {activeTab === "exam" &&
              (gradeBreakdown.quarterlyExam?.items || []).length > 0 &&
              gradeBreakdown.quarterlyExam.items.map((item) => (
                <View key={item.id} style={styles.gradeItem}>
                  <View style={styles.gradeItemLeft}>
                    <Text style={styles.gradeItemName}>{item.name}</Text>
                    <Text style={styles.gradeItemDate}>
                      {item.date} • Q{item.quarter}
                    </Text>
                  </View>
                  <View style={styles.gradeItemRight}>
                    <Text style={styles.gradeItemScore}>
                      {item.score}/{item.totalScore}
                    </Text>
                    <Text
                      style={[
                        styles.gradeItemPercent,
                        { color: getGradeColor(item.percentage) },
                      ]}
                    >
                      {item.percentage}%
                    </Text>
                  </View>
                </View>
              ))}

            {/* Empty states */}
            {activeTab === "grades" &&
              (gradeBreakdown.writtenWorks?.items || []).length === 0 && (
                <View style={styles.emptyState}>
                  <FileText color="#9CA3AF" size={32} />
                  <Text style={styles.emptyStateText}>
                    No written works yet.
                  </Text>
                </View>
              )}
            {activeTab === "performance" &&
              (gradeBreakdown.performanceTask?.items || []).length === 0 && (
                <View style={styles.emptyState}>
                  <Award color="#9CA3AF" size={32} />
                  <Text style={styles.emptyStateText}>
                    No performance tasks yet.
                  </Text>
                </View>
              )}
            {activeTab === "exam" &&
              (gradeBreakdown.quarterlyExam?.items || []).length === 0 && (
                <View style={styles.emptyState}>
                  <AlertCircle color="#9CA3AF" size={32} />
                  <Text style={styles.emptyStateText}>
                    Quarterly exam has not been started yet.
                  </Text>
                </View>
              )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* System-Generated Approach Modal */}
      <Modal
        visible={showApproachModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApproachModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Lightbulb color="#DB2777" size={24} />
                <Text style={styles.modalTitle}>System-Generated Approach</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowApproachModal(false)}
              >
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Goal Summary */}
              <View style={styles.goalSummaryCard}>
                <Text style={styles.goalSummaryTitle}>
                  🎯 Improvement Goal: Reach Very Satisfactory (85%)
                </Text>
                <View style={styles.goalProgressRow}>
                  <View style={styles.goalGradeBox}>
                    <Text style={styles.goalGradeLabel}>Current</Text>
                    <Text
                      style={[
                        styles.goalGradeValue,
                        {
                          color: getGradeColor(
                            personalizedInsights?.currentGrade
                          ),
                        },
                      ]}
                    >
                      {personalizedInsights?.currentGrade || "--"}%
                    </Text>
                  </View>
                  <View style={styles.goalArrow}>
                    <ChevronRight color="#DB2777" size={20} />
                  </View>
                  <View style={styles.goalGradeBox}>
                    <Text style={styles.goalGradeLabel}>Expected</Text>
                    <Text
                      style={[
                        styles.goalGradeValue,
                        {
                          color: getGradeColor(
                            personalizedInsights?.expectedGrade
                          ),
                        },
                      ]}
                    >
                      {personalizedInsights?.expectedGrade || "--"}%
                    </Text>
                  </View>
                  <View style={styles.goalArrow}>
                    <ChevronRight color="#DB2777" size={20} />
                  </View>
                  <View style={[styles.goalGradeBox, styles.goalTargetBox]}>
                    <Text style={styles.goalGradeLabel}>Target</Text>
                    <Text style={[styles.goalGradeValue, { color: "#3B82F6" }]}>
                      85%
                    </Text>
                  </View>
                </View>
                <Text style={styles.goalGapText}>
                  Gap to close: {improvementPlan?.gapToTarget || 0} points
                </Text>
              </View>

              {/* Already Met Goal */}
              {improvementPlan?.isAlreadyMet && (
                <View style={styles.goalMetCard}>
                  <CheckCircle color="#10B981" size={48} />
                  <Text style={styles.goalMetTitle}>Excellent Progress!</Text>
                  <Text style={styles.goalMetText}>
                    You're already on track to achieve Very Satisfactory level.
                    Keep up the great work!
                  </Text>
                </View>
              )}

              {/* Improvement Steps */}
              {!improvementPlan?.isAlreadyMet &&
                improvementPlan?.steps?.map((step, idx) => {
                  const IconComponent = step.icon;
                  return (
                    <View key={idx} style={styles.improvementStepCard}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepNumberBadge}>
                          <Text style={styles.stepNumber}>{idx + 1}</Text>
                        </View>
                        <View
                          style={[
                            styles.stepIconBox,
                            { backgroundColor: step.iconBg },
                          ]}
                        >
                          <IconComponent color={step.iconColor} size={20} />
                        </View>
                        <View style={styles.stepTitleSection}>
                          <Text style={styles.stepTitle}>{step.title}</Text>
                          <View style={styles.stepCurrentTarget}>
                            <Text style={styles.stepCurrent}>
                              {step.currentValue}
                            </Text>
                            <ChevronRight color="#9CA3AF" size={14} />
                            <Text style={styles.stepTarget}>
                              {step.targetValue}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.stepAction}>{step.action}</Text>

                      {/* Step Details */}
                      <View style={styles.stepDetailsBox}>
                        {step.details?.map((detail, dIdx) => (
                          <View key={dIdx} style={styles.stepDetailRow}>
                            <Text style={styles.stepDetailBullet}>•</Text>
                            <Text style={styles.stepDetailText}>{detail}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Impact & Formula */}
                      <View style={styles.stepImpactRow}>
                        <View style={styles.stepImpactBadge}>
                          <TrendingUp color="#10B981" size={14} />
                          <Text style={styles.stepImpactText}>
                            {step.gradeImpact}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.stepFormulaBox}>
                        <Text style={styles.stepFormulaLabel}>Formula:</Text>
                        <Text style={styles.stepFormulaText}>
                          {step.formula}
                        </Text>
                      </View>
                    </View>
                  );
                })}

              {/* Conclusion Summary */}
              {improvementPlan?.conclusion &&
                !improvementPlan?.isAlreadyMet && (
                  <View style={styles.conclusionCard}>
                    <Text style={styles.conclusionTitle}>
                      📋 Summary & Projection
                    </Text>

                    <View style={styles.conclusionGrades}>
                      <View style={styles.conclusionGradeItem}>
                        <Text style={styles.conclusionGradeLabel}>
                          Current Grade
                        </Text>
                        <Text
                          style={[
                            styles.conclusionGradeValue,
                            {
                              color: getGradeColor(
                                improvementPlan.conclusion.currentGrade
                              ),
                            },
                          ]}
                        >
                          {improvementPlan.conclusion.currentGrade}%
                        </Text>
                      </View>
                      <View style={styles.conclusionGradeItem}>
                        <Text style={styles.conclusionGradeLabel}>
                          Expected Grade
                        </Text>
                        <Text
                          style={[
                            styles.conclusionGradeValue,
                            {
                              color: getGradeColor(
                                improvementPlan.conclusion.expectedGrade
                              ),
                            },
                          ]}
                        >
                          {improvementPlan.conclusion.expectedGrade}%
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.conclusionGradeItem,
                          styles.conclusionProjected,
                        ]}
                      >
                        <Text style={styles.conclusionGradeLabel}>
                          Projected
                        </Text>
                        <Text
                          style={[
                            styles.conclusionGradeValue,
                            { color: "#10B981" },
                          ]}
                        >
                          ~{improvementPlan.conclusion.projectedGrade}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.conclusionMessageBox}>
                      <Text style={styles.conclusionMessage}>
                        {improvementPlan.conclusion.message}
                      </Text>
                    </View>

                    {improvementPlan.conclusion.projectedGrade >= 85 && (
                      <View style={styles.successBadge}>
                        <Award color="#10B981" size={16} />
                        <Text style={styles.successBadgeText}>
                          On track to reach Very Satisfactory!
                        </Text>
                      </View>
                    )}
                  </View>
                )}

              {/* Formula Reference */}
              <View style={styles.formulaReference}>
                <Text style={styles.formulaRefTitle}>
                  📊 Calculation Methodology
                </Text>
                <View style={styles.formulaRefItem}>
                  <Text style={styles.formulaRefLabel}>Expected Grade:</Text>
                  <Text style={styles.formulaRefFormula}>
                    Base + Attendance Adj + Trend Adj + Completion Adj +
                    Improvement Potential
                  </Text>
                </View>
                <View style={styles.formulaRefItem}>
                  <Text style={styles.formulaRefLabel}>Attendance Impact:</Text>
                  <Text style={styles.formulaRefFormula}>
                    ≥90%: +1 | 80-89%: 0 | {"<"}80%: -(90-rate)×0.3
                  </Text>
                </View>
                <View style={styles.formulaRefItem}>
                  <Text style={styles.formulaRefLabel}>
                    Category Weight (DepEd):
                  </Text>
                  <Text style={styles.formulaRefFormula}>
                    Written: 25% | Performance: 50% | Exam: 25%
                  </Text>
                </View>
                <View style={styles.formulaRefItem}>
                  <Text style={styles.formulaRefLabel}>Risk Score:</Text>
                  <Text style={styles.formulaRefFormula}>
                    Grade(40%) + Attendance(30%) + Trend(20%) + Completion(10%)
                  </Text>
                </View>
              </View>

              <View style={{ height: 30 }} />
            </ScrollView>

            {/* Modal Footer */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowApproachModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FDF2F8" },
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

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#FDF2F8",
  },
  backBtn: { padding: 8, marginRight: 4 },
  headerContent: { flex: 1 },
  breadcrumb: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  subjectTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  teacherText: { fontSize: 12, color: "#6B7280" },

  gradeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DB2777",
  },
  exportText: { color: "#DB2777", fontSize: 12, fontWeight: "600" },
  gradeBox: { alignItems: "flex-end" },
  gradeBoxLabel: { fontSize: 9, color: "#6B7280", letterSpacing: 0.5 },
  gradeBoxRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  gradeBoxValue: { fontSize: 40, fontWeight: "700" },
  gradeBoxRemarks: { fontSize: 14, fontWeight: "600" },

  scrollView: { flex: 1 },
  scrollContent: { padding: 12 },

  mainRow: { flexDirection: "column" },
  leftColumn: { marginBottom: 0 },
  rightColumn: { flexDirection: "row", gap: 8, marginBottom: 8 },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },

  quarterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quarterCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quarterCardActive: { backgroundColor: "#FFF", borderColor: "#FBCFE8" },
  quarterHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  quarterBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  quarterBadgeText: { fontSize: 11, fontWeight: "700" },
  quarterLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  quarterRemarks: { fontSize: 11, fontWeight: "500" },
  quarterGradeLabel: {
    fontSize: 9,
    color: "#6B7280",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  quarterGradeValue: { fontSize: 32, fontWeight: "700" },
  quarterExpectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  quarterExpectedLabel: { fontSize: 11, color: "#6B7280" },
  quarterExpectedValue: { fontSize: 13, fontWeight: "600", color: "#10B981" },
  quarterFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 8,
  },
  quarterFooterItem: { alignItems: "center" },
  quarterFooterValue: { fontSize: 13, fontWeight: "600", color: "#374151" },
  quarterFooterLabel: { fontSize: 10, color: "#6B7280" },

  trendChart: { flexDirection: "row", height: 100 },
  trendYAxis: {
    justifyContent: "space-between",
    paddingRight: 4,
    paddingVertical: 4,
  },
  trendYLabel: { fontSize: 9, color: "#9CA3AF" },
  trendBars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingBottom: 16,
  },
  trendBarContainer: { alignItems: "center" },
  trendBarBg: {
    width: 24,
    height: 70,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  trendBarFill: { width: "100%", backgroundColor: "#DB2777", borderRadius: 4 },
  trendBarLabel: { fontSize: 10, color: "#6B7280", marginTop: 4 },
  emptyText: { color: "#9CA3AF", fontSize: 12, textAlign: "center", flex: 1 },

  attendanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  attendanceItem: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  attendanceValue: { fontSize: 22, fontWeight: "700" },
  attendanceLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#DB2777" },
  tabText: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#DB2777" },
  tabCount: { fontSize: 9, color: "#9CA3AF", marginTop: 2 },
  tabCountActive: { color: "#DB2777" },

  gradeList: {},
  gradeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  gradeItemLeft: { flex: 1 },
  gradeItemName: { fontSize: 13, fontWeight: "600", color: "#111827" },
  gradeItemDate: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  gradeItemRight: { alignItems: "flex-end" },
  gradeItemScore: { fontSize: 13, fontWeight: "600", color: "#374151" },
  gradeItemPercent: { fontSize: 11, fontWeight: "500" },

  emptyState: { alignItems: "center", paddingVertical: 24 },
  emptyStateText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },

  // Not Started Quarter Card
  quarterCardNotStarted: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  notStartedContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  notStartedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
  },
  notStartedSubtext: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },

  // Expected Grade Factors Card
  factorsDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 18,
  },
  factorsList: {
    gap: 12,
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  factorIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  factorContent: {
    flex: 1,
  },
  factorTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  factorText: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },

  // For Your Case Card
  forYourCaseCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#FBCFE8",
  },
  expectedGradeSection: {
    backgroundColor: "#FDF2F8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  expectedGradeMain: {
    alignItems: "center",
    marginBottom: 12,
  },
  expectedGradeLabel: {
    fontSize: 10,
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  expectedGradeValue: {
    fontSize: 42,
    fontWeight: "800",
  },
  expectedGradeFormula: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },
  adjustmentsList: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  adjustmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  adjustmentFactor: {
    fontSize: 11,
    color: "#6B7280",
  },
  adjustmentImpact: {
    fontSize: 12,
    fontWeight: "700",
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  insightBox: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  insightIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  riskFactorsSection: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  riskFactorsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 8,
  },
  riskFactorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskFactorText: {
    fontSize: 11,
    color: "#7F1D1D",
  },
  gapAnalysisSection: {
    marginBottom: 14,
  },
  gapAnalysisTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  gapRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  gapBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  gapBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  approachButton: {
    backgroundColor: "#DB2777",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  approachButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 16,
    maxHeight: 500,
  },
  approachSummary: {
    backgroundColor: "#FDF2F8",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  approachSummaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  approachSummaryText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
  recommendationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  recIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  recTitleSection: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  recPriorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  recPriorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  recDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 10,
  },
  recActionBox: {
    backgroundColor: "#FCE7F3",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },
  recActionText: {
    flex: 1,
    fontSize: 12,
    color: "#9D174D",
    lineHeight: 17,
  },
  recImpactBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  recImpactLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  recImpactValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
  recFormulaBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    padding: 8,
  },
  recFormulaLabel: {
    fontSize: 9,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  recFormulaValue: {
    fontSize: 10,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  noRecommendations: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noRecTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 12,
  },
  noRecText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },
  formulaReference: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  formulaRefTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 10,
  },
  formulaRefItem: {
    marginBottom: 8,
  },
  formulaRefLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803D",
    marginBottom: 2,
  },
  formulaRefFormula: {
    fontSize: 10,
    color: "#166534",
    fontFamily: "monospace",
    backgroundColor: "#DCFCE7",
    padding: 6,
    borderRadius: 4,
  },
  modalCloseButton: {
    backgroundColor: "#DB2777",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // New For Your Case Styles
  gradeSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FDF2F8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  gradeSummaryBox: {
    flex: 1,
    alignItems: "center",
  },
  expectedBox: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 10,
  },
  gradeSummaryLabel: {
    fontSize: 9,
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gradeSummaryValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  gradeSummaryRemarks: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  gradeArrowContainer: {
    paddingHorizontal: 8,
  },
  whyExpectedSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  whyExpectedTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  whyExpectedSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 12,
  },
  formulaBreakdown: {
    gap: 10,
  },
  formulaRow: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#DB2777",
  },
  formulaLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  formulaLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  formulaImpact: {
    fontSize: 13,
    fontWeight: "700",
  },
  formulaDetail: {
    fontSize: 10,
    color: "#6B7280",
    fontStyle: "italic",
  },
  finalCalculation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#DB2777",
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
  },
  finalCalcLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  finalCalcValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontSize: 9,
    color: "#6B7280",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  categorySection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  categorySectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryItem: {
    flex: 1,
    alignItems: "center",
  },
  categoryName: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 4,
  },
  categoryScore: {
    fontSize: 16,
    fontWeight: "700",
  },
  weakestIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 6,
  },
  weakestText: {
    fontSize: 11,
    color: "#92400E",
  },
  gapToTargetSection: {
    marginBottom: 14,
  },
  gapToTargetTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  gapToTargetRow: {
    flexDirection: "row",
  },
  approachHint: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },

  // Modal Improvement Plan Styles
  goalSummaryCard: {
    backgroundColor: "#FDF2F8",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  goalSummaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  goalProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  goalGradeBox: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  goalTargetBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    paddingVertical: 8,
  },
  goalGradeLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  goalGradeValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  goalArrow: {
    paddingHorizontal: 4,
  },
  goalGapText: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
  },
  goalMetCard: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  goalMetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
    marginTop: 12,
  },
  goalMetText: {
    fontSize: 13,
    color: "#047857",
    textAlign: "center",
    marginTop: 8,
  },
  improvementStepCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#DB2777",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTitleSection: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  stepCurrentTarget: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepCurrent: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
  },
  stepTarget: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  stepAction: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 10,
  },
  stepDetailsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  stepDetailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  stepDetailBullet: {
    fontSize: 10,
    color: "#6B7280",
  },
  stepDetailText: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
  stepImpactRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stepImpactBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  stepImpactText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  stepFormulaBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepFormulaLabel: {
    fontSize: 9,
    color: "#9CA3AF",
  },
  stepFormulaText: {
    fontSize: 9,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  conclusionCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#86EFAC",
  },
  conclusionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 12,
  },
  conclusionGrades: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  conclusionGradeItem: {
    alignItems: "center",
  },
  conclusionProjected: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  conclusionGradeLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },
  conclusionGradeValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  conclusionMessageBox: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  conclusionMessage: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 18,
    textAlign: "center",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  successBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
});
