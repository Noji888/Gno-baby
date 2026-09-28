import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  login: (identifier: string, pass: string) => { success: boolean; error?: string };
  loginAdminWithPin: (pin: string) => { success: boolean; error?: string };
  register: (data: { name: string; email: string; password: string; nickname?: string; phone?: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => boolean;
  resetPassword: (emailOrMemberId: string, newPass: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());

  useEffect(() => {
    return storage.subscribe(() => {
      setCurrentUser(storage.getCurrentUser());
    });
  }, []);

  const login = (identifier: string, pass: string) => {
    const res = storage.authenticate(identifier, pass);
    if (res.user) {
      setCurrentUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'เข้าสู่ระบบไม่สำเร็จ' };
  };

  const loginAdminWithPin = (pin: string) => {
    const res = storage.authenticateAdminPin(pin);
    if (res.user) {
      setCurrentUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'รหัส PIN ไม่ถูกต้อง' };
  };

  const register = (data: { name: string; email: string; password: string; nickname?: string; phone?: string }) => {
    const res = storage.registerUser(data);
    if (res.user) {
      setCurrentUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'สมัครสมาชิกไม่สำเร็จ' };
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return false;
    const ok = storage.updateUser(currentUser.id, updates);
    if (ok) {
      const updated = storage.getUserById(currentUser.id);
      if (updated) setCurrentUser(updated);
    }
    return ok;
  };

  const resetPassword = (emailOrMemberId: string, newPass: string) => {
    return storage.updateUserPassword(emailOrMemberId, newPass);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        login,
        loginAdminWithPin,
        register,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
