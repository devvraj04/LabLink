import React, { useState } from 'react';
import { Search, Phone, Mail, Droplets, Calendar, Filter, UserCheck, Clock, AlertCircle } from 'lucide-react';

const HospitalRecipientsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const dummyRecipients = [
        { id: 1, name: 'Arun Verma', bloodGroup: 'A+', phone: '9811223344', email: 'arun@email.com', requestDate: '2026-02-10', quantity: 2, status: 'pending', reason: 'Surgery - Cardiac bypass' },
        { id: 2, name: 'Geeta Bhatt', bloodGroup: 'B-', phone: '9822334455', email: 'geeta@email.com', requestDate: '2026-02-09', quantity: 3, status: 'fulfilled', reason: 'Emergency transfusion' },
        { id: 3, name: 'Dinesh Rao', bloodGroup: 'O+', phone: '9833445566', email: 'dinesh@email.com', requestDate: '2026-02-08', quantity: 1, status: 'fulfilled', reason: 'Thalassemia treatment' },
        { id: 4, name: 'Lata Kulkarni', bloodGroup: 'AB+', phone: '9844556677', email: 'lata@email.com', requestDate: '2026-02-11', quantity: 2, status: 'pending', reason: 'Post-delivery care' },
        { id: 5, name: 'Ramesh Jadhav', bloodGroup: 'A-', phone: '9855667788', email: 'ramesh@email.com', requestDate: '2026-02-07', quantity: 4, status: 'fulfilled', reason: 'Accident trauma' },
        { id: 6, name: 'Sunita More', bloodGroup: 'O-', phone: '9866778899', email: 'sunita@email.com', requestDate: '2026-02-06', quantity: 1, status: 'rejected', reason: 'Elective surgery' },
        { id: 7, name: 'Pranav Deshpande', bloodGroup: 'B+', phone: '9877889900', email: 'pranav@email.com', requestDate: '2026-02-11', quantity: 2, status: 'pending', reason: 'Dengue platelet therapy' },
        { id: 8, name: 'Asha Patil', bloodGroup: 'AB-', phone: '9888990011', email: 'asha@email.com', requestDate: '2026-02-05', quantity: 3, status: 'fulfilled', reason: 'Chemotherapy support' },
    ];

    const filtered = dummyRecipients.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.phone.includes(searchTerm) || r.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'fulfilled':
                return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Fulfilled</span>;
            case 'pending':
                return <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Pending</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Rejected</span>;
            default:
                return <span className="px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Recipients</h1>
                <p className="text-zinc-600">Patients who have received or requested blood</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, phone, or reason..."
                        className="w-full pl-9 pr-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600">Total Recipients</p>
                    <p className="text-2xl font-bold text-zinc-900">{dummyRecipients.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{dummyRecipients.filter(r => r.status === 'pending').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600 flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Fulfilled</p>
                    <p className="text-2xl font-bold text-emerald-600">{dummyRecipients.filter(r => r.status === 'fulfilled').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600">Total Units Needed</p>
                    <p className="text-2xl font-bold text-red-600">{dummyRecipients.reduce((acc, r) => acc + r.quantity, 0)}</p>
                </div>
            </div>

            {/* Recipients Table */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Patient</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Blood Group</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Units</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Reason</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Request Date</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((recipient) => (
                                <tr key={recipient.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {recipient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 text-sm">{recipient.name}</p>
                                                <p className="text-xs text-zinc-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {recipient.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                                            <Droplets className="h-3.5 w-3.5" />
                                            {recipient.bloodGroup}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">{recipient.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-700 max-w-xs truncate">{recipient.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-700 flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                            {new Date(recipient.requestDate).toLocaleDateString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(recipient.status)}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                        <AlertCircle className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
                                        No recipients found matching your criteria
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

export default HospitalRecipientsPage;
