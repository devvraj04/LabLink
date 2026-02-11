import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Droplets, AlertCircle, Calendar, Award } from 'lucide-react';
import { analyticsAPI } from '../services/api';

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const EnhancedAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Parse analytics data
  const inventoryData = analytics?.inventory?.byBloodGroup?.map(item => ({
    _id: item._id,
    totalUnits: item.total || 0,
    available: item.available || 0,
    reserved: item.reserved || 0,
    used: item.used || 0
  })) || [];
  
  const donationTrends = analytics?.donations?.trends?.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    count: item.count
  })) || [];
  
  const topDonors = analytics?.donors?.topDonors?.map((donor, idx) => {
    // Handle different donor data structures
    const donorName = donor.donorName || 
                      donor.donorId?.Bd_Name || 
                      donor.donorId?.name || 
                      donor.name || 
                      `Donor #${idx + 1}`;
    const bloodGroup = donor.bloodGroup || 
                       donor.donorId?.Bd_Bgroup || 
                       donor.donorId?.bloodGroup || 
                       'N/A';
    const donationCount = donor.donationCount || 
                          donor.totalDonations || 
                          donor.count || 
                          0;
    
    return {
      donorName,
      bloodGroup,
      donationCount,
      totalPoints: donor.totalPoints || 0
    };
  }).filter(donor => donor.donationCount > 0) || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          Enhanced Analytics Dashboard
        </h1>
        <p className="text-zinc-600 mt-1">Comprehensive insights and data visualization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Droplets className="h-8 w-8" />
            <span className="text-sm opacity-80">Total Units</span>
          </div>
          <div className="text-3xl font-bold">{analytics?.inventory?.total || 0}</div>
          <div className="text-sm opacity-90 mt-1">Available: {analytics?.inventory?.available || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8" />
            <span className="text-sm opacity-80">Active Donors</span>
          </div>
          <div className="text-3xl font-bold">{analytics?.donors?.total || 0}</div>
          <div className="text-sm opacity-90 mt-1">This Month: {analytics?.donors?.thisMonth || 0}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8" />
            <span className="text-sm opacity-80">Appointments</span>
          </div>
          <div className="text-3xl font-bold">{analytics?.appointments?.total || 0}</div>
          <div className="text-sm opacity-90 mt-1">
            Scheduled: {analytics?.appointments?.scheduled || 0}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm opacity-80">Emergencies</span>
          </div>
          <div className="text-3xl font-bold">{analytics?.emergencies?.total || 0}</div>
          <div className="text-sm opacity-90 mt-1">
            Active: {analytics?.emergencies?.active || 0}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Blood Inventory Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Blood Inventory by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalUnits" fill="#3B82F6" name="Total Units" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Group Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Blood Group Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryData}
                dataKey="totalUnits"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}: ${entry.totalUnits}`}
              >
                {inventoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Donation Trends Line Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Donation Trends (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={donationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} name="Donations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Donors */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Top Donors
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {topDonors.length > 0 ? (
              topDonors.slice(0, 10).map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-zinc-400' : idx === 2 ? 'bg-orange-600' : 'bg-zinc-300'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">{donor.donorName}</div>
                      <div className="text-xs text-zinc-600">{donor.bloodGroup}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{donor.donationCount}</div>
                    <div className="text-xs text-zinc-600">donations</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No donor data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            Low Stock Alerts
          </h2>
          {analytics?.inventory?.lowStockGroups && analytics.inventory.lowStockGroups.length > 0 ? (
            <div className="space-y-2">
              {analytics.inventory.byBloodGroup
                ?.filter(item => analytics.inventory.lowStockGroups.includes(item._id))
                .map((alert, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{alert._id}</span>
                      <span className="text-red-600 font-bold">{alert.available} units</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">⚠️ Critical: Below 5 units</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No low stock alerts</p>
          )}
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-600">
            <Calendar className="h-6 w-6" />
            Expiring Soon (7 Days)
          </h2>
          {analytics?.inventory?.expiringUnits > 0 ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-600">{analytics.inventory.expiringUnits}</div>
              <p className="text-sm text-orange-700 mt-2">Units expiring within 7 days</p>
              <p className="text-xs text-orange-600 mt-1">Action required to prevent wastage</p>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No units expiring soon</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsPage;
