import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { hospitalAuthAPI } from '../services/api';

const HospitalAuthContext = createContext();

export const useHospitalAuth = () => {
  const context = useContext(HospitalAuthContext);
  if (!context) {
    throw new Error('useHospitalAuth must be used within HospitalAuthProvider');
  }
  return context;
};

export const HospitalAuthProvider = ({ children }) => {
  // Initialize hospital from localStorage to avoid unnecessary API call
  const [hospital, setHospital] = useState(() => {
    try {
      const cached = localStorage.getItem('hospital');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    // Only loading if we have a token but no cached hospital
    const hasToken = !!localStorage.getItem('hospitalToken');
    const hasCached = !!localStorage.getItem('hospital');
    return hasToken && !hasCached;
  });
  const [token, setToken] = useState(localStorage.getItem('hospitalToken'));
  const profileLoadedRef = useRef(false);

  const loadHospital = useCallback(async () => {
    // Prevent duplicate fetches
    if (profileLoadedRef.current) return;
    profileLoadedRef.current = true;

    try {
      const response = await hospitalAuthAPI.getProfile();
      if (response.data.success) {
        setHospital(response.data.data);
        localStorage.setItem('hospital', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Failed to load hospital profile:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      // If we already have cached hospital data, don't show loading
      // but still refresh profile in background (once)
      if (hospital && !profileLoadedRef.current) {
        setLoading(false);
        loadHospital(); // refresh in background, won't block UI
      } else if (!hospital) {
        setLoading(true);
        loadHospital();
      }
    } else {
      setLoading(false);
      profileLoadedRef.current = false;
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (credentials) => {
    try {
      const response = await hospitalAuthAPI.login(credentials);
      if (response.data.success) {
        const { token: newToken, ...hospitalData } = response.data.data;
        localStorage.setItem('hospitalToken', newToken);
        localStorage.setItem('hospital', JSON.stringify(hospitalData));
        setHospital(hospitalData);
        setToken(newToken);
        profileLoadedRef.current = true; // We already have the data, no need to fetch again
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (hospitalData) => {
    try {
      const response = await hospitalAuthAPI.register(hospitalData);
      if (response.data.success) {
        const { token: newToken, ...data } = response.data.data;
        localStorage.setItem('hospitalToken', newToken);
        localStorage.setItem('hospital', JSON.stringify(data));
        setHospital(data);
        setToken(newToken);
        profileLoadedRef.current = true;
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setHospital(null);
    setToken(null);
    profileLoadedRef.current = false;
    localStorage.removeItem('hospitalToken');
    localStorage.removeItem('hospital');
  };

  const updateHospital = (updatedData) => {
    setHospital(prev => ({ ...prev, ...updatedData }));
    localStorage.setItem('hospital', JSON.stringify({ ...hospital, ...updatedData }));
  };

  const value = {
    hospital,
    token,
    loading,
    login,
    register,
    logout,
    updateHospital,
    isAuthenticated: !!token && !!hospital,
  };

  return (
    <HospitalAuthContext.Provider value={value}>
      {children}
    </HospitalAuthContext.Provider>
  );
};

export default HospitalAuthContext;
