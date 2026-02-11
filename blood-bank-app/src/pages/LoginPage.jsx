import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHospitalAuth } from '../context/HospitalAuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, Loader2, Building2, Shield, Heart, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: adminLogin, isLoggedIn } = useAuth();
  const { login: hospitalLogin, isHospitalLoggedIn } = useHospitalAuth();
  const { success, error: showError, warning } = useToast();
  const [loginType, setLoginType] = useState('admin');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/app/dashboard');
    }
    if (isHospitalLoggedIn) {
      navigate('/hospital/dashboard');
    }
  }, [isLoggedIn, isHospitalLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginType === 'admin') {
        const result = await adminLogin(formData.email, formData.password);
        
        if (result.success) {
          success('Login successful', 'Welcome back to HealthTech');
          navigate('/app/dashboard');
        } else {
          setError(result.error || 'Login failed. Please try again.');
          showError('Login failed', result.error || 'Invalid email or password');
        }
      } else {
        const result = await hospitalLogin(formData);
        
        if (result.success) {
          success('Login successful', 'Welcome to Hospital Portal');
          setTimeout(() => {
            navigate('/hospital/dashboard');
          }, 500);
        } else {
          setError(result.message || 'Login failed. Please try again.');
          if (result.message && result.message.includes('not approved')) {
            warning('Account pending approval', 'Your hospital account is awaiting admin approval');
          } else {
            showError('Login failed', result.message || 'Invalid email or password');
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      showError('Login error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const switchLoginType = (type) => {
    setLoginType(type);
    setError('');
    setFormData({ email: '', password: '' });
  };

  return (
    <div className="login-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-teal-300/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-10 right-10 w-56 h-56 bg-emerald-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className={`absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 z-20 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Glass Card */}
        <div className="login-glass-card rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 mb-4 shadow-lg shadow-teal-500/30">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Sign in to continue to HealthTech</p>
          </div>

          {/* Login Type Tabs */}
          <div className="px-8 mb-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => switchLoginType('admin')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'admin'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => switchLoginType('hospital')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'hospital'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Hospital
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder={loginType === 'admin' ? 'admin@healthtech.com' : 'hospital@example.com'}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500 focus:ring-offset-0"
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <button 
                  type="button" 
                  className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {loginType === 'admin' ? (
                  <>Need access? <span className="text-teal-600 font-medium">Contact administrator</span></>
                ) : (
                  <>New hospital? <Link to="/hospital/register" className="text-teal-600 font-medium hover:text-teal-700">Register here</Link></>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-white/60 text-xs mt-6">
          © 2024 HealthTech. Secure Healthcare Platform.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
