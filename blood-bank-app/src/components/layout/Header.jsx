import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut } from 'lucide-react';

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
    const styles = role === 'manager'
      ? 'bg-teal-100 text-teal-700'
      : 'bg-cyan-100 text-cyan-700';
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="header-glass px-4 sm:px-6 py-3 flex items-center justify-between relative z-50">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button for Mobile */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-600 hover:text-teal-600 focus:outline-none p-2 hover:bg-white/50 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-2 justify-end">
            <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
            {user?.role && getRoleBadge(user.role)}
          </div>
          <p className="text-xs text-gray-500">{user?.email || ''}</p>
        </div>

        <div className="relative z-50">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2"
          >
            {getInitials(user?.name)}
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl py-1 z-[70] border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email || ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
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
