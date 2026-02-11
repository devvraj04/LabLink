import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Droplets, Users, Heart, Building2, MessageSquare, Package, X, AlertCircle, Tent, Map, BarChart3, Microscope, FlaskConical, UserPlus } from 'lucide-react';
import { adminHospitalsAPI } from '../../services/api';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [pendingHospitalsCount, setPendingHospitalsCount] = useState(0);

  useEffect(() => {
    fetchPendingHospitals();
    // Poll every 30 seconds
    const interval = setInterval(fetchPendingHospitals, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingHospitals = async () => {
    try {
      const response = await adminHospitalsAPI.getPending();
      if (response.data.success) {
        setPendingHospitalsCount(response.data.data.length);
      }
    } catch (err) {
      // Silently fail - don't show error for background polling
      console.error('Error fetching pending hospitals:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/app/inventory', icon: Droplets },
    { name: 'Donors', path: '/app/donors', icon: Users },
    { name: 'Recipients', path: '/app/recipients', icon: Heart },
    { name: 'Hospitals', path: '/app/hospitals', icon: Building2 },
    { name: 'Hospital Chats', path: '/app/chat', icon: MessageSquare },
    { name: 'Blood Requests', path: '/app/requests', icon: Package },
    { name: 'Emergency SOS', path: '/app/emergency', icon: AlertCircle },
    { name: 'Donation Camps', path: '/app/camps', icon: Tent },
    { name: 'Blood Stock Map', path: '/app/map', icon: Map },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { name: 'Lab (Patient)', path: '/app/lab-patient', icon: FlaskConical },
    { name: 'Lab (Technician)', path: '/app/lab-technician', icon: Microscope },
    { name: 'Smart Panjikaran', path: '/app/patient-registration', icon: UserPlus },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        h-screen w-64 sidebar-glass text-white fixed left-0 top-0 overflow-y-auto shadow-2xl z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">HealthTech</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 px-3 space-y-1 flex-1 overflow-y-auto pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.path === '/app/hospitals' && pendingHospitalsCount > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {pendingHospitalsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-5 border-t border-white/10">
          <p className="text-xs text-white/50">© 2024 HealthTech</p>
          <p className="text-xs text-white/30 mt-0.5">v2.0.0</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
