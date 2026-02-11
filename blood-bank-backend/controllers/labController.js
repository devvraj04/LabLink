const LabTest = require('../models/LabTest');
const LabOrder = require('../models/LabOrder');
const LabInventory = require('../models/LabInventory');

// ===================== LAB TEST CATALOG =====================

// GET /api/lab/tests - List all active tests with optional filters
exports.getTests = async (req, res) => {
    try {
        const { category, search, type } = req.query;
        const filter = { isActive: true };
        if (category) filter.category = category;
        if (type) filter.type = type;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const tests = await LabTest.find(filter).sort({ category: 1, name: 1 });

        // Build category counts
        const allTests = await LabTest.find({ isActive: true });
        const categoryMap = {};
        allTests.forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
        });
        const categories = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

        res.json({ success: true, data: tests, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/lab/tests - Create a new lab test (admin)
exports.createTest = async (req, res) => {
    try {
        const test = await LabTest.create(req.body);
        res.status(201).json({ success: true, data: test });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Test with this code already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================== PATIENT CART & ORDERS =====================

// POST /api/lab/orders/add-to-cart - Add test to cart
exports.addToCart = async (req, res) => {
    try {
        const { testId, sessionId, patientName, patientEmail, patientPhone, patientAge, patientGender } = req.body;
        if (!testId || !sessionId) {
            return res.status(400).json({ success: false, error: 'testId and sessionId are required' });
        }

        const test = await LabTest.findById(testId);
        if (!test) return res.status(404).json({ success: false, error: 'Test not found' });

        // Check if already in cart
        const existing = await LabOrder.findOne({ testId, sessionId, status: 'cart' });
        if (existing) return res.status(400).json({ success: false, error: 'Test already in cart' });

        const order = await LabOrder.create({
            testId,
            sessionId,
            patientName: patientName || 'Walk-in Patient',
            patientEmail,
            patientPhone,
            patientAge,
            patientGender,
            status: 'cart',
            paymentAmount: test.discountedPrice || test.price,
        });

        const populated = await LabOrder.findById(order._id).populate('testId');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/lab/orders/cart - Get cart items
exports.getCart = async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });

        const items = await LabOrder.find({ sessionId, status: 'cart' })
            .populate('testId')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/lab/orders/cart/:orderId - Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const order = await LabOrder.findOne({ _id: req.params.orderId, status: 'cart' });
        if (!order) return res.status(404).json({ success: false, error: 'Cart item not found' });
        await LabOrder.findByIdAndDelete(req.params.orderId);
        res.json({ success: true, message: 'Removed from cart' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/lab/orders/checkout - Checkout cart (submit orders)
exports.checkout = async (req, res) => {
    try {
        const { sessionId, patientName, patientEmail, patientPhone, patientAge, patientGender,
            prescriptionUrl, hasAllergies, allergyNotes, hasImplants, implantDetails } = req.body;

        if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });

        const cartItems = await LabOrder.find({ sessionId, status: 'cart' });
        if (cartItems.length === 0) return res.status(400).json({ success: false, error: 'Cart is empty' });

        // Update all cart items to pending
        await LabOrder.updateMany(
            { sessionId, status: 'cart' },
            {
                $set: {
                    status: 'pending',
                    patientName: patientName || cartItems[0].patientName,
                    patientEmail: patientEmail || cartItems[0].patientEmail,
                    patientPhone: patientPhone || cartItems[0].patientPhone,
                    patientAge: patientAge || cartItems[0].patientAge,
                    patientGender: patientGender || cartItems[0].patientGender,
                    prescriptionUrl: prescriptionUrl || null,
                    hasAllergies: hasAllergies || false,
                    allergyNotes: allergyNotes || null,
                    hasImplants: hasImplants || false,
                    implantDetails: implantDetails || null,
                },
            }
        );

        res.json({ success: true, message: `${cartItems.length} test(s) submitted for approval`, count: cartItems.length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/lab/orders - Get orders for a patient (by sessionId or email)
exports.getPatientOrders = async (req, res) => {
    try {
        const { sessionId, email } = req.query;
        const filter = { status: { $ne: 'cart' } };
        if (sessionId) filter.sessionId = sessionId;
        else if (email) filter.patientEmail = email;
        else return res.status(400).json({ success: false, error: 'sessionId or email required' });

        const orders = await LabOrder.find(filter)
            .populate('testId')
            .sort({ createdAt: -1 });

        // Enrich with progress info
        const enriched = orders.map((o) => {
            const order = o.toObject();
            order.LabTest = order.testId;
            const statusSteps = ['pending', 'approved', 'sample_collected', 'processing', 'completed'];
            const stepLabels = ['Ordered', 'Approved', 'Collected', 'Processing', 'Completed'];
            const currentIdx = statusSteps.indexOf(order.status);
            order.progress = {
                current: order.status,
                percentage: Math.round(((currentIdx + 1) / statusSteps.length) * 100),
                steps: stepLabels.map((name, i) => ({
                    name,
                    completed: i <= currentIdx,
                    current: i === currentIdx,
                })),
            };

            // Payment-gate: only allow result viewing if paid
            if (order.status === 'completed' && !!order.resultData && order.isPaid) {
                order.canDownloadReport = true;
            } else {
                order.canDownloadReport = false;
                // Strip result data from unpaid completed orders so patient can't see it
                if (order.status === 'completed' && !order.isPaid) {
                    order.resultData = null;
                    order.paymentRequired = true;
                }
            }
            return order;
        });

        res.json({ success: true, data: enriched });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================== TECHNICIAN OPERATIONS =====================

// GET /api/lab/technician/requests - Get all lab requests for technician
exports.getTechnicianRequests = async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = { status: { $ne: 'cart' } };
        if (status && status !== 'all') filter.status = status;

        // If search query provided, add barcode / patientName / patientEmail filter
        if (search && search.trim()) {
            const q = search.trim();
            filter.$or = [
                { barcode: { $regex: q, $options: 'i' } },
                { patientName: { $regex: q, $options: 'i' } },
                { patientEmail: { $regex: q, $options: 'i' } },
                { sessionId: { $regex: q, $options: 'i' } },
            ];
        }

        let requests = await LabOrder.find(filter)
            .populate('testId')
            .sort({ priority: -1, createdAt: -1 });

        // Also filter by test name if search is provided (post-populate)
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            requests = requests.filter((r) => {
                const test = r.testId;
                if (test && (test.name || '').toLowerCase().includes(q)) return true;
                if (test && (test.code || '').toLowerCase().includes(q)) return true;
                // Already matched by DB query
                return (r.barcode || '').toLowerCase().includes(q) ||
                    (r.patientName || '').toLowerCase().includes(q) ||
                    (r.patientEmail || '').toLowerCase().includes(q) ||
                    (r.sessionId || '').toLowerCase().includes(q);
            });
        }

        // Build stats
        const allOrders = await LabOrder.find({ status: { $ne: 'cart' } });
        const byStatus = {};
        allOrders.forEach((o) => {
            byStatus[o.status] = (byStatus[o.status] || 0) + 1;
        });

        const enriched = requests.map((o) => {
            const order = o.toObject();
            order.LabTest = order.testId;
            order.Patient = {
                name: order.patientName,
                email: order.patientEmail,
                uhid: order.sessionId?.substring(0, 8)?.toUpperCase() || 'N/A',
            };
            order.safetyAlerts = {
                hasAllergies: order.hasAllergies,
                allergies: order.hasAllergies ? [{ allergen: order.allergyNotes || 'Unknown', severity: 'Unknown' }] : [],
                hasImplants: order.hasImplants,
                implants: order.hasImplants ? [{ type: order.implantDetails || 'Unknown', location: 'Unknown' }] : [],
                isRadiology: order.testId?.type === 'RADIOLOGY',
                requiresMRISafetyCheck: order.hasImplants && order.testId?.type === 'RADIOLOGY',
            };
            return order;
        });

        res.json({ success: true, data: enriched, stats: { byStatus } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/lab/technician/approve/:orderId - Approve an order
exports.approveOrder = async (req, res) => {
    try {
        const order = await LabOrder.findById(req.params.orderId);
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        if (order.status !== 'pending') return res.status(400).json({ success: false, error: 'Order is not pending' });

        order.status = 'approved';
        await order.save();
        res.json({ success: true, data: order, message: 'Order approved' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/lab/technician/barcode - Generate barcode for order
exports.generateBarcode = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await LabOrder.findById(orderId);
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        if (order.barcode) return res.json({ success: true, data: { barcode: order.barcode }, message: 'Barcode already exists' });

        // Generate unique barcode
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const barcode = `LAB-${timestamp}-${random}`;

        order.barcode = barcode;
        order.status = 'sample_collected';
        order.collectedAt = new Date();
        order.collectedBy = 'Lab Technician';
        await order.save();

        res.json({ success: true, data: { barcode }, message: 'Barcode generated, sample collected' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/lab/technician/results - Submit test results
exports.submitResult = async (req, res) => {
    try {
        const { orderId, resultData, isCritical, resultedBy } = req.body;
        const order = await LabOrder.findById(orderId).populate('testId');
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        // Check for abnormal values
        let hasAbnormal = false;
        if (order.testId && order.testId.resultFields) {
            order.testId.resultFields.forEach((field) => {
                if (field.fieldType === 'number' && field.normalMin != null && field.normalMax != null) {
                    const val = parseFloat(resultData[field.fieldName]);
                    if (!isNaN(val) && (val < field.normalMin || val > field.normalMax)) {
                        hasAbnormal = true;
                    }
                }
            });
        }

        order.resultData = resultData;
        order.resultedAt = new Date();
        order.resultedBy = resultedBy || 'Lab Technician';
        order.isCritical = isCritical || hasAbnormal;
        order.status = 'completed';
        await order.save();

        res.json({
            success: true,
            message: isCritical ? '⚠️ Critical result submitted!' : 'Result submitted successfully',
            analysis: { isCritical: order.isCritical, hasAbnormal },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/lab/technician/results/:orderId - Update existing test results
exports.updateResult = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { resultData, isCritical, resultedBy } = req.body;
        const order = await LabOrder.findById(orderId).populate('testId');
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
        if (order.status !== 'completed') {
            return res.status(400).json({ success: false, error: 'Can only edit results for completed orders' });
        }

        // Check for abnormal values
        let hasAbnormal = false;
        if (order.testId && order.testId.resultFields) {
            order.testId.resultFields.forEach((field) => {
                if (field.fieldType === 'number' && field.normalMin != null && field.normalMax != null) {
                    const val = parseFloat(resultData[field.fieldName]);
                    if (!isNaN(val) && (val < field.normalMin || val > field.normalMax)) {
                        hasAbnormal = true;
                    }
                }
            });
        }

        order.resultData = resultData;
        order.resultedAt = new Date();
        order.resultedBy = resultedBy || 'Lab Technician';
        order.isCritical = isCritical || hasAbnormal;
        await order.save();

        res.json({
            success: true,
            message: 'Result updated successfully',
            analysis: { isCritical: order.isCritical, hasAbnormal },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================== INVENTORY =====================

// GET /api/lab/inventory
exports.getInventory = async (req, res) => {
    try {
        const items = await LabInventory.find({ isActive: true }).sort({ category: 1, name: 1 });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/lab/inventory
exports.createInventoryItem = async (req, res) => {
    try {
        const item = await LabInventory.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Item code already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================== PAYMENT TRACKING =====================

// POST /api/lab/payments/record - Record payment for an order
exports.recordPayment = async (req, res) => {
    try {
        const { orderId, paymentMode, paymentAmount, paymentReference } = req.body;
        const order = await LabOrder.findById(orderId);
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        order.isPaid = true;
        order.paymentMode = paymentMode;
        order.paymentAmount = paymentAmount || order.paymentAmount;
        order.paymentDate = new Date();
        order.paymentReference = paymentReference || null;
        await order.save();

        res.json({ success: true, data: order, message: 'Payment recorded' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/lab/payments/summary - Payment summary stats
exports.getPaymentSummary = async (req, res) => {
    try {
        const allOrders = await LabOrder.find({ status: { $ne: 'cart' } });

        const totalRevenue = allOrders.filter(o => o.isPaid).reduce((s, o) => s + (o.paymentAmount || 0), 0);
        const pendingPayments = allOrders.filter(o => !o.isPaid && o.status !== 'cancelled').reduce((s, o) => s + (o.paymentAmount || 0), 0);
        const totalOrders = allOrders.length;
        const paidOrders = allOrders.filter(o => o.isPaid).length;
        const unpaidOrders = allOrders.filter(o => !o.isPaid && o.status !== 'cancelled').length;

        // Payment mode breakdown
        const byMode = {};
        allOrders.filter(o => o.isPaid && o.paymentMode).forEach((o) => {
            byMode[o.paymentMode] = (byMode[o.paymentMode] || 0) + (o.paymentAmount || 0);
        });

        // Recent payments
        const recentPayments = await LabOrder.find({ isPaid: true })
            .populate('testId')
            .sort({ paymentDate: -1 })
            .limit(20);

        res.json({
            success: true,
            data: {
                totalRevenue,
                pendingPayments,
                totalOrders,
                paidOrders,
                unpaidOrders,
                byMode,
                recentPayments: recentPayments.map((p) => ({
                    id: p._id,
                    patientName: p.patientName,
                    testName: p.testId?.name || 'Unknown',
                    amount: p.paymentAmount,
                    mode: p.paymentMode,
                    date: p.paymentDate,
                    reference: p.paymentReference,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================== SEED DATA =====================
exports.seedTestData = async (req, res) => {
    try {
        const existingCount = await LabTest.countDocuments();
        if (existingCount > 0) {
            return res.json({ success: true, message: `Already seeded (${existingCount} tests exist)` });
        }

        const tests = [
            {
                code: 'CBC-001', name: 'Complete Blood Count (CBC)', category: 'Hematology', type: 'PATHOLOGY',
                description: 'Measures red blood cells, white blood cells, hemoglobin, and platelets.',
                price: 500, discountedPrice: 350, sampleType: 'Blood', turnaroundTime: '4 hours',
                prerequisites: { fasting: false, instructions: ['No special preparation needed'] },
                resultFields: [
                    { fieldName: 'hemoglobin', fieldLabel: 'Hemoglobin', fieldType: 'number', unit: 'g/dL', normalMin: 12, normalMax: 17, isRequired: true, sortOrder: 1 },
                    { fieldName: 'wbc', fieldLabel: 'WBC Count', fieldType: 'number', unit: 'cells/μL', normalMin: 4000, normalMax: 11000, isRequired: true, sortOrder: 2 },
                    { fieldName: 'rbc', fieldLabel: 'RBC Count', fieldType: 'number', unit: 'million/μL', normalMin: 4.5, normalMax: 5.5, isRequired: true, sortOrder: 3 },
                    { fieldName: 'platelets', fieldLabel: 'Platelet Count', fieldType: 'number', unit: 'cells/μL', normalMin: 150000, normalMax: 400000, isRequired: true, sortOrder: 4 },
                    { fieldName: 'hematocrit', fieldLabel: 'Hematocrit', fieldType: 'number', unit: '%', normalMin: 36, normalMax: 48, isRequired: true, sortOrder: 5 },
                ],
            },
            {
                code: 'LFT-001', name: 'Liver Function Test', category: 'Biochemistry', type: 'PATHOLOGY',
                description: 'Evaluates liver health by measuring enzymes, proteins, and bilirubin.',
                price: 800, discountedPrice: 600, sampleType: 'Blood', turnaroundTime: '6 hours',
                prerequisites: { fasting: true, fastingHours: 10, instructions: ['Fast for 10-12 hours', 'Water is allowed'] },
                resultFields: [
                    { fieldName: 'alt', fieldLabel: 'ALT (SGPT)', fieldType: 'number', unit: 'U/L', normalMin: 7, normalMax: 56, isRequired: true, sortOrder: 1 },
                    { fieldName: 'ast', fieldLabel: 'AST (SGOT)', fieldType: 'number', unit: 'U/L', normalMin: 10, normalMax: 40, isRequired: true, sortOrder: 2 },
                    { fieldName: 'alp', fieldLabel: 'Alkaline Phosphatase', fieldType: 'number', unit: 'U/L', normalMin: 44, normalMax: 147, isRequired: true, sortOrder: 3 },
                    { fieldName: 'bilirubin', fieldLabel: 'Total Bilirubin', fieldType: 'number', unit: 'mg/dL', normalMin: 0.1, normalMax: 1.2, isRequired: true, sortOrder: 4 },
                    { fieldName: 'albumin', fieldLabel: 'Albumin', fieldType: 'number', unit: 'g/dL', normalMin: 3.5, normalMax: 5.5, isRequired: true, sortOrder: 5 },
                ],
            },
            {
                code: 'KFT-001', name: 'Kidney Function Test', category: 'Biochemistry', type: 'PATHOLOGY',
                description: 'Assesses kidney health by measuring creatinine, BUN, and electrolytes.',
                price: 700, discountedPrice: 500, sampleType: 'Blood', turnaroundTime: '6 hours',
                prerequisites: { fasting: true, fastingHours: 8, instructions: ['Fast for 8 hours before test'] },
                resultFields: [
                    { fieldName: 'creatinine', fieldLabel: 'Creatinine', fieldType: 'number', unit: 'mg/dL', normalMin: 0.7, normalMax: 1.3, isRequired: true, sortOrder: 1 },
                    { fieldName: 'bun', fieldLabel: 'Blood Urea Nitrogen', fieldType: 'number', unit: 'mg/dL', normalMin: 7, normalMax: 20, isRequired: true, sortOrder: 2 },
                    { fieldName: 'uric_acid', fieldLabel: 'Uric Acid', fieldType: 'number', unit: 'mg/dL', normalMin: 3.5, normalMax: 7.2, isRequired: true, sortOrder: 3 },
                    { fieldName: 'sodium', fieldLabel: 'Sodium', fieldType: 'number', unit: 'mEq/L', normalMin: 136, normalMax: 145, isRequired: true, sortOrder: 4 },
                    { fieldName: 'potassium', fieldLabel: 'Potassium', fieldType: 'number', unit: 'mEq/L', normalMin: 3.5, normalMax: 5.0, isRequired: true, sortOrder: 5 },
                ],
            },
            {
                code: 'TSH-001', name: 'Thyroid Stimulating Hormone (TSH)', category: 'Endocrinology', type: 'PATHOLOGY',
                description: 'Screens for thyroid disorders.', price: 450, discountedPrice: 300,
                sampleType: 'Blood', turnaroundTime: '8 hours',
                prerequisites: { fasting: false, instructions: ['No fasting required', 'Best done in the morning'] },
                resultFields: [
                    { fieldName: 'tsh', fieldLabel: 'TSH', fieldType: 'number', unit: 'μIU/mL', normalMin: 0.4, normalMax: 4.0, isRequired: true, sortOrder: 1 },
                    { fieldName: 't3', fieldLabel: 'T3', fieldType: 'number', unit: 'ng/dL', normalMin: 80, normalMax: 200, isRequired: true, sortOrder: 2 },
                    { fieldName: 't4', fieldLabel: 'T4', fieldType: 'number', unit: 'μg/dL', normalMin: 5.1, normalMax: 14.1, isRequired: true, sortOrder: 3 },
                ],
            },
            {
                code: 'LP-001', name: 'Lipid Profile', category: 'Biochemistry', type: 'PATHOLOGY',
                description: 'Measures cholesterol, LDL, HDL, and triglycerides.',
                price: 600, discountedPrice: 450, sampleType: 'Blood', turnaroundTime: '6 hours',
                prerequisites: { fasting: true, fastingHours: 12, instructions: ['Fast for 12 hours', 'Avoid fatty food the night before'], warnings: ['Avoid alcohol 48 hours before the test'] },
                resultFields: [
                    { fieldName: 'total_cholesterol', fieldLabel: 'Total Cholesterol', fieldType: 'number', unit: 'mg/dL', normalMin: 0, normalMax: 200, isRequired: true, sortOrder: 1 },
                    { fieldName: 'ldl', fieldLabel: 'LDL Cholesterol', fieldType: 'number', unit: 'mg/dL', normalMin: 0, normalMax: 100, isRequired: true, sortOrder: 2 },
                    { fieldName: 'hdl', fieldLabel: 'HDL Cholesterol', fieldType: 'number', unit: 'mg/dL', normalMin: 40, normalMax: 60, isRequired: true, sortOrder: 3 },
                    { fieldName: 'triglycerides', fieldLabel: 'Triglycerides', fieldType: 'number', unit: 'mg/dL', normalMin: 0, normalMax: 150, isRequired: true, sortOrder: 4 },
                ],
            },
            {
                code: 'BG-001', name: 'Blood Glucose (Fasting)', category: 'Biochemistry', type: 'PATHOLOGY',
                description: 'Measures fasting blood sugar level.', price: 150, discountedPrice: 100,
                sampleType: 'Blood', turnaroundTime: '2 hours',
                prerequisites: { fasting: true, fastingHours: 8, instructions: ['Fast for 8-10 hours'] },
                resultFields: [
                    { fieldName: 'fasting_glucose', fieldLabel: 'Fasting Glucose', fieldType: 'number', unit: 'mg/dL', normalMin: 70, normalMax: 100, isRequired: true, sortOrder: 1 },
                ],
            },
            {
                code: 'UA-001', name: 'Urine Analysis', category: 'Clinical Pathology', type: 'PATHOLOGY',
                description: 'Physical, chemical, and microscopic examination of urine.',
                price: 300, discountedPrice: 200, sampleType: 'Urine', turnaroundTime: '4 hours',
                prerequisites: { fasting: false, instructions: ['Collect midstream urine sample'] },
                resultFields: [
                    { fieldName: 'ph', fieldLabel: 'pH', fieldType: 'number', unit: '', normalMin: 4.5, normalMax: 8.0, isRequired: true, sortOrder: 1 },
                    { fieldName: 'specific_gravity', fieldLabel: 'Specific Gravity', fieldType: 'number', unit: '', normalMin: 1.005, normalMax: 1.030, isRequired: true, sortOrder: 2 },
                    { fieldName: 'protein', fieldLabel: 'Protein', fieldType: 'select', options: ['Nil', 'Trace', '1+', '2+', '3+'], isRequired: true, sortOrder: 3 },
                    { fieldName: 'glucose_urine', fieldLabel: 'Glucose', fieldType: 'select', options: ['Nil', 'Trace', '1+', '2+', '3+'], isRequired: true, sortOrder: 4 },
                ],
            },
            {
                code: 'XRAY-001', name: 'Chest X-Ray', category: 'Radiology', type: 'RADIOLOGY',
                description: 'Digital chest X-ray for lung and heart evaluation.',
                price: 800, discountedPrice: 600, sampleType: null, turnaroundTime: '1 hour',
                prerequisites: { fasting: false, instructions: ['Remove jewelry and metal objects'], warnings: ['Not recommended for pregnant women'] },
                resultFields: [
                    { fieldName: 'findings', fieldLabel: 'Findings', fieldType: 'text', isRequired: true, sortOrder: 1 },
                    { fieldName: 'impression', fieldLabel: 'Impression', fieldType: 'select', options: ['Normal', 'Abnormal - Follow up needed', 'Critical'], isRequired: true, sortOrder: 2 },
                ],
            },
            {
                code: 'HBA1C-001', name: 'HbA1c (Glycated Hemoglobin)', category: 'Biochemistry', type: 'PATHOLOGY',
                description: 'Measures average blood sugar over the past 2-3 months.',
                price: 600, discountedPrice: 450, sampleType: 'Blood', turnaroundTime: '6 hours',
                prerequisites: { fasting: false, instructions: ['No fasting required'] },
                resultFields: [
                    { fieldName: 'hba1c', fieldLabel: 'HbA1c', fieldType: 'number', unit: '%', normalMin: 4.0, normalMax: 5.6, isRequired: true, sortOrder: 1 },
                ],
            },
            {
                code: 'WIDAL-001', name: 'Widal Test', category: 'Serology', type: 'PATHOLOGY',
                description: 'Detects antibodies against Salmonella typhi (typhoid).',
                price: 400, discountedPrice: 280, sampleType: 'Blood', turnaroundTime: '4 hours',
                prerequisites: { fasting: false, instructions: ['No special preparation needed'] },
                resultFields: [
                    { fieldName: 'typhi_o', fieldLabel: 'S. Typhi O', fieldType: 'select', options: ['Negative', '1:20', '1:40', '1:80', '1:160', '1:320'], isRequired: true, sortOrder: 1 },
                    { fieldName: 'typhi_h', fieldLabel: 'S. Typhi H', fieldType: 'select', options: ['Negative', '1:20', '1:40', '1:80', '1:160', '1:320'], isRequired: true, sortOrder: 2 },
                ],
            },
        ];

        await LabTest.insertMany(tests);

        // Seed inventory
        const inventoryItems = [
            { itemCode: 'VAC-RED', name: 'Vacutainer - Red Top', category: 'tubes', unit: 'pieces', currentStock: 500, minStock: 100, unitCost: 15 },
            { itemCode: 'VAC-PURPLE', name: 'Vacutainer - EDTA (Purple)', category: 'tubes', unit: 'pieces', currentStock: 450, minStock: 100, unitCost: 18 },
            { itemCode: 'VAC-BLUE', name: 'Vacutainer - Citrate (Blue)', category: 'tubes', unit: 'pieces', currentStock: 200, minStock: 50, unitCost: 20 },
            { itemCode: 'SYR-5ML', name: 'Syringe 5ml', category: 'consumables', unit: 'pieces', currentStock: 800, minStock: 200, unitCost: 5 },
            { itemCode: 'GLOVE-M', name: 'Latex Gloves (Medium)', category: 'consumables', unit: 'pairs', currentStock: 300, minStock: 100, unitCost: 8 },
            { itemCode: 'SLIDE-PLAIN', name: 'Glass Slides (Plain)', category: 'consumables', unit: 'pieces', currentStock: 1000, minStock: 200, unitCost: 3 },
            { itemCode: 'REAGENT-CBC', name: 'CBC Reagent Kit', category: 'reagents', unit: 'kits', currentStock: 15, minStock: 5, unitCost: 2500 },
            { itemCode: 'REAGENT-LFT', name: 'LFT Reagent Kit', category: 'reagents', unit: 'kits', currentStock: 8, minStock: 3, unitCost: 3500 },
        ];

        const existingInvCount = await LabInventory.countDocuments();
        if (existingInvCount === 0) {
            await LabInventory.insertMany(inventoryItems);
        }

        res.json({ success: true, message: `Seeded ${tests.length} tests and ${inventoryItems.length} inventory items` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
