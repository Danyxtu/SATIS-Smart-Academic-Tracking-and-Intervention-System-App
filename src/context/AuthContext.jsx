import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Constants from "expo-constants";

// Priority: EXPO_PUBLIC env var → app.config.js extra → emulator fallback
const rawBase =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.API_URL ||
  "http://10.0.2.2:8000";

const normalizedBase = rawBase.replace(/\/+$/, "");
const API_URL = normalizedBase.endsWith("/api")
  ? normalizedBase
  : `${normalizedBase}/api`;

axios.defaults.baseURL = API_URL;

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    // On startup, check for a stored token and validate it by fetching the user.
    (async () => {
      // Helpful debug: show which API URL was resolved at runtime
      try {
        // eslint-disable-next-line no-console
        console.log("[AuthContext] resolved API_URL:", API_URL);
      } catch (e) {}
      try {
        const session = await SecureStore.getItemAsync("user_session");
        if (session) {
          // set default Authorization header for axios
          axios.defaults.headers.common["Authorization"] = `Bearer ${session}`;

          // Try to fetch the authenticated user from the backend (relative path because baseURL is set)
          try {
            const res = await axios.get(`/user`);
            const userData = res.data;
            setUser({ token: session, ...userData });
            // Check if user must change password
            setMustChangePassword(userData.must_change_password ?? false);
          } catch (err) {
            // Token invalid or request failed — remove stored session
            await SecureStore.deleteItemAsync("user_session");
            delete axios.defaults.headers.common["Authorization"];
            setUser(null);
            setMustChangePassword(false);
          }
        }
      } catch (err) {
        // ignore SecureStore errors for now
        console.warn("AuthContext init error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (loginInput, password) => {
    try {
      const identifier = (loginInput || "").trim();

      // call backend login endpoint
      // Use relative path because axios.defaults.baseURL was set earlier
      const payload = {
        login: identifier,
        password,
      };

      // Backward compatibility for older API versions that still validate `email`
      if (identifier.includes("@")) {
        payload.email = identifier;
      }

      const res = await axios.post(`/login`, payload);

      const token = res.data.token;
      const userData = res.data.user;
      const needsPasswordChange = res.data.must_change_password ?? false;

      // persist token
      await SecureStore.setItemAsync("user_session", token);

      // set axios Authorization header for subsequent requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser({ token, ...userData });
      setMustChangePassword(needsPasswordChange);

      return { success: true, mustChangePassword: needsPasswordChange };
    } catch (err) {
      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("[AuthContext] login error:", err?.response || err);
      const validationMessage =
        err?.response?.data?.errors?.login?.[0] ||
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.errors?.password?.[0];
      const message =
        validationMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        `Login failed (${err?.response?.status || "unknown"})`;
      return { success: false, message };
    }
  };

  const changePassword = async (password, password_confirmation) => {
    try {
      const res = await axios.post(`/force-change-password`, {
        password,
        password_confirmation,
      });

      // Update user state and clear the password change flag
      setUser((prev) => ({
        ...prev,
        ...res.data.user,
        must_change_password: false,
      }));
      setMustChangePassword(false);

      return { success: true, message: res.data.message };
    } catch (err) {
      console.error(
        "[AuthContext] changePassword error:",
        err?.response || err,
      );
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.password?.[0] ||
        "Failed to change password";
      return { success: false, message };
    }
  };

  const logout = async () => {
    setUser(null);
    setMustChangePassword(false);
    await SecureStore.deleteItemAsync("user_session");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        mustChangePassword,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
