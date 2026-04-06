import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifyToken, login as apiLogin, logout as apiLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyToken().then(valid => {
      setIsAdmin(valid);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (username, password) => {
    await apiLogin(username, password);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
