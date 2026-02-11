import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ title, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role) => {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/20">
        {role}
      </span>
    );
  };

  return (
    <div className="header-glass px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button for Mobile */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-white/60 hover:text-white focus:outline-none p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-white/90 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-2 justify-end">
            <p className="text-sm font-medium text-white/90">{user?.name || 'User'}</p>
            {user?.role && getRoleBadge(user.role)}
          </div>
          <p className="text-xs text-white/50 mt-0.5">{user?.email || ''}</p>
        </div>

        <div className="relative z-50">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {getInitials(user?.name)}
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 z-[70] rounded-xl overflow-hidden border border-white/15"
                style={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                }}
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-medium text-white/90">{user?.name || 'User'}</p>
                  <p className="text-xs text-white/50 mt-0.5">{user?.email || ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 text-white/50" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
