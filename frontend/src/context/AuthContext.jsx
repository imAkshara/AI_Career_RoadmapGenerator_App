import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await authApi.getUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
  try {
    const response = await authApi.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    toast.success('Welcome back! 🎉');
    return { success: true };
  } catch (error) {
    let message = 'Login failed';
    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string') {
        message = data;
      } else if (data.non_field_errors) {
        message = data.non_field_errors.join(', ');
      } else if (data.username || data.password) {
        const errors = [];
        if (data.username) errors.push(`Username: ${data.username.join(', ')}`);
        if (data.password) errors.push(`Password: ${data.password.join(', ')}`);
        message = errors.join('; ');
      } else if (data.error) {
        message = data.error;
      } else {
        message = JSON.stringify(data); // fallback
      }
    }
    toast.error(message);
    return { success: false, error: message };
  }
};

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      toast.success('Account created successfully! 🚀');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.success('Logged out');
    }
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};