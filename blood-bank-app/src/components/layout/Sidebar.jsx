import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Droplets, Users, Heart, Building2, MessageSquare,
  Package, X, AlertCircle, Tent, Map, BarChart3, Microscope,
  FlaskConical, UserPlus, Activity,
} from 'lucide-react';
import { adminHospitalsAPI } from '../../services/api';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [pendingHospitalsCount, setPendingHospitalsCount] = useState(0);
  const location = useLocation();

  // Determine if current user is a patient
  const getUserRole = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.role || 'admin';
      }
    } catch (e) { /* ignore */ }
    return 'admin';
  };

  const userRole = getUserRole();
  const isPatient = userRole === 'patient';

  useEffect(() => {
    if (isPatient) return;
    fetchPendingHospitals();
    const interval = setInterval(fetchPendingHospitals, 30000);
    return () => clearInterval(interval);
  }, [isPatient]);

  const fetchPendingHospitals = async () => {
    try {
      const response = await adminHospitalsAPI.getPending();
      if (response.data.success) {
        setPendingHospitalsCount(response.data.data.length);
      }
    } catch (err) {
      console.error('Error fetching pending hospitals:', err);
    }
  };

  // Full admin nav items
  const adminNavItems = [
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

  // Patient-only nav items
  const patientNavItems = [
    { name: 'My Dashboard', path: '/app/lab-patient', icon: LayoutDashboard },
    { name: 'Book Lab Test', path: '/app/lab-catalog', icon: FlaskConical },
    { name: 'My Medical Record', path: '/app/medical-record', icon: Activity },
    { name: 'Donation Camps', path: '/app/camps', icon: Tent },
  ];

  const navItems = isPatient ? patientNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Glassmorphism Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 z-30 flex flex-col overflow-hidden
          sidebar-glass text-white
          rounded-r-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400/30 to-cyan-400/20 border border-white/15 shadow-glow-teal">
              <Heart className="h-5 w-5 text-teal-300" />
            </div>
            <span className="text-lg font-semibold text-white/90 tracking-tight">
              LabLink
            </span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-200"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isPatient && (
          <div className="px-5 py-3 border-b border-white/10 flex-shrink-0">
            <p className="text-[11px] font-medium uppercase tracking-widest text-teal-300/70">
              Patient Portal
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-3 px-3 space-y-0.5 flex-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={`
                  group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 ease-out relative
                  ${isActive
                    ? 'sidebar-active-glow text-white'
                    : 'sidebar-item-hover text-white/60 hover:text-white/90'
                  }
                `}
              >
                <Icon
                  className={`h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-teal-300' : 'text-white/50 group-hover:text-white/80'
                  }`}
                />
                <span className="flex-1 truncate">{item.name}</span>
                {item.path === '/app/hospitals' && pendingHospitalsCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/90 text-white text-[10px] font-bold rounded-full animate-pulse shadow-lg shadow-amber-500/30">
                    {pendingHospitalsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex-shrink-0">
          <p className="text-[11px] text-white/40">© 2026 LabLink</p>
          <p className="text-[10px] text-white/25 mt-0.5">v2.1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
