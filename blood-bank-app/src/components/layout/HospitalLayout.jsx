import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HospitalSidebar from './HospitalSidebar';
import HospitalHeader from './HospitalHeader';

const HospitalLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/hospital/dashboard':
        return 'Hospital Dashboard';
      case '/hospital/requests':
        return 'Blood Requests';
      case '/hospital/chat':
        return 'Chat with Admin';
      default:
        return 'Hospital Portal';
    }
  };

  return (
    <div className="flex h-screen app-background">
      <HospitalSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        <HospitalHeader title={getPageTitle()} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HospitalLayout;
