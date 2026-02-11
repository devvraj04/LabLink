import React, { useState, useEffect } from 'react';
import { emergencyAPI, hospitalsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AlertCircle, Send, MapPin, Clock, Users, Phone, Activity, Siren } from 'lucide-react';

const EmergencySOSPageNew = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [formData, setFormData] = useState({
    hospitalId: '',
    hospitalName: '',
    bloodGroup: '',
    unitsNeeded: 1,
    urgencyLevel: 'urgent',
    patientCondition: '',
    location: {
      coordinates: { latitude: '', longitude: '' },
      address: ''
    }
  });

  useEffect(() => {
    fetchActiveEmergencies();
    fetchHospitals();
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          }));
        },
        (error) => console.error('Geolocation error:', error)
      );
    }
  };

  const fetchActiveEmergencies = async () => {
    try {
      const response = await emergencyAPI.getActive();
      setActiveEmergencies(response.data.data || []);
    } catch (err) {
      console.error('Error fetching emergencies:', err);
    }
  };

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await hospitalsAPI.getAll();
      if (response.data.success) {
        setHospitals(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      error('Failed to load hospitals', 'Unable to fetch hospital list');
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleHospitalChange = (e) => {
    const selectedHospitalId = e.target.value;
    const selectedHospital = hospitals.find(h => h._id === selectedHospitalId);
    
    if (selectedHospital) {
      setFormData({
        ...formData,
        hospitalId: selectedHospitalId,
        hospitalName: selectedHospital.Hosp_Name || selectedHospital.name || ''
      });
    } else {
      setFormData({
        ...formData,
        hospitalId: '',
        hospitalName: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await emergencyAPI.broadcast(formData);
      success('Emergency Broadcast Sent!', response.data.message);
      setFormData({
        ...formData,
        bloodGroup: '',
        unitsNeeded: 1,
        patientCondition: ''
      });
      fetchActiveEmergencies();
    } catch (err) {
      error('Failed to broadcast', err.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'urgent':
        return 'from-orange-500 to-orange-600';
      case 'moderate':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Alert Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl shadow-xl p-8 text-white mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                <Siren className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Emergency SOS</h1>
                <p className="text-white/90">Broadcast urgent blood requirements instantly to nearby donors and hospitals</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emergency Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Emergency Request</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hospital Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hospital *
                  </label>
                  {loadingHospitals ? (
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-gray-500">
                      Loading hospitals...
                    </div>
                  ) : (
                    <select
                      value={formData.hospitalId}
                      onChange={handleHospitalChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                      required
                    >
                      <option value="">-- Select Hospital --</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital._id} value={hospital._id}>
                          {hospital.Hosp_Name || hospital.name} (ID: {hospital._id.slice(-8)})
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.hospitalName && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.hospitalName}
                    </p>
                  )}
                </div>

                {/* Blood Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group Needed</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.unitsNeeded}
                      onChange={(e) => setFormData({ ...formData, unitsNeeded: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'critical', label: 'Critical', color: 'red' },
                      { value: 'urgent', label: 'Urgent', color: 'orange' },
                      { value: 'moderate', label: 'Moderate', color: 'yellow' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgencyLevel: level.value })}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          formData.urgencyLevel === level.value
                            ? `border-${level.color}-500 bg-${level.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`text-lg font-semibold ${
                          formData.urgencyLevel === level.value ? `text-${level.color}-600` : 'text-gray-600'
                        }`}>
                          {level.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Condition</label>
                  <textarea
                    value={formData.patientCondition}
                    onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    placeholder="Describe patient's condition and urgency..."
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Hospital address"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-2xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Broadcast Emergency
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Active Emergencies Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-card p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="h-6 w-6 text-red-500" />
                Active Emergencies
              </h3>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {activeEmergencies.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No active emergencies</p>
                  </div>
                ) : (
                  activeEmergencies.map((emergency, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getUrgencyColor(emergency.urgencyLevel)} mb-3`}>
                        {emergency.urgencyLevel?.toUpperCase()}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{emergency.hospitalName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Blood: <strong>{emergency.bloodGroup}</strong> ({emergency.unitsNeeded} units)</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {emergency.createdAt ? new Date(emergency.createdAt).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOSPageNew;
