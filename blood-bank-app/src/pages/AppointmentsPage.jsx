import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Check } from 'lucide-react';

const AppointmentsPage = () => {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    bloodGroup: '',
    appointmentDate: '',
    timeSlot: '',
    location: 'Main Blood Bank Center',
    locationAddress: '123 Healthcare Ave, Medical District',
    healthQuestionnaire: {
      weight: '',
      recentIllness: false,
      medications: '',
      recentTravel: false,
      chronicConditions: ''
    }
  });

  const fetchAvailableSlots = async (date, location) => {
    try {
      const response = await appointmentsAPI.getAvailableSlots({ date, location });
      setAvailableSlots(response.data.data.availableSlots || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    }
  };

  useEffect(() => {
    if (selectedDate && formData.location) {
      fetchAvailableSlots(selectedDate, formData.location);
    }
  }, [selectedDate, formData.location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user || !user._id) {
      error('Login Required', 'Please login to book an appointment');
      return;
    }

    try {
      const response = await appointmentsAPI.create({
        ...formData,
        donorId: user._id,
        donorName: formData.donorName || user.Bd_Name || user.name || 'Unknown Donor',
        donorPhone: formData.donorPhone || user.Bd_Cell_Num || user.phone || user.Bd_Phone || '',
        donorEmail: formData.donorEmail || user.Bd_Email || user.email || '',
        bloodGroup: formData.bloodGroup || user.Bd_Blood_Group || user.bloodGroup || user.Bd_Bgroup || '',
        appointmentDate: selectedDate
      });
      
      success('Appointment Booked!', 'Your blood donation appointment has been confirmed');
      // Reset form
      setStep(1);
      setSelectedDate('');
      setAvailableSlots([]);
      setFormData({
        donorName: '',
        donorPhone: '',
        donorEmail: '',
        bloodGroup: '',
        appointmentDate: '',
        timeSlot: '',
        location: 'Main Blood Bank Center',
        locationAddress: '123 Healthcare Ave, Medical District',
        healthQuestionnaire: {
          weight: '',
          recentIllness: false,
          medications: '',
          recentTravel: false,
          chronicConditions: ''
        }
      });
    } catch (err) {
      console.error('Appointment booking error:', err);
      error('Booking Failed', err.response?.data?.message || 'Please try again');
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          Book Donation Appointment
        </h1>
        <p className="text-zinc-600 mt-1">Schedule your blood donation at your convenience</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-600'
              } font-semibold`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-1 ${
                  step > s ? 'bg-blue-600' : 'bg-zinc-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-8">
          <span className="text-sm text-zinc-600">Personal Info</span>
          <span className="text-sm text-zinc-600">Select Slot</span>
          <span className="text-sm text-zinc-600">Health Check</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.donorName}
                    onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.donorPhone}
                    onChange={(e) => setFormData({...formData, donorPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.donorEmail}
                    onChange={(e) => setFormData({...formData, donorEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Next: Select Time Slot
              </button>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Select Date *</label>
                <input
                  type="date"
                  min={getTodayDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Available Time Slots</label>
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.length > 0 ? availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({...formData, timeSlot: slot})}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.timeSlot === slot
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-zinc-300 hover:border-blue-400'
                      }`}
                    >
                      <Clock className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{slot}</div>
                    </button>
                  )) : (
                    <div className="col-span-3 text-center text-zinc-500 py-4">
                      {selectedDate ? 'All slots booked for this date' : 'Please select a date'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 py-3 rounded-lg font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.timeSlot}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  Next: Health Check
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Health Questionnaire */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Health Questionnaire</h2>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  value={formData.healthQuestionnaire.weight}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthQuestionnaire: {...formData.healthQuestionnaire, weight: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Must be at least 50 kg"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.healthQuestionnaire.recentIllness}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthQuestionnaire: {...formData.healthQuestionnaire, recentIllness: e.target.checked}
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm text-zinc-700">Have you been ill in the past 2 weeks?</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.healthQuestionnaire.recentTravel}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthQuestionnaire: {...formData.healthQuestionnaire, recentTravel: e.target.checked}
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm text-zinc-700">Have you traveled to malaria-risk areas recently?</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Current Medications</label>
                <input
                  type="text"
                  value={formData.healthQuestionnaire.medications}
                  onChange={(e) => setFormData({
                    ...formData,
                    healthQuestionnaire: {...formData.healthQuestionnaire, medications: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="List any current medications"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 py-3 rounded-lg font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  Confirm Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentsPage;
