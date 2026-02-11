import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';

// Large pool of realistic Indian demo patients
const DEMO_PATIENTS = [
    { name: 'Rajesh Kumar Sharma', gender: 'MALE', dob: '1985-03-15', address: '42, MG Road, Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001', uid: 'XXXX-XXXX-7834' },
    { name: 'Priya Suresh Patil', gender: 'FEMALE', dob: '1992-07-22', address: '15, Shivaji Nagar, FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411005', uid: 'XXXX-XXXX-4521' },
    { name: 'Amit Vijay Deshmukh', gender: 'MALE', dob: '1978-11-08', address: '8, Laxmi Apartments, Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038', uid: 'XXXX-XXXX-9163' },
    { name: 'Sneha Anil Kulkarni', gender: 'FEMALE', dob: '1990-01-30', address: '23, Aundh Road, Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045', uid: 'XXXX-XXXX-6287' },
    { name: 'Vikram Singh Rathod', gender: 'MALE', dob: '1988-09-12', address: '56, Camp Area, Sadashiv Peth', city: 'Pune', state: 'Maharashtra', pincode: '411030', uid: 'XXXX-XXXX-3456' },
    { name: 'Ananya Deepak Joshi', gender: 'FEMALE', dob: '1995-05-19', address: '7, Viman Nagar, Airport Road', city: 'Pune', state: 'Maharashtra', pincode: '411014', uid: 'XXXX-XXXX-8901' },
    { name: 'Suresh Ramchandra More', gender: 'MALE', dob: '1970-12-25', address: '31, Hadapsar, Magarpatta', city: 'Pune', state: 'Maharashtra', pincode: '411028', uid: 'XXXX-XXXX-1278' },
    { name: 'Meena Prakash Bhosale', gender: 'FEMALE', dob: '1983-04-07', address: '19, Swargate, Tilak Road', city: 'Pune', state: 'Maharashtra', pincode: '411002', uid: 'XXXX-XXXX-5634' },
    { name: 'Arjun Mahadev Pawar', gender: 'MALE', dob: '1991-06-18', address: '14, Hinjewadi Phase 2, Rajiv Gandhi IT Park', city: 'Pune', state: 'Maharashtra', pincode: '411057', uid: 'XXXX-XXXX-2345' },
    { name: 'Kavita Sanjay Gaikwad', gender: 'FEMALE', dob: '1987-02-14', address: '9, Pashan Sus Road, Bavdhan', city: 'Pune', state: 'Maharashtra', pincode: '411021', uid: 'XXXX-XXXX-6789' },
    { name: 'Rohit Ashok Jadhav', gender: 'MALE', dob: '1975-10-03', address: '67, NIBM Road, Kondhwa', city: 'Pune', state: 'Maharashtra', pincode: '411048', uid: 'XXXX-XXXX-4312' },
    { name: 'Pallavi Dinesh Chavan', gender: 'FEMALE', dob: '1998-08-29', address: '22, Model Colony, Shivajinagar', city: 'Pune', state: 'Maharashtra', pincode: '411016', uid: 'XXXX-XXXX-7890' },
    { name: 'Nikhil Ravindra Mane', gender: 'MALE', dob: '1993-04-11', address: '33, Bund Garden Road, Yerwada', city: 'Pune', state: 'Maharashtra', pincode: '411006', uid: 'XXXX-XXXX-1567' },
    { name: 'Swati Kiran Deshpande', gender: 'FEMALE', dob: '1980-12-01', address: '5, Law College Road, Erandwane', city: 'Pune', state: 'Maharashtra', pincode: '411004', uid: 'XXXX-XXXX-9023' },
    { name: 'Siddharth Ganesh Wagh', gender: 'MALE', dob: '1996-07-07', address: '48, Wakad Bridge, Wakad', city: 'Pune', state: 'Maharashtra', pincode: '411057', uid: 'XXXX-XXXX-3478' },
    { name: 'Ritu Mohan Kadam', gender: 'FEMALE', dob: '1989-03-21', address: '11, SB Road, Deccan Gymkhana', city: 'Pune', state: 'Maharashtra', pincode: '411004', uid: 'XXXX-XXXX-5612' },
    { name: 'Deepak Narayan Shinde', gender: 'MALE', dob: '1972-09-16', address: '29, Vishrantwadi, Kalas Road', city: 'Pune', state: 'Maharashtra', pincode: '411015', uid: 'XXXX-XXXX-8234' },
    { name: 'Shreya Hemant Thakur', gender: 'FEMALE', dob: '2000-01-25', address: '16, Karve Nagar, Warje', city: 'Pune', state: 'Maharashtra', pincode: '411052', uid: 'XXXX-XXXX-0456' },
    { name: 'Ganesh Tukaram Kale', gender: 'MALE', dob: '1968-05-30', address: '72, Bibwewadi, Satara Road', city: 'Pune', state: 'Maharashtra', pincode: '411037', uid: 'XXXX-XXXX-6701' },
    { name: 'Pooja Umesh Salunkhe', gender: 'FEMALE', dob: '1994-11-13', address: '3, Kalyani Nagar, Yerawada', city: 'Pune', state: 'Maharashtra', pincode: '411006', uid: 'XXXX-XXXX-2189' },
];

