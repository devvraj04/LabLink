const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Generate UHID
function generateUHID() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `UHID-${year}-${random}`;
}

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register a new patient (Smart Panjikaran)
// @route   POST /api/patients/register
// @access  Public
exports.registerPatient = async (req, res) => {
    try {
        const {
            firstName, lastName, dob, gender, bloodGroup,
            phone, email, address, city, state, pincode,
            idType, idNumber, aadhaarLast4,
            emergencyName, emergencyContact, emergencyRelation,
            allergies, conditions, isTemporary,
        } = req.body;

        // Validate required fields
        if (!firstName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'First name and phone number are required',
            });
        }

        // Phone must be at least 6 chars for password (bcrypt min)
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must have at least 6 digits',
            });
        }

        // Generate unique UHID
        let uhid = generateUHID();
        let attempts = 0;
        while (attempts < 10) {
            const existing = await Patient.findOne({ uhid });
            if (!existing) break;
            uhid = generateUHID();
            attempts++;
        }

        const fullName = `${firstName} ${lastName || ''}`.trim();

        // Check for duplicate by phone number
        const duplicates = [];
        const phoneDuplicates = await Patient.find({ contact: phone });
        phoneDuplicates.forEach(p => {
            duplicates.push({ id: p._id, uhid: p.uhid, name: p.name, similarity: 'phone' });
        });

        // Create Patient document
        const patient = await Patient.create({
            uhid,
            name: fullName,
            dob: dob || '',
            gender: (gender || '').toUpperCase(),
            bloodGroup: bloodGroup || '',
            contact: phone,
            email: email || '',
            address: address || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            aadhaarLast4: aadhaarLast4 || '',
            idType: idType || '',
            idNumber: idNumber || '',
            emergencyName: emergencyName || '',
            emergencyContact: emergencyContact || '',
            emergencyRelation: emergencyRelation || '',
            allergies: allergies || '',
            conditions: conditions || '',
            isTemporary: isTemporary || false,
        });

        // --- Auto-create User account for this patient ---
        // Username (email field): UHID@lablink.com
        // Password: mobile number
        let userAccount = null;
        try {
            const patientEmail = `${uhid.toLowerCase()}@lablink.com`;
            const userExists = await User.findOne({ email: patientEmail });

            if (!userExists) {
                userAccount = await User.create({
                    name: fullName,
                    email: patientEmail,
                    password: cleanPhone, // will be hashed by pre-save hook
                    role: 'patient',
                });

                // Link User to Patient
                patient.userId = userAccount._id;
                await patient.save();
            }
        } catch (authError) {
            console.error('Failed to create user account for patient:', authError);
            // Don't block patient creation if user creation fails
        }

        // Generate token for the newly registered patient
        const token = userAccount ? generateToken(userAccount._id) : null;

        res.status(201).json({
            success: true,
            message: duplicates.length > 0
                ? 'Patient registered with potential duplicates detected'
                : 'Patient registered successfully',
            data: {
                patient: {
                    id: patient._id,
                    uhid: patient.uhid,
                    name: patient.name,
                    contact: patient.contact,
                },
                credentials: userAccount ? {
                    loginEmail: `${uhid.toLowerCase()}@lablink.com`,
                    loginPassword: 'Your mobile number',
                } : null,
                token,
            },
            duplicates: duplicates.length > 0 ? duplicates : undefined,
        });
    } catch (error) {
        console.error('Error in patient registration:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during patient registration',
            error: error.message,
        });
    }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Staff)
exports.getPatients = async (req, res) => {
    try {
        const { search, uhid, phone } = req.query;

        let query = {};

        if (uhid) {
            query.uhid = { $regex: uhid, $options: 'i' };
        }

        if (phone) {
            query.contact = { $regex: phone, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { uhid: { $regex: search, $options: 'i' } },
                { contact: { $regex: search, $options: 'i' } },
            ];
        }

        const patients = await Patient.find(query).sort({ createdAt: -1 }).limit(100);

        res.status(200).json({
            success: true,
            count: patients.length,
            data: patients,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// @desc    Get single patient by id  
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found',
            });
        }
        res.status(200).json({
            success: true,
            data: patient,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// @desc    Patient login (via UHID or email)
// @route   POST /api/patients/login
// @access  Public
exports.patientLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/UHID and password',
            });
        }

        // Determine the actual email to look up
        // If user enters just a UHID, append @lablink.com
        let lookupEmail = email.toLowerCase().trim();
        if (!lookupEmail.includes('@')) {
            lookupEmail = `${lookupEmail}@lablink.com`;
        }

        // Find user
        const user = await User.findOne({ email: lookupEmail }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid UHID/email or password',
            });
        }

        // Check that the user is a patient
        if (user.role !== 'patient') {
            return res.status(401).json({
                success: false,
                message: 'This login is for patients only. Please use the admin/hospital login.',
            });
        }

        // Match password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid UHID/email or password',
            });
        }

        // Find the associated patient record
        const patient = await Patient.findOne({ userId: user._id });

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                patient: patient ? {
                    id: patient._id,
                    uhid: patient.uhid,
                    name: patient.name,
                    contact: patient.contact,
                } : null,
                token,
            },
        });
    } catch (error) {
        console.error('Patient login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message,
        });
    }
};

// @desc    Get patient profile by user ID (for logged-in patient)
// @route   GET /api/patients/profile/:userId
// @access  Private
exports.getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.params.userId });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found',
            });
        }
        res.status(200).json({
            success: true,
            data: patient,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};
