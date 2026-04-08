import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lock, Eye, EyeClosed, Shield, CheckCircle } from "lucide-react-native";
import { useAuth } from "@context/AuthContext";
import SchoolPic from "@assets/school.jpg";

const { width, height } = Dimensions.get("window");

const ForceChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword, user } = useAuth();
  const accountIdentifier =
    user?.email || user?.personal_email || user?.username || null;

  // Password strength checker
  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: "", color: "#E5E7EB" };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    if (strength <= 2)
      return { level: strength, label: "Weak", color: "#EF4444" };
    if (strength <= 3)
      return { level: strength, label: "Medium", color: "#F59E0B" };
    if (strength <= 4)
      return { level: strength, label: "Strong", color: "#10B981" };
    return { level: strength, label: "Very Strong", color: "#059669" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleChangePassword = async () => {
    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    const res = await changePassword(password, confirmPassword);

    setLoading(false);

    if (!res.success) {
      setError(res.message || "Failed to change password.");
      return;
    }
    // On success, AuthContext will update and the layout will redirect
  };

  return (
    <View style={styles.container}>
      {/* Blurred Background Image */}
      <ImageBackground
        source={SchoolPic}
        style={styles.backgroundImage}
        blurRadius={8}
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Glass Card */}
            <View style={styles.card}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Shield size={48} color="#E91E63" strokeWidth={1.5} />
              </View>

              <Text style={styles.welcomeText}>Change Your Password</Text>
              <Text style={styles.subHeaderText}>
                For your security, please create a new password for your
                account.
              </Text>

              {/* User Info */}
              {accountIdentifier && (
                <View style={styles.userInfoContainer}>
                  <Text style={styles.userInfoText}>
                    Logged in as: {accountIdentifier}
                  </Text>
                </View>
              )}

              {/* New Password Field */}
              <View style={styles.field}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#E91E63" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.showButton}
                  >
                    {showPassword ? (
                      <Eye size={18} color="#E91E63" />
                    ) : (
                      <EyeClosed size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthSegment,
                            {
                              backgroundColor:
                                i <= passwordStrength.level
                                  ? passwordStrength.color
                                  : "#E5E7EB",
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text
                      style={[
                        styles.strengthLabel,
                        { color: passwordStrength.color },
                      ]}
                    >
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password Field */}
              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#E91E63" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.showButton}
                  >
                    {showConfirmPassword ? (
                      <Eye size={18} color="#E91E63" />
                    ) : (
                      <EyeClosed size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Match Indicator */}
                {confirmPassword.length > 0 && (
                  <View style={styles.matchContainer}>
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle size={14} color="#10B981" />
                        <Text style={[styles.matchText, { color: "#10B981" }]}>
                          Passwords match
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.matchText, { color: "#EF4444" }]}>
                        Passwords do not match
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password must:</Text>
                <Text style={styles.requirementItem}>
                  • Be at least 8 characters
                </Text>
                <Text style={styles.requirementItem}>
                  • Include uppercase & lowercase
                </Text>
                <Text style={styles.requirementItem}>• Include a number</Text>
                <Text style={styles.requirementItem}>
                  • Include a special character
                </Text>
              </View>

              {/* Change Password Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF2F8",
  },
  backgroundImage: {
    position: "absolute",
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(252, 231, 243, 0.75)",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  userInfoContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  userInfoText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  showButton: {
    padding: 6,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  strengthBar: {
    flexDirection: "row",
    flex: 1,
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 10,
  },
  requirementsContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: "#3B82F6",
    marginBottom: 4,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: "#E91E63",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ForceChangePassword;
