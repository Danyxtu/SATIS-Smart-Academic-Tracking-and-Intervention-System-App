import React, { useEffect, useState } from "react";
import SchoolPicture from "@assets/school.jpg";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Lock,
  Eye,
  EyeClosed,
  QrCode,
  Camera,
  X,
} from "lucide-react-native";
import { useAuth } from "@context/AuthContext";
import SchoolLogo from "@assets/school-logo.png";
import * as SecureStore from "expo-secure-store";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width, height } = Dimensions.get("window");
const REMEMBERED_CREDENTIALS_KEY = "remembered_credentials";

const parseQrCredentials = (rawValue) => {
  const raw = String(rawValue ?? "").trim();

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed?.type === "satis_student_credentials" &&
      parsed?.username &&
      parsed?.password
    ) {
      return {
        loginInput: String(parsed.username).trim(),
        password: String(parsed.password),
      };
    }
  } catch (err) {
    // Fall through to plain-text parsing.
  }

  const usernameLine = raw.match(/username\s*:\s*(.+)/i)?.[1]?.trim();
  const passwordLine = raw.match(/password\s*:\s*(.+)/i)?.[1]?.trim();

  if (usernameLine && passwordLine) {
    return {
      loginInput: usernameLine,
      password: passwordLine,
    };
  }

  return null;
};

