import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const ADMIN_SESSION_KEY = 'electroplumb_admin_session';
const ADMIN_PIN_KEY = 'electroplumb_admin_pin';
const BUSINESS_PROFILE_KEY = 'electroplumb_business_profile';

const DEFAULT_BUSINESS_PROFILE = {
  business_name: 'ElectroPlumb Services',
  technician_name: 'Technician',
  phone: '+91 98765 43210',
  email: 'contact@electroplumb.com',
  address: 'Main Street, City Center',
  gstin: '',
  notes: 'Quality Electrical & Plumbing Solutions',
};

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });

  const [businessProfile, setBusinessProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(BUSINESS_PROFILE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_BUSINESS_PROFILE;
    } catch {
      return DEFAULT_BUSINESS_PROFILE;
    }
  });

  const [loading, setLoading] = useState(false);

  // Admin login check
  const adminLogin = async (inputPassOrPin) => {
    const configuredPin = localStorage.getItem(ADMIN_PIN_KEY) || 'admin123';
    
    // Accept 'admin123' or 'admin' or custom configured PIN
    if (
      inputPassOrPin.trim() === configuredPin ||
      inputPassOrPin.trim() === 'admin123' ||
      inputPassOrPin.trim() === 'admin'
    ) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    throw new Error('Invalid Admin Password or PIN. Default is admin123');
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
  };

  const changeAdminPin = (newPin) => {
    if (!newPin || newPin.trim().length < 4) {
      throw new Error('Admin PIN must be at least 4 characters long.');
    }
    localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
    return true;
  };

  const updateBusinessProfile = (newData) => {
    const updated = { ...businessProfile, ...newData };
    setBusinessProfile(updated);
    localStorage.setItem(BUSINESS_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  };

  // Virtual user object for backward compatibility
  const user = isAdmin
    ? {
        username: 'admin',
        first_name: 'Admin',
        is_staff: true,
        profile: { ...businessProfile, role: 'admin' },
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminLogin,
        adminLogout,
        changeAdminPin,
        businessProfile,
        updateBusinessProfile,
        user,
        loading,
        logout: adminLogout,
        login: adminLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
