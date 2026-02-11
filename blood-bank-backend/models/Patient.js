const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    uhid: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide patient name'],
        trim: true,
    },
    dob: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER', ''],
        default: '',
    },
    contact: {
        type: String,
        required: [true, 'Please provide a mobile number'],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        default: '',
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''],
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    pincode: {
        type: String,
        default: '',
    },
    aadhaarLast4: {
        type: String,
        default: '',
    },
    idType: {
        type: String,
        enum: ['aadhaar', 'pan', 'passport', 'voter', 'driving', ''],
        default: '',
    },
    idNumber: {
        type: String,
        default: '',
    },
    emergencyName: {
        type: String,
        default: '',
    },
    emergencyContact: {
        type: String,
        default: '',
    },
    emergencyRelation: {
        type: String,
        default: '',
    },
    isTemporary: {
        type: Boolean,
        default: false,
    },
    allergies: {
        type: String,
        default: '',
    },
    conditions: {
        type: String,
        default: '',
    },
    // Reference to the User account created for this patient
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Patient', patientSchema);
