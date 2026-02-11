const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

// ===================== TEST CATALOG =====================
router.get('/tests', labController.getTests);
router.post('/tests', labController.createTest);

// ===================== PATIENT: CART & ORDERS =====================
router.post('/orders/add-to-cart', labController.addToCart);
router.get('/orders/cart', labController.getCart);
router.delete('/orders/cart/:orderId', labController.removeFromCart);
router.post('/orders/checkout', labController.checkout);
router.get('/orders', labController.getPatientOrders);

// ===================== TECHNICIAN =====================
router.get('/technician/requests', labController.getTechnicianRequests);
router.put('/technician/approve/:orderId', labController.approveOrder);
router.post('/technician/barcode', labController.generateBarcode);
router.post('/technician/results', labController.submitResult);

// ===================== INVENTORY =====================
router.get('/inventory', labController.getInventory);
router.post('/inventory', labController.createInventoryItem);

// ===================== PAYMENTS =====================
router.post('/payments/record', labController.recordPayment);
router.get('/payments/summary', labController.getPaymentSummary);

// ===================== SEED =====================
router.post('/seed', labController.seedTestData);

module.exports = router;
