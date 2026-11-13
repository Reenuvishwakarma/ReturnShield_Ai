import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('returnshield_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          setUser(res.data.user);
        } catch (err) {
          console.error("Auth initialization error:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('returnshield_token', receivedToken);
    localStorage.setItem('returnshield_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const register = async (name, email, store_name, password) => {
    const res = await authService.register(name, email, store_name, password);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('returnshield_token', receivedToken);
    localStorage.setItem('returnshield_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('returnshield_token');
    localStorage.removeItem('returnshield_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
