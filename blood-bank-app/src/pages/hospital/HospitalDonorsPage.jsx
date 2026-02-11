import React, { useState } from 'react';
import { Heart, Search, Phone, Mail, MapPin, Droplets, Calendar, Filter } from 'lucide-react';

const HospitalDonorsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('all');

    const dummyDonors = [
        { id: 1, name: 'Rajesh Sharma', bloodGroup: 'A+', phone: '9876543210', email: 'rajesh@email.com', lastDonation: '2026-01-15', totalDonations: 5, city: 'Pune', status: 'eligible' },
        { id: 2, name: 'Priya Patel', bloodGroup: 'B+', phone: '9876543211', email: 'priya@email.com', lastDonation: '2026-02-01', totalDonations: 3, city: 'Pune', status: 'recent' },
        { id: 3, name: 'Amit Kumar', bloodGroup: 'O+', phone: '9876543212', email: 'amit@email.com', lastDonation: '2025-11-20', totalDonations: 8, city: 'Pune', status: 'eligible' },
        { id: 4, name: 'Sneha Desai', bloodGroup: 'AB+', phone: '9876543213', email: 'sneha@email.com', lastDonation: '2026-01-28', totalDonations: 2, city: 'Pune', status: 'recent' },
        { id: 5, name: 'Vikram Singh', bloodGroup: 'A-', phone: '9876543214', email: 'vikram@email.com', lastDonation: '2025-10-05', totalDonations: 12, city: 'Pune', status: 'eligible' },
        { id: 6, name: 'Anita Joshi', bloodGroup: 'B-', phone: '9876543215', email: 'anita@email.com', lastDonation: '2025-12-10', totalDonations: 6, city: 'Pune', status: 'eligible' },
        { id: 7, name: 'Rahul Mehta', bloodGroup: 'O-', phone: '9876543216', email: 'rahul@email.com', lastDonation: '2026-01-20', totalDonations: 4, city: 'Pune', status: 'recent' },
        { id: 8, name: 'Kavita Nair', bloodGroup: 'AB-', phone: '9876543217', email: 'kavita@email.com', lastDonation: '2025-09-15', totalDonations: 7, city: 'Pune', status: 'eligible' },
        { id: 9, name: 'Suresh Pandey', bloodGroup: 'O+', phone: '9876543218', email: 'suresh@email.com', lastDonation: '2025-08-22', totalDonations: 15, city: 'Pune', status: 'eligible' },
        { id: 10, name: 'Meena Gupta', bloodGroup: 'A+', phone: '9876543219', email: 'meena@email.com', lastDonation: '2026-02-05', totalDonations: 1, city: 'Pune', status: 'recent' },
    ];

    const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const filteredDonors = dummyDonors.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.phone.includes(searchTerm) || d.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = filterGroup === 'all' || d.bloodGroup === filterGroup;
        return matchesSearch && matchesGroup;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Donors</h1>
                <p className="text-zinc-600">Registered donors associated with your hospital</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, phone, or email..."
                        className="w-full pl-9 pr-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="px-3 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    >
                        {bloodGroups.map(g => (
                            <option key={g} value={g}>{g === 'all' ? 'All Blood Groups' : g}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600">Total Donors</p>
                    <p className="text-2xl font-bold text-zinc-900">{dummyDonors.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600">Eligible Now</p>
                    <p className="text-2xl font-bold text-emerald-600">{dummyDonors.filter(d => d.status === 'eligible').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600">Recent Donors</p>
                    <p className="text-2xl font-bold text-amber-600">{dummyDonors.filter(d => d.status === 'recent').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600">Total Donations</p>
                    <p className="text-2xl font-bold text-cyan-600">{dummyDonors.reduce((acc, d) => acc + d.totalDonations, 0)}</p>
                </div>
            </div>

            {/* Donors Table */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Name</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Blood Group</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Contact</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Last Donation</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Total</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredDonors.map((donor) => (
                                <tr key={donor.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {donor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 text-sm">{donor.name}</p>
                                                <p className="text-xs text-zinc-500">{donor.city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                                            <Droplets className="h-3.5 w-3.5" />
                                            {donor.bloodGroup}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-zinc-700 flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {donor.phone}
                                            </span>
                                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {donor.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-700 flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                            {new Date(donor.lastDonation).toLocaleDateString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">{donor.totalDonations}</td>
                                    <td className="px-6 py-4">
                                        {donor.status === 'eligible' ? (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Eligible</span>
                                        ) : (
                                            <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Recent Donor</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredDonors.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                        <Heart className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
                                        No donors found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HospitalDonorsPage;
