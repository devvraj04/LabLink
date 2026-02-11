import React, { useState, useEffect } from 'react';
import { useHospitalAuth } from '../../context/HospitalAuthContext';
import { campsAPI } from '../../services/api';
import { CalendarCheck, MapPin, Users, Clock, Calendar, Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const HospitalCampsPage = () => {
    const { hospital } = useHospitalAuth();
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCamp, setExpandedCamp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy camps data
    const dummyCamps = [
        {
            _id: '1',
            name: 'Mega Blood Donation Drive - Pune',
            date: '2026-02-15',
            time: '9:00 AM - 5:00 PM',
            location: 'Shivaji Nagar Community Hall, Pune',
            organizer: hospital?.Hosp_Name || 'Hospital',
            status: 'upcoming',
            maxCapacity: 100,
            registrations: [
                { _id: 'r1', name: 'Rohit Sharma', phone: '9876543001', bloodGroup: 'A+', status: 'registered' },
                { _id: 'r2', name: 'Anjali Deshmukh', phone: '9876543002', bloodGroup: 'B+', status: 'registered' },
                { _id: 'r3', name: 'Kiran Patil', phone: '9876543003', bloodGroup: 'O+', status: 'registered' },
                { _id: 'r4', name: 'Deepak Joshi', phone: '9876543004', bloodGroup: 'AB+', status: 'registered' },
                { _id: 'r5', name: 'Swati Kulkarni', phone: '9876543005', bloodGroup: 'O-', status: 'registered' },
            ],
        },
        {
            _id: '2',
            name: 'World Blood Donor Day Camp',
            date: '2026-02-20',
            time: '10:00 AM - 4:00 PM',
            location: 'Koregaon Park, Pune',
            organizer: hospital?.Hosp_Name || 'Hospital',
            status: 'upcoming',
            maxCapacity: 75,
            registrations: [
                { _id: 'r6', name: 'Nikhil Agarwal', phone: '9876543006', bloodGroup: 'A-', status: 'registered' },
                { _id: 'r7', name: 'Prerna Goel', phone: '9876543007', bloodGroup: 'B-', status: 'registered' },
                { _id: 'r8', name: 'Manoj Tiwari', phone: '9876543008', bloodGroup: 'O+', status: 'registered' },
            ],
        },
        {
            _id: '3',
            name: 'College Blood Donation Camp',
            date: '2026-01-25',
            time: '9:00 AM - 3:00 PM',
            location: 'Savitribai Phule Pune University',
            organizer: hospital?.Hosp_Name || 'Hospital',
            status: 'completed',
            maxCapacity: 150,
            registrations: [
                { _id: 'r9', name: 'Siddharth Bhosale', phone: '9876543009', bloodGroup: 'A+', status: 'attended' },
                { _id: 'r10', name: 'Pooja Wagh', phone: '9876543010', bloodGroup: 'B+', status: 'attended' },
                { _id: 'r11', name: 'Varun Kale', phone: '9876543011', bloodGroup: 'O+', status: 'attended' },
                { _id: 'r12', name: 'Shruti Jain', phone: '9876543012', bloodGroup: 'AB-', status: 'no-show' },
                { _id: 'r13', name: 'Akash Deo', phone: '9876543013', bloodGroup: 'O-', status: 'attended' },
                { _id: 'r14', name: 'Neha Sawant', phone: '9876543014', bloodGroup: 'A+', status: 'attended' },
                { _id: 'r15', name: 'Raj Malhotra', phone: '9876543015', bloodGroup: 'B-', status: 'attended' },
            ],
        },
    ];

    useEffect(() => {
        // Try fetching real camps, fall back to dummy
        const fetchCamps = async () => {
            try {
                setLoading(true);
                const response = await campsAPI.getAll();
                if (response.data.success && response.data.data?.length > 0) {
                    setCamps(response.data.data);
                } else {
                    setCamps(dummyCamps);
                }
            } catch (e) {
                setCamps(dummyCamps);
            } finally {
                setLoading(false);
            }
        };
        fetchCamps();
    }, []);

    const toggleExpand = (campId) => {
        setExpandedCamp(expandedCamp === campId ? null : campId);
    };

    const displayCamps = camps.length > 0 ? camps : dummyCamps;

    const filteredCamps = displayCamps.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-600">Loading camps...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Donation Camps</h1>
                <p className="text-zinc-600">View camps and their registered donors</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search camps..."
                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
            </div>

            {/* Camps List */}
            <div className="space-y-4">
                {filteredCamps.map((camp) => (
                    <div key={camp._id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-all">
                        {/* Camp Header */}
                        <div
                            className="px-6 py-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                            onClick={() => toggleExpand(camp._id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${camp.status === 'completed' ? 'bg-zinc-100' : 'bg-teal-100'}`}>
                                        <CalendarCheck className={`h-6 w-6 ${camp.status === 'completed' ? 'text-zinc-600' : 'text-teal-600'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900">{camp.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-zinc-600">
                                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(camp.date).toLocaleDateString('en-IN')}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {camp.time}</span>
                                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {camp.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-sm font-medium text-zinc-900">
                                            <Users className="h-4 w-4 text-cyan-600" />
                                            {camp.registrations?.length || 0} registered
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${camp.status === 'completed' ? 'bg-zinc-100 text-zinc-600' :
                                                camp.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {camp.status?.charAt(0).toUpperCase() + camp.status?.slice(1)}
                                        </span>
                                    </div>
                                    {expandedCamp === camp._id ? (
                                        <ChevronUp className="h-5 w-5 text-zinc-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-zinc-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Registered Users */}
                        {expandedCamp === camp._id && (
                            <div className="border-t border-zinc-200">
                                <div className="px-6 py-3 bg-zinc-50">
                                    <h4 className="text-sm font-semibold text-zinc-700">Registered Donors ({camp.registrations?.length || 0})</h4>
                                </div>
                                {camp.registrations && camp.registrations.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-zinc-50 border-b border-zinc-200">
                                                <tr>
                                                    <th className="text-left px-6 py-2 text-xs font-semibold text-zinc-600 uppercase">#</th>
                                                    <th className="text-left px-6 py-2 text-xs font-semibold text-zinc-600 uppercase">Name</th>
                                                    <th className="text-left px-6 py-2 text-xs font-semibold text-zinc-600 uppercase">Phone</th>
                                                    <th className="text-left px-6 py-2 text-xs font-semibold text-zinc-600 uppercase">Blood Group</th>
                                                    <th className="text-left px-6 py-2 text-xs font-semibold text-zinc-600 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {camp.registrations.map((reg, idx) => (
                                                    <tr key={reg._id} className="hover:bg-zinc-50 transition-colors">
                                                        <td className="px-6 py-3 text-sm text-zinc-500">{idx + 1}</td>
                                                        <td className="px-6 py-3 text-sm font-medium text-zinc-900">{reg.name}</td>
                                                        <td className="px-6 py-3 text-sm text-zinc-700">{reg.phone}</td>
                                                        <td className="px-6 py-3">
                                                            <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 rounded-full">
                                                                {reg.bloodGroup}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${reg.status === 'attended' ? 'bg-emerald-100 text-emerald-700' :
                                                                    reg.status === 'no-show' ? 'bg-red-100 text-red-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {reg.status?.charAt(0).toUpperCase() + reg.status?.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="px-6 py-8 text-center text-zinc-500">
                                        <AlertCircle className="h-8 w-8 mx-auto text-zinc-300 mb-2" />
                                        No registrations yet
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {filteredCamps.length === 0 && (
                    <div className="text-center py-12">
                        <CalendarCheck className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
                        <p className="text-zinc-500">No camps found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalCampsPage;
