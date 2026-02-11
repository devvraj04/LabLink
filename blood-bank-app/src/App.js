import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalAuthProvider } from './context/HospitalAuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import HospitalProtectedRoute from './components/HospitalProtectedRoute';
import Layout from './Layout';
import HospitalLayout from './components/layout/HospitalLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPageNew';
import DonorsPage from './pages/DonorsPage';
import RecipientsPage from './pages/RecipientsPage';
import HospitalsPage from './pages/HospitalsPage';

// Hospital Portal Pages
import HospitalRegisterPage from './pages/hospital/HospitalRegisterPage';
import HospitalDashboard from './pages/hospital/HospitalDashboardNew';
import HospitalRequestsPage from './pages/hospital/HospitalRequestsPage';
import HospitalChatPage from './pages/hospital/HospitalChatPage';

// Admin Pages
import AdminChatPage from './pages/AdminChatPage';
import AdminRequestsPage from './pages/AdminRequestsPage';

// New Feature Pages
import EmergencySOSPage from './pages/EmergencySOSPageNew';
import CampsPage from './pages/CampsPage';
import BloodStockMapPage from './pages/BloodStockMapPage';
import EnhancedAnalyticsPage from './pages/EnhancedAnalyticsPage';
import LabPatientPage from './pages/LabPatientPage';
import LabTechnicianPage from './pages/LabTechnicianPage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';
import PatientDashboard from './pages/PatientDashboard';
import MedicalRecordPage from './pages/MedicalRecordPage';

// Logout component
const Logout = () => {
  const { logout } = useAuth();
  React.useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <HospitalAuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Login Route - No Layout */}
              <Route path="/login" element={<LoginPage />} />

              {/* Hospital Portal Routes */}
              <Route path="/hospital/register" element={<HospitalRegisterPage />} />

              {/* Hospital Protected Routes - With Hospital Layout */}
              <Route
                path="/hospital"
                element={
                  <HospitalProtectedRoute>
                    <HospitalLayout />
                  </HospitalProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/hospital/dashboard" replace />} />
                <Route path="dashboard" element={<HospitalDashboard />} />
                <Route path="requests" element={<HospitalRequestsPage />} />
                <Route path="chat" element={<HospitalChatPage />} />
              </Route>

              {/* Logout Route - Clears session and redirects to login */}
              <Route path="/logout" element={<Logout />} />

              {/* Protected Routes - With Layout */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="donors" element={<DonorsPage />} />
                <Route path="recipients" element={<RecipientsPage />} />
                <Route path="hospitals" element={<HospitalsPage />} />
                <Route path="chat" element={<AdminChatPage />} />
                <Route path="requests" element={<AdminRequestsPage />} />

                {/* New Feature Routes */}
                <Route path="emergency" element={<EmergencySOSPage />} />
                <Route path="camps" element={<CampsPage />} />
                <Route path="map" element={<BloodStockMapPage />} />
                <Route path="analytics" element={<EnhancedAnalyticsPage />} />
                <Route path="lab-patient" element={<PatientDashboard />} />
                <Route path="lab-catalog" element={<LabPatientPage />} />
                <Route path="medical-record" element={<MedicalRecordPage />} />
                <Route path="lab-technician" element={<LabTechnicianPage />} />
                <Route path="patient-registration" element={<PatientRegistrationPage />} />
              </Route>

              {/* Legacy route redirects */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/inventory" element={<Navigate to="/app/inventory" replace />} />
              <Route path="/donors" element={<Navigate to="/app/donors" replace />} />
              <Route path="/recipients" element={<Navigate to="/app/recipients" replace />} />
              <Route path="/hospitals" element={<Navigate to="/app/hospitals" replace />} />
              <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
              <Route path="/requests" element={<Navigate to="/app/requests" replace />} />
              <Route path="/emergency" element={<Navigate to="/app/emergency" replace />} />
              <Route path="/camps" element={<Navigate to="/app/camps" replace />} />
              <Route path="/map" element={<Navigate to="/app/map" replace />} />
              <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </HospitalAuthProvider>
    </AuthProvider>
  );
}

export default App;