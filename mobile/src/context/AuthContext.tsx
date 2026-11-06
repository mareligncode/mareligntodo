import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserSettings } from '../types';
import {
  authApi,
  settingsApi,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  settings: UserSettings | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore existing session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          setToken(storedToken);
          const data = await authApi.getMe();
          setUser(data.user);
          setSettings(data.settings);
        }
      } catch (err) {
        console.warn('Session expired or offline:', err);
        await removeStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      await setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);

      // fetch settings
      try {
        const meData = await authApi.getMe();
        setSettings(meData.settings);
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.register({ fullName, email, password });
      await setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await removeStoredToken();
    setToken(null);
    setUser(null);
    setSettings(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setSettings(data.settings);
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await authApi.updateProfile(data);
    setUser(res.user);
  };

  const updateSettings = async (data: Partial<UserSettings>) => {
    const res = await settingsApi.updateSettings(data);
    setSettings(res.settings);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

