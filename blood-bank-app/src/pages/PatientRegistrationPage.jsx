import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/patientService';
import { getAadhaarLast4 } from '../utils/aadhaarQR';
import QRScannerModal from '../components/QRScannerModal';
import { useToast } from '../context/ToastContext';

export default function PatientRegistrationPage() {
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [registeredPatient, setRegisteredPatient] = useState(null);
    const [duplicates, setDuplicates] = useState([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        idType: '',
        idNumber: '',
        aadhaarLast4: '',
        emergencyName: '',
        emergencyContact: '',
        emergencyRelation: '',
        allergies: '',
        conditions: '',
        isTemporary: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleQRScan = (data) => {
        const nameParts = (data.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData(prev => ({
            ...prev,
            firstName,
            lastName,
            dob: data.dob || prev.dob,
            gender: data.gender ? data.gender.toLowerCase() : prev.gender,
            address: data.address || prev.address,
            city: data.city || prev.city,
            state: data.state || prev.state,
            pincode: data.pincode || prev.pincode,
            idType: 'aadhaar',
            idNumber: data.uid ? `XXXX-XXXX-${getAadhaarLast4(data.uid)}` : prev.idNumber,
            aadhaarLast4: data.uid ? getAadhaarLast4(data.uid) : prev.aadhaarLast4,
        }));

        setShowQRScanner(false);
        showSuccess('Aadhaar QR Scanned', `Extracted details for ${data.name || 'patient'}. Please review and complete.`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setDuplicates([]);
        setRegisteredPatient(null);

        try {
            const response = await patientAPI.register(formData);
            const result = response.data;

            if (result.duplicates && result.duplicates.length > 0) {
                setDuplicates(result.duplicates);
            }

            setRegisteredPatient(result.data);

            showSuccess(
                'Registration Complete',
                `UHID: ${result.data.patient.uhid} — Patient Registered`
            );

            // Reset form
            setFormData({
                firstName: '', lastName: '', dob: '', gender: '', bloodGroup: '',
                phone: '', email: '', address: '', city: '', state: '', pincode: '',
                idType: '', idNumber: '', aadhaarLast4: '',
                emergencyName: '', emergencyContact: '', emergencyRelation: '',
                allergies: '', conditions: '', isTemporary: false,
            });
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed';
            showError('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">🏥</span>
                        </div>
                        Smart Panjikaran
                    </h1>
                    <p className="text-gray-500 mt-2 ml-1 text-base">
                        New patient enrollment and admission intake.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border shadow-sm self-start md:self-auto">
                    <button
                        type="button"
                        onClick={() => setShowQRScanner(true)}
                        className="px-4 py-2 text-sm font-medium rounded-xl text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-colors flex items-center gap-2"
                    >
                        📷 Scan Aadhaar
                    </button>
                    <div className="h-6 w-px bg-gray-200" />
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 px-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="isTemporary"
                            checked={formData.isTemporary}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        Emergency Reg.
                    </label>
                </div>
            </div>

            {/* Success Banner */}
            {registeredPatient && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 text-lg">✅</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900 text-sm uppercase tracking-wide">Registration Successful</h4>
                        <p className="text-emerald-700 mt-0.5">
                            UHID: <span className="font-mono font-bold bg-white/50 px-1.5 py-0.5 rounded text-emerald-800">{registeredPatient.patient.uhid}</span> • {registeredPatient.patient.name}
                        </p>
                        {registeredPatient.credentials && (
                            <div className="mt-2 p-3 bg-white rounded-xl border border-emerald-200 text-sm">
                                <p className="font-semibold text-gray-800 mb-1">🔑 Patient Login Credentials:</p>
                                <p className="text-gray-600">Email/UHID: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{registeredPatient.credentials.loginEmail}</code></p>
                                <p className="text-gray-600">Password: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{registeredPatient.credentials.loginPassword}</code></p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Duplicate Warning */}
            {duplicates.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-amber-600">⚠️</span>
                        </div>
                        <h4 className="font-bold text-amber-800">Potential Duplicates Found</h4>
                    </div>
                    <ul className="space-y-2">
                        {duplicates.map(d => (
                            <li key={d.id} className="text-sm text-amber-700 bg-white/60 p-2 rounded-lg border border-amber-100/50 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <b>{d.name}</b> <span className="font-mono opacity-80">({d.uhid})</span> <span className="text-amber-600/70 text-xs">- {d.similarity} match</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        👤 Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name *</label>
                            <input name="firstName" value={formData.firstName} onChange={handleChange}
                                placeholder="John" required
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
                            <input name="lastName" value={formData.lastName} onChange={handleChange}
                                placeholder="Doe"
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</label>
                            <input name="dob" type="date" value={formData.dob} onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all">
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Blood Group</label>
                                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all">
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address & Contact */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        📍 Address & Contact
                    </h3>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number *</label>
                                <input name="phone" value={formData.phone} onChange={handleChange}
                                    placeholder="+91 99999 99999" required
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange}
                                    placeholder="john@example.com"
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Street Address</label>
                            <input name="address" value={formData.address} onChange={handleChange}
                                placeholder="Flat No, Building, Street"
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
                                <input name="city" value={formData.city} onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">State</label>
                                <input name="state" value={formData.state} onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pincode</label>
                                <input name="pincode" value={formData.pincode} onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Identity Proof */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        🪪 Identity Proof
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Type</label>
                            <select name="idType" value={formData.idType} onChange={handleChange}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                                <option value="">Select Document</option>
                                <option value="aadhaar">Aadhaar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="passport">Passport</option>
                                <option value="voter">Voter ID</option>
                                <option value="driving">Driving License</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Number</label>
                            <input name="idNumber" value={formData.idNumber} onChange={handleChange}
                                placeholder="XXXX-XXXX-XXXX"
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        🚨 Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                            <input name="emergencyName" value={formData.emergencyName} onChange={handleChange}
                                placeholder="Guardian Name"
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Number</label>
                            <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange}
                                placeholder="+91..."
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Relation</label>
                            <input name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange}
                                placeholder="Spouse, Parent..."
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                        </div>
                    </div>
                </div>

                {/* Medical Info */}
                <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                        💊 Medical Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Allergies</label>
                            <input name="allergies" value={formData.allergies} onChange={handleChange}
                                placeholder="Penicillin, Peanuts..."
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pre-existing Conditions</label>
                            <input name="conditions" value={formData.conditions} onChange={handleChange}
                                placeholder="Diabetes, Hypertension..."
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="sticky bottom-4 z-10 flex justify-end gap-3 p-4 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl">
                    <button type="button" onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        Complete Registration
                    </button>
                </div>
            </form>

            {/* Aadhaar QR Scanner Modal */}
            {showQRScanner && (
                <QRScannerModal
                    onScan={handleQRScan}
                    onClose={() => setShowQRScanner(false)}
                />
            )}
        </div>
    );
}
