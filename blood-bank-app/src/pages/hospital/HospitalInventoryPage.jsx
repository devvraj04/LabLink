import React, { useState, useEffect } from 'react';
import { useHospitalAuth } from '../../context/HospitalAuthContext';
import { hospitalRequestsAPI } from '../../services/api';
import { Package, Droplets, Plus, Minus, AlertTriangle, Search, RefreshCw } from 'lucide-react';

const HospitalInventoryPage = () => {
    const { hospital } = useHospitalAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy inventory data
    const dummyInventory = [
        { bloodGroup: 'A+', quantity: 25, expiringIn7Days: 3, status: 'adequate' },
        { bloodGroup: 'A-', quantity: 8, expiringIn7Days: 1, status: 'low' },
        { bloodGroup: 'B+', quantity: 30, expiringIn7Days: 5, status: 'adequate' },
        { bloodGroup: 'B-', quantity: 5, expiringIn7Days: 0, status: 'critical' },
        { bloodGroup: 'AB+', quantity: 12, expiringIn7Days: 2, status: 'adequate' },
        { bloodGroup: 'AB-', quantity: 3, expiringIn7Days: 1, status: 'critical' },
        { bloodGroup: 'O+', quantity: 45, expiringIn7Days: 8, status: 'adequate' },
        { bloodGroup: 'O-', quantity: 10, expiringIn7Days: 2, status: 'low' },
    ];

    const dummyMedicalSupplies = [
        { name: 'Blood Collection Bags', quantity: 200, unit: 'pcs', status: 'adequate' },
        { name: 'IV Drip Sets', quantity: 150, unit: 'pcs', status: 'adequate' },
        { name: 'Syringes (10ml)', quantity: 500, unit: 'pcs', status: 'adequate' },
        { name: 'Blood Typing Reagents', quantity: 45, unit: 'kits', status: 'low' },
        { name: 'Anticoagulant (CPDA)', quantity: 30, unit: 'bottles', status: 'low' },
        { name: 'Cross-match Tubes', quantity: 300, unit: 'pcs', status: 'adequate' },
        { name: 'Platelet Bags', quantity: 15, unit: 'pcs', status: 'critical' },
        { name: 'FFP Storage Bags', quantity: 80, unit: 'pcs', status: 'adequate' },
    ];

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            try {
                const response = await hospitalRequestsAPI.getInventorySummary();
                if (response.data.success && response.data.data.inventory?.length > 0) {
                    setInventory(response.data.data.inventory);
                } else {
                    setInventory(dummyInventory);
                }
            } catch (e) {
                setInventory(dummyInventory);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'critical':
                return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Critical</span>;
            case 'low':
                return <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Low</span>;
            default:
                return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Adequate</span>;
        }
    };

    const filteredSupplies = dummyMedicalSupplies.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-600">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Hospital Inventory</h1>
                    <p className="text-zinc-600">Manage blood stock and medical supplies</p>
                </div>
                <button
                    onClick={fetchInventory}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Blood Inventory Grid */}
            <div>
                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-red-600" />
                    Blood Stock
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(inventory.length > 0 ? inventory : dummyInventory).map((item) => (
                        <div
                            key={item.bloodGroup}
                            className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold text-red-600">{item.bloodGroup}</span>
                                <Droplets className="h-6 w-6 text-red-400" />
                            </div>
                            <p className="text-3xl font-bold text-zinc-900">{item.quantity}</p>
                            <p className="text-sm text-zinc-500 mb-2">units available</p>
                            {item.expiringIn7Days > 0 && (
                                <div className="flex items-center gap-1 text-amber-600 text-xs">
                                    <AlertTriangle className="h-3 w-3" />
                                    {item.expiringIn7Days} expiring in 7 days
                                </div>
                            )}
                            <div className="mt-2">
                                {getStatusBadge(item.status || 'adequate')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Medical Supplies Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-600" />
                        Medical Supplies
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search supplies..."
                            className="pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                        />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Item</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Quantity</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Unit</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredSupplies.map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-700">{item.quantity}</td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">{item.unit}</td>
                                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HospitalInventoryPage;
