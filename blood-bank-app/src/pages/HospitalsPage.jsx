import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hospitalsAPI, citiesAPI, adminHospitalsAPI } from '../services/api';
import { fetchNearbyFacilities, getCurrentLocation } from '../services/eRaktKoshService';
import DataTable from '../components/shared/DataTable';
import { Plus, Edit, Trash2, Loader2, Search, X, Globe, MapPin, Phone, Mail, Building2, Navigation, RefreshCw, Check, XCircle, Clock } from 'lucide-react';


const HospitalsPage = () => {
  const { user } = useAuth();
  const { success, error: showError, warning } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending'
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    Hosp_Name: '',
    Hosp_Phone: '',
    Hosp_Needed_Bgrp: '',
    City_Id: '',
    email: '',
    password: '',
    isApproved: true // Auto-approve when admin creates
  });

  // eRaktKosh integration states
  const [activeTab, setActiveTab] = useState('internal'); // 'internal' or 'eraktkosh'
  const [eraktKoshFacilities, setEraktKoshFacilities] = useState([]);
  const [eraktKoshLoading, setEraktKoshLoading] = useState(false);
  const [eraktKoshError, setEraktKoshError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Fetch cities from API
  const fetchCities = useCallback(async () => {
    try {
      const response = await citiesAPI.getAll();
      if (response.data.success) {
        setCities(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  }, []);

  // Fetch hospitals from API
  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate network delay
      await new Promise(res => setTimeout(res, 500));
      
      const response = await hospitalsAPI.getAll();
      
      if (response.data.success) {
        setHospitals(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch hospitals');
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
    fetchHospitals();
  }, [fetchCities, fetchHospitals]);

  // eRaktKosh integration functions
  const fetchUserLocation = async () => {
    setEraktKoshLoading(true);
    setEraktKoshError('');
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      await searchEraktKoshFacilities(location.latitude, location.longitude);
    } catch (err) {
      console.error('Location error:', err);
      // Use default location (Mumbai) as fallback
      const defaultLocation = { latitude: 19.0760, longitude: 72.8777 };
      setUserLocation(defaultLocation);
      setEraktKoshError('Using default location (Mumbai). ' + (err.message || 'Location access denied'));
      await searchEraktKoshFacilities(defaultLocation.latitude, defaultLocation.longitude);
    }
  };

  const searchEraktKoshFacilities = async (lat, long) => {
    setEraktKoshLoading(true);
    setEraktKoshError('');

    try {
      const results = await fetchNearbyFacilities(
        lat || userLocation?.latitude,
        long || userLocation?.longitude,
        searchRadius
      );

      if (!results || results.length === 0) {
        setEraktKoshError(`No facilities found within ${searchRadius}km. Try increasing the search radius.`);
        setEraktKoshFacilities([]);
      } else {
        setEraktKoshFacilities(results);
        setSelectedFacility(results[0]);
      }
    } catch (err) {
      console.error('eRaktKosh search error:', err);
      setEraktKoshError(err.message || 'Failed to fetch facilities from eRaktKosh');
      setEraktKoshFacilities([]);
    } finally {
      setEraktKoshLoading(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      searchEraktKoshFacilities(userLocation.latitude, userLocation.longitude);
    }
  };

  useEffect(() => {
    if (activeTab === 'eraktkosh' && !userLocation) {
      fetchUserLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (user?.role !== 'manager') {
      warning('Permission denied', 'Only managers can delete hospitals');
      return;
    }

    // Removed window.confirm as it is not supported
    // Add a custom modal confirmation here for production

    try {
      await hospitalsAPI.delete(id);
      success('Hospital deleted', 'Hospital has been removed from the system');
      fetchHospitals();
    } catch (err) {
      showError('Failed to delete hospital', err.response?.data?.message || 'Please try again later');
    }
  };

  const handleAddClick = () => {
    if (user?.role !== 'manager') {
      warning('Permission denied', 'Only managers can add hospitals');
      return;
    }

    setEditingHospital(null);
    setFormData({
      Hosp_Name: '',
      Hosp_Phone: '',
      Hosp_Needed_Bgrp: '',
      City_Id: '',
      email: '',
      password: '',
      isApproved: true
    });
    setShowModal(true);
  };

  const handleApproval = async (hospitalId, isApproved) => {
    if (user?.role !== 'manager') {
      warning('Permission denied', 'Only managers can approve hospitals');
      return;
    }

    const action = isApproved ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${action} this hospital registration?`)) {
      return;
    }

    try {
      await adminHospitalsAPI.updateApproval(hospitalId, isApproved);
      success(
        `Hospital ${isApproved ? 'approved' : 'rejected'}`,
        `The hospital registration has been ${isApproved ? 'approved' : 'rejected'} successfully`
      );
      fetchHospitals();
    } catch (err) {
      showError(`Failed to ${action} hospital`, err.response?.data?.message || 'An error occurred');
    }
  };

  // Helper function to get City_Id by city name (for backward compatibility)
  const getCityIdByName = (cityName) => {
    if (!cityName) return '';
    const city = cities.find(c => c.City_Name?.toLowerCase() === cityName?.toLowerCase());
    return city ? city.City_Id : '';
  };

  // Helper function to get City_Name by City_Id
  const getCityName = (cityId) => {
    if (!cityId) return 'N/A';
    const city = cities.find(c => c.City_Id === cityId);
    return city ? city.City_Name : 'N/A';
  };

  const handleEditClick = (hospital) => {
    if (user?.role !== 'manager') {
      warning('Permission denied', 'Only managers can edit hospitals');
      return;
    }

    setEditingHospital(hospital);
    setFormData({
      Hosp_Name: hospital.Hosp_Name || hospital.name || '',
      Hosp_Phone: hospital.Hosp_Phone || hospital.phone || '',
      Hosp_Needed_Bgrp: hospital.Hosp_Needed_Bgrp || hospital.neededBloodGroup || '',
      City_Id: hospital.City_Id || getCityIdByName(hospital.city) || ''
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
      if (editingHospital) {
        await hospitalsAPI.update(editingHospital._id, formData);
        success('Hospital updated', `${formData.Hosp_Name}'s information has been updated successfully`);
      } else {
        await hospitalsAPI.create(formData);
        success('Hospital added', `${formData.Hosp_Name} has been added to the system with login credentials`);
      }
      
      setShowModal(false);
      fetchHospitals();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to save hospital';
      showError(
        editingHospital ? 'Failed to update hospital' : 'Failed to add hospital',
        errorMsg
      );
    }
  };

  const columns = [
    { 
      header: 'ID', 
      accessor: 'Hosp_Id', 
      render: (row) => row.Hosp_Id || row._id?.slice(-6) || 'N/A' 
    },
    { 
      header: 'Hospital Name', 
      accessor: 'Hosp_Name',
      render: (row) => row.Hosp_Name || row.name || 'N/A'
    },
    { 
      header: 'Phone', 
      accessor: 'Hosp_Phone',
      render: (row) => row.Hosp_Phone || row.phone || 'N/A'
    },
    { 
      header: 'Needed Blood Group', 
      accessor: 'Hosp_Needed_Bgrp',
      render: (row) => row.Hosp_Needed_Bgrp || row.neededBloodGroup || 'N/A'
    },
    { 
      header: 'City', 
      accessor: 'City_Id',
      render: (row) => getCityName(row.City_Id) || row.city || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'isApproved',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
          row.isApproved === false
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            : 'bg-green-100 text-green-800 border border-green-300'
        }`}>
          {row.isApproved === false ? (
            <><Clock className="h-3 w-3" /> Pending</>
          ) : (
            <><Check className="h-3 w-3" /> Approved</>
          )}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {user?.role === 'manager' && (
            <>
              {row.isApproved === false && (
                <>
                  <button 
                    onClick={() => handleApproval(row._id, true)}
                    className="text-green-600 hover:text-green-800 p-1.5 rounded hover:bg-green-50 transition-colors"
                    title="Approve hospital"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleApproval(row._id, false)}
                    className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                    title="Reject hospital"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
              {row.isApproved !== false && (
                <>
                  <button 
                    onClick={() => handleEditClick(row)}
                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                    title="Edit hospital"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(row._id)}
                    className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                    title="Delete hospital"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </>
          )}
          {user?.role !== 'manager' && (
            <span className="text-zinc-400 text-xs">Manager Only</span>
          )}
        </div>
      )
    }
  ];

  // Filter hospitals based on search term and status
  const filteredHospitals = hospitals.filter(hospital => {
    // Status filter
    if (statusFilter === 'approved' && hospital.isApproved !== true) return false;
    if (statusFilter === 'pending' && hospital.isApproved !== false) return false;
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    return (
      (hospital.Hosp_Name || hospital.name)?.toLowerCase().includes(searchLower) ||
      (hospital.Hosp_Phone || hospital.phone)?.toLowerCase().includes(searchLower) ||
      (hospital.Hosp_Needed_Bgrp || hospital.neededBloodGroup)?.toLowerCase().includes(searchLower) ||
      getCityName(hospital.City_Id)?.toLowerCase().includes(searchLower) ||
      hospital.city?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-zinc-900 mb-1">Hospital Network</h3>
          <p className="text-zinc-600">Manage partner hospitals and explore nationwide facilities</p>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href="https://facilitysbx.abdm.gov.in/v2/api-docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full text-white text-xs font-medium flex items-center gap-1.5 hover:shadow-lg transition-all"
          >
            <Globe className="h-3 w-3" />
            ABDM Network
          </a>
          {user?.role === 'manager' && (
            <button 
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 shadow-sm duration-150 flex items-center gap-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Hospital
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-zinc-200 p-1 flex gap-1">
        <button
          onClick={() => setActiveTab('internal')}
          className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
            activeTab === 'internal'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Building2 className="h-4 w-4" />
            Internal Network ({hospitals.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('eraktkosh')}
          className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
            activeTab === 'eraktkosh'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Globe className="h-4 w-4" />
            ABDM Network Search
          </span>
        </button>
      </div>

      {/* Internal Network Tab */}
      {activeTab === 'internal' && (
        <>
          {user?.role !== 'manager' && (
            <div className="mb-4 text-sm text-zinc-500 bg-gray-100 px-4 py-2 rounded-lg">
              Manager Access Required to Add/Edit Hospitals
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={fetchHospitals}
                className="mt-2 text-sm underline font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="mb-6 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by name, city, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            {user?.role === 'manager' && (
              <div className="bg-white p-3 rounded-lg shadow-sm border border-zinc-200 flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  All ({hospitals.length})
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-1.5 ${
                    statusFilter === 'approved'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Approved ({hospitals.filter(h => h.isApproved !== false).length})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-1.5 ${
                    statusFilter === 'pending'
                      ? 'bg-yellow-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Pending ({hospitals.filter(h => h.isApproved === false).length})
                </button>
              </div>
            )}
          </div>

          <DataTable columns={columns} data={filteredHospitals} />
          
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
            <p>Showing {filteredHospitals.length} of {hospitals.length} hospitals</p>
          </div>
        </>
      )}

      {/* eRaktKosh Tab */}
      {activeTab === 'eraktkosh' && (
        <div className="space-y-4">
          {/* Search Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-600">Search Radius:</span>
                {[5, 10, 20, 50].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => handleRadiusChange(radius)}
                    disabled={eraktKoshLoading}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      searchRadius === radius
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
              <button
                onClick={() => userLocation ? searchEraktKoshFacilities(userLocation.latitude, userLocation.longitude) : fetchUserLocation()}
                disabled={eraktKoshLoading}
                className="ml-auto px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg shadow-lg hover:shadow-teal-500/40 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {eraktKoshLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {eraktKoshLoading ? 'Searching...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Error State */}
          {eraktKoshError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p>{eraktKoshError}</p>
            </div>
          )}

          {/* Loading State */}
          {eraktKoshLoading && (
            <div className="bg-white p-12 rounded-lg shadow-sm border border-zinc-200 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-teal-500 animate-spin" />
              <p className="text-zinc-600 font-medium">Searching nationwide facilities...</p>
            </div>
          )}

          {/* Results */}
          {!eraktKoshLoading && eraktKoshFacilities.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Facility List */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 space-y-3 max-h-[600px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-teal-500" />
                  Found {eraktKoshFacilities.length} Facilities
                </h3>

                {eraktKoshFacilities.map((facility) => (
                  <div
                    key={facility.id}
                    onClick={() => setSelectedFacility(facility)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedFacility?.id === facility.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-zinc-200 bg-white hover:border-teal-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-zinc-800 line-clamp-2 flex-1">
                        {facility.name}
                      </h4>
                      {facility.distance && (
                        <div className="flex items-center gap-1 text-sm text-teal-600 font-medium ml-2">
                          <Navigation className="h-3.5 w-3.5" />
                          {facility.distance.toFixed(1)} km
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-zinc-600">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{facility.address}</span>
                    </div>
                    {facility.city && facility.state && (
                      <div className="text-xs text-zinc-500 mt-1 ml-5">
                        {facility.city}, {facility.state}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Facility Details */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 sticky top-6">
                {selectedFacility ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-zinc-900">{selectedFacility.name}</h3>
                        <span className="text-xs text-teal-600 font-medium">
                          {selectedFacility.facilityType || 'Blood Bank'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedFacility.address && (
                        <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{selectedFacility.address}</p>
                            {selectedFacility.city && selectedFacility.state && (
                              <p className="text-xs text-zinc-600 mt-1">
                                {selectedFacility.city}, {selectedFacility.state}
                                {selectedFacility.pincode && ` - ${selectedFacility.pincode}`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedFacility.contact && selectedFacility.contact !== 'N/A' && (
                        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                          <Phone className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-zinc-500">Contact</p>
                            <a 
                              href={`tel:${selectedFacility.contact}`}
                              className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                            >
                              {selectedFacility.contact}
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedFacility.email && selectedFacility.email !== 'N/A' && (
                        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                          <Mail className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-zinc-500">Email</p>
                            <a 
                              href={`mailto:${selectedFacility.email}`}
                              className="text-sm font-semibold text-teal-600 hover:text-teal-700 break-all"
                            >
                              {selectedFacility.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {selectedFacility.distance && (
                        <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                          <Navigation className="h-5 w-5 text-teal-600 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-teal-700">Distance</p>
                            <p className="text-sm font-bold text-teal-900">
                              {selectedFacility.distance.toFixed(1)} km away
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                    <Building2 className="h-16 w-16 mb-4" />
                    <p className="text-sm">Select a facility to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {!eraktKoshLoading && !eraktKoshError && eraktKoshFacilities.length === 0 && (
            <div className="bg-white p-12 rounded-lg shadow-sm border border-zinc-200 flex flex-col items-center justify-center text-center">
              <Building2 className="h-16 w-16 text-zinc-300 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-800 mb-2">No Facilities Found</h3>
              <p className="text-sm text-zinc-500">Click "Refresh" to search for nearby blood bank facilities</p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Add/Edit Hospital */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-zinc-200 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold text-zinc-900">
                {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 overflow-y-auto">
              <form onSubmit={handleFormSubmit} id="hospital-form" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="Hosp_Name"
                    value={formData.Hosp_Name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="Hosp_Phone"
                    value={formData.Hosp_Phone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Needed Blood Group *
                  </label>
                  <select
                    name="Hosp_Needed_Bgrp"
                    value={formData.Hosp_Needed_Bgrp}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    City *
                  </label>
                  <select
                    name="City_Id"
                    value={formData.City_Id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city._id} value={city.City_Id}>
                        {city.City_Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* NEW: Hospital Portal Login Credentials */}
                {!editingHospital && (
                  <>
                    <div className="col-span-2 mt-4 pt-4 border-t border-zinc-200">
                      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Hospital Portal Access</h3>
                      <p className="text-xs text-zinc-600 mb-3">Provide login credentials for the hospital to access their portal</p>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        required={!editingHospital}
                        placeholder="hospital@example.com"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        required={!editingHospital}
                        minLength="6"
                        placeholder="Minimum 6 characters"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Hospital will use this to login at /hospital/login</p>
                    </div>
                  </>
                )}
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
                form="hospital-form"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-150"
              >
                {editingHospital ? 'Update Hospital' : 'Add Hospital'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalsPage;

