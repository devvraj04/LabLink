import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

const Layout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/app/dashboard':
        return 'Dashboard';
      case '/app/inventory':
        return 'Blood Inventory';
      case '/app/donors':
        return 'Donors Management';
      case '/app/recipients':
        return 'Recipients Management';
      case '/app/hospitals':
        return 'Hospital Network';
      case '/app/emergency':
        return 'Emergency SOS';

      case '/app/rewards':
        return 'Rewards';
      case '/app/camps':
        return 'Donation Camps';
      case '/app/map':
        return 'Blood Stock Map';
      case '/app/analytics':
        return 'Analytics';
      case '/app/chat':
        return 'Chat';
      case '/app/requests':
        return 'Blood Requests';
      case '/app/lab-patient':
        return 'Lab & Diagnostics';
      case '/app/lab-technician':
        return 'Lab Technician';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen app-background">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
