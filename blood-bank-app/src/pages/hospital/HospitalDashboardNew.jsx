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
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      fulfilled: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      cancelled: 'bg-zinc-100 text-zinc-700 border-zinc-200'
    };
    return colors[status] || colors.pending;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      routine: 'text-zinc-600',
      urgent: 'text-amber-600',
      emergency: 'text-red-600'
    };
    return colors[urgency] || colors.routine;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading dashboard...</p>
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
                View All
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
                  <div key={request._id} className="px-6 py-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Droplets className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{request.bloodGroup}</p>
                          <p className="text-sm text-zinc-600">{request.quantity} units</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency?.charAt(0).toUpperCase() + request.urgency?.slice(1)}
                      </span>
                      <span className="text-zinc-500">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    {request.reason && (
                      <p className="text-sm text-zinc-600 mt-2 line-clamp-1">{request.reason}</p>
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
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-4 border-b border-zinc-200">
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Blood Inventory
              </h2>
              <p className="text-sm text-zinc-600 mt-1">Currently available</p>
            </div>

            <div className="p-6">
              {inventory.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500">No inventory received yet</p>
                  <p className="text-sm text-zinc-400 mt-1">Request blood to build your inventory</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {inventory.map((item) => (
                    <div
                      key={item.bloodGroup}
                      className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-cyan-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-bold text-red-600">{item.bloodGroup}</span>
                        <Droplets className="h-5 w-5 text-red-400" />
                      </div>
                      <p className="text-sm text-zinc-600">{item.quantity} units</p>
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
            <p className="text-cyan-100 text-sm mb-4">
              Contact admin for urgent blood requests or queries
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
