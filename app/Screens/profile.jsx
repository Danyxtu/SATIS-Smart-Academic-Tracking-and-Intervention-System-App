import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Shield,
  Key,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  Users,
  AlertCircle,
} from "lucide-react-native";
import axios from "axios";

// --- Info Display Field Component (Read-only) ---
const InfoField = ({ label, value, icon: Icon }) => (
  <View style={styles.infoField}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      {Icon && (
        <View style={styles.infoIcon}>
          <Icon color="#9CA3AF" size={16} />
        </View>
      )}
      <Text style={[styles.infoValue, Icon && { marginLeft: 8 }]}>
        {value || <Text style={styles.notProvided}>Not provided</Text>}
      </Text>
    </View>
  </View>
);

// --- Section Card Component ---
const SectionCard = ({ title, description, children, icon: Icon }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionCardHeader}>
      {Icon && (
        <View style={styles.sectionIconBox}>
          <Icon size={18} color="#DB2777" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionCardTitle}>{title}</Text>
        {description && (
          <Text style={styles.sectionCardDescription}>{description}</Text>
        )}
      </View>
    </View>
    <View style={styles.sectionCardContent}>{children}</View>
  </View>
);

// --- Change Password Modal ---
const ChangePasswordModal = ({ visible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setErrors({});

    // Validation
    const newErrors = {};
    if (!currentPassword) {
      newErrors.current_password = "Current password is required";
    }
    if (!newPassword) {
      newErrors.password = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await axios.put("/student/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      const apiErrors = err?.response?.data?.errors || {};
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        setErrors({
          current_password:
            err?.response?.data?.message || "Failed to update password",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalIconBox}>
                <Key color="#DB2777" size={22} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Change Password</Text>
                <Text style={styles.modalSubtitle}>
                  Update your account password
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X color="#6B7280" size={22} />
            </TouchableOpacity>
          </View>

          {/* Success Message */}
          {success && (
            <View style={styles.successMessage}>
              <CheckCircle color="#059669" size={18} />
              <Text style={styles.successText}>
                Password updated successfully!
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.modalForm}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <Key color="#9CA3AF" size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? (
                    <EyeOff color="#9CA3AF" size={18} />
                  ) : (
                    <Eye color="#9CA3AF" size={18} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.current_password && (
                <Text style={styles.errorText}>{errors.current_password}</Text>
              )}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Key color="#9CA3AF" size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  {showNew ? (
                    <EyeOff color="#9CA3AF" size={18} />
                  ) : (
                    <Eye color="#9CA3AF" size={18} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <Key color="#9CA3AF" size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? (
                    <EyeOff color="#9CA3AF" size={18} />
                  ) : (
                    <Eye color="#9CA3AF" size={18} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password_confirmation && (
                <Text style={styles.errorText}>
                  {errors.password_confirmation}
                </Text>
              )}
            </View>

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters long.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Main Profile Component ---
function StudentProfile() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await axios.get("/student/profile");
      setData(res.data);
      setError(null);
    } catch (err) {
      console.warn("Profile fetch error:", err?.response || err);
      setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const user = data?.user || {};
  const student = data?.student || {};

  // Get initials - using camelCase from API
  const getInitials = () => {
    const first = student.firstName?.[0] || "";
    const last = student.lastName?.[0] || "";
    return (first + last).toUpperCase() || "ST";
  };

  // Get full name
  const getFullName = () => {
    const parts = [
      student.firstName,
      student.middleName,
      student.lastName,
    ].filter(Boolean);
    return parts.join(" ") || user.name || "Student";
  };

  // Get grade section display
  const getGradeSection = () => {
    const parts = [];
    if (student.gradeLevel) parts.push(`Grade ${student.gradeLevel}`);
    if (student.section) parts.push(student.section);
    return parts.join(" - ") || "N/A";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DB2777" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <AlertCircle color="#DC2626" size={48} />
          <Text style={styles.errorTitle}>Failed to Load Profile</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchProfile()}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProfile(true)}
          />
        }
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backIconCircle}>
            <ArrowLeft color="#374151" size={20} />
          </View>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>My Profile</Text>
          <Text style={styles.pageSubtitle}>View your account information</Text>
        </View>

        {/* Profile Header Card */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>

          {/* User Info */}
          <Text style={styles.profileName}>{getFullName()}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Student</Text>
            </View>
            {student.gradeLevel && (
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>
                  Grade {student.gradeLevel}
                </Text>
              </View>
            )}
            {student.section && (
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{student.section}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Student Information */}
        <SectionCard
          title="Student Information"
          description="Your academic profile details (read-only)"
          icon={GraduationCap}
        >
          <View style={styles.infoGrid}>
            <InfoField
              label="First Name"
              value={student.firstName}
              icon={User}
            />
            <InfoField label="Last Name" value={student.lastName} icon={User} />
            <InfoField
              label="Middle Name"
              value={student.middleName}
              icon={User}
            />
            <InfoField label="LRN" value={student.lrn} />
            <InfoField
              label="Grade Level"
              value={student.gradeLevel ? `Grade ${student.gradeLevel}` : null}
              icon={BookOpen}
            />
            <InfoField label="Section" value={student.section} />
            {student.track && <InfoField label="Track" value={student.track} />}
            {student.strand && (
              <InfoField label="Strand" value={student.strand} />
            )}
          </View>
        </SectionCard>

        {/* Account Information */}
        <SectionCard
          title="Account Information"
          description="Your login credentials"
          icon={Mail}
        >
          <View style={styles.infoGrid}>
            <InfoField label="Display Name" value={user.name} icon={User} />
            <InfoField label="Email Address" value={user.email} icon={Mail} />
          </View>
        </SectionCard>

        {/* Security Section */}
        <SectionCard
          title="Security"
          description="Manage your password"
          icon={Shield}
        >
          <View style={styles.securityBox}>
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>Password</Text>
              <Text style={styles.securitySubtitle}>
                Change your password to keep your account secure
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changePasswordBtn}
              onPress={() => setShowPasswordModal(true)}
            >
              <Key color="#FFF" size={16} />
              <Text style={styles.changePasswordBtnText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <AlertCircle color="#3B82F6" size={18} />
          <Text style={styles.infoNoteText}>
            <Text style={styles.infoNoteStrong}>Note:</Text> To update your
            personal information, please contact your teacher or school
            administrator.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FDF2F8",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#DB2777",
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#FFF",
    fontWeight: "600",
  },

  // Back Button
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  // Page Header
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  // Profile Header
  profileHeader: {
    backgroundColor: "#6366F1",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "700",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  gradeBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gradeBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sectionBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Section Card
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionCardDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  sectionCardContent: {
    padding: 16,
  },

  // Info Grid
  infoGrid: {
    gap: 12,
  },
  infoField: {
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoIcon: {
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  notProvided: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  // Security Box
  securityBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  securityInfo: {
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  securitySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  changePasswordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DB2777",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  changePasswordBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Info Note
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  infoNoteStrong: {
    fontWeight: "700",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
  },
  modalForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
  passwordHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#DB2777",
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default StudentProfile;
