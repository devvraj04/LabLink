import React, { useState, useEffect } from 'react';
import { Droplet, Users, Heart, TrendingUp, AlertCircle, Activity, Calendar, Award } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, gradient, iconBg }) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 ${gradient}`}>
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90 font-medium">{title}</p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-4xl font-bold mb-1">{value}</h3>
        <p className="text-sm opacity-90">{subtitle}</p>
      </div>
    </div>
    <div className="absolute bottom-0 right-0 opacity-10">
      <Icon className="h-32 w-32 transform translate-x-8 translate-y-8" />
    </div>
  </div>
);

const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = "#14b8a6" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-xs text-gray-600">Complete</span>
      </div>
    </div>
  );
};

const BloodGroupCard = ({ bloodGroup, units, total, color }) => {
  const percentage = (units / total) * 100;
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Droplet className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{units}</p>
          <p className="text-xs text-gray-600">units</p>
        </div>
      </div>
      <div className="mb-2">
        <p className="text-sm font-bold text-gray-900">{bloodGroup}</p>
        <p className="text-xs text-gray-600">Blood Type</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color.replace('bg-', 'bg-')}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

const DashboardPageNew = () => {
  const [stats, setStats] = useState({
    totalDonors: 247,
    totalUnits: 189,
    activeRequests: 12,
    todaysDonations: 8
  });

  const bloodGroups = [
    { type: 'A+', units: 45, total: 60, color: 'bg-red-500' },
    { type: 'O+', units: 52, total: 60, color: 'bg-orange-500' },
    { type: 'B+', units: 28, total: 60, color: 'bg-blue-500' },
    { type: 'AB+', units: 15, total: 60, color: 'bg-purple-500' },
    { type: 'A-', units: 12, total: 60, color: 'bg-pink-500' },
    { type: 'O-', units: 18, total: 60, color: 'bg-indigo-500' },
    { type: 'B-', units: 10, total: 60, color: 'bg-teal-500' },
    { type: 'AB-', units: 9, total: 60, color: 'bg-cyan-500' },
  ];

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-gray-600 text-lg">Here's what's happening with your blood bank today</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Blood Units"
          value={stats.totalUnits}
          subtitle="Available in inventory"
          icon={Droplet}
          gradient="bg-gradient-to-br from-primary-500 to-primary-700 text-white"
          iconBg="bg-white/20"
        />
        <StatCard
          title="Active Donors"
          value={stats.totalDonors}
          subtitle="Registered donors"
          icon={Users}
          gradient="bg-gradient-to-br from-accent-400 to-accent-500 text-gray-900"
          iconBg="bg-white/30"
        />
        <StatCard
          title="Pending Requests"
          value={stats.activeRequests}
          subtitle="Awaiting approval"
          icon={Heart}
          gradient="bg-gradient-to-br from-pink-500 to-rose-600 text-white"
          iconBg="bg-white/20"
        />
        <StatCard
          title="Today's Donations"
          value={stats.todaysDonations}
          subtitle="Collected today"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
          iconBg="bg-white/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Blood Inventory Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Blood Inventory</h2>
              <p className="text-gray-600">Current stock levels by blood type</p>
            </div>
            <Activity className="h-8 w-8 text-primary-600" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {bloodGroups.map((group) => (
              <BloodGroupCard key={group.type} bloodGroup={group.type} units={group.units} total={group.total} color={group.color} />
            ))}
          </div>
        </div>

        {/* Donation Goal */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 shadow-card text-white">
          <h2 className="text-2xl font-bold mb-4">Monthly Goal</h2>
          <div className="flex justify-center mb-4">
            <ProgressRing percentage={72} color="#facc15" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold">180/250</p>
            <p className="text-sm opacity-90">Donations this month</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm opacity-90">70 more to reach your goal!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Alerts */}
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Urgent Alerts</h2>
              <p className="text-sm text-gray-600">Critical stock levels</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { type: 'AB-', units: 9, status: 'critical' },
              { type: 'B-', units: 10, status: 'low' },
              { type: 'A-', units: 12, status: 'low' }
            ].map((alert) => (
              <div key={alert.type} className="flex items-center justify-between p-3 bg-red-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {alert.type}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{alert.units} units remaining</p>
                    <p className="text-xs text-red-600 capitalize">{alert.status} level</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
                  Request
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-2xl">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-600">Latest donations & requests</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'John Smith', action: 'donated', type: 'O+', time: '10 mins ago', icon: Droplet, color: 'bg-green-100 text-green-600' },
              { name: 'City Hospital', action: 'requested', type: 'AB-', time: '25 mins ago', icon: Heart, color: 'bg-blue-100 text-blue-600' },
              { name: 'Emma Wilson', action: 'donated', type: 'A+', time: '1 hour ago', icon: Droplet, color: 'bg-green-100 text-green-600' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-xl ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{activity.name}</p>
                  <p className="text-xs text-gray-600">{activity.action} {activity.type}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageNew;
