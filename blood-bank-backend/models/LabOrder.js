const mongoose = require('mongoose');

const labOrderSchema = new mongoose.Schema({
    patientName: { type: String, default: 'Walk-in Patient' },
    patientEmail: { type: String, default: null },
    patientPhone: { type: String, default: null },
    patientAge: { type: Number, default: null },
    patientGender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
    status: {
        type: String,
        enum: ['cart', 'pending', 'approved', 'sample_collected', 'processing', 'completed', 'cancelled'],
        default: 'cart',
    },
    priority: { type: String, enum: ['ROUTINE', 'URGENT', 'STAT'], default: 'ROUTINE' },
    prescriptionUrl: { type: String, default: null },
    scheduledDate: { type: Date, default: null },
    notes: { type: String, default: null },
    hasAllergies: { type: Boolean, default: false },
    allergyNotes: { type: String, default: null },
    hasImplants: { type: Boolean, default: false },
    implantDetails: { type: String, default: null },
    barcode: { type: String, unique: true, sparse: true },
    collectedAt: { type: Date, default: null },
    collectedBy: { type: String, default: null },
    resultData: { type: mongoose.Schema.Types.Mixed, default: null },
    resultedAt: { type: Date, default: null },
    resultedBy: { type: String, default: null },
    isCritical: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
    // Payment tracking
    isPaid: { type: Boolean, default: false },
    paymentMode: { type: String, enum: ['cash', 'card', 'upi', 'insurance', 'online', null], default: null },
    paymentAmount: { type: Number, default: 0 },
    paymentDate: { type: Date, default: null },
    paymentReference: { type: String, default: null },
    // Session identifier (for grouping cart items)
    sessionId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

labOrderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

labOrderSchema.index({ status: 1 });
labOrderSchema.index({ sessionId: 1 });
labOrderSchema.index({ patientEmail: 1 });
labOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LabOrder', labOrderSchema);
