// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSessionData } from '@/types/index';
import { authApi, setStoredAuthToken, removeStoredAuthToken, getStoredAuthToken } from '@/lib/apiClient';

interface AuthContextType {
  user: UserSessionData | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, userData: UserSessionData) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updatedData: Partial<UserSessionData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        setAccessToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
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
    localStorage.setItem('paintit_refresh_token', refresh);
    localStorage.setItem('paintit_user_data', JSON.stringify(userData));

    const roleUpper = (userData.role || "").toUpperCase();
    const emailLower = (userData.email || "").toLowerCase();

    if (roleUpper === 'ADMIN' || emailLower === 'codelight001@gmail.com') {
      router.push('/admin/dashboard');
    } else if (roleUpper === 'PAINTER' || roleUpper === 'CONSUMER') {
      router.push('/dashboard');
    } else {
      router.push('/');
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

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      loading,
      isAuthenticated: !!accessToken,
      login,
      logout,
      refreshSession,
      updateUser
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