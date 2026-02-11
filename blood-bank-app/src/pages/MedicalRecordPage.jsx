import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ─── Dummy Data ─────────────────────────────────────────────────
const HEALTH_SCORE = 82;

const VITALS = [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: '🫀', status: 'normal', color: 'from-rose-500 to-pink-500' },
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: '💓', status: 'normal', color: 'from-red-500 to-rose-500' },
    { label: 'SpO2', value: '98', unit: '%', icon: '🩸', status: 'normal', color: 'from-blue-500 to-cyan-500' },
    { label: 'Temperature', value: '98.4', unit: '°F', icon: '🌡️', status: 'normal', color: 'from-amber-500 to-orange-500' },
    { label: 'BMI', value: '22.5', unit: 'kg/m²', icon: '⚖️', status: 'normal', color: 'from-emerald-500 to-green-500' },
    { label: 'Blood Sugar', value: '95', unit: 'mg/dL', icon: '🍬', status: 'normal', color: 'from-purple-500 to-violet-500' },
];

const BP_TREND = [
    { month: 'Aug', systolic: 125, diastolic: 82 },
    { month: 'Sep', systolic: 122, diastolic: 80 },
    { month: 'Oct', systolic: 128, diastolic: 85 },
    { month: 'Nov', systolic: 120, diastolic: 78 },
    { month: 'Dec', systolic: 118, diastolic: 76 },
    { month: 'Jan', systolic: 121, diastolic: 79 },
    { month: 'Feb', systolic: 120, diastolic: 80 },
];

const WEIGHT_TREND = [
    { month: 'Aug', weight: 72 },
    { month: 'Sep', weight: 71.5 },
    { month: 'Oct', weight: 71 },
    { month: 'Nov', weight: 70.8 },
    { month: 'Dec', weight: 71.2 },
    { month: 'Jan', weight: 70.5 },
    { month: 'Feb', weight: 70 },
];

const HEART_RATE_TREND = [
    { month: 'Aug', hr: 78 },
    { month: 'Sep', hr: 75 },
    { month: 'Oct', hr: 80 },
    { month: 'Nov', hr: 72 },
    { month: 'Dec', hr: 74 },
    { month: 'Jan', hr: 73 },
    { month: 'Feb', hr: 72 },
];

const VISIT_HISTORY = [
    { date: '2026-01-28', type: 'OPD', doctor: 'Dr. Anika Sharma', diagnosis: 'Routine Checkup', notes: 'All vitals normal. Continue current medications.' },
    { date: '2025-12-15', type: 'Lab', doctor: 'Lab Tech', diagnosis: 'CBC + Lipid Panel', notes: 'Results within normal limits.' },
    { date: '2025-11-02', type: 'OPD', doctor: 'Dr. Rajesh Patel', diagnosis: 'Seasonal Flu', notes: 'Mild viral infection. Prescribed antivirals and rest.' },
    { date: '2025-09-18', type: 'Emergency', doctor: 'Dr. Priya Nair', diagnosis: 'Mild Dehydration', notes: 'IV fluids administered. Discharged same day.' },
    { date: '2025-07-05', type: 'OPD', doctor: 'Dr. Anika Sharma', diagnosis: 'Annual Physical', notes: 'Blood work ordered. Follow-up in 1 week.' },
];

