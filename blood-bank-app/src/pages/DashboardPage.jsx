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
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Error Loading Dashboard</p>
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-150 text-sm font-medium shadow-sm flex items-center gap-2"
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
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">Overview</h3>
        <p className="text-zinc-600">Welcome to the Blood Bank Management System Dashboard</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Blood Group Inventory</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.byBloodGroup && typeof stats.byBloodGroup === 'object' && !Array.isArray(stats.byBloodGroup) ? (
                Object.entries(stats.byBloodGroup).map(([bloodGroup, count]) => (
                  <div 
                    key={bloodGroup} 
                    className={`p-4 rounded-lg border transition-all duration-150 ${
                      count < 5 
                        ? 'bg-red-50 border-red-200 shadow-sm' 
                        : 'bg-emerald-50 border-emerald-200 shadow-sm'
                    }`}
                  >
                    <div className="text-2xl font-bold text-zinc-900">{bloodGroup}</div>
                    <div className="text-sm text-zinc-600 mt-1">{count} units</div>
                    {count < 5 && (
                      <div className="flex items-center gap-1 text-xs text-red-700 mt-2 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock!
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-8">
                  <Droplets className="mx-auto h-12 w-12 text-zinc-400" />
                  <p className="mt-2 text-sm text-zinc-500">No blood group data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button 
                onClick={() => navigate('/inventory')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Blood Unit</span>
              </button>
              <button 
                onClick={() => navigate('/donors')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Register Donor</span>
              </button>
              <button 
                onClick={() => navigate('/recipients')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                <span>Manage Recipients</span>
              </button>
              <button 
                onClick={() => navigate('/camps')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <Tent className="h-5 w-5" />
                <span>Donation Camps</span>
              </button>
              <button 
                onClick={() => navigate('/blood-requests')}
                className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <FileText className="h-5 w-5" />
                <span>Blood Requests</span>
              </button>
              <button 
                onClick={() => navigate('/emergencies')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Emergencies</span>
              </button>
              <button 
                onClick={() => navigate('/hospitals')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <Building2 className="h-5 w-5" />
                <span>Hospitals</span>
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-150 shadow-sm flex items-center justify-center gap-2"
              >
                <Droplets className="h-5 w-5" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          {/* Low Stock Alert */}
          {stats.lowStockGroups.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900">Low Stock Alert</h3>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>The following blood groups are running low: <span className="font-semibold">{stats.lowStockGroups.join(', ')}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 bg-white rounded-lg border border-zinc-200 text-center">
          <Droplets className="mx-auto h-16 w-16 text-zinc-400" />
          <p className="mt-4 text-lg font-medium text-zinc-900">No statistics available</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
