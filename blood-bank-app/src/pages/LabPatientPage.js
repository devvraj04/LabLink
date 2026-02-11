import React, { useState, useEffect, useCallback, useRef } from 'react';
import { labAPI } from '../services/labService';

// Generate or retrieve a session ID for this patient
const getSessionId = () => {
    let sid = localStorage.getItem('labSessionId');
    if (!sid) {
        sid = 'SESS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('labSessionId', sid);
    }
    return sid;
};

export default function LabPatientPage() {
    const sessionId = getSessionId();
    const [activeTab, setActiveTab] = useState('catalog');
    const [loading, setLoading] = useState(true);
    const [tests, setTests] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTest, setSelectedTest] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [toast, setToast] = useState(null);

    // Detect logged-in patient
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    const storedPatient = (() => { try { return JSON.parse(localStorage.getItem('patient')); } catch { return null; } })();
    const isLoggedIn = !!(storedUser && storedUser.role === 'patient');
    const loggedInUserId = storedUser?.id || null;

    // Checkout form — auto-fill from patient profile if logged in
    const [patientName, setPatientName] = useState(
        isLoggedIn ? (storedPatient?.name || storedUser?.name || '') : (localStorage.getItem('labPatientName') || '')
    );
    const [patientEmail, setPatientEmail] = useState(
        isLoggedIn ? (storedPatient?.email || storedUser?.email || '') : (localStorage.getItem('labPatientEmail') || '')
    );
    const [patientPhone, setPatientPhone] = useState(
        isLoggedIn ? (storedPatient?.contact || '') : ''
    );
    const [prescriptionUrl, setPrescriptionUrl] = useState('');
    const [hasAllergies, setHasAllergies] = useState(false);
    const [allergyNotes, setAllergyNotes] = useState(
        isLoggedIn ? (storedPatient?.allergies || '') : ''
    );
    const [hasImplants, setHasImplants] = useState(false);
    const [implantDetails, setImplantDetails] = useState('');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const showToast = (title, message, type = 'success') => {
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Seed data on first load
    useEffect(() => {
        labAPI.seedData().catch(() => { });
    }, []);

    const fetchTests = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery) params.search = searchQuery;
            const res = await labAPI.getTests(params);
            setTests(res.data.data || []);
            setCategories(res.data.categories || []);
        } catch (err) {
            console.error('Error fetching tests:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, searchQuery]);

    const fetchCart = useCallback(async () => {
        try {
            const res = await labAPI.getCart(sessionId, loggedInUserId);
            setCart(res.data.data || []);
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    }, [sessionId, loggedInUserId]);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await labAPI.getOrders({ sessionId, userId: loggedInUserId });
            setOrders(res.data.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    }, [sessionId, loggedInUserId]);

    useEffect(() => { fetchTests(); }, [fetchTests]);
    useEffect(() => { fetchCart(); fetchOrders(); }, [fetchCart, fetchOrders]);

    useEffect(() => {
        const t = setTimeout(() => fetchTests(), 300);
        return () => clearTimeout(t);
    }, [selectedCategory, searchQuery, fetchTests]);

    const addToCart = async (testId) => {
        try {
            await labAPI.addToCart({ testId, sessionId, userId: loggedInUserId, patientName, patientEmail });
            showToast('Added', 'Test added to cart');
            fetchCart();
        } catch (err) {
            showToast('Error', err.response?.data?.error || 'Failed to add', 'error');
        }
    };

    const removeFromCart = async (orderId) => {
        try {
            await labAPI.removeFromCart(orderId);
            showToast('Removed', 'Test removed from cart');
            fetchCart();
        } catch (err) {
            showToast('Error', 'Failed to remove', 'error');
        }
    };

    const handleCheckout = async () => {
        if (!patientName.trim()) {
            showToast('Error', 'Patient name is required', 'error');
            return;
        }
        setCheckoutLoading(true);
        localStorage.setItem('labPatientName', patientName);
        localStorage.setItem('labPatientEmail', patientEmail);
        try {
            await labAPI.checkout({
                sessionId, userId: loggedInUserId, patientName, patientEmail, patientPhone,
                prescriptionUrl: prescriptionUrl || undefined,
                hasAllergies, allergyNotes: hasAllergies ? allergyNotes : undefined,
                hasImplants, implantDetails: hasImplants ? implantDetails : undefined,
            });
            showToast('Success!', 'Order submitted for approval');
            setShowCheckout(false);
            setCart([]);
            fetchOrders();
            setActiveTab('orders');
        } catch (err) {
            showToast('Error', err.response?.data?.error || 'Checkout failed', 'error');
        } finally {
            setCheckoutLoading(false);
        }
    };

    // Generate PDF report
    const downloadPDF = (order) => {
        const test = order.LabTest || order.testId;
        const w = window.open('', '_blank');
        if (!w) { showToast('Error', 'Popup blocked', 'error'); return; }

        const resultRows = test?.resultFields
            ? test.resultFields.map((f) => {
                const val = order.resultData?.[f.fieldName] ?? '-';
                const range = f.normalMin != null && f.normalMax != null ? `${f.normalMin} - ${f.normalMax}` : '-';
                const numVal = parseFloat(val);
                const isAbnormal = f.fieldType === 'number' && f.normalMin != null && f.normalMax != null && !isNaN(numVal) && (numVal < f.normalMin || numVal > f.normalMax);
                return `<tr>
            <td style="padding:8px;border:1px solid #ddd">${f.fieldLabel}</td>
            <td style="padding:8px;border:1px solid #ddd;font-weight:bold;${isAbnormal ? 'color:red' : ''}">${val} ${f.unit || ''}</td>
            <td style="padding:8px;border:1px solid #ddd">${range} ${f.unit || ''}</td>
            <td style="padding:8px;border:1px solid #ddd">${isAbnormal ? '⚠️ Abnormal' : '✅ Normal'}</td>
          </tr>`;
            }).join('')
            : '<tr><td colspan="4" style="padding:8px">No structured results available</td></tr>';

        w.document.write(`<!DOCTYPE html><html><head><title>Lab Report - ${test?.name || 'Test'}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:20px;color:#333}
        .header{text-align:center;border-bottom:3px solid #0d9488;padding-bottom:15px;margin-bottom:20px}
        .header h1{color:#0d9488;margin:0}
        .header p{color:#666;margin:5px 0}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;padding:15px;background:#f0fdfa;border-radius:8px}
        .info-item{font-size:14px}.info-item strong{color:#0d9488}
        table{width:100%;border-collapse:collapse;margin-bottom:20px}
        th{background:#0d9488;color:white;padding:10px;text-align:left;border:1px solid #0d9488}
        .critical{background:#fef2f2;border:2px solid #ef4444;padding:10px;border-radius:8px;margin-bottom:15px;color:#dc2626;font-weight:bold}
        .footer{text-align:center;margin-top:30px;padding-top:15px;border-top:1px solid #ddd;font-size:12px;color:#999}
        @media print{body{margin:0}.no-print{display:none}}
      </style></head><body>
      <div class="header">
        <h1>🔬 Lab Report</h1>
        <p>HealthTech Labs — Diagnostic Excellence</p>
      </div>
      <div class="info-grid">
        <div class="info-item"><strong>Patient:</strong> ${order.patientName || 'N/A'}</div>
        <div class="info-item"><strong>Test:</strong> ${test?.name || 'N/A'}</div>
        <div class="info-item"><strong>Code:</strong> ${test?.code || 'N/A'}</div>
        <div class="info-item"><strong>Barcode:</strong> ${order.barcode || 'N/A'}</div>
        <div class="info-item"><strong>Date:</strong> ${order.resultedAt ? new Date(order.resultedAt).toLocaleString() : 'N/A'}</div>
        <div class="info-item"><strong>Status:</strong> ${order.status}</div>
      </div>
      ${order.isCritical ? '<div class="critical">⚠️ CRITICAL VALUES DETECTED — Immediate attention required</div>' : ''}
      <table><thead><tr><th>Parameter</th><th>Result</th><th>Normal Range</th><th>Status</th></tr></thead>
      <tbody>${resultRows}</tbody></table>
      <div class="footer">
        <p>Report generated on ${new Date().toLocaleString()}</p>
        <p>This is a computer-generated report. For queries, contact the lab.</p>
      </div>
      <div class="no-print" style="text-align:center;margin-top:20px">
        <button onclick="window.print()" style="padding:10px 30px;background:#0d9488;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer">🖨️ Print / Save PDF</button>
      </div>
    </body></html>`);
        w.document.close();
    };

    const isInCart = (testId) => cart.some((item) => (item.testId?._id || item.testId) === testId);

    const cartTotal = cart.reduce((s, i) => s + (i.testId?.discountedPrice || i.testId?.price || 0), 0);
    const cartOriginal = cart.reduce((s, i) => s + (i.testId?.price || 0), 0);
    const cartDiscount = cartOriginal - cartTotal;

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-teal-500'}`}>
                    <p className="font-bold">{toast.title}</p>
                    <p>{toast.message}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        🔬 Lab & Diagnostics
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Book tests, track results, download reports</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 glass-card-mini w-fit">
                {[
                    { id: 'catalog', label: '📋 Book Tests' },
                    { id: 'cart', label: `🛒 Cart (${cart.length})` },
                    { id: 'orders', label: '📑 My Orders' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); if (tab.id === 'orders') fetchOrders(); }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >{tab.label}</button>
                ))}
            </div>

            {/* ===================== CATALOG ===================== */}
            {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Categories */}
                    <div className="lg:col-span-1">
                        <div className="glass-card-mini p-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
                            <div className="space-y-1">
                                <button onClick={() => setSelectedCategory('')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-teal-100 text-teal-700 font-medium' : 'hover:bg-gray-100 text-gray-600'
                                        }`}>All Tests</button>
                                {categories.map((cat) => (
                                    <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between ${selectedCategory === cat.name ? 'bg-teal-100 text-teal-700 font-medium' : 'hover:bg-gray-100 text-gray-600'
                                            }`}>
                                        <span>{cat.name}</span>
                                        <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tests Grid */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input type="text" placeholder="Search tests by name, code..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/90 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all" />
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : tests.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No tests found</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tests.map((test) => (
                                    <div key={test._id}
                                        onClick={() => setSelectedTest(test)}
                                        className="glass-card-mini p-4 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:border-teal-200 hover:-translate-y-0.5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${test.type === 'RADIOLOGY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>{test.type}</span>
                                            {test.isHomeCollection && <span className="text-xs text-emerald-600">🏠 Home</span>}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">{test.name}</h3>
                                        <p className="text-xs text-gray-400 mb-1">{test.code}</p>
                                        {test.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{test.description}</p>}
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                            {test.sampleType && <span>🧪 {test.sampleType}</span>}
                                            <span>⏱️ {test.turnaroundTime}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                {test.discountedPrice ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-teal-600">₹{test.discountedPrice}</span>
                                                        <span className="text-sm text-gray-400 line-through">₹{test.price}</span>
                                                        <span className="text-xs font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded">
                                                            {Math.round(((test.price - test.discountedPrice) / test.price) * 100)}% off
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-bold text-teal-600">₹{test.price}</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                {isInCart(test._id) ? (
                                                    <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium border border-gray-200 cursor-default flex items-center gap-1.5" disabled>
                                                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        In Cart
                                                    </button>
                                                ) : (
                                                    <button onClick={() => addToCart(test._id)}
                                                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border border-amber-400 shadow-sm hover:shadow-md active:scale-95"
                                                        style={{
                                                            background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)',
                                                            color: '#111',
                                                        }}>
                                                        🛒 Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===================== CART ===================== */}
            {activeTab === 'cart' && (
                <div className="max-w-3xl mx-auto space-y-4">
                    {cart.length === 0 ? (
                        <div className="glass-card-mini p-12 text-center">
                            <div className="text-5xl mb-4">🛒</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-4">Browse our test catalog and add tests</p>
                            <button onClick={() => setActiveTab('catalog')} className="btn-primary px-6 py-2">Browse Tests</button>
                        </div>
                    ) : (
                        <>
                            {cart.map((item) => (
                                <div key={item._id} className="glass-card-mini p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{item.testId?.name}</h3>
                                        <p className="text-sm text-gray-400">{item.testId?.code}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-teal-600">₹{item.testId?.discountedPrice || item.testId?.price}</span>
                                        <button onClick={() => removeFromCart(item._id)}
                                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">🗑️</button>
                                    </div>
                                </div>
                            ))}

                            <div className="glass-card-mini p-4 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal ({cart.length} items)</span><span>₹{cartOriginal}</span>
                                </div>
                                {cartDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Discount</span><span>-₹{cartDiscount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                                    <span>Total</span><span className="text-teal-600">₹{cartTotal}</span>
                                </div>
                                <button onClick={() => setShowCheckout(true)}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">
                                    Proceed to Checkout →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ===================== ORDERS ===================== */}
            {activeTab === 'orders' && (
                <div className="max-w-3xl mx-auto space-y-4">
                    {orders.length === 0 ? (
                        <div className="glass-card-mini p-12 text-center">
                            <div className="text-5xl mb-4">📑</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
                            <p className="text-gray-500 mb-4">Your test orders will appear here</p>
                            <button onClick={() => setActiveTab('catalog')} className="btn-primary px-6 py-2">Book a Test</button>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const test = order.LabTest || order.testId;
                            return (
                                <div key={order._id} className="glass-card-mini p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{test?.name}</h3>
                                            <p className="text-xs text-gray-400">{test?.code}</p>
                                            {order.barcode && (
                                                <span className="text-xs font-mono mt-1 bg-gray-100 px-2 py-1 rounded inline-block">{order.barcode}</span>
                                            )}
                                        </div>
                                        <div className="text-right space-y-1">
                                            {order.isCritical && (
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">⚠️ Critical</span>
                                            )}
                                            <div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {order.isPaid ? '✅ Paid' : '💰 Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    {order.progress && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-2">
                                                {order.progress.steps.map((step, idx) => (
                                                    <React.Fragment key={step.name}>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step.completed ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-400'
                                                            }`}>{step.completed ? '✓' : idx + 1}</div>
                                                        {idx < order.progress.steps.length - 1 && (
                                                            <div className={`flex-1 h-1 mx-1 rounded ${step.completed ? 'bg-teal-500' : 'bg-gray-200'}`} />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-400 px-1">
                                                {order.progress.steps.map((step) => (
                                                    <span key={step.name} className={`text-center flex-1 ${step.current ? 'text-teal-600 font-semibold' : ''}`}>{step.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {order.canDownloadReport && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <button onClick={() => setSelectedResult(order)}
                                                className="w-full py-2 rounded-lg border border-teal-500 text-teal-600 font-medium hover:bg-teal-50 transition-colors text-sm">
                                                📊 View Results
                                            </button>
                                        </div>
                                    )}
                                    {order.paymentRequired && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="w-full py-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                                                <div className="flex items-center justify-center gap-2 text-amber-700 font-medium text-sm">
                                                    <span>🔒</span>
                                                    <span>Payment required to view results</span>
                                                </div>
                                                <p className="text-xs text-amber-500 mt-1">Please complete payment at the lab counter to access your report</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ===================== TEST DETAILS MODAL ===================== */}
            {selectedTest && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTest(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">{selectedTest.name}</h2>
                            <button onClick={() => setSelectedTest(null)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedTest.type === 'RADIOLOGY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{selectedTest.type}</span>
                                <span className="text-sm text-gray-400">{selectedTest.code}</span>
                            </div>
                            {selectedTest.description && <p className="text-sm text-gray-500">{selectedTest.description}</p>}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {selectedTest.sampleType && <div><span className="text-gray-400">Sample:</span> {selectedTest.sampleType}</div>}
                                <div><span className="text-gray-400">TAT:</span> {selectedTest.turnaroundTime}</div>
                            </div>
                            {selectedTest.prerequisites && (selectedTest.prerequisites.fasting || selectedTest.prerequisites.instructions?.length > 0) && (
                                <div className="p-4 bg-amber-50 rounded-lg space-y-2">
                                    <h3 className="font-medium text-amber-800">⚠️ Pre-Test Instructions</h3>
                                    {selectedTest.prerequisites.fasting && <p className="text-sm">⏰ <strong>Fasting:</strong> {selectedTest.prerequisites.fastingHours} hours</p>}
                                    {selectedTest.prerequisites.instructions?.map((inst, i) => <p key={i} className="text-sm">• {inst}</p>)}
                                    {selectedTest.prerequisites.warnings?.map((w, i) => <p key={i} className="text-sm text-amber-700">⚠️ {w}</p>)}
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div>
                                    {selectedTest.discountedPrice ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-teal-600">₹{selectedTest.discountedPrice}</span>
                                            <span className="text-sm text-gray-400 line-through">₹{selectedTest.price}</span>
                                        </div>
                                    ) : (
                                        <span className="text-2xl font-bold text-teal-600">₹{selectedTest.price}</span>
                                    )}
                                </div>
                                {isInCart(selectedTest._id) ? (
                                    <button className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-500 font-medium border border-gray-200 cursor-default flex items-center gap-2" disabled>
                                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        In Cart
                                    </button>
                                ) : (
                                    <button onClick={() => { addToCart(selectedTest._id); setSelectedTest(null); }}
                                        className="px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 border border-amber-400 shadow-sm hover:shadow-md active:scale-95"
                                        style={{
                                            background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)',
                                            color: '#111',
                                        }}>
                                        🛒 Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== CHECKOUT MODAL ===================== */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCheckout(false)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Complete Your Order</h2>
                            <button onClick={() => setShowCheckout(false)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
                        </div>
                        <div className="space-y-5">
                            {/* Summary */}
                            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex justify-between">
                                        <span>{item.testId?.name}</span>
                                        <span>₹{item.testId?.discountedPrice || item.testId?.price}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold pt-2 border-t">
                                    <span>Total</span><span>₹{cartTotal}</span>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="space-y-3">
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Patient Name *</span>
                                    <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="Full name" className="input mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-500" />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Email</span>
                                    <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)}
                                        placeholder="Email address" className="input mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-500" />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Phone</span>
                                    <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)}
                                        placeholder="Phone number" className="input mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-500" />
                                </label>
                            </div>

                            {/* Prescription */}
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">📄 Prescription URL (Optional)</span>
                                <input type="text" value={prescriptionUrl} onChange={(e) => setPrescriptionUrl(e.target.value)}
                                    placeholder="Paste URL" className="input mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-500" />
                            </label>

                            {/* Allergies */}
                            <div className="p-4 border rounded-xl space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={hasAllergies} onChange={(e) => setHasAllergies(e.target.checked)} className="w-4 h-4 text-teal-500" />
                                    <span className="text-sm font-medium">❤️ I have allergies</span>
                                </label>
                                {hasAllergies && (
                                    <input type="text" value={allergyNotes} onChange={(e) => setAllergyNotes(e.target.value)}
                                        placeholder="Describe allergies..." className="input w-full px-3 py-2 rounded-xl border border-gray-200" />
                                )}
                            </div>

                            {/* Implants */}
                            <div className="p-4 border rounded-xl space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={hasImplants} onChange={(e) => setHasImplants(e.target.checked)} className="w-4 h-4 text-teal-500" />
                                    <span className="text-sm font-medium">⚠️ I have implants</span>
                                </label>
                                {hasImplants && (
                                    <input type="text" value={implantDetails} onChange={(e) => setImplantDetails(e.target.value)}
                                        placeholder="Type, location, MRI safety..." className="input w-full px-3 py-2 rounded-xl border border-gray-200" />
                                )}
                            </div>

                            <button onClick={handleCheckout} disabled={checkoutLoading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                                {checkoutLoading ? '⏳ Processing...' : `Confirm Order — ₹${cartTotal}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== RESULT MODAL ===================== */}
            {selectedResult && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedResult(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Lab Report</h2>
                                <p className="text-sm text-gray-400">{(selectedResult.LabTest || selectedResult.testId)?.name}</p>
                            </div>
                            <button onClick={() => setSelectedResult(null)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
                        </div>

                        {selectedResult.isCritical && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                                ⚠️ Critical values detected — immediate attention required
                            </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-lg space-y-2 mb-4 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Patient:</span><span>{selectedResult.patientName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Barcode:</span><span className="font-mono">{selectedResult.barcode || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Resulted:</span><span>{selectedResult.resultedAt ? new Date(selectedResult.resultedAt).toLocaleString() : 'N/A'}</span></div>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto mb-4">
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
                                    {((selectedResult.LabTest || selectedResult.testId)?.resultFields || []).map((field) => {
                                        const val = selectedResult.resultData?.[field.fieldName] ?? '-';
                                        const numVal = parseFloat(val);
                                        const isAbnormal = field.fieldType === 'number' && field.normalMin != null && field.normalMax != null &&
                                            !isNaN(numVal) && (numVal < field.normalMin || numVal > field.normalMax);
                                        return (
                                            <tr key={field.fieldName} className={`border-b ${isAbnormal ? 'bg-red-50' : ''}`}>
                                                <td className="p-3 font-medium">{field.fieldLabel}</td>
                                                <td className={`p-3 font-bold ${isAbnormal ? 'text-red-600' : 'text-gray-700'}`}>{val} {field.unit}</td>
                                                <td className="p-3 text-gray-400">{field.normalMin != null ? `${field.normalMin} - ${field.normalMax}` : '-'} {field.unit}</td>
                                                <td className="p-3">{isAbnormal ? <span className="text-red-600">⚠️ Abnormal</span> : <span className="text-green-600">✅ Normal</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <button onClick={() => downloadPDF(selectedResult)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">
                            📥 Download PDF Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
