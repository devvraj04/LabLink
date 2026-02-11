const mongoose = require('mongoose');

const labTestResultFieldSchema = new mongoose.Schema({
    fieldName: { type: String, required: true },
    fieldLabel: { type: String, required: true },
    fieldType: { type: String, enum: ['number', 'text', 'select'], default: 'number' },
    unit: { type: String, default: null },
    normalMin: { type: Number, default: null },
    normalMax: { type: Number, default: null },
    options: [String],
    isRequired: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
});

const labTestSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['PATHOLOGY', 'RADIOLOGY'], default: 'PATHOLOGY' },
    description: { type: String, default: null },
    price: { type: Number, required: true },
    discountedPrice: { type: Number, default: null },
    prerequisites: {
        fasting: { type: Boolean, default: false },
        fastingHours: { type: Number, default: null },
        instructions: [String],
        warnings: [String],
    },
    sampleType: { type: String, default: null },
    turnaroundTime: { type: String, default: '24 hours' },
    isActive: { type: Boolean, default: true },
    isHomeCollection: { type: Boolean, default: false },
    resultFields: [labTestResultFieldSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

labTestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('LabTest', labTestSchema);
