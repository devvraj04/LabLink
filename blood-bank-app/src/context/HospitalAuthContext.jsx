import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('hospitalToken'));

  useEffect(() => {
    if (token) {
      // Load hospital profile on mount
      loadHospital();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadHospital = async () => {
    try {
      console.log('Loading hospital profile...');
      const response = await hospitalAuthAPI.getProfile();
      console.log('Profile response:', response.data);
      if (response.data.success) {
        setHospital(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load hospital profile:', error);
      console.error('Error response:', error.response?.data);
      // Only logout if it's an authentication error (401), not server errors (500)
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await hospitalAuthAPI.login(credentials);
      console.log('Login response:', response.data);
      if (response.data.success) {
        const { token: newToken, ...hospitalData } = response.data.data;
        console.log('Setting token and hospital data:', { newToken, hospitalData });
        setToken(newToken);
        setHospital(hospitalData);
        localStorage.setItem('hospitalToken', newToken);
        localStorage.setItem('hospital', JSON.stringify(hospitalData));
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
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
        // Auto-login after registration
        const { token: newToken, ...hospital } = response.data.data;
        setToken(newToken);
        setHospital(hospital);
        localStorage.setItem('hospitalToken', newToken);
        localStorage.setItem('hospital', JSON.stringify(hospital));
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
