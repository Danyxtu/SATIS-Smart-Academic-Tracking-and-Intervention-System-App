import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "@styles/mainMenu";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Mainmenu() {
  const router = useRouter();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const width = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(-width * 0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Fetch student data for the header
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await axios.get("/student/dashboard");
        setStudentData(res.data?.student);
      } catch (err) {
        console.warn("MainMenu: Failed to fetch student data", err);
      }
    };
    fetchStudentData();
  }, []);

  // Get initials from first name and last name
  const getInitials = () => {
    const firstName = studentData?.firstName || "";
    const lastName = studentData?.lastName || "";
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial || "ST";
  };

  // Get grade level display
  const getGradeDisplay = () => {
    const gradeLevel = studentData?.gradeLevel;
    return gradeLevel ? `Grade ${gradeLevel}` : "Student";
  };

  // Get strand/section display
  const getStrandDisplay = () => {
    return studentData?.strand || studentData?.section || "";
  };

  useEffect(() => {
    if (drawerOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -width * 0.8,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [drawerOpen]);

  const handleLogout = async () => {
    setDrawerOpen(false);
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={28} color="#1f2937" />
        </TouchableOpacity>

        <View style={styles.rightSection}>
          <View style={styles.profileSection}>
            {/* Avatar with Initials */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View>
              <Text style={styles.grade}>{getGradeDisplay()}</Text>
              {getStrandDisplay() ? (
                <Text style={styles.stream}>{getStrandDisplay()}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {/* Drawer Modal */}
      <Modal
        visible={drawerOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <Animated.View style={[styles.drawerBackdrop, { opacity }]}>
            <TouchableOpacity
              style={styles.backdropTouchable}
              activeOpacity={1}
              onPress={() => setDrawerOpen(false)}
            />
          </Animated.View>

          {/* Drawer */}
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX }] }]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setDrawerOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerContent}>
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  router.push("/Screens/about");
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#1f2937"
                />
                <Text style={styles.drawerItemText}>Learn More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  router.push("/Screens/profile");
                }}
              >
                <Ionicons name="person-outline" size={24} color="#1f2937" />
                <Text style={styles.drawerItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#dc2626" />
                <Text style={[styles.drawerItemText, { color: "#dc2626" }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

export default Mainmenu;
