import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { patientAPI } from '../services/patientService';
import { labAPI } from '../services/labService';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const qrRef = useRef(null);

    // Load user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedPatient = localStorage.getItem('patient');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) { /* ignore */ }
        }
        if (storedPatient) {
            try { setPatient(JSON.parse(storedPatient)); } catch (e) { /* ignore */ }
        }
    }, []);

    // Fetch full patient profile from backend
    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }
        const fetchProfile = async () => {
            try {
                const res = await patientAPI.getProfile(user.id);
                if (res.data.success) {
                    setPatient(res.data.data);
                    // Update localStorage with full patient data
                    localStorage.setItem('patient', JSON.stringify(res.data.data));
                }
            } catch (err) {
                console.error('Error fetching patient profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.id]);

    // Fetch patient orders
    const fetchOrders = useCallback(async () => {
        if (!user?.id) { setOrdersLoading(false); return; }
        setOrdersLoading(true);
        try {
            const sessionId = localStorage.getItem('labSessionId');
            const res = await labAPI.getOrders({ userId: user.id, sessionId });
            setOrders(res.data.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // QR code data
    const qrData = patient ? JSON.stringify({
        type: 'LABLINK_PATIENT',
        uhid: patient.uhid,
        name: patient.name,
        userId: user?.id,
        contact: patient.contact,
    }) : '';

    // Download QR as image
    const downloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = 400;
            canvas.height = 400;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 400, 400);
            ctx.drawImage(img, 0, 0, 400, 400);
            const link = document.createElement('a');
            link.download = `LabLink-QR-${patient?.uhid || 'patient'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    // PDF report (same logic as LabPatientPage)
    const downloadPDF = (order) => {
        const test = order.LabTest || order.testId;
        const w = window.open('', '_blank');
        if (!w) return;
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
            : '<tr><td colspan="4" style="padding:8px">No structured results</td></tr>';

        w.document.write(`<!DOCTYPE html><html><head><title>Lab Report - ${test?.name || 'Test'}</title>
        <style>body{font-family:Arial,sans-serif;margin:20px;color:#333}.header{text-align:center;border-bottom:3px solid #0d9488;padding-bottom:15px;margin-bottom:20px}.header h1{color:#0d9488;margin:0}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;padding:15px;background:#f0fdfa;border-radius:8px}.info-item{font-size:14px}.info-item strong{color:#0d9488}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#0d9488;color:white;padding:10px;text-align:left;border:1px solid #0d9488}.footer{text-align:center;margin-top:30px;padding-top:15px;border-top:1px solid #ddd;font-size:12px;color:#999}@media print{body{margin:0}.no-print{display:none}}</style></head><body>
        <div class="header"><h1>🔬 Lab Report</h1><p>LabLink Labs — Diagnostic Excellence</p></div>
        <div class="info-grid">
            <div class="info-item"><strong>Patient:</strong> ${patient?.name || order.patientName || 'N/A'}</div>
            <div class="info-item"><strong>UHID:</strong> ${patient?.uhid || 'N/A'}</div>
            <div class="info-item"><strong>Test:</strong> ${test?.name || 'N/A'}</div>
            <div class="info-item"><strong>Barcode:</strong> ${order.barcode || 'N/A'}</div>
            <div class="info-item"><strong>Date:</strong> ${order.resultedAt ? new Date(order.resultedAt).toLocaleString() : 'N/A'}</div>
            <div class="info-item"><strong>Status:</strong> ${order.status}</div>
        </div>
        <table><thead><tr><th>Parameter</th><th>Result</th><th>Normal Range</th><th>Status</th></tr></thead>
        <tbody>${resultRows}</tbody></table>
        <div class="footer"><p>Report generated on ${new Date().toLocaleString()}</p></div>
        <div class="no-print" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="padding:10px 30px;background:#0d9488;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer">🖨️ Print / Save PDF</button></div>
        </body></html>`);
        w.document.close();
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-blue-100 text-blue-700',
            sample_collected: 'bg-indigo-100 text-indigo-700',
            processing: 'bg-purple-100 text-purple-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: '⏳ Pending', approved: '✅ Approved', sample_collected: '🧪 Sample Collected',
            processing: '⚙️ Processing', completed: '✅ Completed', cancelled: '❌ Cancelled',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-xl mx-auto text-center py-16">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Login Required</h2>
                <p className="text-gray-500 mb-6">Please log in with your UHID and mobile number to access your dashboard.</p>
                <button onClick={() => navigate('/login')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Welcome Header */}
            <div className="glass-card-mini p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        🏥 Welcome, {patient?.name || user.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        UHID: <span className="font-mono font-semibold text-teal-600">{patient?.uhid || 'N/A'}</span>
                        {patient?.contact && <> &bull; Mobile: <span className="font-medium">{patient.contact}</span></>}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowQRModal(true)}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:shadow-md transition-all flex items-center gap-2">
                        📱 My QR Code
                    </button>
                    <button onClick={() => navigate('/app/lab-catalog')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                        🔬 Book Lab Test
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: orders.length, icon: '📋', color: 'from-blue-500 to-blue-600' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'pending' || o.status === 'approved').length, icon: '⏳', color: 'from-yellow-500 to-amber-500' },
                    { label: 'In Progress', value: orders.filter(o => o.status === 'sample_collected' || o.status === 'processing').length, icon: '⚙️', color: 'from-purple-500 to-purple-600' },
                    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: '✅', color: 'from-green-500 to-emerald-600' },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card-mini p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-lg`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => navigate('/app/medical-record')}
                    className="glass-card-mini p-5 cursor-pointer hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">My Medical Record</h3>
                            <p className="text-xs text-gray-400">Vitals, history & health score</p>
                        </div>
                    </div>
                </div>
                <div onClick={() => navigate('/app/camps')}
                    className="glass-card-mini p-5 cursor-pointer hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                            🏕️
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Donation Camps</h3>
                            <p className="text-xs text-gray-400">Find nearby blood donation camps</p>
                        </div>
                    </div>
                </div>
                <div onClick={() => navigate('/app/lab-catalog')}
                    className="glass-card-mini p-5 cursor-pointer hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                            🧪
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Book Lab Test</h3>
                            <p className="text-xs text-gray-400">Browse & book diagnostic tests</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Info Card */}
            {patient && (
                <div className="glass-card-mini p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        👤 Patient Information
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {[
                            { label: 'Full Name', value: patient.name },
                            { label: 'UHID', value: patient.uhid },
                            { label: 'Gender', value: patient.gender },
                            { label: 'Date of Birth', value: patient.dob || 'Not provided' },
                            { label: 'Blood Group', value: patient.bloodGroup || 'Not provided' },
                            { label: 'Contact', value: patient.contact },
                            { label: 'Email', value: patient.email || 'Not provided' },
                            { label: 'City', value: patient.city || 'Not provided' },
                            { label: 'ID Type', value: patient.idType || 'Not provided' },
                        ].map((item) => (
                            <div key={item.label}>
                                <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
                                <p className="font-medium text-gray-700">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Orders / Reports */}
            <div className="glass-card-mini p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">📑 My Lab Reports</h2>
                    <button onClick={fetchOrders} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                        🔄 Refresh
                    </button>
                </div>

                {ordersLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-5xl mb-3">📭</div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No lab orders yet</h3>
                        <p className="text-gray-500 mb-4 text-sm">Book a test to see your results here</p>
                        <button onClick={() => navigate('/app/lab-catalog')}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg transition-all">
                            Book a Test
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => {
                            const test = order.LabTest || order.testId;
                            return (
                                <div key={order._id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{test?.name}</h3>
                                            <p className="text-xs text-gray-400">{test?.code} {order.barcode && `• ${order.barcode}`}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {order.isCritical && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ Critical</span>}
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    {order.progress && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                {order.progress.steps.map((step, idx) => (
                                                    <React.Fragment key={step.name}>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-400'}`}>{step.completed ? '✓' : idx + 1}</div>
                                                        {idx < order.progress.steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded ${step.completed ? 'bg-teal-500' : 'bg-gray-200'}`} />}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[9px] text-gray-400">
                                                {order.progress.steps.map((step) => (
                                                    <span key={step.name} className={`text-center flex-1 ${step.current ? 'text-teal-600 font-semibold' : ''}`}>{step.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-3 flex gap-2">
                                        {order.canDownloadReport && (
                                            <>
                                                <button onClick={() => setSelectedResult(order)}
                                                    className="flex-1 py-2 rounded-lg border border-teal-500 text-teal-600 font-medium hover:bg-teal-50 transition-colors text-sm">
                                                    📊 View Results
                                                </button>
                                                <button onClick={() => downloadPDF(order)}
                                                    className="py-2 px-4 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors text-sm">
                                                    📥 PDF
                                                </button>
                                            </>
                                        )}
                                        {order.paymentRequired && (
                                            <div className="flex-1 py-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
                                                <p className="text-amber-700 font-medium text-sm">🔒 Payment required to view results</p>
                                            </div>
                                        )}
                                        {!order.isPaid && order.status !== 'completed' && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.isPaid ? '✅ Paid' : '💰 Payment Pending'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===== QR CODE MODAL ===== */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">📱 Your Patient QR</h2>
                            <button onClick={() => setShowQRModal(false)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
                        </div>

                        <div className="text-center">
                            <div ref={qrRef} className="inline-block p-4 bg-white rounded-xl border-2 border-gray-100 mb-4">
                                <QRCodeSVG
                                    value={qrData}
                                    size={220}
                                    level="M"
                                    includeMargin={true}
                                    fgColor="#0d9488"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">UHID: <span className="font-mono font-bold text-teal-600">{patient?.uhid}</span></p>
                            <p className="text-xs text-gray-400 mb-4">Show this QR at the lab for instant check-in</p>

                            <div className="flex gap-2">
                                <button onClick={downloadQR}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg transition-all">
                                    📥 Save QR Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== RESULT MODAL ===== */}
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
                            <div className="flex justify-between"><span className="text-gray-400">Patient:</span><span>{patient?.name || selectedResult.patientName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">UHID:</span><span className="font-mono">{patient?.uhid || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Barcode:</span><span className="font-mono">{selectedResult.barcode || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Resulted:</span><span>{selectedResult.resultedAt ? new Date(selectedResult.resultedAt).toLocaleString() : 'N/A'}</span></div>
                        </div>

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