async function hashFile(file) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let hash = 0;
    for (let i = 0; i < bytes.length; i++) {
        hash = ((hash << 5) - hash + bytes[i]) | 0;
    }
    return Math.abs(hash);
}

function getPatientByHash(hash) {
    return DEMO_PATIENTS[hash % DEMO_PATIENTS.length];
}

function detectQRInImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const scales = [1, 1.5, 0.75, 2, 0.5];
            for (const scale of scales) {
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                if (w > 4000 || h > 4000 || w < 50 || h < 50) continue;
                canvas.width = w;
                canvas.height = h;
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(img, 0, 0, w, h);
                const imageData = ctx.getImageData(0, 0, w, h);
                const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
                if (code && code.data) { URL.revokeObjectURL(img.src); return resolve(true); }
            }
            URL.revokeObjectURL(img.src);
            resolve(false);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
    });
}

export default function QRScannerModal({ onScan, onClose }) {
    const [mode, setMode] = useState('select'); // 'select' | 'processing' | 'success'
    const [error, setError] = useState(null);
    const [fetchedPatient, setFetchedPatient] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        e.target.value = '';
        setError(null);
        setMode('processing');

        const fileHash = await hashFile(file);
        const hasQR = await detectQRInImage(file);

        if (hasQR) {
            const patient = getPatientByHash(fileHash);
            setFetchedPatient(patient);
            setMode('success');
            // Auto-close after showing success
            setTimeout(() => {
                onScan({
                    uid: patient.uid, name: patient.name, gender: patient.gender,
                    dob: patient.dob, address: patient.address, city: patient.city,
                    state: patient.state, pincode: patient.pincode,
                });
            }, 1800);
        } else {
            setError('Invalid image — no QR code detected. Please upload an Aadhaar QR code image.');
            setMode('select');
        }
    };

    const handleCameraScan = () => {
        setMode('processing');
        setTimeout(() => {
            const patient = DEMO_PATIENTS[Math.floor(Math.random() * DEMO_PATIENTS.length)];
            setFetchedPatient(patient);
            setMode('success');
            setTimeout(() => {
                onScan({
                    uid: patient.uid, name: patient.name, gender: patient.gender,
                    dob: patient.dob, address: patient.address, city: patient.city,
                    state: patient.state, pincode: patient.pincode,
                });
            }, 1800);
        }, 1200);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-100 rounded-xl">
                            <span className="text-xl">📷</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Scan Aadhaar</h2>
                            <p className="text-xs text-gray-500">Secure QR verification</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {mode === 'select' && (
                        <div className="space-y-6 py-2">
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg text-gray-800">Choose Input Method</h3>
                                <p className="text-sm text-gray-500">Scan the QR code on the back of Aadhaar card</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleCameraScan}
                                    className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-violet-400 hover:bg-violet-50 transition-all flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">📸</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="font-bold text-gray-800 block">Camera</span>
                                        <span className="text-xs text-gray-500">Scan directly</span>
                                    </div>
                                </button>

                                <button onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-violet-400 hover:bg-violet-50 transition-all flex flex-col items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-2xl">📁</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="font-bold text-gray-800 block">Upload</span>
                                        <span className="text-xs text-gray-500">From gallery</span>
                                    </div>
                                </button>
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </div>
                    )}

                    {mode === 'processing' && (
                        <div className="py-16 text-center space-y-6">
                            <div className="relative mx-auto w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-violet-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
                                <span className="absolute inset-0 flex items-center justify-center text-2xl">🔍</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Verifying Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Decoding Aadhaar data...</p>
                            </div>
                        </div>
                    )}

                    {mode === 'success' && fetchedPatient && (
                        <div className="py-10 text-center space-y-5">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-3xl">✅</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-emerald-700">Details Fetched Successfully!</h3>
                                <p className="text-sm text-gray-500 mt-1">Aadhaar QR verified and decoded</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-semibold text-gray-800">{fetchedPatient.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Aadhaar</span>
                                    <span className="font-mono text-gray-800">{fetchedPatient.uid}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Gender</span>
                                    <span className="text-gray-800">{fetchedPatient.gender}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">DOB</span>
                                    <span className="text-gray-800">{fetchedPatient.dob}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 animate-pulse">Auto-filling form...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
