import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Home,
  ClipboardList,
  BarChart3,
  MessageCircle,
  AlertTriangle,
  User,
  Info,
  LogOut,
  X,
  Menu,
} from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import styles from "@styles/mainMenu";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Mainmenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const width = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(-width * 0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Navigation items configuration
  const navigationItems = [
    {
      label: "Dashboard",
      icon: Home,
      route: "/home",
      color: "#DB2777",
    },
    {
      label: "Attendance",
      icon: ClipboardList,
      route: "/attendance",
      color: "#7C3AED",
    },
    {
      label: "Performance",
      icon: BarChart3,
      route: "/performance",
      color: "#2563EB",
    },
    {
      label: "Intervention",
      icon: MessageCircle,
      route: "/intervention",
      color: "#059669",
    },
    {
      label: "Subjects at Risk",
      icon: AlertTriangle,
      route: "/subject",
      color: "#DC2626",
    },
  ];

  const secondaryItems = [
    {
      label: "Profile",
      icon: User,
      route: "/Screens/profile",
      color: "#6B7280",
    },
    {
      label: "About SATIS",
      icon: Info,
      route: "/Screens/about",
      color: "#6B7280",
    },
  ];

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

  // Get full name
  const getFullName = () => {
    const firstName = studentData?.firstName || "";
    const lastName = studentData?.lastName || "";
    return `${firstName} ${lastName}`.trim() || "Student";
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

  // Check if route is active
  const isActiveRoute = (route) => {
    return pathname === route || pathname.startsWith(route + "/");
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
          toValue: -width * 0.85,
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

  const handleNavigation = (route) => {
    setDrawerOpen(false);
    setTimeout(() => {
      router.push(route);
    }, 100);
  };

  const handleLogoutPress = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setLogoutModalVisible(true);
    }, 300);
  };

  const handleLogoutConfirm = async () => {
    setLogoutModalVisible(false);
    logout();
    router.replace("/(auth)/login");
  };

  const handleLogoutCancel = () => {
    setLogoutModalVisible(false);
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={styles.menuButton}
        >
          <Menu size={26} color="#1f2937" strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => router.push("/Screens/profile")}
            activeOpacity={0.7}
          >
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
          </TouchableOpacity>
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
            {/* Drawer Header with User Info */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerUserSection}>
                <View style={styles.drawerAvatarContainer}>
                  <Text style={styles.drawerAvatarText}>{getInitials()}</Text>
                </View>
                <View style={styles.drawerUserInfo}>
                  <Text style={styles.drawerUserName}>{getFullName()}</Text>
                  <Text style={styles.drawerUserGrade}>
                    {getGradeDisplay()}
                    {getStrandDisplay() ? ` • ${getStrandDisplay()}` : ""}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setDrawerOpen(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.drawerScrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Main Navigation Section */}
              <View style={styles.drawerSection}>
                <Text style={styles.sectionTitle}>NAVIGATION</Text>
                {navigationItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveRoute(item.route);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.drawerItem,
                        isActive && styles.drawerItemActive,
                      ]}
                      onPress={() => handleNavigation(item.route)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${item.color}15` },
                        ]}
                      >
                        <IconComponent
                          size={20}
                          color={isActive ? item.color : "#6B7280"}
                          strokeWidth={2}
                        />
                      </View>
                      <Text
                        style={[
                          styles.drawerItemText,
                          isActive && { color: item.color, fontWeight: "700" },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isActive && (
                        <View
                          style={[
                            styles.activeIndicator,
                            { backgroundColor: item.color },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Secondary Navigation Section */}
              <View style={styles.drawerSection}>
                <Text style={styles.sectionTitle}>SETTINGS</Text>
                {secondaryItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.drawerItem}
                      onPress={() => handleNavigation(item.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconContainerSecondary}>
                        <IconComponent
                          size={20}
                          color="#6B7280"
                          strokeWidth={2}
                        />
                      </View>
                      <Text style={styles.drawerItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Logout Section */}
              <View style={styles.drawerSection}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogoutPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainerLogout}>
                    <LogOut size={20} color="#DC2626" strokeWidth={2} />
                  </View>
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContainer}>
            {/* Icon */}
            <View style={styles.confirmIconContainer}>
              <LogOut size={32} color="#DC2626" strokeWidth={2} />
            </View>

            {/* Title & Message */}
            <Text style={styles.confirmTitle}>Logout</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </Text>

            {/* Buttons */}
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={handleLogoutCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmLogoutButton}
                onPress={handleLogoutConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default Mainmenu;
