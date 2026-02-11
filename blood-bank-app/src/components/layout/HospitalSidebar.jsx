import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, X, Building2 } from 'lucide-react';

const HospitalSidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
    { name: 'My Requests', path: '/hospital/requests', icon: Package },
    { name: 'Chat with Admin', path: '/hospital/chat', icon: MessageSquare },
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
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Hospital Portal</span>
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
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-5 border-t border-white/10">
          <p className="text-xs text-white/50">© 2024 HealthTech</p>
          <p className="text-xs text-white/30 mt-0.5">Hospital Portal v2.0</p>
        </div>
      </div>
    </>
  );
};

export default HospitalSidebar;
