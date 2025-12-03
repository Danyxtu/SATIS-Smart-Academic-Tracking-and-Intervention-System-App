import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { User, Lock, Eye, EyeClosed } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("../../assets/school.jpg")}
          style={styles.logo}
          resizeMode="cover"
        />

        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subHeaderText}>Sign in to continue</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showButton}
            >
              {showPassword ? (
                <Eye size={18} color="#666" />
              ) : (
                <EyeClosed size={18} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.rememberRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setRemember(!remember)}
          >
            {remember ? <View style={styles.checkboxInner} /> : null}
          </TouchableOpacity>
          <Text style={styles.rememberText}>Remember me</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            loading ? styles.loginButtonDisabled : null,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        {/* Optional: Forgot Password / Sign Up links */}
        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: "100%",
    maxWidth: 350,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    width: "100%",
    maxWidth: 350,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPasswordButton: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
  errorText: {
    color: "#dc2626",
    marginTop: 8,
    marginBottom: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: "#E5E7EB",
  },
  field: {
    width: "100%",
    maxWidth: 350,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
  },
  showButton: {
    padding: 8,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    marginTop: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  rememberText: {
    color: "#6b7280",
  },
});

export default Login;
