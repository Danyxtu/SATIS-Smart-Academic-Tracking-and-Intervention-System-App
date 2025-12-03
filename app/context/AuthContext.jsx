import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Constants from "expo-constants";

// Determine API base URL in this order:
// 1. process.env.API_URL (useful for dev overrides)
// 2. expo config extra (app.json or app.config.js -> extra.API_URL)
// 3. default to Android emulator host (10.0.2.2)
const extraApi =
  Constants.expoConfig?.extra?.API_URL || Constants.manifest?.extra?.API_URL;
const rawBase = process.env.API_URL || extraApi || "http://10.0.2.2:8000";

// Ensure the API_URL ends with /api (so callers can use relative paths)
const normalizedBase = rawBase.replace(/\/+$/, "");
const API_URL = normalizedBase.endsWith("/api")
  ? normalizedBase
  : `${normalizedBase}/api`;

// Set axios baseURL so we can use relative paths in requests
axios.defaults.baseURL = API_URL;

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
            setUser({ token: session, ...res.data });
          } catch (err) {
            // Token invalid or request failed — remove stored session
            await SecureStore.deleteItemAsync("user_session");
            delete axios.defaults.headers.common["Authorization"];
            setUser(null);
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

  const login = async (email, password) => {
    try {
      // call backend login endpoint
      // Use relative path because axios.defaults.baseURL was set earlier
      const res = await axios.post(`/login`, { email, password });

      const token = res.data.token;
      const userData = res.data.user;

      // persist token
      await SecureStore.setItemAsync("user_session", token);

      // set axios Authorization header for subsequent requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser({ token, ...userData });

      return { success: true };
    } catch (err) {
      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("[AuthContext] login error:", err?.response || err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        `Login failed (${err?.response?.status || "unknown"})`;
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    SecureStore.deleteItemAsync("user_session");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
