import React, { useState } from 'react';
import { TestTubes, Search, Clock, CheckCircle, AlertCircle, User, FileText, Filter } from 'lucide-react';

const HospitalLabTechnicianPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const dummyLabOrders = [
        { id: 'LAB-001', patientName: 'Rajesh Sharma', patientId: 'P-1001', test: 'Complete Blood Count (CBC)', status: 'completed', date: '2026-02-11', result: 'Normal', technicianNote: 'All values within range.' },
        { id: 'LAB-002', patientName: 'Priya Patel', patientId: 'P-1002', test: 'Blood Group & Rh Typing', status: 'completed', date: '2026-02-11', result: 'B+ Positive', technicianNote: '' },
        { id: 'LAB-003', patientName: 'Amit Kumar', patientId: 'P-1003', test: 'Cross-match Test', status: 'pending', date: '2026-02-11', result: '-', technicianNote: '' },
        { id: 'LAB-004', patientName: 'Sneha Desai', patientId: 'P-1004', test: 'HCV Antibody Test', status: 'in-progress', date: '2026-02-11', result: '-', technicianNote: '' },
        { id: 'LAB-005', patientName: 'Vikram Singh', patientId: 'P-1005', test: 'HIV 1/2 Antibody', status: 'completed', date: '2026-02-10', result: 'Non-reactive', technicianNote: 'Sample clear.' },
        { id: 'LAB-006', patientName: 'Anita Joshi', patientId: 'P-1006', test: 'HBsAg Test', status: 'pending', date: '2026-02-11', result: '-', technicianNote: '' },
        { id: 'LAB-007', patientName: 'Rahul Mehta', patientId: 'P-1007', test: 'Platelet Count', status: 'in-progress', date: '2026-02-11', result: '-', technicianNote: '' },
        { id: 'LAB-008', patientName: 'Kavita Nair', patientId: 'P-1008', test: 'Hemoglobin Level', status: 'completed', date: '2026-02-10', result: '13.5 g/dL', technicianNote: 'Normal hemoglobin.' },
        { id: 'LAB-009', patientName: 'Suresh Pandey', patientId: 'P-1009', test: 'Blood Sugar (Fasting)', status: 'completed', date: '2026-02-10', result: '98 mg/dL', technicianNote: 'Within normal range.' },
        { id: 'LAB-010', patientName: 'Meena Gupta', patientId: 'P-1010', test: 'Liver Function Test (LFT)', status: 'pending', date: '2026-02-11', result: '-', technicianNote: '' },
    ];

    const filtered = dummyLabOrders.filter(order => {
        const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.test.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Completed
                    </span>
                );
            case 'in-progress':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        <Clock className="h-3 w-3" /> In Progress
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                        <AlertCircle className="h-3 w-3" /> Pending
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <TestTubes className="h-7 w-7 text-purple-600" />
                    Lab Technician
                </h1>
                <p className="text-zinc-600">View and manage lab orders and test results</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600">Total Orders</p>
                    <p className="text-2xl font-bold text-zinc-900">{dummyLabOrders.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{dummyLabOrders.filter(o => o.status === 'pending').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{dummyLabOrders.filter(o => o.status === 'in-progress').length}</p>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4">
                    <p className="text-sm text-zinc-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Completed</p>
                    <p className="text-2xl font-bold text-emerald-600">{dummyLabOrders.filter(o => o.status === 'completed').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by patient name, order ID, or test name..."
                        className="w-full pl-9 pr-4 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Lab Orders Table */}
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Order ID</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Patient</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Test</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Date</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Result</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map((order) => (
                                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono font-medium text-purple-700">{order.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {order.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 text-sm">{order.patientName}</p>
                                                <p className="text-xs text-zinc-500">{order.patientId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-zinc-700 flex items-center gap-1">
                                            <TestTubes className="h-3.5 w-3.5 text-purple-500" />
                                            {order.test}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-600">
                                        {new Date(order.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium ${order.result === '-' ? 'text-zinc-400' : 'text-zinc-900'}`}>
                                            {order.result}
                                        </span>
                                        {order.technicianNote && (
                                            <p className="text-xs text-zinc-500 mt-0.5">{order.technicianNote}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">
                                        <TestTubes className="h-12 w-12 mx-auto text-zinc-300 mb-3" />
                                        No lab orders found
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

export default HospitalLabTechnicianPage;
