import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, User, Building2 } from 'lucide-react';
import { useHospitalAuth } from '../../context/HospitalAuthContext';
import { useNavigate } from 'react-router-dom';

const HospitalHeader = ({ title, toggleSidebar }) => {
  const { hospital, logout } = useHospitalAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header-glass border-b border-white/10 shadow-lg sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side - Menu and Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-zinc-900">{title}</h1>
        </div>

        {/* Right side - User profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-white/60 rounded-xl transition-colors text-zinc-700">
            <Bell className="h-5 w-5" />
            {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>

          {/* Hospital Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-white/60 rounded-xl transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-zinc-900 leading-tight">
                  {hospital?.Hosp_Name || 'Hospital'}
                </p>
                <p className="text-xs text-zinc-600">Hospital Portal</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 z-[70]">
                  <div className="px-4 py-3 border-b border-zinc-200">
                    <p className="text-sm font-semibold text-zinc-900">
                      {hospital?.Hosp_Name || 'Hospital'}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">Hospital Portal Access</p>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HospitalHeader;
