import React, { useState, useEffect } from 'react';
import { campsAPI } from '../services/api';
import { Tent, MapPin, Calendar, Users, Plus, X, User, Phone, Mail, Droplet } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CampsPage = () => {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    bloodGroup: ''
  });

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const response = await campsAPI.getUpcoming();
      setCamps(response.data.data || []);
    } catch (err) {
      console.error('Error fetching camps:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (campId) => {
    if (!user) {
      error('Login Required', 'Please login to register for camps');
      return;
    }

    // Find the camp to display its name
    const camp = camps.find(c => c._id === campId);
    setSelectedCamp(camp);

    // Pre-fill form with user data if available
    setFormData({
      donorName: user.Bd_Name || user.name || '',
      donorPhone: user.Bd_Cell_Num || user.phone || user.Bd_Phone || '',
      donorEmail: user.Bd_Email || user.email || '',
      bloodGroup: user.Bd_Blood_Group || user.bloodGroup || user.Bd_Bgroup || ''
    });

    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    if (!formData.donorName.trim()) {
      error('Validation Error', 'Please provide your name');
      return;
    }

    if (!formData.donorPhone.trim()) {
      error('Validation Error', 'Please provide your phone number');
      return;
    }

    if (!formData.bloodGroup) {
      error('Validation Error', 'Please select your blood group');
      return;
    }

    try {
      await campsAPI.register(selectedCamp._id, {
        donorId: user._id,
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        donorEmail: formData.donorEmail,
        bloodGroup: formData.bloodGroup
      });
      success('Registered!', 'You have been registered for the camp');
      setShowModal(false);
      fetchCamps();
    } catch (err) {
      console.error('Camp registration error:', err);
      error('Registration Failed', err.response?.data?.message || 'Please try again');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
            <Tent className="h-8 w-8 text-green-600" />
            Blood Donation Camps
          </h1>
          <p className="text-zinc-600 mt-1">Join upcoming blood donation drives in your area</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps.map((camp) => (
          <div key={camp._id} className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-zinc-900">{camp.campName}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${camp.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                camp.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                  'bg-zinc-100 text-zinc-700'
                }`}>
                {camp.status.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-zinc-600 mb-4">{camp.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>{new Date(camp.campDate).toLocaleDateString()} • {camp.startTime} - {camp.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <span>{camp.location.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-zinc-500" />
                <span>{camp.registrations?.length || 0} / {camp.expectedDonors} registered</span>
              </div>
            </div>

            <button
              onClick={() => handleRegister(camp._id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Register for Camp
            </button>
          </div>
        ))}

        {camps.length === 0 && !loading && (
          <div className="col-span-3 text-center py-12">
            <Tent className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-600">No upcoming camps at the moment</p>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showModal && selectedCamp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-semibold">Register for Camp</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Camp Details */}
            <div className="px-6 py-4 bg-green-50 border-b border-green-100">
              <h3 className="font-semibold text-zinc-900 mb-2">{selectedCamp.campName}</h3>
              <div className="space-y-1 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedCamp.campDate).toLocaleDateString()} • {selectedCamp.startTime} - {selectedCamp.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedCamp.location.name}, {selectedCamp.location.address}</span>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmitRegistration} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="text"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleFormChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="tel"
                    name="donorPhone"
                    value={formData.donorPhone}
                    onChange={handleFormChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <input
                    type="email"
                    name="donorEmail"
                    value={formData.donorEmail}
                    onChange={handleFormChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Blood Group *
                </label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleFormChange}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
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
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Please arrive 15 minutes before the camp starts</li>
                  <li>Bring a valid ID proof</li>
                  <li>Ensure you've had a proper meal before donation</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampsPage;
