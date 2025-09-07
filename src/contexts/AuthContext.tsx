"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  usageCount: number;
  incrementUsage: () => void;
  hasReachedLimit: boolean;
  sessionStartTime: number | null;
  startSession: () => void;
  isSessionExpired: boolean;
  clearAllData: () => void;
  isTrialExpired: boolean;
  revokeUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded authorized users
const AUTHORIZED_USERS = [
  {
    email: "test1@example.com",
    password: "password123",
    name: "Test User 1",
  },
  {
    email: "test2@example.com",
    password: "password456",
    name: "Test User 2",
  },
  {
    email: "admin@example.com",
    password: "admin789",
    name: "Admin User",
  },
];

const USAGE_LIMIT = 3;
const SESSION_DURATION_MS = 1 * 60 * 1000; // 1 minute

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("voiceAgent_user");
    const savedUsage = localStorage.getItem("voiceAgent_usage");
    const savedSessionStart = localStorage.getItem("voiceAgent_sessionStart");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedUsage) {
      setUsageCount(parseInt(savedUsage, 10));
    }
    if (savedSessionStart) {
      setSessionStartTime(parseInt(savedSessionStart, 10));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const authorizedUser = AUTHORIZED_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (authorizedUser) {
      // Check if user is already revoked
      const isRevoked = localStorage.getItem(`voiceAgent_revoked_${email}`);
      if (isRevoked) {
        return false; // User is revoked, cannot login
      }

      const userData = {
        email: authorizedUser.email,
        name: authorizedUser.name,
      };
      setUser(userData);
      localStorage.setItem("voiceAgent_user", JSON.stringify(userData));

      // Clear any existing session data on fresh login
      setUsageCount(0);
      setSessionStartTime(null);
      localStorage.removeItem("voiceAgent_usage");
      localStorage.removeItem("voiceAgent_sessionStart");
      localStorage.removeItem("voiceAgent_sessionEnd");
      localStorage.removeItem("voiceAgent_sessionTimeout");

      return true;
    }
    return false;
  };

  const logout = () => {
    // Clear any existing timeout
    const existingTimeout = localStorage.getItem("voiceAgent_sessionTimeout");
    if (existingTimeout) {
      clearTimeout(parseInt(existingTimeout, 10));
      localStorage.removeItem("voiceAgent_sessionTimeout");
    }

    setUser(null);
    setUsageCount(0);
    setSessionStartTime(null);
    localStorage.removeItem("voiceAgent_user");
    localStorage.removeItem("voiceAgent_usage");
    localStorage.removeItem("voiceAgent_sessionStart");
    localStorage.removeItem("voiceAgent_sessionEnd");
  };

  const clearAllData = () => {
    // Clear any existing timeout
    const existingTimeout = localStorage.getItem("voiceAgent_sessionTimeout");
    if (existingTimeout) {
      clearTimeout(parseInt(existingTimeout, 10));
    }

    // Clear all localStorage data
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("voiceAgent_")) {
        localStorage.removeItem(key);
      }
    });

    // Reset state
    setUser(null);
    setUsageCount(0);
    setSessionStartTime(null);
  };

  const revokeUser = (email: string) => {
    // Mark user as revoked permanently
    localStorage.setItem(`voiceAgent_revoked_${email}`, "true");

    // If this is the current user, log them out
    if (user && user.email === email) {
      logout();
    }
  };

  const startSession = () => {
    const now = Date.now();
    const sessionEndTime = now + SESSION_DURATION_MS;

    // Store session data
    setSessionStartTime(now);
    setUsageCount(0);

    // Clear any existing timeout
    const existingTimeout = localStorage.getItem("voiceAgent_sessionTimeout");
    if (existingTimeout) {
      clearTimeout(parseInt(existingTimeout, 10));
    }

    // Store session data in localStorage
    localStorage.setItem("voiceAgent_sessionStart", now.toString());
    localStorage.setItem("voiceAgent_usage", "0");
    localStorage.setItem("voiceAgent_sessionEnd", sessionEndTime.toString());

    // Set new timeout for session expiration
    const timeoutId = window.setTimeout(() => {
      // Session expired - revoke user credentials
      if (user) {
        revokeUser(user.email);
      }
      setSessionStartTime(null);
      localStorage.removeItem("voiceAgent_sessionStart");
      localStorage.removeItem("voiceAgent_sessionEnd");
    }, SESSION_DURATION_MS);

    localStorage.setItem("voiceAgent_sessionTimeout", timeoutId.toString());
  };

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem("voiceAgent_usage", newCount.toString());

    // If limit reached, revoke user credentials
    if (newCount >= USAGE_LIMIT && user) {
      revokeUser(user.email);
    }
  };

  const hasReachedLimit = usageCount >= USAGE_LIMIT;

  const isSessionExpired = sessionStartTime
    ? Date.now() - sessionStartTime > SESSION_DURATION_MS
    : false;

  const isTrialExpired = user
    ? (() => {
        try {
          const isRevoked = localStorage.getItem(
            `voiceAgent_revoked_${user.email}`
          );
          return isRevoked === "true";
        } catch (error) {
          console.error("Error checking trial expiration:", error);
          return false;
        }
      })()
    : false;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    usageCount,
    incrementUsage,
    hasReachedLimit,
    sessionStartTime,
    startSession,
    isSessionExpired,
    clearAllData,
    isTrialExpired,
    revokeUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
