import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
import { styles } from "@styles/landing";

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

export default LandingIndex;
