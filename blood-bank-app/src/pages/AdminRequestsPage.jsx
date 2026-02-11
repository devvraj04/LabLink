import React, { useState, useEffect } from 'react';
import { adminRequestsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  TrendingUp,
  Package,
  Activity
} from 'lucide-react';

const AdminRequestsPage = () => {
  const { success, error } = useToast();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'fulfill'
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [statusFilter, urgencyFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (urgencyFilter !== 'all') params.urgency = urgencyFilter;
      
      const response = await adminRequestsAPI.getAll(params);
      setRequests(response.data.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      error('Failed to load requests', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminRequestsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes(request.adminNotes || '');
    setShowModal(true);
  };

  const submitAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setActionLoading(true);
      await adminRequestsAPI.updateStatus(
        selectedRequest._id,
        actionType,
        adminNotes
      );
      
      // Show success toast with appropriate message
      if (actionType === 'approved') {
        success('Request approved successfully', `Blood request for ${selectedRequest.hospitalName} has been approved`);
      } else if (actionType === 'rejected') {
        success('Request rejected', `Blood request for ${selectedRequest.hospitalName} has been rejected`);
      } else if (actionType === 'fulfilled') {
        success('Request fulfilled', `Blood request for ${selectedRequest.hospitalName} has been marked as fulfilled`);
      }
      
      setShowModal(false);
      setSelectedRequest(null);
      setActionType('');
      setAdminNotes('');
      fetchRequests();
      fetchStats();
    } catch (err) {
      console.error('Error updating request:', err);
      error(`Failed to ${actionType} request`, err.response?.data?.message || 'Please try again later');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-blue-100 text-blue-800 border-blue-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      fulfilled: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      routine: 'text-gray-600',
      urgent: 'text-orange-600',
      emergency: 'text-red-600',
    };
    return colors[urgency] || 'text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'fulfilled':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
        <p className="text-gray-600 mt-1">Manage hospital blood requests</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalRequests || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.pendingRequests || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fulfilled</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.fulfilledRequests || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fulfillment Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.fulfillmentRate || 0}%
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency
            </label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Urgency</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-md border border-gray-200 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 break-words">
                      {request.hospitalName}
                    </h3>
                    <p className="text-sm text-gray-600 break-all">
                      ID: {request._id.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full border flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="text-sm font-medium capitalize">{request.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-semibold text-gray-900">{request.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">{request.quantity} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Urgency</p>
                  <p className={`font-semibold capitalize ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </p>
                </div>
              </div>

              {request.reason && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  <p className="text-gray-900">{request.reason}</p>
                </div>
              )}

              {request.patientDetails && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Patient Details</p>
                  <p className="text-gray-900">{request.patientDetails}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Request Date</p>
                  <p className="text-gray-900">
                    {new Date(request.requestDate).toLocaleString()}
                  </p>
                </div>
                {request.requiredBy && (
                  <div>
                    <p className="text-sm text-gray-600">Required By</p>
                    <p className="text-gray-900">
                      {new Date(request.requiredBy).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {request.adminNotes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                  <p className="text-gray-900">{request.adminNotes}</p>
                  {request.respondedByName && (
                    <p className="text-xs text-gray-500 mt-2">
                      By {request.respondedByName} on{' '}
                      {new Date(request.responseDate).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {request.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAction(request, 'approved')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(request, 'rejected')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {request.status === 'approved' && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAction(request, 'fulfilled')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Fulfilled
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
              {actionType} Request
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Hospital:</strong> {selectedRequest.hospitalName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Blood Group:</strong> {selectedRequest.bloodGroup}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Quantity:</strong> {selectedRequest.quantity} units
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes {actionType === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === 'approved'
                    ? 'Optional notes for approval...'
                    : actionType === 'rejected'
                    ? 'Please provide reason for rejection'
                    : 'Optional notes...'
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setActionType('');
                  setAdminNotes('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={actionLoading || (actionType === 'rejected' && !adminNotes.trim())}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  actionType === 'approved'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : actionType === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;
