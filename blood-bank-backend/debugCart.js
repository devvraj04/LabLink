const mongoose = require('mongoose');
const LabOrder = require('./models/LabOrder');
const LabTest = require('./models/LabTest');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const sessionId = 'DEBUG-' + Date.now();
        console.log('Session ID:', sessionId);

        const tests = await LabTest.find().limit(2);
        if (tests.length < 2) {
            console.log('Not enough tests to debug');
            return;
        }

        console.log('Adding Test 1:', tests[0].name);
        await LabOrder.create({
            testId: tests[0]._id,
            sessionId,
            status: 'cart',
            patientName: 'Walk-in Patient'
        });

        console.log('Adding Test 2:', tests[1].name);
        await LabOrder.create({
            testId: tests[1]._id,
            sessionId,
            status: 'cart',
            patientName: 'Walk-in Patient'
        });

        const cart = await LabOrder.find({ sessionId, status: 'cart' });
        console.log('Cart Items:', cart.length);
        cart.forEach(c => console.log(' -', c.testId));

        if (cart.length === 2) {
            console.log('SUCCESS: Multiple items in cart supported.');
        } else {
            console.log('FAILURE: Only ' + cart.length + ' items in cart.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
