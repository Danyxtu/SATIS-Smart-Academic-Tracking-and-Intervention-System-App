import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Mail,
  Send,
  CheckCircle,
  RefreshCw,
  LogOut,
} from "lucide-react-native";
import { useAuth } from "@context/AuthContext";
import SchoolPicture from "@assets/school.jpg";

const { width, height } = Dimensions.get("window");

const StudentEmailVerification = () => {
  const {
    user,
    sendEmailVerification,
    refreshEmailVerificationStatus,
    requiresEmailVerification,
    logout,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fallbackEmail =
      user?.personal_email || user?.email || user?.username || "";
    setEmail(String(fallbackEmail || ""));
  }, [user?.personal_email, user?.email, user?.username]);

  useEffect(() => {
    const bootstrapStatus = async () => {
      if (!requiresEmailVerification) {
        return;
      }

      setRefreshing(true);
      await refreshEmailVerificationStatus();
      setRefreshing(false);
    };

    bootstrapStatus();
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendVerification = async () => {
    setError("");
    setMessage("");

    const normalizedEmail = String(email || "").trim();

    if (!normalizedEmail.includes("@")) {
      setError("Please enter a valid personal email.");
      return;
    }

    setSending(true);
    const result = await sendEmailVerification(normalizedEmail);
    setSending(false);

    if (!result.success) {
      setError(result.message || "Failed to send verification email.");
      return;
    }

    setMessage(
      result.message ||
        "Verification email sent. Please verify within 30 minutes.",
    );
  };

  const handleRefreshStatus = async () => {
    setError("");
    setMessage("");
    setRefreshing(true);

    const result = await refreshEmailVerificationStatus();

    setRefreshing(false);

    if (!result.success) {
      setError(result.message || "Failed to refresh verification status.");
      return;
    }

    if (result.requiresEmailVerification) {
      setMessage(
        "Email is not verified yet. Open your inbox and tap the verification link.",
      );
    } else {
      setMessage("Email verified successfully. Redirecting...");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={SchoolPicture}
        style={styles.backgroundImage}
        blurRadius={8}
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Mail size={38} color="#E91E63" />
          </View>

          <Text style={styles.title}>Verify Personal Email</Text>
          <Text style={styles.subtitle}>
            Enter your personal email and verify it to continue. Verification
            links expire in 30 minutes.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Personal Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color="#E91E63" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="student@example.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {message ? (
            <View style={styles.messageBox}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryButton, sending && styles.disabledButton]}
            onPress={handleSendVerification}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Send size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  Send Verification Email
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              refreshing && styles.disabledButton,
            ]}
            onPress={handleRefreshStatus}
            disabled={refreshing}
            activeOpacity={0.85}
          >
            {refreshing ? (
              <ActivityIndicator color="#E91E63" size="small" />
            ) : (
              <>
                <RefreshCw size={16} color="#E91E63" />
                <Text style={styles.secondaryButtonText}>
                  I Verified, Check Again
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#6B7280" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
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
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(252, 231, 243, 0.78)",
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FCE7F3",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FBCFE8",
    borderRadius: 14,
    backgroundColor: "#FDF2F8",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#1F2937",
    fontSize: 15,
  },
  errorText: {
    color: "#E11D48",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  messageText: {
    color: "#065F46",
    fontSize: 12,
    flex: 1,
  },
  primaryButton: {
    marginTop: 4,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#F9A8D4",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#BE185D",
    fontSize: 13,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  logoutButtonText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default StudentEmailVerification;
