// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSessionData } from '@/types/index';
import { authApi, setStoredAuthToken, removeStoredAuthToken, getStoredAuthToken } from '@/lib/apiClient';
import { registerCurrentDevice, verifyDeviceSecurity } from '@/lib/deviceFingerprint';

interface AuthContextType {
  user: UserSessionData | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, userData: UserSessionData) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updatedData: Partial<UserSessionData>) => void;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getDashboardPathForUser(userData: UserSessionData | null): string {
  if (!userData) return "/register";
  const roleUpper = (userData.role || "").toUpperCase();
  const emailLower = (userData.email || "").toLowerCase();

  if (roleUpper === 'ADMIN' || emailLower === 'codelight001@gmail.com') {
    return '/admin/dashboard';
  }
  if (roleUpper === 'PAINTER') {
    return '/dashboard';
  }
  return '/hub';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSessionData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getStoredAuthToken();
      const storedUser = localStorage.getItem('paintit_user_data');

      if (storedToken && storedUser) {
        // Verify device security & suspicious fingerprint mismatch
        const securityCheck = verifyDeviceSecurity();
        if (!securityCheck.valid) {
          console.warn("[Security] Device verification failed:", securityCheck.reason);
          // Revoke session due to suspicious device activity
          setAccessToken(null);
          setUser(null);
          removeStoredAuthToken();
          localStorage.removeItem('paintit_refresh_token');
          localStorage.removeItem('paintit_user_data');
          setLoading(false);
          return;
        }

        setAccessToken(storedToken);
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          registerCurrentDevice(parsedUser.id);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, refresh: string, userData: UserSessionData) => {
    setAccessToken(token);
    setUser(userData);

    setStoredAuthToken(token);
    // 30-Day Long Session Persistence
    localStorage.setItem('paintit_refresh_token', refresh);
    localStorage.setItem('paintit_user_data', JSON.stringify(userData));
    localStorage.setItem('paintit_auth_timestamp', new Date().toISOString());

    // Register active device for security fingerprinting
    registerCurrentDevice(userData.id);

    const targetPath = getDashboardPathForUser(userData);

    if (typeof window !== "undefined") {
      window.location.href = targetPath;
    } else {
      router.push(targetPath);
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authApi.post('/api/auth/logout');
      }
    } catch (err) {
      console.error("Session logout cleanup error:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      removeStoredAuthToken();
      localStorage.removeItem('paintit_refresh_token');
      localStorage.removeItem('paintit_user_data');
      localStorage.removeItem('paintit_auth_timestamp');
      router.push('/login');
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = localStorage.getItem('paintit_refresh_token');
      if (!currentRefreshToken) throw new Error("No active refresh references available.");

      const data = await authApi.post<{ accessToken: string }>('/api/auth/refresh', {
        refreshToken: currentRefreshToken,
      });

      setAccessToken(data.accessToken);
      setStoredAuthToken(data.accessToken);
      return true;
    } catch (err) {
      setAccessToken(null);
      setUser(null);
      removeStoredAuthToken();
      localStorage.removeItem('paintit_refresh_token');
      localStorage.removeItem('paintit_user_data');
      localStorage.removeItem('paintit_auth_timestamp');
      return false;
    }
  };

  const updateUser = (updatedData: Partial<UserSessionData>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const mergedUser = { ...prevUser, ...updatedData };
      localStorage.setItem('paintit_user_data', JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  const getDashboardPath = (): string => {
    return getDashboardPathForUser(user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      isAuthenticated: !!accessToken,
      login,
      logout,
      refreshSession,
      updateUser,
      getDashboardPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
};