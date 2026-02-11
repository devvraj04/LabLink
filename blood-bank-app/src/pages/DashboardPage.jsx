import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/ui/StatCard';
import { analyticsAPI } from '../services/api';
import { Droplets, Users, CheckCircle, AlertTriangle, Plus, UserPlus, FileText, Loader2, Building2, Tent } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch comprehensive analytics
      const response = await analyticsAPI.getDashboard();
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Convert inventory byBloodGroup array to object for easier rendering
        const byBloodGroup = {};
        if (data.inventory?.byBloodGroup) {
          data.inventory.byBloodGroup.forEach(item => {
            byBloodGroup[item._id] = item.available || 0;
          });
        }
        
        // Combine stats for dashboard display
        setStats({
          totalUnits: data.inventory?.total || 0,
          donorsThisMonth: data.donors?.thisMonth || 0,
          available: data.inventory?.available || 0,
          byBloodGroup: byBloodGroup,
          lowStockGroups: data.inventory?.lowStockGroups || [],
          expiringUnits: data.inventory?.expiringUnits || 0,
          pendingRequests: data.requests?.pending || 0,
          activeEmergencies: data.emergencies?.active || 0,
          upcomingAppointments: data.appointments?.scheduled || 0,
          totalDonors: data.donors?.total || 0,
          fulfillmentRate: data.requests?.fulfillmentRate || 0
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-3xl animate-float" />
        </div>
        <div className="text-center z-10">
          <Loader2 className="h-12 w-12 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mx-auto mb-4 animate-spin" />
          <p className="text-zinc-700 dark:text-gray-300 font-bold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-500/20 to-red-600/10 dark:from-red-500/10 dark:to-red-600/5 border border-red-300/50 dark:border-red-400/30 text-red-700 dark:text-red-400 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-bold mb-1 text-lg">Error Loading Dashboard</p>
            <p className="text-sm text-red-600/80 dark:text-red-300/80">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-sm font-bold shadow-md flex items-center gap-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-32 w-80 h-80 bg-teal-300/10 dark:bg-teal-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 right-20 w-96 h-96 bg-emerald-300/10 dark:bg-emerald-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Premium Header with Gradient */}
      <div className="relative">
        <div className="glass-card bg-gradient-to-r from-blue-500/20 via-teal-500/15 to-cyan-500/20 dark:from-blue-500/10 dark:via-teal-500/5 dark:to-cyan-500/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-300/20 dark:from-cyan-500/10 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 dark:from-cyan-400 dark:via-teal-300 dark:to-blue-300 bg-clip-text text-transparent mb-2">Dashboard</h1>
            <p className="text-zinc-700 dark:text-gray-300 font-semibold text-lg">Welcome back to LabLink Management System</p>
          </div>
        </div>
      </div>

      {stats ? (
        <>
          {/* Primary Stats Grid - Red Hot Heat */}
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></span>
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">
              <StatCard
                title="Total Blood Units"
                value={stats.totalUnits}
                detail="Available in inventory"
                icon={Droplets}
                iconColor="text-red-600"
              />
              <StatCard
                title="Donors This Month"
                value={stats.donorsThisMonth}
                detail={`Total: ${stats.totalDonors || 0}`}
                icon={Users}
                iconColor="text-blue-600"
              />
              <StatCard
                title="Available Units"
                value={stats.available}
                detail="Ready for transfusion"
                icon={CheckCircle}
                iconColor="text-emerald-600"
              />
              <StatCard
                title="Low Stock Groups"
                value={stats.lowStockGroups.length}
                detail={stats.lowStockGroups.length > 0 ? stats.lowStockGroups.join(', ') : 'All stocked'}
                icon={AlertTriangle}
                iconColor={stats.lowStockGroups.length > 0 ? 'text-amber-600' : 'text-zinc-400'}
              />
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
              Activity & Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">
              <StatCard
                title="Pending Requests"
                value={stats.pendingRequests}
                detail="Awaiting fulfillment"
                icon={FileText}
                iconColor="text-purple-600"
              />
              <StatCard
                title="Active Emergencies"
                value={stats.activeEmergencies}
                detail="Urgent attention needed"
                icon={AlertTriangle}
                iconColor="text-red-600"
              />
              <StatCard
                title="Donation Camps"
                value={stats.camps || 0}
                detail="Scheduled donations"
                icon={Tent}
                iconColor="text-blue-600"
              />
              <StatCard
                title="Expiring Soon"
                value={stats.expiringUnits}
                detail="Within 7 days"
                icon={AlertTriangle}
                iconColor="text-orange-600"
              />
            </div>
          </div>

          {/* Blood Group Inventory - Premium Card */}
          <div className="glass-card bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 dark:from-emerald-500/10 dark:to-cyan-500/5 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Droplets className="w-6 h-6 text-red-500" />
              Blood Group Inventory
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.byBloodGroup && typeof stats.byBloodGroup === 'object' && !Array.isArray(stats.byBloodGroup) ? (
                Object.entries(stats.byBloodGroup).map(([bloodGroup, count]) => (
                  <div 
                    key={bloodGroup} 
                    className={`group glass-card rounded-2xl p-5 border backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                      count < 5 
                        ? 'bg-gradient-to-br from-red-500/25 to-red-600/15 dark:from-red-500/15 dark:to-red-600/10 border-red-300/50 dark:border-red-400/30 hover:shadow-lg hover:shadow-red-500/20' 
                        : 'bg-gradient-to-br from-emerald-500/25 to-teal-600/15 dark:from-emerald-500/15 dark:to-teal-600/10 border-emerald-300/50 dark:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/20'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-black bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-1">{bloodGroup}</div>
                      <div className="text-xs font-bold text-zinc-600 dark:text-gray-400 uppercase tracking-wide mb-2">{count} units</div>
                      {count < 5 && (
                        <div className="flex items-center justify-center gap-1 text-xs text-red-700 dark:text-red-400 font-bold bg-red-100/50 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                          <AlertTriangle className="h-3 w-3" />
                          LOW STOCK
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-12">
                  <Droplets className="mx-auto h-16 w-16 text-zinc-300 dark:text-gray-700 mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-gray-400 font-semibold">No blood group data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - Power User Card */}
          <div className="glass-card bg-gradient-to-br from-blue-500/20 to-purple-500/15 dark:from-blue-500/10 dark:to-purple-500/5 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/app/inventory')}
                className="group glass-card bg-gradient-to-br from-blue-500/30 to-cyan-500/20 dark:from-blue-500/15 dark:to-cyan-500/10 hover:from-blue-500/40 hover:to-cyan-500/30 dark:hover:from-blue-500/25 dark:hover:to-cyan-500/15 text-blue-700 dark:text-cyan-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 border border-blue-300/50 dark:border-blue-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Add Blood Unit</span>
              </button>
              <button 
                onClick={() => navigate('/app/donors')}
                className="group glass-card bg-gradient-to-br from-emerald-500/30 to-teal-500/20 dark:from-emerald-500/15 dark:to-teal-500/10 hover:from-emerald-500/40 hover:to-teal-500/30 dark:hover:from-emerald-500/25 dark:hover:to-teal-500/15 text-emerald-700 dark:text-emerald-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 border border-emerald-300/50 dark:border-emerald-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Register Donor</span>
              </button>
              <button 
                onClick={() => navigate('/app/recipients')}
                className="group glass-card bg-gradient-to-br from-purple-500/30 to-pink-500/20 dark:from-purple-500/15 dark:to-pink-500/10 hover:from-purple-500/40 hover:to-pink-500/30 dark:hover:from-purple-500/25 dark:hover:to-pink-500/15 text-purple-700 dark:text-purple-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 border border-purple-300/50 dark:border-purple-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Manage Recipients</span>
              </button>
              <button 
                onClick={() => navigate('/app/camps')}
                className="group glass-card bg-gradient-to-br from-indigo-500/30 to-blue-500/20 dark:from-indigo-500/15 dark:to-blue-500/10 hover:from-indigo-500/40 hover:to-blue-500/30 dark:hover:from-indigo-500/25 dark:hover:to-blue-500/15 text-indigo-700 dark:text-indigo-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20 border border-indigo-300/50 dark:border-indigo-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <Tent className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Donation Camps</span>
              </button>
              <button 
                onClick={() => navigate('/app/requests')}
                className="group glass-card bg-gradient-to-br from-pink-500/30 to-rose-500/20 dark:from-pink-500/15 dark:to-rose-500/10 hover:from-pink-500/40 hover:to-rose-500/30 dark:hover:from-pink-500/25 dark:hover:to-rose-500/15 text-pink-700 dark:text-pink-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 border border-pink-300/50 dark:border-pink-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Blood Requests</span>
              </button>
              <button 
                onClick={() => navigate('/app/emergency')}
                className="group glass-card bg-gradient-to-br from-red-500/30 to-orange-500/20 dark:from-red-500/15 dark:to-orange-500/10 hover:from-red-500/40 hover:to-orange-500/30 dark:hover:from-red-500/25 dark:hover:to-orange-500/15 text-red-700 dark:text-orange-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20 border border-red-300/50 dark:border-red-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <AlertTriangle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Emergencies</span>
              </button>
              <button 
                onClick={() => navigate('/app/hospitals')}
                className="group glass-card bg-gradient-to-br from-teal-500/30 to-cyan-500/20 dark:from-teal-500/15 dark:to-cyan-500/10 hover:from-teal-500/40 hover:to-cyan-500/30 dark:hover:from-teal-500/25 dark:hover:to-cyan-500/15 text-teal-700 dark:text-teal-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/20 border border-teal-300/50 dark:border-teal-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <Building2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Hospitals</span>
              </button>
              <button 
                onClick={() => navigate('/app/analytics')}
                className="group glass-card bg-gradient-to-br from-cyan-500/30 to-blue-500/20 dark:from-cyan-500/15 dark:to-blue-500/10 hover:from-cyan-500/40 hover:to-blue-500/30 dark:hover:from-cyan-500/25 dark:hover:to-blue-500/15 text-cyan-700 dark:text-blue-400 font-bold py-4 px-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20 border border-cyan-300/50 dark:border-cyan-400/30 flex items-center justify-center gap-2 text-sm"
              >
                <Droplets className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          {/* Low Stock Alert - Prominent Warning */}
          {stats.lowStockGroups.length > 0 && (
            <div className="glass-card bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-red-500/15 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-red-500/5 rounded-2xl p-6 border border-amber-300/50 dark:border-amber-400/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-slow">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100/50 dark:bg-amber-900/30">
                    <AlertTriangle className="h-6 w-6 text-amber-700 dark:text-amber-400 animate-bounce" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-amber-900 dark:text-amber-300">⚠️ Low Stock Alert</h3>
                  <div className="mt-2 text-sm text-amber-800 dark:text-amber-200 font-semibold">
                    <p>The following blood groups are critically low: <span className="font-black text-amber-900 dark:text-amber-100">{stats.lowStockGroups.join(', ')}</span></p>
                    <p className="mt-1 text-xs opacity-75">Immediate action recommended to maintain inventory levels.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card bg-gradient-to-br from-zinc-500/20 to-gray-500/10 dark:from-zinc-500/10 dark:to-gray-500/5 rounded-3xl p-16 border border-white/20 dark:border-white/10 text-center shadow-xl">
          <Droplets className="mx-auto h-20 w-20 text-zinc-400 dark:text-gray-600 mb-4" />
          <p className="text-xl font-bold text-zinc-900 dark:text-white">No statistics available</p>
          <p className="text-zinc-600 dark:text-gray-400 mt-2">Try refreshing the page to load data</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
