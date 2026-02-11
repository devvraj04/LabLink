import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bloodSpecimensAPI } from '../services/api';
import { Plus, Search, Droplet, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

const InventoryPageNew = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await bloodSpecimensAPI.getAll(params);
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const getBloodGroupColor = (group) => {
    const colors = {
      'A+': 'from-red-500 to-red-600',
      'A-': 'from-pink-500 to-pink-600',
      'B+': 'from-blue-500 to-blue-600',
      'B-': 'from-cyan-500 to-cyan-600',
      'AB+': 'from-purple-500 to-purple-600',
      'AB-': 'from-indigo-500 to-indigo-600',
      'O+': 'from-orange-500 to-orange-600',
      'O-': 'from-teal-500 to-teal-600'
    };
    return colors[group] || 'from-gray-500 to-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <CheckCircle className="h-5 w-5 text-primary-500" />;
      case 'used':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'reserved':
        return <Clock className="h-5 w-5 text-accent-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredInventory = inventory.filter(item =>
    (item.B_Group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: inventory.length,
    available: inventory.filter(i => i.Status === 'available' || i.status === 'available').length,
    used: inventory.filter(i => i.Status === 'used' || i.status === 'used').length,
    expired: inventory.filter(i => i.Status === 'expired' || i.status === 'expired').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blood Inventory</h1>
          <p className="text-gray-600">Manage and track blood specimen inventory</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Units</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                <Droplet className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-primary-600">{stats.available}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Used</p>
                <p className="text-3xl font-bold text-gray-600">{stats.used}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expired</p>
                <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by blood group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {['all', 'available', 'used', 'expired', 'reserved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => (
              <div key={item._id} className="bg-white rounded-3xl shadow-card hover:shadow-card-hover transition-all overflow-hidden">
                {/* Blood Group Header */}
                <div className={`bg-gradient-to-r ${getBloodGroupColor(item.B_Group || item.bloodGroup)} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Droplet className="h-8 w-8" />
                      <div>
                        <p className="text-sm opacity-90">Blood Group</p>
                        <p className="text-3xl font-bold">{item.B_Group || item.bloodGroup}</p>
                      </div>
                    </div>
                    {getStatusIcon(item.Status || item.status)}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Collection Date</p>
                      <p className="font-medium text-gray-900">
                        {item.collectionDate ? new Date(item.collectionDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Expiry Date</p>
                      <p className="font-medium text-gray-900">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (item.Status === 'available' || item.status === 'available')
                          ? 'bg-primary-100 text-primary-700'
                          : (item.Status === 'used' || item.status === 'used')
                          ? 'bg-gray-100 text-gray-700'
                          : (item.Status === 'expired' || item.status === 'expired')
                          ? 'bg-red-100 text-red-700'
                          : 'bg-accent-100 text-accent-700'
                      }`}>
                        {(item.Status || item.status || 'unknown').toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500">ID: {item._id.slice(-6)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredInventory.length === 0 && (
          <div className="bg-white rounded-3xl shadow-card p-12 text-center">
            <Droplet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No inventory found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPageNew;
