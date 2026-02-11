import React, { useState, useEffect } from 'react';
import { useHospitalAuth } from '../../context/HospitalAuthContext';
import { hospitalRequestsAPI } from '../../services/api';
import {
  Droplets,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Package,
  MessageSquare,
  Plus,
  Users,
  DollarSign,
  Activity,
  Heart,
  Siren,
  CalendarCheck,
  TestTubes
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';

const HospitalDashboard = () => {
  const { hospital } = useHospitalAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy stats for dashboard
  const dummyStats = {
    totalPatients: 1247,
    avgRevenue: '₹4,85,000',
    totalDonors: 342,
    totalRecipients: 198,
    bloodUnitsAvailable: 156,
    pendingLabTests: 23,
    activeCamps: 3,
    emergencyAlerts: 2,
    monthlyTransfusions: 87,
    satisfactionRate: '94%',
    bedOccupancy: '78%',
    avgWaitTime: '12 min',
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch request stats
      try {
        const statsResponse = await hospitalRequestsAPI.getStats();
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
      } catch (e) {
        console.log('Stats API not available, using defaults');
      }

      // Fetch recent requests
      try {
        const requestsResponse = await hospitalRequestsAPI.getAll({ limit: 5 });
        if (requestsResponse.data.success) {
          setRecentRequests(requestsResponse.data.data);
        }
      } catch (e) {
        console.log('Requests API not available');
      }

      // Fetch hospital inventory
      try {
        const inventoryResponse = await hospitalRequestsAPI.getInventorySummary();
        if (inventoryResponse.data.success) {
          setInventory(inventoryResponse.data.data.inventory || []);
        }
      } catch (e) {
        console.log('Inventory API not available');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100/60 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-400/30',
      approved: 'bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/30',
      rejected: 'bg-red-100/60 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-400/30',
      fulfilled: 'bg-cyan-100/60 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-400/30',
      cancelled: 'bg-zinc-100/60 dark:bg-zinc-700/30 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-600/30'
    };
    return colors[status] || colors.pending;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      routine: 'text-zinc-600 dark:text-gray-400',
      urgent: 'text-amber-600 dark:text-amber-400',
      emergency: 'text-red-600 dark:text-red-400'
    };
    return colors[urgency] || colors.routine;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-300/20 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-3xl animate-float" />
        </div>
        <div className="text-center z-10">
          <div className="w-16 h-16 border-4 border-gradient-to-r from-cyan-600 to-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-700 dark:text-gray-300 font-bold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome, {hospital?.Hosp_Name || hospital?.name}!</h2>
        <p className="text-cyan-100">Manage your hospital — blood bank, patients, labs and more from one place.</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={dummyStats.totalPatients}
          detail="All registered patients"
          icon={Users}
          iconColor="text-cyan-600"
        />
        <StatCard
          title="Avg Monthly Revenue"
          value={dummyStats.avgRevenue}
          detail="Last 30 days"
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Donors"
          value={dummyStats.totalDonors}
          detail="Registered donors"
          icon={Heart}
          iconColor="text-red-500"
        />
        <StatCard
          title="Blood Units Available"
          value={dummyStats.bloodUnitsAvailable}
          detail="Across all groups"
          icon={Droplets}
          iconColor="text-red-600"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Request Stats"
          value={stats?.totalRequests || 0}
          detail={`${stats?.pendingRequests || 0} pending`}
          icon={FileText}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pending Lab Tests"
          value={dummyStats.pendingLabTests}
          detail="Awaiting results"
          icon={TestTubes}
          iconColor="text-purple-600"
        />
        <StatCard
          title="Monthly Transfusions"
          value={dummyStats.monthlyTransfusions}
          detail="This month"
          icon={Activity}
          iconColor="text-teal-600"
        />
        <StatCard
          title="Satisfaction Rate"
          value={dummyStats.satisfactionRate}
          detail="Patient feedback"
          icon={TrendingUp}
          iconColor="text-amber-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/hospital/requests"
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-zinc-200 hover:shadow-md hover:border-cyan-300 transition-all"
        >
          <div className="p-3 bg-cyan-100 rounded-lg">
            <FileText className="h-6 w-6 text-cyan-600" />
          </div>
          <span className="text-sm font-medium text-zinc-700">Blood Requests</span>
        </Link>
        <Link
          to="/hospital/inventory"
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-zinc-200 hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="p-3 bg-emerald-100 rounded-lg">
            <Package className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-zinc-700">Inventory</span>
        </Link>
        <Link
          to="/hospital/sos"
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-zinc-200 hover:shadow-md hover:border-red-300 transition-all"
        >
          <div className="p-3 bg-red-100 rounded-lg">
            <Siren className="h-6 w-6 text-red-600" />
          </div>
          <span className="text-sm font-medium text-zinc-700">Emergency SOS</span>
        </Link>
        <Link
          to="/hospital/chat"
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-zinc-200 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-zinc-700">Chat Admin</span>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Recent Blood Requests</h2>
              <Link
                to="/hospital/requests"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                View All →
              </Link>
            </div>

            <div className="divide-y divide-zinc-200">
              {recentRequests.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500">No requests yet</p>
                  <Link
                    to="/hospital/requests"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-colors text-sm font-medium shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Create Request
                  </Link>
                </div>
              ) : (
                recentRequests.map((request) => (
                  <div key={request._id} className="px-8 py-5 hover:bg-white/30 dark:hover:bg-white/5 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-red-500/30 to-red-600/20 dark:from-red-500/15 dark:to-red-600/10 rounded-xl border border-red-300/50 dark:border-red-400/30">
                          <Droplets className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white text-lg">{request.bloodGroup}</p>
                          <p className="text-sm text-zinc-600 dark:text-gray-400">{request.quantity} units</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency?.charAt(0).toUpperCase() + request.urgency?.slice(1)}
                      </span>
                      <span className="text-zinc-500 dark:text-gray-400">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    {request.reason && (
                      <p className="text-sm text-zinc-600 dark:text-gray-400 mt-2 line-clamp-1 group-hover:line-clamp-none transition-all">{request.reason}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Blood Inventory */}
          <div className="glass-card bg-gradient-to-br from-emerald-500/25 to-teal-500/15 dark:from-emerald-500/10 dark:to-teal-500/5 rounded-3xl shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Blood Inventory
              </h2>
              <p className="text-sm text-zinc-600 dark:text-gray-400 mt-1 font-semibold">Currently available</p>
            </div>

            <div className="p-6">
              {inventory.length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="h-14 w-14 text-zinc-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-zinc-600 dark:text-gray-400 font-semibold">No inventory yet</p>
                  <p className="text-sm text-zinc-500 dark:text-gray-500 mt-1">Request blood to build your stock</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {inventory.map((item) => (
                    <div
                      key={item.bloodGroup}
                      className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-cyan-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-500 bg-clip-text text-transparent">{item.bloodGroup}</span>
                        <Droplets className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-sm font-bold text-zinc-600 dark:text-gray-400">{item.quantity} units</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hospital Info & Quick Contact */}
          <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Need Help?
            </h3>
            <p className="text-zinc-700 dark:text-gray-300 text-sm mb-5 font-semibold">
              Need help? Contact admin for urgent requests
            </p>
            <Link
              to="/hospital/chat"
              className="block w-full px-4 py-2 bg-white text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors text-center font-medium"
            >
              Open Chat
            </Link>
          </div>

          {/* Upcoming Camps */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2 mb-3">
              <CalendarCheck className="h-5 w-5 text-teal-600" />
              Upcoming Camps
            </h3>
            <p className="text-sm text-zinc-500 mb-3">View & manage camp registrations</p>
            <Link
              to="/hospital/camps"
              className="block w-full px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors text-center font-medium text-sm"
            >
              View Camps
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
