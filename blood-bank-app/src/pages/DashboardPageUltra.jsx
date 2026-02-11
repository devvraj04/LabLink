import React, { useState, useEffect } from 'react';
import { Droplet, Users, Heart, TrendingUp, AlertCircle, Activity, Award, Zap, Target, Clock } from 'lucide-react';

// Circular Progress Component - Responsive
const MassiveProgress = ({ percentage, size = 200, strokeWidth = 16, color = '#14b8a6', label, value, subtitle }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(20,184,166,0.15)"
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
          style={{ filter: `drop-shadow(0 0 10px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-3xl sm:text-4xl font-bold text-gray-800">{value}</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
};

// Glassmorphic Stat Card - Responsive
const GlassCard = ({ icon: Icon, title, value, change, gradient }) => (
  <div className="content-card p-4 sm:p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${change >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {change >= 0 ? '+' : ''}{change}%
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</div>
    </div>
  </div>
);

// Blood Group Card - Responsive
const BloodGroupCardUltra = ({ type, units, total, color }) => {
  const percentage = (units / total) * 100;
  
  return (
    <div className={`relative overflow-hidden rounded-xl p-3 sm:p-4 bg-gradient-to-br ${color} shadow-lg hover:scale-105 hover:-rotate-1 transition-all duration-300 cursor-pointer group`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="text-xl sm:text-2xl font-bold text-white">{type}</div>
          <Droplet className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="text-lg sm:text-xl font-bold text-white">{units}</span>
            <span className="text-xs text-white/60">/ {total}</span>
          </div>
          
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Card - Responsive
const AlertCardPulse = ({ type, units, level }) => {
  const getLevelColor = () => {
    if (level === 'critical') return 'from-red-500 to-red-600';
    if (level === 'low') return 'from-orange-500 to-orange-600';
    return 'from-amber-500 to-amber-600';
  };

  return (
    <div className={`bg-gradient-to-r ${getLevelColor()} rounded-xl p-3 sm:p-4 text-white shadow-lg hover:scale-[1.02] transition-transform duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold">{type}</div>
            <div className="text-xs text-white/80">{units} units left</div>
          </div>
        </div>
        <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase">
          {level}
        </div>
      </div>
    </div>
  );
};

const DashboardPageUltra = () => {
  const [stats, setStats] = useState({
    totalDonors: 247,
    totalUnits: 189,
    activeRequests: 12,
    todaysDonations: 8
  });

  const bloodGroups = [
    { type: 'A+', units: 45, total: 60, color: 'from-red-500 to-red-700' },
    { type: 'O+', units: 52, total: 60, color: 'from-orange-500 to-orange-700' },
    { type: 'B+', units: 28, total: 60, color: 'from-blue-500 to-blue-700' },
    { type: 'AB+', units: 15, total: 60, color: 'from-purple-500 to-purple-700' },
    { type: 'A-', units: 12, total: 60, color: 'from-pink-500 to-pink-700' },
    { type: 'O-', units: 18, total: 60, color: 'from-indigo-500 to-indigo-700' },
    { type: 'B-', units: 10, total: 60, color: 'from-teal-500 to-teal-700' },
    { type: 'AB-', units: 9, total: 60, color: 'from-cyan-500 to-cyan-700' }
  ];

  const alerts = [
    { type: 'AB-', units: 9, level: 'critical' },
    { type: 'B-', units: 10, level: 'critical' },
    { type: 'A-', units: 12, level: 'low' }
  ];

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header - Responsive */}
        <div className="content-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
              <p className="text-sm text-gray-500">Real-time monitoring and analytics</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-1.5">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Quick</span> Actions
              </button>
              <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Set</span> Goals
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <GlassCard 
            icon={Droplet}
            title="Blood Units"
            value={stats.totalUnits}
            change={8.2}
            gradient="from-teal-500 to-cyan-500"
          />
          <GlassCard 
            icon={Users}
            title="Active Donors"
            value={stats.totalDonors}
            change={12.5}
            gradient="from-blue-500 to-indigo-500"
          />
          <GlassCard 
            icon={Heart}
            title="Requests"
            value={stats.activeRequests}
            change={-5.3}
            gradient="from-rose-500 to-pink-500"
          />
          <GlassCard 
            icon={TrendingUp}
            title="Today"
            value={stats.todaysDonations}
            change={15.8}
            gradient="from-emerald-500 to-green-500"
          />
        </div>

        {/* Progress Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Progress Ring */}
          <div className="lg:col-span-2 content-card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-1 text-center sm:text-left order-2 sm:order-1">
              <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold mb-2">
                Monthly Target
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">December 2025</h2>
              <p className="text-sm text-gray-500 mb-4">72% of target completed</p>
              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center gap-1.5 mx-auto sm:mx-0">
                <Award className="h-4 w-4" />
                View Rewards
              </button>
            </div>
            <div className="order-1 sm:order-2">
              <MassiveProgress 
                percentage={72}
                size={160}
                strokeWidth={14}
                color="#14b8a6"
                label="180 / 250"
                value="72%"
                subtitle="Donations"
              />
            </div>
          </div>

          {/* Quick Stats - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
            <div className="content-card p-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Active</div>
                  <div className="text-xl font-bold text-gray-800">24</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Donors in facility</div>
            </div>

            <div className="content-card p-4 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Wait</div>
                  <div className="text-xl font-bold text-gray-800">12m</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Avg processing</div>
            </div>
          </div>
        </div>

        {/* Blood Inventory Grid - Responsive */}
        <div className="content-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Blood Inventory</h2>
            <div className="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full text-white text-xs font-medium">
              Live
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {bloodGroups.map((group, idx) => (
              <BloodGroupCardUltra key={idx} {...group} />
            ))}
          </div>
        </div>

        {/* Critical Alerts - Responsive */}
        <div className="content-card p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Critical Alerts</h2>
              <p className="text-xs text-gray-500">Immediate attention needed</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert, idx) => (
              <AlertCardPulse key={idx} {...alert} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPageUltra;
