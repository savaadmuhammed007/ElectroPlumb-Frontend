import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    setToken(access);
    const profileRes = await api.get('/profile/', {
      headers: { Authorization: `Bearer ${access}` },
    });
    setUser(profileRes.data);
    return profileRes.data;
  };

  const register = async (registerData) => {
    await api.post('/auth/register/', registerData);
    return await login(registerData.username, registerData.password);
  };

  const loginWithGoogle = async (googlePayload) => {
    const response = await api.post('/auth/google/', googlePayload);
    const { access, refresh, user: loggedUser } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    setToken(access);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    const response = await api.put('/profile/', updatedData);
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        fetchUserProfile,
        isAdmin: user?.is_staff || user?.profile?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