const Login = () => {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const { login } = useAuth();

  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const stored = await SecureStore.getItemAsync(
          REMEMBERED_CREDENTIALS_KEY,
        );
        if (!stored) return;
        let parsed;
        try {
          parsed = JSON.parse(stored);
        } catch (err) {
          // Corrupted data, clear it
          await SecureStore.deleteItemAsync(REMEMBERED_CREDENTIALS_KEY);
          setLoginInput("");
          setPassword("");
          setRemember(false);
          return;
        }
        if (
          typeof parsed?.loginInput !== "string" ||
          typeof parsed?.password !== "string"
        ) {
          await SecureStore.deleteItemAsync(REMEMBERED_CREDENTIALS_KEY);
          setLoginInput("");
          setPassword("");
          setRemember(false);
          return;
        }
        setLoginInput(parsed.loginInput);
        setPassword(parsed.password);
        setRemember(true);
      } catch (err) {
        console.warn("Login: failed to load remembered credentials", err);
        setLoginInput("");
        setPassword("");
        setRemember(false);
      }
    };
    loadRememberedCredentials();
  }, []);

  const persistRememberedCredentials = async (
    loginInputValue = loginInput,
    passwordValue = password,
  ) => {
    try {
      if (!remember) {
        await SecureStore.deleteItemAsync(REMEMBERED_CREDENTIALS_KEY);
        return;
      }

      await SecureStore.setItemAsync(
        REMEMBERED_CREDENTIALS_KEY,
        JSON.stringify({
          loginInput: String(loginInputValue || "").trim(),
          password: String(passwordValue || ""),
        }),
      );
    } catch (err) {
      console.warn("Login: failed to persist remembered credentials", err);
    }
  };

  const handleRememberToggle = async () => {
    const nextRemember = !remember;
    setRemember(nextRemember);

    if (!nextRemember) {
      try {
        await SecureStore.deleteItemAsync(REMEMBERED_CREDENTIALS_KEY);
      } catch (err) {
        console.warn("Login: failed to clear remembered credentials", err);
      }
    }
  };

  const handleLogin = async (
    overrideLoginInput = null,
    overridePassword = null,
  ) => {
    const normalizedLoginInput = String(
      overrideLoginInput ?? loginInput,
    ).trim();
    const passwordValue = String(overridePassword ?? password);

    if (!normalizedLoginInput || !passwordValue) {
      setError("Please enter your username or email and password.");
      return;
    }

    setError("");
    setLoading(true);

    await persistRememberedCredentials(normalizedLoginInput, passwordValue);

    const res = await login(normalizedLoginInput, passwordValue);

    setLoading(false);
    if (!res.success) {
      setError(res.message || "Please check your credentials.");
      return;
    }
  };

  const handleOpenScanner = async () => {
    setScannerError("");
    setScanLocked(false);

    if (!cameraPermission?.granted) {
      const nextPermission = await requestCameraPermission();
      if (!nextPermission?.granted) {
        setScannerError(
          "Camera permission is required to scan student login QR codes.",
        );
      }
    }

    setScannerVisible(true);
  };

  const handleCloseScanner = () => {
    setScannerVisible(false);
    setScanLocked(false);
  };

  const handleQrScanned = async ({ data }) => {
    if (scanLocked) {
      return;
    }

    setScanLocked(true);
    setScannerError("");

    const parsedCredentials = parseQrCredentials(data);
    if (!parsedCredentials) {
      setScannerError(
        "Unsupported QR code. Please scan a student credential QR from the web app.",
      );
      setScanLocked(false);
      return;
    }
    setLoginInput(parsedCredentials.loginInput || "");
    setPassword(parsedCredentials.password || "");
    setScannerVisible(false);
    try {
      await handleLogin(
        parsedCredentials.loginInput,
        parsedCredentials.password,
      );
    } catch (err) {
      setScannerError("Login failed. Please check credentials or try again.");
    }
    setScanLocked(false);
  };

  return (
    <View style={styles.container}>
      {/* Blurred Background Image */}
      <ImageBackground
        source={SchoolPicture}
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
              {/* School Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={SchoolLogo}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subHeaderText}>Sign in to continue</Text>

              {/* Username or Email Field */}
              <View style={styles.field}>
                <Text style={styles.label}>Username or Email</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#E91E63" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username or email"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    value={loginInput}
                    onChangeText={setLoginInput}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#E91E63" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
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
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Remember Me */}
              <View style={styles.rememberRow}>
                <TouchableOpacity
                  style={[styles.checkbox, remember && styles.checkboxChecked]}
                  onPress={handleRememberToggle}
                >
                  {remember ? <View style={styles.checkboxInner} /> : null}
                </TouchableOpacity>
                <Text style={styles.rememberText}>Remember me</Text>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={() => handleLogin()}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  // TODO: Replace with navigation to reset screen if available
                  setError(
                    "Please contact your school administrator to reset your password.",
                  );
                }}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.scanFab}
        onPress={handleOpenScanner}
        activeOpacity={0.85}
      >
        <QrCode size={22} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={scannerVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseScanner}
      >
        <View style={styles.scannerBackdrop}>
          <View style={styles.scannerCard}>
            <View style={styles.scannerHeader}>
              <View>
                <Text style={styles.scannerTitle}>Scan Login QR</Text>
                <Text style={styles.scannerSubtitle}>
                  Point the camera at the student credentials QR.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCloseScanner}
                style={styles.scannerCloseButton}
                activeOpacity={0.8}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.scannerBody}>
              {cameraPermission?.granted ? (
                <CameraView
                  style={styles.cameraView}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={scanLocked ? undefined : handleQrScanned}
                />
              ) : (
                <View style={styles.permissionCard}>
                  <Camera size={26} color="#E91E63" />
                  <Text style={styles.permissionText}>
                    Camera permission is needed to scan QR credentials.
                  </Text>
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={handleOpenScanner}
                  >
                    <Text style={styles.permissionButtonText}>
                      Allow Camera
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {scannerError ? (
              <Text style={styles.scannerError}>{scannerError}</Text>
            ) : (
              <Text style={styles.scannerHint}>
                Use only QR codes generated from Student Login Credentials in
                the web class list.
              </Text>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: "rgba(252, 231, 243, 0.75)", // Pinkish overlay
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
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 36,
    alignItems: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 12,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FDF2F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subHeaderText: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 32,
  },
  field: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF2F8",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#FBCFE8",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    color: "#1F2937",
    fontSize: 15,
  },
  showButton: {
    padding: 8,
  },
  errorText: {
    color: "#E11D48",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
    textAlign: "center",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FBCFE8",
    backgroundColor: "#FDF2F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: "#E91E63",
    backgroundColor: "#FCE7F3",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "#E91E63",
    borderRadius: 3,
  },
  rememberText: {
    color: "#6B7280",
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#E91E63",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  forgotPasswordButton: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#E91E63",
    fontSize: 14,
    fontWeight: "500",
  },
  scanFab: {
    position: "absolute",
    right: 24,
    bottom: 26,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  scannerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  scannerCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 16,
  },
  scannerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  scannerTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  scannerSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  scannerCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerBody: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FBCFE8",
  },
  cameraView: {
    width: "100%",
    aspectRatio: 1,
  },
  permissionCard: {
    width: "100%",
    minHeight: 240,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF2F8",
  },
  permissionText: {
    marginTop: 10,
    color: "#4B5563",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
  permissionButton: {
    marginTop: 14,
    backgroundColor: "#E91E63",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  scannerHint: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 17,
  },
  scannerError: {
    marginTop: 10,
    color: "#E11D48",
    fontSize: 12,
    lineHeight: 17,
  },
});

export default Login;
