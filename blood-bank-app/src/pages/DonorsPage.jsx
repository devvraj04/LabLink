import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donorsAPI, citiesAPI } from '../services/api';
import DataTable from '../components/shared/DataTable';
import { Plus, Edit, Trash2, Phone, Loader2, Search, Filter, X, MapPin, ChevronDown } from 'lucide-react';

const DonorsPage = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [donors, setDonors] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [formData, setFormData] = useState({
    Bd_Name: '',
    Bd_Phone: '',
    Bd_Bgroup: '',
    City_Id: '',
    Bd_Age: '',
    Bd_Sex: ''
  });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, donorId: null, donorName: '' });

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

  // Fetch donors from API
  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      
      const response = await donorsAPI.getAll(params);
      
      if (response.data.success) {
        setDonors(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch donors');
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  }, [bloodGroupFilter]);

  useEffect(() => {
    fetchCities();
    fetchDonors();
  }, [fetchCities, fetchDonors]);

  const handleDeleteClick = (id, name) => {
    setConfirmDialog({ show: true, donorId: id, donorName: name });
  };

  const handleDeleteConfirm = async () => {
    const { donorId } = confirmDialog;
    setConfirmDialog({ show: false, donorId: null, donorName: '' });

    try {
      await donorsAPI.delete(donorId);
      success('Donor deleted', 'Donor has been removed from the system');
      fetchDonors();
    } catch (err) {
      showError('Failed to delete donor', err.response?.data?.message || 'Please try again later');
    }
  };

  const handleDeleteReject = () => {
    setConfirmDialog({ show: false, donorId: null, donorName: '' });
  };

  const handleAddClick = () => {
    setEditingDonor(null);
    setFormData({
      Bd_Name: '',
      Bd_Phone: '',
      Bd_Bgroup: '',
      City_Id: '',
      Bd_Age: '',
      Bd_Sex: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (donor) => {
    setEditingDonor(donor);
    setFormData({
      Bd_Name: donor.Bd_Name || donor.name || '',
      Bd_Phone: donor.Bd_Phone || donor.phone || '',
      Bd_Bgroup: donor.Bd_Bgroup || donor.bloodGroup || '',
      City_Id: donor.City_Id || '',
      Bd_Age: donor.Bd_Age || donor.age || '',
      Bd_Sex: donor.Bd_Sex || (donor.sex === 'Male' ? 'M' : donor.sex === 'Female' ? 'F' : '') || ''
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
      if (editingDonor) {
        await donorsAPI.update(editingDonor._id, formData);
        success('Donor updated', `${formData.Bd_Name}'s information has been updated successfully`);
      } else {
        const response = await donorsAPI.create(formData);
        success(
          'Donor added & Blood collected', 
          `${formData.Bd_Name} has been added and blood specimen ${response.data.data.bloodSpecimen?.specimenNumber || ''} added to inventory`
        );
      }
      
      setShowModal(false);
      fetchDonors();
    } catch (err) {
      showError(
        editingDonor ? 'Failed to update donor' : 'Failed to add donor',
        err.response?.data?.message || 'Please try again later'
      );
    }
  };

  const columns = [
    { header: 'ID', accessor: 'Bd_Id', render: (row) => row.Bd_Id || row._id?.slice(-6) || 'N/A' },
    { header: 'Name', accessor: 'Bd_Name', render: (row) => row.Bd_Name || row.name || 'N/A' },
    { header: 'Blood Group', accessor: 'Bd_Bgroup', render: (row) => row.Bd_Bgroup || row.bloodGroup || 'N/A' },
    { header: 'Phone', accessor: 'Bd_Phone', render: (row) => row.Bd_Phone || row.phone || 'N/A' },
    { header: 'Age', accessor: 'Bd_Age', render: (row) => row.Bd_Age || row.age || 'N/A' },
    { header: 'Sex', accessor: 'Bd_Sex', render: (row) => row.Bd_Sex || row.sex || 'N/A' },
    { 
      header: 'City', 
      accessor: 'City_Id',
      render: (row) => {
        if (row.City_Id) {
          const city = cities.find(c => c.City_Id === row.City_Id);
          return city?.City_Name || `City ID: ${row.City_Id}`;
        }
        return row.city || 'N/A';
      }
    },
    { 
      header: 'Registration Date', 
      accessor: 'Bd_reg_Date',
      render: (row) => new Date(row.Bd_reg_Date || row.registrationDate || row.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEditClick(row)}
            className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
            title="Edit donor"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded hover:bg-emerald-50 transition-colors"
            title="Contact donor"
          >
            <Phone className="h-4 w-4" />
          </button>
          {user?.role === 'manager' && (
            <button 
              onClick={() => handleDeleteClick(row._id, row.Bd_Name)}
              className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
              title="Delete donor"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Filter donors based on search term
  const filteredDonors = donors.filter(donor => {
    const searchLower = searchTerm.toLowerCase();
    const donorName = (donor.Bd_Name || donor.name || '').toLowerCase();
    const donorBloodGroup = (donor.Bd_Bgroup || donor.bloodGroup || '').toLowerCase();
    const donorCity = donor.City_Id 
      ? (cities.find(c => c.City_Id === donor.City_Id)?.City_Name || '').toLowerCase()
      : (donor.city || '').toLowerCase();
    
    return (
      donorName.includes(searchLower) ||
      donorBloodGroup.includes(searchLower) ||
      donorCity.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600">Loading donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Registered Donors</h3>
          <p className="text-zinc-600">Manage donor information and contact details</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New Donor
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchDonors}
            className="mt-2 text-sm underline hover:no-underline"
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
              placeholder="Search by name, blood group, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none z-10" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <select 
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="pl-10 pr-9 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white cursor-pointer hover:border-zinc-400"
            >
              <option value="">All Blood Groups</option>
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
        </div>
      </div>

      <DataTable columns={columns} data={filteredDonors} />
      
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
        <p>Showing {filteredDonors.length} of {donors.length} donors</p>
      </div>

      {/* Modal for Add/Edit Donor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-zinc-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">
                {editingDonor ? 'Edit Donor' : 'Add New Donor'}
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
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="Bd_Name"
                      value={formData.Bd_Name}
                      onChange={handleFormChange}
                      required
                      maxLength="100"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        type="tel"
                        name="Bd_Phone"
                        value={formData.Bd_Phone}
                        onChange={handleFormChange}
                        required
                        maxLength="15"
                        className="w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Blood Group *
                    </label>
                    <select
                      name="Bd_Bgroup"
                      value={formData.Bd_Bgroup}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors"
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
                      City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                      <select
                        name="City_Id"
                        value={formData.City_Id}
                        onChange={handleFormChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors appearance-none bg-white"
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city._id} value={city.City_Id}>
                            {city.City_Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="Bd_Age"
                      value={formData.Bd_Age}
                      onChange={handleFormChange}
                      required
                      min="18"
                      max="65"
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors"
                      placeholder="18-65"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                      Sex *
                    </label>
                    <select
                      name="Bd_Sex"
                      value={formData.Bd_Sex}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-colors"
                    >
                      <option value="">Select Sex</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
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
                onClick={handleFormSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-150"
              >
                {editingDonor ? 'Update Donor' : 'Add Donor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  Delete Donor?
                </h3>
                <p className="text-zinc-600">
                  Are you sure you want to delete <span className="font-semibold">{confirmDialog.donorName}</span>? This action cannot be undone and will permanently remove all their records.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteReject}
                className="px-4 py-2 text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorsPage;
