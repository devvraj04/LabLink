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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal-400 mx-auto mb-4 animate-spin" />
          <p className="text-white/60 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 backdrop-blur-xl border border-red-400/20 text-red-300 rounded-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold mb-1 text-red-200">Error Loading Dashboard</p>
            <p className="text-sm text-red-300/80">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/20 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium backdrop-blur-md flex items-center gap-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Overview</h3>
        <p className="text-white/60">Welcome to the Blood Bank Management System Dashboard</p>
      </div>

      {stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Blood Group Inventory Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Blood Group Inventory</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.byBloodGroup && typeof stats.byBloodGroup === 'object' && !Array.isArray(stats.byBloodGroup) ? (
                Object.entries(stats.byBloodGroup).map(([bloodGroup, count]) => (
                  <div 
                    key={bloodGroup} 
                    className={`p-4 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-[1.03] ${
                      count < 5 
                        ? 'bg-red-500/10 border-red-400/20 shadow-lg shadow-red-500/10' 
                        : 'bg-emerald-500/10 border-emerald-400/20 shadow-lg shadow-emerald-500/10'
                    }`}
                  >
                    <div className="text-2xl font-bold text-white">{bloodGroup}</div>
                    <div className="text-sm text-white/60 mt-1">{count} units</div>
                    {count < 5 && (
                      <div className="flex items-center gap-1 text-xs text-red-300 mt-2 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock!
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8">
                  <Droplets className="mx-auto h-12 w-12 text-white/30" />
                  <p className="mt-2 text-sm text-white/50">No blood group data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button 
                onClick={() => navigate('/inventory')}
                className="bg-blue-500/15 hover:bg-blue-500/25 text-blue-200 border border-blue-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Plus className="h-5 w-5" />
                <span>Add Blood Unit</span>
              </button>
              <button 
                onClick={() => navigate('/donors')}
                className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <UserPlus className="h-5 w-5" />
                <span>Register Donor</span>
              </button>
              <button 
                onClick={() => navigate('/recipients')}
                className="bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <FileText className="h-5 w-5" />
                <span>Manage Recipients</span>
              </button>
              <button 
                onClick={() => navigate('/camps')}
                className="bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Tent className="h-5 w-5" />
                <span>Donation Camps</span>
              </button>
              <button 
                onClick={() => navigate('/blood-requests')}
                className="bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 border border-pink-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-pink-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <FileText className="h-5 w-5" />
                <span>Blood Requests</span>
              </button>
              <button 
                onClick={() => navigate('/emergencies')}
                className="bg-red-500/15 hover:bg-red-500/25 text-red-200 border border-red-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Emergencies</span>
              </button>
              <button 
                onClick={() => navigate('/hospitals')}
                className="bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 border border-teal-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Building2 className="h-5 w-5" />
                <span>Hospitals</span>
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                className="bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/20 font-medium py-3 px-4 rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Droplets className="h-5 w-5" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          {/* Low Stock Alert */}
          {stats.lowStockGroups.length > 0 && (
            <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-4 shadow-xl">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-200">Low Stock Alert</h3>
                  <div className="mt-1 text-sm text-amber-300/80">
                    <p>The following blood groups are running low: <span className="font-semibold text-amber-200">{stats.lowStockGroups.join(', ')}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-center">
          <Droplets className="mx-auto h-16 w-16 text-white/30" />
          <p className="mt-4 text-lg font-medium text-white/70">No statistics available</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
