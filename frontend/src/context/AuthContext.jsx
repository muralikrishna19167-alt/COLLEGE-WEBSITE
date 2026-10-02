import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('rc_token');
    const raw = localStorage.getItem('rc_admin');
    return token && raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    const adminInfo = { name: data.name, username: data.username, role: data.role, department: data.department };
    localStorage.setItem('rc_token', data.token);
    localStorage.setItem('rc_admin', JSON.stringify(adminInfo));
    setAdmin(adminInfo);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_admin');
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
