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
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';

const HospitalDashboard = () => {
  const { hospital } = useHospitalAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch request stats
      const statsResponse = await hospitalRequestsAPI.getStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent requests
      const requestsResponse = await hospitalRequestsAPI.getAll({ limit: 5 });
      if (requestsResponse.data.success) {
        setRecentRequests(requestsResponse.data.data);
      }

      // Fetch hospital inventory
      const inventoryResponse = await hospitalRequestsAPI.getInventorySummary();
      if (inventoryResponse.data.success) {
        setInventory(inventoryResponse.data.data.inventory || []);
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
    <div className="space-y-8 pb-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-32 w-80 h-80 bg-teal-300/10 dark:bg-teal-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-emerald-300/10 dark:bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 right-20 w-96 h-96 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Premium Gradient Header */}
      <div className="relative">
        <div className="glass-card bg-gradient-to-r from-cyan-500/25 via-teal-500/20 to-emerald-500/25 dark:from-cyan-500/10 dark:via-teal-500/5 dark:to-emerald-500/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-300/30 dark:from-emerald-500/15 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-300 bg-clip-text text-transparent mb-2">Welcome, {hospital?.Hosp_Name}!</h1>
            <p className="text-zinc-700 dark:text-gray-300 font-semibold text-lg">Manage blood requests and inventory with precision</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"></span>
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">
          <StatCard
            title="Total Requests"
            value={stats?.totalRequests || 0}
            detail="All time requests"
            icon={FileText}
            iconColor="text-cyan-600"
          />
          <StatCard
            title="Pending"
            value={stats?.pendingRequests || 0}
            detail="Awaiting approval"
            icon={Clock}
            iconColor="text-amber-600"
          />
          <StatCard
            title="Fulfilled"
            value={stats?.fulfilledRequests || 0}
            detail="Completed requests"
            icon={CheckCircle}
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Fulfillment Rate"
            value={`${stats?.fulfillmentRate || 0}%`}
            detail="Success rate"
            icon={TrendingUp}
            iconColor="text-cyan-600"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="glass-card bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/30 dark:to-gray-900/30 rounded-3xl shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-teal-500/10 dark:from-cyan-500/5 dark:to-teal-500/5">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                Recent Requests
              </h2>
              <Link 
                to="/hospital/requests" 
                className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold transition-colors"
              >
                View All →
              </Link>
            </div>
            
            <div className="divide-y divide-white/10 dark:divide-white/5">
              {recentRequests.length === 0 ? (
                <div className="px-8 py-16 text-center">
                  <FileText className="h-16 w-16 text-zinc-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-zinc-600 dark:text-gray-400 font-semibold">No requests yet</p>
                  <Link 
                    to="/hospital/requests" 
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-700 dark:to-teal-700 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-1 text-sm font-bold shadow-lg"
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
                      <span className={`font-bold ${getUrgencyColor(request.urgency)}`}>
                        🚨 {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
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
                      className="group glass-card bg-gradient-to-br from-red-500/20 to-red-600/10 dark:from-red-500/10 dark:to-red-600/5 rounded-xl p-4 border border-red-300/50 dark:border-red-400/30 hover:border-red-400 dark:hover:border-red-300 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 cursor-pointer hover:scale-105"
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

          {/* Quick Actions */}
          <div className="glass-card bg-gradient-to-br from-purple-500/25 to-pink-500/15 dark:from-purple-500/10 dark:to-pink-500/5 rounded-3xl shadow-xl border border-white/20 dark:border-white/10 backdrop-blur-xl overflow-hidden p-6">
            <h3 className="font-black text-zinc-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Quick Support
            </h3>
            <p className="text-zinc-700 dark:text-gray-300 text-sm mb-5 font-semibold">
              Need help? Contact admin for urgent requests
            </p>
            <Link 
              to="/hospital/chat" 
              className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 text-center font-bold shadow-lg text-sm"
            >
              Open Chat →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