const MEDICATIONS = [
    { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', status: 'Active' },
    { name: 'Vitamin D3', dosage: '60,000 IU', frequency: 'Weekly', status: 'Active' },
    { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', status: 'Active' },
];

const ALLERGIES = [
    { allergen: 'Penicillin', severity: 'High', reaction: 'Rash & Swelling' },
    { allergen: 'Peanuts', severity: 'Moderate', reaction: 'Mild itching' },
];

const SCORE_BREAKDOWN = [
    { name: 'Vitals', value: 30, fill: '#10b981' },
    { name: 'BMI', value: 22, fill: '#06b6d4' },
    { name: 'Activity', value: 18, fill: '#8b5cf6' },
    { name: 'Lab Results', value: 12, fill: '#f59e0b' },
];

// ─── Component ──────────────────────────────────────────────────
export default function MedicalRecordPage() {
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const storedPatient = localStorage.getItem('patient');
        if (storedPatient) {
            try { setPatient(JSON.parse(storedPatient)); } catch (e) { /* ignore */ }
        }
    }, []);

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Needs Attention';
    };

    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (HEALTH_SCORE / 100) * circumference;

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'vitals', label: '🫀 Vitals & Trends' },
        { id: 'history', label: '📋 Visit History' },
        { id: 'medications', label: '💊 Medications' },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            {/* Header */}
            <div className="glass-card-mini p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📋 Complete Medical Record</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Patient: <span className="font-semibold text-teal-600">{patient?.name || 'N/A'}</span>
                        {' '}&bull; UHID: <span className="font-mono font-semibold text-teal-600">{patient?.uhid || 'N/A'}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/app/lab-patient')}
                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:shadow-md transition-all flex items-center gap-2">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === 'overview' && (
                <>
                    {/* Health Score + Vitals Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Health Score Card */}
                        <div className="glass-card-mini p-6 flex flex-col items-center">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">🏆 Health Score</h2>
                            <div className="relative w-36 h-36 mb-3">
                                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                    <circle cx="60" cy="60" r="54" stroke={getScoreColor(HEALTH_SCORE)}
                                        strokeWidth="8" fill="none" strokeLinecap="round"
                                        strokeDasharray={circumference} strokeDashoffset={offset}
                                        style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold" style={{ color: getScoreColor(HEALTH_SCORE) }}>{HEALTH_SCORE}</span>
                                    <span className="text-xs text-gray-400">/100</span>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-sm font-semibold"
                                style={{ backgroundColor: getScoreColor(HEALTH_SCORE) + '20', color: getScoreColor(HEALTH_SCORE) }}>
                                {getScoreLabel(HEALTH_SCORE)}
                            </span>

                            {/* Score Breakdown Pie */}
                            <div className="w-full mt-4">
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie data={SCORE_BREAKDOWN} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
                                            {SCORE_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [`${value} pts`, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-3 mt-1 text-xs text-gray-500">
                                    {SCORE_BREAKDOWN.map((s, i) => (
                                        <span key={i} className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fill }} /> {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Vitals Grid */}
                        <div className="lg:col-span-2">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">🫀 Current Vitals</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {VITALS.map((v) => (
                                    <div key={v.label} className="glass-card-mini p-4 hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-lg`}>
                                                {v.icon}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">{v.label}</p>
                                                <p className="text-xl font-bold text-gray-800">{v.value} <span className="text-xs font-normal text-gray-400">{v.unit}</span></p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✅ Normal</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Allergies & Current Meds Quick View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card-mini p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">⚠️ Known Allergies</h2>
                            {ALLERGIES.length === 0 ? (
                                <p className="text-gray-400 text-sm">No known allergies</p>
                            ) : (
                                <div className="space-y-2">
                                    {ALLERGIES.map((a, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-gray-800">{a.allergen}</p>
                                                <p className="text-xs text-gray-500">{a.reaction}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {a.severity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="glass-card-mini p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">💊 Active Medications</h2>
                            <div className="space-y-2">
                                {MEDICATIONS.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-gray-800">{m.name}</p>
                                            <p className="text-xs text-gray-500">{m.dosage} &bull; {m.frequency}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{m.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== VITALS & TRENDS TAB ===== */}
            {activeTab === 'vitals' && (
                <>
                    {/* BP Trend */}
                    <div className="glass-card-mini p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">📈 Blood Pressure Trend (7 months)</h2>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={BP_TREND}>
                                <defs>
                                    <linearGradient id="sysFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="diaFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} domain={[60, 140]} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="systolic" stroke="#ef4444" fill="url(#sysFill)" strokeWidth={2.5} name="Systolic" dot={{ r: 4 }} />
                                <Area type="monotone" dataKey="diastolic" stroke="#3b82f6" fill="url(#diaFill)" strokeWidth={2.5} name="Diastolic" dot={{ r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Heart Rate + Weight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card-mini p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">💓 Heart Rate Trend</h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={HEART_RATE_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} domain={[60, 90]} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="hr" stroke="#e11d48" strokeWidth={2.5} name="BPM" dot={{ r: 4, fill: '#e11d48' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="glass-card-mini p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">⚖️ Weight Trend (kg)</h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={WEIGHT_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} domain={[65, 75]} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="weight" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Weight" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Vitals Cards (repeated for detail) */}
                    <div className="glass-card-mini p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">🩺 Latest Vital Readings</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {VITALS.map((v) => (
                                <div key={v.label} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="text-2xl mb-1">{v.icon}</div>
                                    <p className="text-xl font-bold text-gray-800">{v.value}</p>
                                    <p className="text-[10px] text-gray-400">{v.unit}</p>
                                    <p className="text-xs text-gray-500 mt-1">{v.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ===== VISIT HISTORY TAB ===== */}
            {activeTab === 'history' && (
                <div className="glass-card-mini p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Visit History</h2>
                    <div className="space-y-4">
                        {VISIT_HISTORY.map((visit, i) => {
                            const typeColors = {
                                OPD: 'bg-blue-100 text-blue-700',
                                Lab: 'bg-purple-100 text-purple-700',
                                Emergency: 'bg-red-100 text-red-700',
                            };
                            return (
                                <div key={i} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[visit.type] || 'bg-gray-100 text-gray-700'}`}>
                                                {visit.type}
                                            </span>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{visit.diagnosis}</h3>
                                                <p className="text-xs text-gray-400">{visit.doctor}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 pl-1 border-l-2 border-teal-200 ml-1">{visit.notes}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== MEDICATIONS TAB ===== */}
            {activeTab === 'medications' && (
                <>
                    <div className="glass-card-mini p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">💊 Current Medications</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-teal-500 text-white">
                                        <th className="p-3 text-left rounded-tl-lg">Medication</th>
                                        <th className="p-3 text-left">Dosage</th>
                                        <th className="p-3 text-left">Frequency</th>
                                        <th className="p-3 text-left rounded-tr-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MEDICATIONS.map((m, i) => (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800">{m.name}</td>
                                            <td className="p-3 text-gray-600">{m.dosage}</td>
                                            <td className="p-3 text-gray-600">{m.frequency}</td>
                                            <td className="p-3">
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{m.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-card-mini p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">⚠️ Allergies & Sensitivities</h2>
                        <div className="space-y-3">
                            {ALLERGIES.map((a, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-base">{a.allergen}</p>
                                        <p className="text-sm text-gray-500">Reaction: {a.reaction}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${a.severity === 'High' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                        {a.severity} Risk
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
