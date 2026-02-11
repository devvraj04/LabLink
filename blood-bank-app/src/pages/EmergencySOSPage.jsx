import React, { useState, useEffect } from 'react';
import { emergencyAPI, hospitalsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AlertCircle, Send, MapPin, Clock, Users, Phone } from 'lucide-react';

const EmergencySOS = () => {
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
      coordinates: {
        latitude: '',
        longitude: ''
      },
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

  const handleRespond = async (emergencyId, status) => {
    try {
      await emergencyAPI.respond(emergencyId, {
        donorId: 'DONOR_ID_HERE', // You'll need to get this from context/auth
        donorName: 'Current Donor',
        donorPhone: '1234567890',
        responseStatus: status
      });
      success('Response Recorded', `You ${status} the emergency request`);
      fetchActiveEmergencies();
    } catch (err) {
      error('Failed to respond', err.response?.data?.message || 'Please try again');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-3">
          <AlertCircle className="h-8 w-8" />
          Emergency SOS Broadcast
        </h1>
        <p className="text-zinc-600 mt-1">Send urgent blood requests to nearby donors instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Form */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Create Emergency Broadcast</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Select Hospital *
              </label>
              {loadingHospitals ? (
                <div className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading hospitals...
                </div>
              ) : (
                <select
                  value={formData.hospitalId}
                  onChange={handleHospitalChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                <p className="mt-1 text-xs text-gray-600">
                  Selected: {formData.hospitalName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Blood Group *
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select</option>
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
                  Units Needed *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.unitsNeeded}
                  onChange={(e) => setFormData({...formData, unitsNeeded: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Urgency Level *
              </label>
              <select
                value={formData.urgencyLevel}
                onChange={(e) => setFormData({...formData, urgencyLevel: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Patient Condition *
              </label>
              <textarea
                value={formData.patientCondition}
                onChange={(e) => setFormData({...formData, patientCondition: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
                required
                placeholder="e.g., Accident victim, severe bleeding..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Location Address
              </label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => setFormData({
                  ...formData,
                  location: {...formData.location, address: e.target.value}
                })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Hospital address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              {loading ? 'Broadcasting...' : 'Broadcast Emergency SOS'}
            </button>
          </form>
        </div>

        {/* Active Emergencies */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Active Emergency Requests</h2>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {activeEmergencies.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
                <p className="text-zinc-600">No active emergencies</p>
              </div>
            ) : (
              activeEmergencies.map((emergency) => (
                <div key={emergency._id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-zinc-900">{emergency.hospitalName}</h3>
                      <p className="text-sm text-zinc-600">{emergency.patientCondition}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      emergency.urgencyLevel === 'critical' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {emergency.urgencyLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Blood:</span>
                      <span className="px-2 py-1 bg-red-600 text-white rounded">{emergency.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="font-medium">Units:</span> {emergency.unitsNeeded}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{emergency.donorsNotified} notified</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(emergency.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(emergency._id, 'accepted')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(emergency._id, 'declined')}
                      className="flex-1 bg-zinc-400 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
