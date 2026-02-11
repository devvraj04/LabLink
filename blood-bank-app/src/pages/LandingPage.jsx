import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated counter hook
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

// Floating animation component
const FloatingElement = ({ children, delay = 0, className = '' }) => (
  <div
    className={`animate-float ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

// Glassmorphic Card Component
const GlassCard = ({ children, className = '', hover3D = true }) => {
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e) => {
    if (!hover3D) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      className={`glass-card ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Feature icons as SVG components
const Icons = {
  BloodDrop: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 8-11 8-11s8 6.582 8 11c0 4.418-3.582 8-8 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Hospital: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Emergency: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Map: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
};

// Feature data
const features = [
  {
    icon: Icons.BloodDrop,
    title: 'Real-Time Inventory',
    description: 'Track blood stock levels across all blood groups with live updates and low-stock alerts.',
    gradient: 'from-red-400 to-rose-500',
  },
  {
    icon: Icons.Calendar,
    title: 'Donation Scheduling',
    description: 'Manage donor appointments, organize blood drives, and schedule donation camps.',
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    icon: Icons.Hospital,
    title: 'Hospital Network',
    description: 'Connect with hospitals for blood requests, inventory sharing, and emergency coordination.',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Icons.Emergency,
    title: 'Emergency SOS',
    description: 'Instant emergency blood requests with priority matching and rapid response system.',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    icon: Icons.Map,
    title: 'eRaktKosh Integration',
    description: 'Search nationwide blood availability using Government of India\'s blood bank network.',
    gradient: 'from-purple-400 to-cyan-500',
  },
];

// Dashboard dummy data
const bloodStats = [
  { label: 'Total Units', value: '2,450', unit: 'units', trend: '+12%', color: 'text-rose-500' },
  { label: 'Active Donors', value: '1,285', unit: 'donors', trend: '+8%', color: 'text-emerald-500' },
  { label: 'Pending Requests', value: '24', unit: 'requests', trend: '-15%', color: 'text-cyan-500' },
  { label: "Today's Donations", value: '18', unit: 'units', trend: '+25%', color: 'text-amber-500' },
];

const upcomingActivities = [
  { time: '9:00 AM', activity: 'Blood Drive - City Hospital', status: 'completed' },
  { time: '11:30 AM', activity: 'O+ Request - Apollo Hospital', status: 'upcoming' },
  { time: '2:00 PM', activity: 'Donor Appointment - John Doe', status: 'upcoming' },
  { time: '4:30 PM', activity: 'Inventory Audit - A- Stock', status: 'upcoming' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const livesSaved = useCounter(25000, 2500);
  const bloodUnitsCollected = useCounter(150000, 2500);
  const hospitalPartners = useCounter(350, 2000);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="landing-page min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-300/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-20 right-10 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Abstract medical shapes */}
        <svg className="absolute top-1/4 right-1/4 w-32 h-32 text-white/10 animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
        </svg>
        <svg className="absolute bottom-1/3 left-1/4 w-24 h-24 text-white/10 animate-float" viewBox="0 0 100 100">
          <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className={`relative z-50 px-6 py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 shadow-lg">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 4 8.5 4 13.5C4 17.64 7.58 21 12 21C16.42 21 20 17.64 20 13.5C20 8.5 12 2 12 2ZM12 19C8.69 19 6 16.54 6 13.5C6 10.5 9 6.5 12 4C15 6.5 18 10.5 18 13.5C18 16.54 15.31 19 12 19ZM12 16C10.34 16 9 14.66 9 13C9 11.34 10.34 10 12 10C13.66 10 15 11.34 15 13C15 14.66 13.66 16 12 16Z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">BloodLink</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium">Features</a>
            <a href="#dashboard" className="text-white/80 hover:text-white transition-colors font-medium">Dashboard</a>
            <a href="#privacy" className="text-white/80 hover:text-white transition-colors font-medium">Privacy</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 text-white/90 hover:text-white font-medium transition-all hover:bg-white/10 rounded-xl"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-glow px-6 py-2.5 bg-white text-teal-600 font-semibold rounded-xl hover:shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative z-10 px-6 pt-16 pb-24 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-medium">Saving 25,000+ lives through blood donation</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Smart Blood Bank{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-teal-200 animate-gradient-text">
                  Management
                </span>
              </h1>

              <p className="text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
                Revolutionize blood donation with real-time inventory tracking,
                seamless hospital coordination, and life-saving emergency response—all in one powerful platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/login')}
                  className="group relative px-8 py-4 bg-white text-teal-600 font-bold text-lg rounded-2xl shadow-2xl shadow-white/25 hover:shadow-white/40 transition-all duration-300 hover:-translate-y-1 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button className="group px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-bold text-lg rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16">
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-bold text-white">{livesSaved.toLocaleString()}+</div>
                  <div className="text-white/60 text-sm mt-1">Lives Saved</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-bold text-white">{bloodUnitsCollected.toLocaleString()}+</div>
                  <div className="text-white/60 text-sm mt-1">Units Collected</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl lg:text-4xl font-bold text-white">{hospitalPartners}+</div>
                  <div className="text-white/60 text-sm mt-1">Hospital Partners</div>
                </div>
              </div>
            </div>

            {/* Right - 3D Card Preview */}
            <div className="relative">
              <FloatingElement delay={0}>
                <GlassCard className="p-8 max-w-md mx-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                      <Icons.BloodDrop />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Blood Inventory</h3>
                      <p className="text-gray-500 text-sm">Real-time stock status</p>
                    </div>
                  </div>

                  <div className="relative h-40 flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle cx="72" cy="72" r="64" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle
                        cx="72" cy="72" r="64" fill="none"
                        stroke="url(#gradient)" strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray="402"
                        strokeDashoffset="80"
                        className="animate-draw-circle"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-bold text-gray-800">82%</span>
                      <span className="text-sm text-gray-500">Stock Level</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <div className="text-lg font-bold text-red-600">245</div>
                      <div className="text-xs text-gray-500">O+ Units</div>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-xl">
                      <div className="text-lg font-bold text-cyan-600">189</div>
                      <div className="text-xs text-gray-500">A+ Units</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <div className="text-lg font-bold text-emerald-600">98%</div>
                      <div className="text-xs text-gray-500">Fulfilled</div>
                    </div>
                  </div>
                </GlassCard>
              </FloatingElement>

              {/* Floating mini cards */}
              <FloatingElement delay={0.5} className="absolute -top-4 -right-4 lg:right-0">
                <div className="glass-card-mini px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Donation Complete</div>
                    <div className="text-xs text-gray-500">O+ • 450ml collected</div>
                  </div>
                </div>
              </FloatingElement>

              <FloatingElement delay={1} className="absolute -bottom-4 -left-4 lg:left-0">
                <div className="glass-card-mini px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C12 2 4 8.5 4 13.5C4 17.64 7.58 21 12 21C16.42 21 20 17.64 20 13.5C20 8.5 12 2 12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Urgent: AB- Needed</div>
                    <div className="text-xs text-gray-500">City Hospital • 2 units</div>
                  </div>
                </div>
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything You Need for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-200">
                Saving Lives
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Comprehensive tools designed to streamline blood bank operations and connect donors with those in need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-8 group cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 text-white`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Blood Bank at a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-200">
                Glance
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              A powerful dashboard that puts inventory, donations, and emergency requests front and center.
            </p>
          </div>

          <GlassCard className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Vitals Column */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                    <Icons.BloodDrop />
                  </div>
                  Blood Inventory
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {bloodStats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-2xl p-5 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 ${stat.color}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors">{stat.value}</span>
                        <span className="text-gray-400 text-sm">{stat.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini Chart */}
                <div className="mt-8 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">Weekly Donations</h4>
                    <select className="text-sm text-gray-500 bg-transparent border-none focus:ring-0">
                      <option>This Week</option>
                      <option>Last Week</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-between h-32 gap-2">
                    {[65, 40, 80, 55, 90, 70, 85].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-teal-500 to-cyan-400 rounded-lg transition-all duration-500 hover:from-teal-400 hover:to-cyan-300"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-gray-400">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reminders Column */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Icons.Calendar />
                  </div>
                  Today's Schedule
                </h3>

                <div className="space-y-4">
                  {upcomingActivities.map((activity, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${activity.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-gray-100 hover:border-teal-200 hover:shadow-md'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-gray-100'
                            }`}>
                            {activity.status === 'completed' ? (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${activity.status === 'completed' ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>
                              {activity.activity}
                            </div>
                            <div className="text-sm text-gray-500">{activity.time}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5">
                  View Full Schedule
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Privacy & Accessibility Section */}
      <section id="privacy" className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-6">
                <Icons.Lock />
                <span className="text-white/90 text-sm font-medium">Privacy by Design</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Your Data,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-200">
                  Fully Protected
                </span>
              </h2>

              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                We believe donor data and medical records should be private, secure, and completely under your control.
                Our platform is built with HIPAA-compliant security at its core.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '🔒', title: 'End-to-End Encryption', desc: 'All donor and hospital data is encrypted in transit and at rest' },
                  { icon: '🛡️', title: 'HIPAA Compliant', desc: 'Meets all healthcare privacy regulations for blood banks' },
                  { icon: '🏥', title: 'Secure Hospital Network', desc: 'Protected connections between blood banks and hospitals' },
                  { icon: '📊', title: 'Audit Trails', desc: 'Complete tracking of all blood unit movements and access' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-white/60 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <FloatingElement>
                <GlassCard className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Security Score</h3>
                    <p className="text-gray-500">Your account protection level</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Two-Factor Auth', status: true },
                      { label: 'Strong Password', status: true },
                      { label: 'Biometric Login', status: true },
                      { label: 'Last Security Review', status: 'Today' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-700 font-medium">{item.label}</span>
                        {typeof item.status === 'boolean' ? (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-sm text-teal-600 font-medium">{item.status}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Protection</span>
                      <span className="text-sm font-bold text-teal-600">98%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
                    </div>
                  </div>
                </GlassCard>
              </FloatingElement>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                Ready to Transform Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                  Blood Bank Operations?
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Join hundreds of blood banks and hospitals who have already streamlined their operations.
                Start your free trial today—no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-10 py-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                >
                  Start Free Trial
                </button>
                <button className="px-10 py-5 bg-gray-100 text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-200 transition-all duration-300 hover:-translate-y-1">
                  Schedule Demo
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 px-6 py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-12">
            Meet the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-teal-200">
              Makers
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-8">
            {/* Nachiket */}
            <a
              href="https://www.linkedin.com/in/nachiket-kale-5363001b3"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-64 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/30">
                NK
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Nachiket Kale</h3>
              <p className="text-teal-200 text-sm mb-4">Team Leader</p>
              <div className="flex items-center justify-center gap-2 text-white/60 group-hover:text-white transition-colors">
                <span className="text-sm">View Profile</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
            </a>

            {/* Abhishek */}
            <a
              href="https://www.linkedin.com/in/abhishek-chaudhari-949002356"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-64 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30">
                AC
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Abhishek Chaudhari</h3>
              <p className="text-purple-200 text-sm mb-4">Full Stack Developer</p>
              <div className="flex items-center justify-center gap-2 text-white/60 group-hover:text-white transition-colors">
                <span className="text-sm">View Profile</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
            </a>

            {/* Harsh */}
            <div
              className="group relative w-64 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 cursor-default"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-orange-500/30">
                H
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Harsh</h3>
              <p className="text-orange-200 text-sm mb-4">Full Stack Developer</p>
            </div>

            {/* Deep */}
            <a
              href="https://www.linkedin.com/in/deep-mehta-857a09304/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-64 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/30">
                D
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Deep Mehta</h3>
              <p className="text-blue-200 text-sm mb-4">Full Stack Developer</p>
              <div className="flex items-center justify-center gap-2 text-white/60 group-hover:text-white transition-colors">
                <span className="text-sm">View Profile</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12 2 4 8.5 4 13.5C4 17.64 7.58 21 12 21C16.42 21 20 17.64 20 13.5C20 8.5 12 2 12 2Z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">BloodLink</span>
              </div>
              <p className="text-white/60 max-w-sm leading-relaxed">
                Empowering blood banks with smart management solutions.
                Making blood donation tracking simple, secure, and accessible for everyone.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-white/60 hover:text-white transition-colors">Features</a></li>
                <li><a href="#dashboard" className="text-white/60 hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#privacy" className="text-white/60 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2024 BloodLink. Built for Healthcare Innovation Hackathon.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">HIPAA Notice</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
