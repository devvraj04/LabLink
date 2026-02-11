import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bloodSpecimensAPI } from '../services/api';
import DataTable from '../components/shared/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Loader2, Search, Filter, X, ChevronDown } from 'lucide-react';


const InventoryPage = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    B_Group: '',
    bloodGroup: '',
    collectionDate: '',
    expiryDate: '',
    Status: 'available',
    status: 'available'
  });

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter) params.status = statusFilter;

      // Simulate network delay
      await new Promise(res => setTimeout(res, 500));
      
      const response = await bloodSpecimensAPI.getAll(params);
      
      if (response.data.success) {
        setInventory(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleDelete = async (id) => {
    // Removed window.confirm as it is not supported
    // Add a custom modal confirmation here for production
    try {
      await bloodSpecimensAPI.delete(id);
      success('Specimen deleted', 'Blood specimen has been removed from inventory');
      fetchInventory();
    } catch (err) {
      showError('Failed to delete specimen', err.response?.data?.message || 'Please try again later');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await bloodSpecimensAPI.update(id, { Status: newStatus });
      const statusMessages = {
        available: 'Specimen marked available',
        used: 'Specimen marked as used',
        expired: 'Specimen marked as expired',
        reserved: 'Specimen reserved'
      };
      success(statusMessages[newStatus] || 'Status updated', `Blood specimen status changed to ${newStatus}`);
      fetchInventory();
    } catch (err) {
      showError('Failed to update status', err.response?.data?.message || 'Please try again later');
    }
  };

  const handleAddClick = () => {
    // Generate auto specimen number
    const timestamp = Date.now();
    const specimenId = parseInt(String(timestamp).slice(-6));
    
    setFormData({
      Specimen_Id: specimenId,
      B_Group: '',
      collectionDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      Status: 'available'
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      // Sync both field names for compatibility
      ...(name === 'B_Group' && { bloodGroup: value }),
      ...(name === 'bloodGroup' && { B_Group: value }),
      ...(name === 'Status' && { status: value }),
      ...(name === 'status' && { Status: value })
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await bloodSpecimensAPI.create(formData);
      success('Blood specimen added', `${formData.B_Group} blood specimen has been added to inventory`);
      setShowModal(false);
      fetchInventory();
    } catch (err) {
      showError('Failed to add blood specimen', err.response?.data?.message || 'Please try again later');
    }
  };

  const columns = [
    { 
      header: 'Specimen ID', 
      accessor: 'Specimen_Id',
      render: (row) => row.Specimen_Id || row._id?.slice(-6) || 'N/A'
    },
    { 
      header: 'Blood Group', 
      accessor: 'B_Group',
      render: (row) => row.B_Group || row.bloodGroup || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'Status',
      render: (row) => <StatusBadge status={row.Status || row.status} />
    },
    { 
      header: 'Collection Date', 
      accessor: 'collectionDate',
      render: (row) => row.collectionDate ? new Date(row.collectionDate).toLocaleDateString() : 'N/A'
    },
    { 
      header: 'Expiry Date', 
      accessor: 'expiryDate',
      render: (row) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2 items-center">
          {(row.Status === 'available' || row.status === 'available') && (
            <select
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              className="text-xs border border-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm"
              defaultValue=""
            >
              <option value="" disabled>Change Status</option>
              <option value="reserved">Mark Reserved</option>
              <option value="used">Mark Used</option>
              <option value="contaminated">Mark Contaminated</option>
            </select>
          )}
          {user?.role === 'manager' && (
            <button 
              onClick={() => handleDelete(row._id)}
              className="text-red-600 hover:text-red-800 font-medium text-xs px-2 py-1.5 rounded hover:bg-red-50" // Added padding for easier click
            >
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.B_Group || item.bloodGroup)?.toLowerCase().includes(searchLower) ||
      (item.Specimen_Id || item._id)?.toString().toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-zinc-900 mb-1">Blood Inventory</h3>
          <p className="text-zinc-600">Manage and track blood specimen inventory</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 md:w-auto w-full"
        >
          <Plus className="h-5 w-5" />
          Add Blood Unit
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchInventory}
            className="mt-2 text-sm underline font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-zinc-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by ID or Blood Group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="relative w-full md:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none z-10" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto pl-10 pr-9 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white cursor-pointer hover:border-zinc-400"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="used">Used</option>
              <option value="contaminated">Contaminated</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredInventory} />
      
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
        <p>Showing {filteredInventory.length} of {inventory.length} entries</p>
      </div>

      {/* Modal for Add Blood Unit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl border border-zinc-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold text-zinc-900">Add Blood Unit</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 overflow-y-auto">
              <form onSubmit={handleFormSubmit} id="inventory-form" className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Blood Group *
                </label>
                <select
                  name="B_Group"
                  value={formData.B_Group}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Collection Date *
                </label>
                <input
                  type="date"
                  name="collectionDate"
                  value={formData.collectionDate}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Status *
                </label>
                <select
                  name="Status"
                  value={formData.Status}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="used">Used</option>
                  <option value="contaminated">Contaminated</option>
                </select>
              </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white text-zinc-700 font-medium rounded-lg shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="inventory-form"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-150"
              >
                Add Blood Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;

