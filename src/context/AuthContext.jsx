import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  // True until the initial "am I already signed in?" check finishes.
  // Route guards (RequireAuth) wait for this before deciding whether
  // to redirect, so a page reload never flashes to /login incorrectly
  // just because the session cookie hasn't been checked yet.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authService
      .getSession()
      .then(({ user }) => { if (!cancelled) setUser(user); })
      .catch(() => { /* not signed in — that's fine, user stays null */ })
      .finally(() => { if (!cancelled) setInitializing(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password, remember) => {
    setStatus("loading");
    try {
      const { user } = await authService.login(email, password, remember);
      setUser(user);
      setStatus("idle");
      return user;
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, status, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
