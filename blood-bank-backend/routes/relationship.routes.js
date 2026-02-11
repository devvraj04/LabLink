const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/relationshipControllers');

// Registers
router.post('/registers', ctrl.createRegister);
router.get('/registers', ctrl.listRegisters);

// Records
router.post('/records', ctrl.createRecordRel);
router.get('/records', ctrl.listRecords);

// Request_To
router.post('/request-to', ctrl.createRequestTo);
router.get('/request-to', ctrl.listRequestTo);

module.exports = router;
