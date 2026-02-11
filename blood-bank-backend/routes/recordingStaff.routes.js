const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recordingStaffController');

router.post('/', ctrl.createStaff);
router.get('/', ctrl.listStaff);
router.get('/:id', ctrl.getStaff);
router.delete('/:id', ctrl.deleteStaff);

module.exports = router;
