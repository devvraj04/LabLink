const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bbManagerController');

router.post('/', ctrl.createManager);
router.get('/', ctrl.listManagers);
router.get('/:id', ctrl.getManager);
router.delete('/:id', ctrl.deleteManager);

module.exports = router;
