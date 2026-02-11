import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { recipientsAPI, citiesAPI } from '../services/api';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Edit, Trash2, Loader2, Search, Filter, X, ChevronDown } from 'lucide-react';

const RecipientsPage = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [recipients, setRecipients] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [formData, setFormData] = useState({
    Reci_Name: '',
    Reci_Phone: '',
    Reci_Bgrp: '',
    Reci_Bqty: 1,
    Reci_Age: '',
    Reci_Sex: 'M',
    City_Id: '',
    status: 'pending'
  });

  // Fetch cities from API
  const fetchCities = useCallback(async () => {
    try {
      const response = await citiesAPI.getAll();
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  }, []);

  // Fetch recipients from API
  const fetchRecipients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await recipientsAPI.getAll(params);
      
      if (response.data.success) {
        setRecipients(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recipients');
      console.error('Error fetching recipients:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCities();
    fetchRecipients();
  }, [fetchCities, fetchRecipients]);

  const handleDelete = async (id) => {
    // Removed window.confirm as it is not supported.
    // A custom confirmation modal would be the ideal replacement.

    try {
      await recipientsAPI.delete(id);
      success('Recipient deleted', 'Recipient has been removed from the system');
      fetchRecipients();
    } catch (err) {
      showError('Failed to delete recipient', err.response?.data?.message || 'Please try again later');
    }
  };

  const handleAddClick = () => {
    setEditingRecipient(null);
    setFormData({
      Reci_Name: '',
      Reci_Phone: '',
      Reci_Bgrp: '',
      Reci_Bqty: 1,
      Reci_Age: '',
      Reci_Sex: 'M',
      City_Id: '',
      status: 'pending'
    });
    setShowModal(true);
  };

  const handleEditClick = (recipient) => {
    setEditingRecipient(recipient);
    setFormData({
      Reci_Name: recipient.Reci_Name || recipient.name || '',
      Reci_Phone: recipient.Reci_Phone || recipient.phone || '',
      Reci_Bgrp: recipient.Reci_Bgrp || recipient.bloodGroup || '',
      Reci_Bqty: recipient.Reci_Bqty || recipient.bloodQuantity || 1,
      Reci_Age: recipient.Reci_Age || recipient.age || '',
      Reci_Sex: recipient.Reci_Sex || (recipient.sex === 'Male' ? 'M' : recipient.sex === 'Female' ? 'F' : '') || 'M',
      City_Id: recipient.City_Id || '',
      status: recipient.status || 'pending'
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRecipient) {
        await recipientsAPI.update(editingRecipient._id, formData);
        success('Recipient updated', `${formData.Reci_Name}'s information has been updated successfully`);
      } else {
        const response = await recipientsAPI.create(formData);
        const bloodUsed = response.data.data.bloodUsed;
        if (bloodUsed) {
          success(
            'Recipient added & Blood issued', 
            `${formData.Reci_Name} has been added and ${bloodUsed.quantity} units of ${bloodUsed.bloodGroup} blood marked as used in inventory`
          );
        } else {
          success('Recipient added', `${formData.Reci_Name} has been added to the system`);
        }
      }
      
      setShowModal(false);
      fetchRecipients();
    } catch (err) {
      showError(
        editingRecipient ? 'Failed to update recipient' : 'Failed to add recipient', 
        err.response?.data?.message || 'Please try again later'
      );
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await recipientsAPI.update(id, { status: newStatus });
      const statusMessages = {
        approved: 'Request approved',
        fulfilled: 'Request fulfilled',
        rejected: 'Request rejected'
      };
      success(statusMessages[newStatus] || 'Status updated', `Recipient status changed to ${newStatus}`);
      fetchRecipients();
    } catch (err) {
      showError('Failed to update status', err.response?.data?.message || 'Please try again later');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'Reci_Id', render: (row) => row.Reci_Id || row._id?.slice(-6) || 'N/A' },
    { header: 'Name', accessor: 'Reci_Name', render: (row) => row.Reci_Name || row.name || 'N/A' },
    { header: 'Blood Group', accessor: 'Reci_Bgrp', render: (row) => row.Reci_Bgrp || row.bloodGroup || 'N/A' },
    { header: 'Phone', accessor: 'Reci_Phone', render: (row) => row.Reci_Phone || row.phone || 'N/A' },
    { 
      header: 'Quantity (Units)', 
      accessor: 'Reci_Bqty',
      render: (row) => row.Reci_Bqty || row.bloodQuantity || 1
    },
    {
      header: 'Age',
      accessor: 'Reci_Age',
      render: (row) => row.Reci_Age || row.age || 'N/A'
    },
    {
      header: 'Sex',
      accessor: 'Reci_Sex',
      render: (row) => row.Reci_Sex || row.sex || 'N/A'
    },
    { 
      header: 'City', 
      accessor: 'City_Id',
      render: (row) => {
        if (row.City_Id) {
          const city = cities.find(c => c.City_Id === row.City_Id);
          return city?.City_Name || `City ID: ${row.City_Id}`;
        }
        return 'N/A';
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => handleEditClick(row)}
            className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
            title="Edit recipient"
          >
            <Edit className="h-4 w-4" />
          </button>
          {row.status === 'pending' && (
            <select
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              className="text-xs border border-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm"
              defaultValue=""
            >
              <option value="" disabled>Change Status</option>
              <option value="approved">Approve</option>
              <option value="fulfilled">Fulfill</option>
              <option value="rejected">Reject</option>
            </select>
          )}
          {user?.role === 'manager' && (
            <button 
              onClick={() => handleDelete(row._id)}
              className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
              title="Delete recipient"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Filter recipients based on search term
  const filteredRecipients = recipients.filter(recipient => {
    const searchLower = searchTerm.toLowerCase();
    const recipientName = (recipient.Reci_Name || recipient.name || '').toLowerCase();
    const recipientBloodGroup = (recipient.Reci_Bgrp || recipient.bloodGroup || '').toLowerCase();
    const recipientPhone = (recipient.Reci_Phone || recipient.phone || '').toLowerCase();
    
    return (
      recipientName.includes(searchLower) ||
      recipientBloodGroup.includes(searchLower) ||
      recipientPhone.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600">Loading recipients...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Blood Recipients</h3>
          <p className="text-zinc-600">Manage blood recipients and their requests</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New Recipient
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchRecipients}
            className="mt-2 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-zinc-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, blood group, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none z-10" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-9 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white cursor-pointer hover:border-zinc-400"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredRecipients} />
      
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
        <p>Showing {filteredRecipients.length} of {recipients.length} recipients</p>
      </div>

      {/* Modal for Add/Edit Recipient */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-zinc-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">
                {editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleFormSubmit} id="recipient-form" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="Reci_Name"
                    value={formData.Reci_Name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="Reci_Phone"
                    value={formData.Reci_Phone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Blood Group *
                  </label>
                  <select
                    name="Reci_Bgrp"
                    value={formData.Reci_Bgrp}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Blood Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    name="Reci_Bqty"
                    value={formData.Reci_Bqty}
                    onChange={handleFormChange}
                    required
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="Reci_Age"
                    value={formData.Reci_Age}
                    onChange={handleFormChange}
                    required
                    min="0"
                    max="120"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Sex *
                  </label>
                  <select
                    name="Reci_Sex"
                    value={formData.Reci_Sex}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sex</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    City *
                  </label>
                  <select
                    name="City_Id"
                    value={formData.City_Id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city._id} value={city.City_Id}>
                        {city.City_Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white text-zinc-700 font-medium rounded-lg shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="recipient-form"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-150"
              >
                {editingRecipient ? 'Update Recipient' : 'Add Recipient'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientsPage;
