import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PagerView from "react-native-pager-view";
import { useRouter } from "expo-router";
import {
  LayoutDashboard,
  ChevronRight,
  BarChart3,
  CheckCircle,
  Siren,
  ShieldQuestion,
  ArrowRight,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────
// Screen 1 Component
// ─────────────────────────────────────────────────────────────
const Screen1Content = ({ onNext }) => (
  <View style={styles.screenContainer}>
    <View style={styles.iconWrapper}>
      <View style={[styles.iconCircle, styles.iconCircleBlue]}>
        <LayoutDashboard size={56} color="#007AFF" strokeWidth={1.5} />
      </View>
    </View>

    <Text style={styles.title}>Welcome to SATIS</Text>
    <Text style={[styles.subtitle, { color: "#007AFF" }]}>
      Smart Academic Tracking
    </Text>
    <Text style={styles.description}>
      Your personal academic assistant. Get a clear and complete overview of
      your progress, all in one place.
    </Text>

    <TouchableOpacity
      style={styles.button}
      onPress={onNext}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>Next</Text>
      <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
    </TouchableOpacity>
  </View>
);

// ─────────────────────────────────────────────────────────────
// Screen 2 Component
// ─────────────────────────────────────────────────────────────
const Screen2Content = ({ onNext }) => (
  <View style={styles.screenContainer}>
    <View style={styles.iconRow}>
      <View style={[styles.iconCircle, styles.iconCircleBlue]}>
        <BarChart3 size={44} color="#007AFF" strokeWidth={1.5} />
      </View>
      <View style={[styles.iconCircle, styles.iconCircleGreen]}>
        <CheckCircle size={44} color="#10B981" strokeWidth={1.5} />
      </View>
    </View>

    <Text style={styles.title}>Track Your Success</Text>
    <Text style={[styles.subtitle, { color: "#10B981" }]}>
      Performance & Attendance
    </Text>
    <Text style={styles.description}>
      Stay on top of your studies. Easily monitor your attendance and analyze
      your academic performance in every subject.
    </Text>

    <TouchableOpacity
      style={styles.button}
      onPress={onNext}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>Next</Text>
      <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
    </TouchableOpacity>
  </View>
);

// ─────────────────────────────────────────────────────────────
// Screen 3 Component
// ─────────────────────────────────────────────────────────────
const Screen3Content = ({ onGetStarted }) => (
  <View style={styles.screenContainer}>
    <View style={styles.iconRow}>
      <View style={[styles.iconCircle, styles.iconCircleRed]}>
        <Siren size={44} color="#EF4444" strokeWidth={1.5} />
      </View>
      <View style={[styles.iconCircle, styles.iconCircleYellow]}>
        <ShieldQuestion size={44} color="#F59E0B" strokeWidth={1.5} />
      </View>
    </View>

    <Text style={styles.title}>Get Support & Take Action</Text>
    <Text style={[styles.subtitle, { color: "#EF4444" }]}>
      Intervention Resources
    </Text>
    <Text style={styles.description}>
      Identify subjects where you might need help and easily access intervention
      resources to get back on track.
    </Text>

    <TouchableOpacity
      style={styles.primaryButton}
      onPress={onGetStarted}
      activeOpacity={0.85}
    >
      <Text style={styles.primaryButtonText}>Get Started</Text>
      <ArrowRight size={22} color="#fff" strokeWidth={2.5} />
    </TouchableOpacity>
  </View>
);

// ─────────────────────────────────────────────────────────────
// Main Landing Index
// ─────────────────────────────────────────────────────────────
const LandingIndex = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef(null);
  const router = useRouter();

  const TOTAL_PAGES = 3;

  const onPageSelected = (e) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const goToPage = (index) => {
    if (index >= 0 && index < TOTAL_PAGES) {
      pagerRef.current?.setPage(index);
    }
  };

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        <View key="0" style={styles.page}>
          <Screen1Content onNext={() => goToPage(1)} />
        </View>
        <View key="1" style={styles.page}>
          <Screen2Content onNext={() => goToPage(2)} />
        </View>
        <View key="2" style={styles.page}>
          <Screen3Content onGetStarted={handleGetStarted} />
        </View>
      </PagerView>

      {/* Dynamic pagination dots */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2].map((idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => goToPage(idx)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.dot,
                currentPage === idx ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
    backgroundColor: "#ffffff",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: "#007AFF",
    width: 28,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
  },

  // ─────────────────────────────────────────────────────────────
  // Screen shared styles
  // ─────────────────────────────────────────────────────────────
  screenContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
  },
  iconWrapper: {
    marginBottom: 32,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircleBlue: {
    backgroundColor: "#EBF4FF",
    shadowColor: "#007AFF",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  iconCircleGreen: {
    backgroundColor: "#ECFDF5",
    shadowColor: "#10B981",
  },
  iconCircleRed: {
    backgroundColor: "#FEF2F2",
    shadowColor: "#EF4444",
  },
  iconCircleYellow: {
    backgroundColor: "#FFFBEB",
    shadowColor: "#F59E0B",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: width * 0.85,
    marginBottom: 48,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 160,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 200,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },
});

export default LandingIndex;
