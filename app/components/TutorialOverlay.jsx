import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { X, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

/**
 * TutorialOverlay - A reusable component for step-by-step tutorials
 *
 * Props:
 * - visible: boolean - Controls modal visibility
 * - onClose: function - Called when tutorial is closed
 * - steps: array - Array of step objects with { title, description, icon, highlightArea }
 * - title: string - Tutorial title (e.g., "Dashboard Tutorial")
 * - accentColor: string - Primary color for the tutorial theme
 */
const TutorialOverlay = ({
  visible,
  onClose,
  steps = [],
  title = "Tutorial",
  accentColor = "#DB2777",
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setCurrentStep(0);
    });
  };

  if (!visible || steps.length === 0) return null;

  const currentStepData = steps[currentStep] || {
    title: "Step",
    description: "No description available.",
  };
  const IconComponent = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
              borderTopColor: accentColor,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.tutorialTitle, { color: accentColor }]}>
                {title}
              </Text>
              <Text style={styles.stepIndicator}>
                Step {currentStep + 1} of {steps.length}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={22} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: accentColor,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          {/* Step Content */}
          <Animated.View
            style={[styles.content, { transform: [{ translateX: slideAnim }] }]}
          >
            {/* Icon */}
            {IconComponent && (
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${accentColor}15` },
                ]}
              >
                <IconComponent
                  size={36}
                  color={accentColor}
                  strokeWidth={1.5}
                />
              </View>
            )}

            {/* Step Title */}
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>

            {/* Step Description */}
            <Text style={styles.stepDescription}>
              {currentStepData.description}
            </Text>

            {/* Highlight Area Info */}
            {currentStepData.highlightArea && (
              <View
                style={[
                  styles.highlightBadge,
                  { backgroundColor: `${accentColor}15` },
                ]}
              >
                <Text style={[styles.highlightText, { color: accentColor }]}>
                  📍 Location: {currentStepData.highlightArea}
                </Text>
              </View>
            )}

            {/* Tips */}
            {currentStepData.tip && (
              <View style={styles.tipContainer}>
                <Text style={styles.tipLabel}>💡 Tip</Text>
                <Text style={styles.tipText}>{currentStepData.tip}</Text>
              </View>
            )}
          </Animated.View>

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.prevButton,
                currentStep === 0 && styles.navButtonDisabled,
              ]}
              onPress={handlePrevious}
              disabled={currentStep === 0}
              activeOpacity={0.7}
            >
              <ChevronLeft
                size={20}
                color={currentStep === 0 ? "#D1D5DB" : "#6B7280"}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.navButtonText,
                  currentStep === 0 && styles.navButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                { backgroundColor: accentColor },
              ]}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? "Finish" : "Next"}
              </Text>
              {isLastStep ? (
                <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <ChevronRight size={20} color="#FFFFFF" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          {/* Step Dots */}
          <View style={styles.dotsContainer}>
            {steps.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentStep(index)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dot,
                    index === currentStep && [
                      styles.dotActive,
                      { backgroundColor: accentColor },
                    ],
                    index < currentStep && [
                      styles.dotCompleted,
                      { backgroundColor: accentColor },
                    ],
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 4,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 36,
    maxHeight: height * 0.75,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  stepIndicator: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  closeButton: {
    padding: 8,
    marginTop: -4,
    marginRight: -8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  content: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  highlightBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tipContainer: {
    marginTop: 20,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    width: "100%",
  },
  tipLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  prevButton: {
    backgroundColor: "#F3F4F6",
  },
  nextButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  navButtonTextDisabled: {
    color: "#D1D5DB",
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  dotActive: {
    width: 24,
  },
  dotCompleted: {
    opacity: 0.5,
  },
});

export default TutorialOverlay;
