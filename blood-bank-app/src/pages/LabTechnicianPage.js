import React, { useState, useEffect, useCallback, useRef } from 'react';
import Barcode from 'react-barcode';
import { Html5Qrcode } from 'html5-qrcode';
import { labAPI } from '../services/labService';

export default function LabTechnicianPage() {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [stats, setStats] = useState({});
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);
    const searchInputRef = useRef(null);
    const [openPaymentId, setOpenPaymentId] = useState(null);
    const html5QrCodeRef = useRef(null);
    const fileInputRef = useRef(null);

    // Modals
    const [barcodeModal, setBarcodeModal] = useState(null);
    const [resultModal, setResultModal] = useState(null);
    const [resultForm, setResultForm] = useState({});
    const [resultLoading, setResultLoading] = useState(false);
    const [reportViewModal, setReportViewModal] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null); // Track if editing existing result

    const showToast = (title, message, type = 'success') => {
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 3000);
    };



    const handleFileUpload = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                // We need an element for Html5Qrcode instance, we can use a hidden one
                const html5QrCode = new Html5Qrcode("barcode-scanner-hidden");
                const decodedText = await html5QrCode.scanFile(file, true);
                setSearchQuery(decodedText);
                showToast('Scanned!', `Barcode from image: ${decodedText}`);
            } catch (err) {
                console.error('File scan error:', err);
                showToast('Error', 'Could not scan barcode from image. Ensure image is clear.', 'error');
            } finally {
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    // Seed data on first load
    useEffect(() => { labAPI.seedData().catch(() => { }); }, []);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = { status: statusFilter };
            if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
            const res = await labAPI.getTechnicianRequests(params);
            setRequests(res.data.data || []);
            setStats(res.data.stats || {});
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery]);

    const fetchInventory = useCallback(async () => {
        try {
            const res = await labAPI.getInventory();
            setInventory(res.data.data || []);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        }
    }, []);

    const fetchPayments = useCallback(async () => {
        try {
            const res = await labAPI.getPaymentSummary();
            setPaymentData(res.data.data || null);
        } catch (err) {
            console.error('Error fetching payments:', err);
        }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);
    useEffect(() => { fetchInventory(); }, [fetchInventory]);
    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    // Debounced search: refetch requests when searchQuery changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRequests();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    // Approve order
    const approveOrder = async (orderId) => {
        try {
            await labAPI.approveOrder(orderId);
            showToast('Approved', 'Order approved successfully');
            fetchRequests();
        } catch (err) {
            showToast('Error', err.response?.data?.error || 'Failed', 'error');
        }
    };

    // Generate barcode
    const handleGenerateBarcode = async (orderId) => {
        try {
            const res = await labAPI.generateBarcode({ orderId });
            setBarcodeModal(res.data.data);
            showToast('Barcode', res.data.message);
            fetchRequests();
        } catch (err) {
            showToast('Error', err.response?.data?.error || 'Failed', 'error');
        }
    };

    // Open result entry modal (new or edit)
    const openResultEntry = (order) => {
        const test = order.LabTest || order.testId;
        const initial = {};
        if (test?.resultFields) {
            test.resultFields.forEach((f) => { initial[f.fieldName] = ''; });
        }
        setResultForm(initial);
        setEditingOrder(null);
        setResultModal(order);
    };

    // Open result entry modal pre-filled for editing
    const openEditResult = (order) => {
        const test = order.LabTest || order.testId;
        const initial = {};
        if (test?.resultFields) {
            test.resultFields.forEach((f) => {
                initial[f.fieldName] = order.resultData?.[f.fieldName] ?? '';
            });
        }
        setResultForm(initial);
        setEditingOrder(order);
        setResultModal(order);
    };

    // Submit test result (new or update)
    const handleSubmitResult = async () => {
        if (!resultModal) return;
        setResultLoading(true);
        try {
            let res;
            if (editingOrder) {
                // Update existing result
                res = await labAPI.updateResult(resultModal._id, { resultData: resultForm });
            } else {
                // Submit new result
                res = await labAPI.submitResult({
                    orderId: resultModal._id,
                    resultData: resultForm,
                });
            }
            showToast(editingOrder ? 'Result Updated' : 'Result Saved', res.data.message);
            setResultModal(null);
            setEditingOrder(null);
            fetchRequests();
        } catch (err) {
            showToast('Error', err.response?.data?.error || 'Failed', 'error');
        } finally {
            setResultLoading(false);
        }
    };

    // Record payment
    const handleRecordPayment = async (orderId, paymentMode) => {
        try {
            await labAPI.recordPayment({ orderId, paymentMode });
            showToast('Payment', 'Payment recorded');
            fetchRequests();
            fetchPayments();
        } catch (err) {
            showToast('Error', err.response?.data?.error || 'Failed', 'error');
        }
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-blue-100 text-blue-700',
        sample_collected: 'bg-indigo-100 text-indigo-700',
        processing: 'bg-purple-100 text-purple-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-gray-100 text-gray-500',
    };

    const priorityColors = {
        ROUTINE: 'bg-gray-100 text-gray-600',
        URGENT: 'bg-orange-100 text-orange-700',
        STAT: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Hidden scanner element for file upload */}
            <div id="barcode-scanner-hidden" className="hidden"></div>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-teal-500'}`}>
                    <p className="font-bold">{toast.title}</p>
                    <p>{toast.message}</p>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">🧑‍🔬 Lab Technician Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Manage samples, enter results, track payments</p>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                    { label: 'Pending', count: stats.byStatus?.pending || 0, color: 'from-amber-400 to-orange-400', icon: '⏳' },
                    { label: 'Approved', count: stats.byStatus?.approved || 0, color: 'from-blue-400 to-indigo-400', icon: '✅' },
                    { label: 'Collected', count: stats.byStatus?.sample_collected || 0, color: 'from-indigo-400 to-purple-400', icon: '🧪' },
                    { label: 'Processing', count: stats.byStatus?.processing || 0, color: 'from-purple-400 to-pink-400', icon: '⚙️' },
                    { label: 'Completed', count: stats.byStatus?.completed || 0, color: 'from-green-400 to-emerald-400', icon: '✔️' },
                ].map((s) => (
                    <div key={s.label} className={`glass-card-mini p-4 text-center`}>
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-bold text-gray-800">{s.count}</div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 glass-card-mini w-fit flex-wrap">
                {[
                    { id: 'requests', label: '📋 Requests' },
                    { id: 'inventory', label: '📦 Inventory' },
                    { id: 'payments', label: '💰 Payment Tracker' },
                ].map((tab) => (
                    <button key={tab.id}
                        onClick={() => { setActiveTab(tab.id); if (tab.id === 'payments') fetchPayments(); }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                            }`}>{tab.label}</button>
                ))}
            </div>

            {/* ===================== REQUESTS ===================== */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {/* Filter & Search */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'pending', 'approved', 'sample_collected', 'processing', 'completed'].map((s) => (
                                <button key={s} onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}>{s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</button>
                            ))}
                        </div>
                        <div className="flex gap-2 flex-1 max-w-lg">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search patient, test, barcode..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-sm"
                                        title="Clear search"
                                    >✕</button>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                title="Upload barcode image"
                            >
                                🖼️ Upload
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="glass-card-mini p-12 text-center">
                            <div className="text-5xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-gray-700">No requests found</h3>
                            <p className="text-gray-500">Lab orders will appear here when patients submit them</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((order) => {
                                const test = order.LabTest || order.testId;
                                return (
                                    <div key={order._id} className={`glass-card-mini p-4 relative ${openPaymentId === order._id ? 'z-30' : 'z-0'}`}>
                                        {/* Safety Alerts */}
                                        {order.safetyAlerts && (order.safetyAlerts.hasAllergies || order.safetyAlerts.requiresMRISafetyCheck) && (
                                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                                                <span className="text-lg">⚠️</span>
                                                <div>
                                                    {order.safetyAlerts.hasAllergies && (
                                                        <div><strong>Allergies:</strong> {order.safetyAlerts.allergies.map(a => a.allergen).join(', ')}</div>
                                                    )}
                                                    {order.safetyAlerts.requiresMRISafetyCheck && (
                                                        <div><strong>Implant Safety Check Required</strong> — {order.safetyAlerts.implants.map(i => i.type).join(', ')}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between flex-wrap gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="font-semibold text-gray-800">{test?.name || 'Unknown Test'}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>{order.status?.replace('_', ' ')}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[order.priority] || 'bg-gray-100'}`}>{order.priority}</span>
                                                    {order.isCritical && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ CRITICAL</span>}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-4 flex-wrap">
                                                    <span>👤 {order.Patient?.name || order.patientName || 'N/A'}</span>
                                                    <span>🏷️ {order.Patient?.uhid || 'N/A'}</span>
                                                    {order.barcode && <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">📊 {order.barcode}</span>}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {test?.code} • {test?.sampleType || 'N/A'} • {new Date(order.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 flex-wrap items-center">
                                                {order.status === 'pending' && (
                                                    <button onClick={() => approveOrder(order._id)}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors">
                                                        ✅ Approve
                                                    </button>
                                                )}
                                                {order.status === 'approved' && (
                                                    <button onClick={() => handleGenerateBarcode(order._id)}
                                                        className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
                                                        📊 Barcode + Collect
                                                    </button>
                                                )}
                                                {(order.status === 'sample_collected' || order.status === 'processing') && (
                                                    <button onClick={() => openResultEntry(order)}
                                                        className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors">
                                                        📝 Enter Result
                                                    </button>
                                                )}
                                                {order.status === 'completed' && order.resultData && (
                                                    <>
                                                        <button onClick={() => setReportViewModal(order)}
                                                            className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors">
                                                            📄 View Report
                                                        </button>
                                                        <button onClick={() => openEditResult(order)}
                                                            className="px-3 py-1.5 rounded-lg bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 transition-colors">
                                                            ✏️ Edit Result
                                                        </button>
                                                    </>
                                                )}
                                                {/* Payment */}
                                                {!order.isPaid && order.status !== 'cancelled' && (
                                                    <div className="relative">
                                                        <button onClick={() => setOpenPaymentId(openPaymentId === order._id ? null : order._id)}
                                                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors">
                                                            💰 Pay
                                                        </button>
                                                        {openPaymentId === order._id && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setOpenPaymentId(null)} />
                                                                <div className="absolute right-0 top-full mt-1 bg-white shadow-2xl rounded-xl p-2 z-50 min-w-[160px] border border-gray-100 animate-fade-in">
                                                                    {['cash', 'card', 'upi', 'online'].map((mode) => (
                                                                        <button key={mode} onClick={() => { handleRecordPayment(order._id, mode); setOpenPaymentId(null); }}
                                                                            className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-amber-50 capitalize transition-colors flex items-center gap-2">
                                                                            <span>{mode === 'cash' ? '💵' : mode === 'card' ? '💳' : mode === 'upi' ? '📱' : '🌐'}</span>
                                                                            {mode}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {order.isPaid && (
                                                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">💳 {order.paymentMode}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ===================== INVENTORY ===================== */}
            {activeTab === 'inventory' && (
                <div>
                    {inventory.length === 0 ? (
                        <div className="glass-card-mini p-12 text-center">
                            <div className="text-5xl mb-4">📦</div>
                            <h3 className="text-lg font-semibold text-gray-700">No inventory items</h3>
                            <p className="text-gray-500">Inventory data is loaded when tests are seeded</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {inventory.map((item) => {
                                const stockPercent = item.maxStock ? (item.currentStock / item.maxStock) * 100 : 50;
                                const isLow = item.currentStock <= item.minStock;
                                return (
                                    <div key={item._id} className={`glass-card-mini p-4 ${isLow ? 'ring-2 ring-red-300' : ''}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.category}</span>
                                            {isLow && <span className="text-xs text-red-600 font-medium">⚠️ Low Stock</span>}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                                        <p className="text-xs text-gray-400 mb-3">{item.itemCode}</p>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-2xl font-bold text-gray-800">{item.currentStock}</span>
                                            <span className="text-sm text-gray-400 mb-0.5">{item.unit}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-teal-500'}`}
                                                style={{ width: `${Math.min(stockPercent, 100)}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Min: {item.minStock}</span>
                                            {item.unitCost && <span>₹{item.unitCost}/{item.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ===================== PAYMENT TRACKER ===================== */}
            {activeTab === 'payments' && paymentData && (
                <div className="space-y-6">
                    {/* Revenue Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card-mini p-5 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="text-3xl mb-1">💰</div>
                            <div className="text-2xl font-bold text-green-600">₹{paymentData.totalRevenue?.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Total Revenue</div>
                        </div>
                        <div className="glass-card-mini p-5 text-center bg-gradient-to-br from-amber-50 to-orange-50">
                            <div className="text-3xl mb-1">⏳</div>
                            <div className="text-2xl font-bold text-amber-600">₹{paymentData.pendingPayments?.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Pending Payments</div>
                        </div>
                        <div className="glass-card-mini p-5 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="text-3xl mb-1">📊</div>
                            <div className="text-2xl font-bold text-blue-600">{paymentData.paidOrders}</div>
                            <div className="text-xs text-gray-500">Paid Orders</div>
                        </div>
                        <div className="glass-card-mini p-5 text-center bg-gradient-to-br from-red-50 to-pink-50">
                            <div className="text-3xl mb-1">📝</div>
                            <div className="text-2xl font-bold text-red-600">{paymentData.unpaidOrders}</div>
                            <div className="text-xs text-gray-500">Unpaid Orders</div>
                        </div>
                    </div>

                    {/* Payment Mode Breakdown */}
                    {paymentData.byMode && Object.keys(paymentData.byMode).length > 0 && (
                        <div className="glass-card-mini p-5">
                            <h3 className="font-semibold text-gray-700 mb-4">Payment Mode Breakdown</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(paymentData.byMode).map(([mode, amount]) => (
                                    <div key={mode} className="p-4 bg-gray-50 rounded-xl text-center">
                                        <div className="text-sm text-gray-400 capitalize">{mode}</div>
                                        <div className="text-xl font-bold text-gray-800 mt-1">₹{amount.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Payments */}
                    {paymentData.recentPayments && paymentData.recentPayments.length > 0 && (
                        <div className="glass-card-mini p-5">
                            <h3 className="font-semibold text-gray-700 mb-4">Recent Payments</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="p-3 text-gray-500">Patient</th>
                                            <th className="p-3 text-gray-500">Test</th>
                                            <th className="p-3 text-gray-500">Amount</th>
                                            <th className="p-3 text-gray-500">Mode</th>
                                            <th className="p-3 text-gray-500">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentData.recentPayments.map((p) => (
                                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                <td className="p-3 font-medium">{p.patientName}</td>
                                                <td className="p-3 text-gray-500">{p.testName}</td>
                                                <td className="p-3 font-bold text-green-600">₹{p.amount}</td>
                                                <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs capitalize">{p.mode}</span></td>
                                                <td className="p-3 text-gray-400">{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'payments' && !paymentData && (
                <div className="glass-card-mini p-12 text-center">
                    <div className="text-5xl mb-4">💰</div>
                    <h3 className="text-lg font-semibold text-gray-700">No payment data</h3>
                    <p className="text-gray-500">Payment data appears when orders are placed and paid</p>
                </div>
            )}

            {/* ===================== BARCODE MODAL ===================== */}
            {barcodeModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setBarcodeModal(null)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">🏷️ Barcode Generated</h2>
                        <div className="p-6 bg-gray-50 rounded-xl mb-4">
                            <div className="flex justify-center mb-3">
                                <Barcode
                                    value={barcodeModal.barcode}
                                    format="CODE128"
                                    width={2}
                                    height={80}
                                    displayValue={true}
                                    fontSize={14}
                                    font="monospace"
                                    textMargin={6}
                                    margin={10}
                                    background="#f9fafb"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-3">Sample collected successfully</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => {
                                const w = window.open('', '_blank');
                                if (w) {
                                    w.document.write(`<!DOCTYPE html><html><head><title>Barcode - ${barcodeModal.barcode}</title>
                                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
                                    <style>
                                        body { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:Arial,sans-serif; margin:0; }
                                        .label { font-size:12px; color:#666; margin-bottom:10px; }
                                        .title { font-size:16px; font-weight:bold; color:#0d9488; margin-bottom:20px; }
                                        @media print { .no-print { display:none; } }
                                    </style></head><body>
                                    <div class="title">HealthTech Labs</div>
                                    <div class="label">Sample Barcode</div>
                                    <svg id="barcode"></svg>
                                    <br/>
                                    <button class="no-print" onclick="window.print()" style="padding:10px 30px;font-size:16px;cursor:pointer;background:#0d9488;color:white;border:none;border-radius:8px;margin-top:20px">🖨️ Print</button>
                                    <script>JsBarcode("#barcode", "${barcodeModal.barcode}", { format: "CODE128", width: 2, height: 80, displayValue: true, fontSize: 16, font: "monospace", textMargin: 8, margin: 10 });</script>
                                    </body></html>`);
                                    w.document.close();
                                }
                            }} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-all">
                                🖨️ Print
                            </button>
                            <button onClick={() => setBarcodeModal(null)} className="flex-1 py-2 rounded-xl border text-gray-600 hover:bg-gray-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== RESULT ENTRY MODAL ===================== */}
            {resultModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setResultModal(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{editingOrder ? '✏️ Edit Results' : '📝 Enter Results'}</h2>
                                <p className="text-sm text-gray-400">
                                    {(resultModal.LabTest || resultModal.testId)?.name} — {resultModal.patientName}
                                </p>
                            </div>
                            <button onClick={() => setResultModal(null)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
                        </div>

                        {/* Safety alerts */}
                        {resultModal.safetyAlerts?.hasAllergies && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                ⚠️ <strong>Allergies:</strong> {resultModal.safetyAlerts.allergies.map(a => a.allergen).join(', ')}
                            </div>
                        )}

                        {resultModal.barcode && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                                <span className="text-gray-400">Barcode: </span>
                                <span className="font-mono font-bold">{resultModal.barcode}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {((resultModal.LabTest || resultModal.testId)?.resultFields || [])
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((field) => {
                                    const val = resultForm[field.fieldName] || '';
                                    const numVal = parseFloat(val);
                                    const isAbnormal = field.fieldType === 'number' && field.normalMin != null && field.normalMax != null &&
                                        val !== '' && !isNaN(numVal) && (numVal < field.normalMin || numVal > field.normalMax);

                                    return (
                                        <div key={field.fieldName} className={`p-4 rounded-xl border transition-colors ${isAbnormal ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {field.fieldLabel}
                                                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.fieldType === 'select' ? (
                                                <select value={val} onChange={(e) => setResultForm(prev => ({ ...prev, [field.fieldName]: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200">
                                                    <option value="">Select...</option>
                                                    {(field.options || []).map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.fieldType === 'text' ? (
                                                <textarea value={val} onChange={(e) => setResultForm(prev => ({ ...prev, [field.fieldName]: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200" rows={3}
                                                    placeholder={`Enter ${field.fieldLabel.toLowerCase()}...`} />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <input type="number" step="any" value={val}
                                                        onChange={(e) => setResultForm(prev => ({ ...prev, [field.fieldName]: e.target.value }))}
                                                        className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-200 ${isAbnormal ? 'border-red-300' : 'border-gray-200 focus:border-teal-500'}`}
                                                        placeholder={`Normal: ${field.normalMin} - ${field.normalMax}`} />
                                                    {field.unit && <span className="text-sm text-gray-400 whitespace-nowrap">{field.unit}</span>}
                                                </div>
                                            )}
                                            {field.normalMin != null && field.normalMax != null && (
                                                <p className="text-xs text-gray-400 mt-1">Normal range: {field.normalMin} – {field.normalMax} {field.unit}</p>
                                            )}
                                            {isAbnormal && (
                                                <p className="text-xs text-red-600 font-medium mt-1">⚠️ Value is outside normal range!</p>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSubmitResult} disabled={resultLoading}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                                {resultLoading ? '⏳ Submitting...' : editingOrder ? '✅ Update Results' : '✅ Submit Results'}
                            </button>
                            <button onClick={() => setResultModal(null)}
                                className="px-6 py-3 rounded-xl border text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== REPORT VIEW MODAL ===================== */}
            {reportViewModal && (() => {
                const test = reportViewModal.LabTest || reportViewModal.testId;
                const resultData = reportViewModal.resultData || {};
                const resultFields = test?.resultFields || [];

                const downloadReportPDF = () => {
                    const w = window.open('', '_blank');
                    if (!w) return;

                    const rows = resultFields.sort((a, b) => a.sortOrder - b.sortOrder).map(f => {
                        const val = resultData[f.fieldName] ?? 'N/A';
                        const numVal = parseFloat(val);
                        const isAbnormal = f.fieldType === 'number' && f.normalMin != null && f.normalMax != null &&
                            !isNaN(numVal) && (numVal < f.normalMin || numVal > f.normalMax);
                        const range = (f.normalMin != null && f.normalMax != null) ? `${f.normalMin} - ${f.normalMax}` : '-';
                        return `<tr style="border-bottom:1px solid #e5e7eb">
                            <td style="padding:10px;font-weight:500">${f.fieldLabel}</td>
                            <td style="padding:10px;font-weight:bold;color:${isAbnormal ? '#dc2626' : '#111'}">${val} ${f.unit || ''} ${isAbnormal ? '⚠️' : ''}</td>
                            <td style="padding:10px;color:#6b7280">${range} ${f.unit || ''}</td>
                            <td style="padding:10px;color:${isAbnormal ? '#dc2626' : '#16a34a'};font-weight:600">${isAbnormal ? 'ABNORMAL' : 'Normal'}</td>
                        </tr>`;
                    }).join('');

                    w.document.write(`<!DOCTYPE html><html><head><title>Lab Report - ${reportViewModal.patientName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; color: #111; }
                        .header { text-align: center; border-bottom: 3px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px; }
                        .header h1 { color: #0d9488; margin: 0; font-size: 24px; }
                        .header p { color: #6b7280; margin: 4px 0 0; font-size: 12px; }
                        .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; font-size: 13px; }
                        .patient-info strong { color: #374151; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th { background: #0d9488; color: white; padding: 10px; text-align: left; font-size: 13px; }
                        td { font-size: 13px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px; }
                        .critical { background: #fef2f2; padding: 10px; border-radius: 8px; border: 1px solid #fecaca; color: #dc2626; font-weight: bold; text-align: center; margin-bottom: 15px; }
                        @media print { .no-print { display: none; } }
                    </style></head><body>
                    <div class="header">
                        <h1>🏥 HealthTech Labs</h1>
                        <p>Diagnostic Report</p>
                    </div>
                    ${reportViewModal.isCritical ? '<div class="critical">⚠️ CRITICAL VALUES DETECTED — IMMEDIATE ATTENTION REQUIRED</div>' : ''}
                    <div class="patient-info">
                        <div><strong>Patient:</strong> ${reportViewModal.patientName}</div>
                        <div><strong>Test:</strong> ${test?.name || 'N/A'}</div>
                        <div><strong>Barcode:</strong> ${reportViewModal.barcode || 'N/A'}</div>
                        <div><strong>Date:</strong> ${reportViewModal.resultedAt ? new Date(reportViewModal.resultedAt).toLocaleString() : 'N/A'}</div>
                        <div><strong>Email:</strong> ${reportViewModal.patientEmail || 'N/A'}</div>
                        <div><strong>Status:</strong> Completed</div>
                    </div>
                    <table><thead><tr><th>Parameter</th><th>Result</th><th>Normal Range</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
                    <div class="footer">
                        <p>This is a computer-generated report. | Generated: ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="no-print" style="text-align:center;margin-top:20px">
                        <button onclick="window.print()" style="padding:12px 40px;font-size:16px;cursor:pointer;background:#0d9488;color:white;border:none;border-radius:8px">🖨️ Print / Save PDF</button>
                    </div>
                    </body></html>`);
                    w.document.close();
                };

                return (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setReportViewModal(null)}>
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">📄 Lab Report</h2>
                                    <p className="text-sm text-gray-400">{test?.name} — {reportViewModal.patientName}</p>
                                </div>
                                <button onClick={() => setReportViewModal(null)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
                            </div>

                            {reportViewModal.isCritical && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold text-center">
                                    ⚠️ CRITICAL VALUES DETECTED
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm mb-4 p-4 bg-gray-50 rounded-xl">
                                <div><span className="text-gray-400">Patient:</span> <span className="font-medium">{reportViewModal.patientName}</span></div>
                                <div><span className="text-gray-400">Test:</span> <span className="font-medium">{test?.name}</span></div>
                                {reportViewModal.barcode && <div><span className="text-gray-400">Barcode:</span> <span className="font-mono font-medium">{reportViewModal.barcode}</span></div>}
                                <div><span className="text-gray-400">Date:</span> <span className="font-medium">{reportViewModal.resultedAt ? new Date(reportViewModal.resultedAt).toLocaleString() : 'N/A'}</span></div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-teal-500 text-white">
                                            <th className="p-3 text-left rounded-tl-lg">Parameter</th>
                                            <th className="p-3 text-left">Result</th>
                                            <th className="p-3 text-left">Normal Range</th>
                                            <th className="p-3 text-left rounded-tr-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultFields.sort((a, b) => a.sortOrder - b.sortOrder).map((f) => {
                                            const val = resultData[f.fieldName] ?? 'N/A';
                                            const numVal = parseFloat(val);
                                            const isAbnormal = f.fieldType === 'number' && f.normalMin != null && f.normalMax != null &&
                                                !isNaN(numVal) && (numVal < f.normalMin || numVal > f.normalMax);
                                            return (
                                                <tr key={f.fieldName} className={`border-b ${isAbnormal ? 'bg-red-50' : ''}`}>
                                                    <td className="p-3 font-medium">{f.fieldLabel}</td>
                                                    <td className={`p-3 font-bold ${isAbnormal ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {val} {f.unit || ''} {isAbnormal && '⚠️'}
                                                    </td>
                                                    <td className="p-3 text-gray-400">
                                                        {f.normalMin != null && f.normalMax != null ? `${f.normalMin} - ${f.normalMax} ${f.unit || ''}` : '-'}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isAbnormal ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {isAbnormal ? 'ABNORMAL' : 'Normal'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={downloadReportPDF}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">
                                    🖨️ Print / Download PDF
                                </button>
                                <button onClick={() => setReportViewModal(null)}
                                    className="px-6 py-3 rounded-xl border text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
