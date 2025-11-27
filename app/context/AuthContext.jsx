import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY: Clear storage on every app start to ensure a clean slate for debugging.
    // This addresses the user's concern about a bad stored token.
    SecureStore.deleteItemAsync("user_session");
    
    // Check for a stored token when the app loads
    SecureStore.getItemAsync("user_session")
      .then((session) => {
        if (session) {
          setUser({ token: session });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = () => {
    const fakeToken = "dummy_auth_token";
    setUser({ token: fakeToken });
    SecureStore.setItemAsync("user_session", fakeToken);
  };

  const logout = () => {
    setUser(null);
    SecureStore.deleteItemAsync("user_session");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
