import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Lock, Eye, EyeClosed } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.message || "Please check your credentials.");
      return;
    }
    // on success, AuthProvider will update user and the layout will redirect
  };

  return (
    <View style={styles.container}>
      {/* Blurred Background Image */}
      <ImageBackground
        source={require("../../assets/school.jpg")}
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
                  source={require("../../assets/school-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subHeaderText}>Sign in to continue</Text>

              {/* Email Field */}
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#E91E63" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
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
                  onPress={() => setRemember(!remember)}
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
                onPress={handleLogin}
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
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
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
});

export default Login;
