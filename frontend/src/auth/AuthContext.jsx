import { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fleet_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (authResponse) => {
    const { token, email, fullName, role } = authResponse;
    const userRecord = { email, fullName, role };
    localStorage.setItem('fleet_token', token);
    localStorage.setItem('fleet_user', JSON.stringify(userRecord));
    setUser(userRecord);
  };

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    persist(res);
    return res;
  }, []);

  const register = useCallback(async (email, password, fullName, role) => {
    const res = await authApi.register(email, password, fullName, role);
    persist(res);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fleet_token');
    localStorage.removeItem('fleet_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
