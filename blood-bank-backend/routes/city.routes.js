const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cityController');

router.post('/', ctrl.createCity);
router.get('/', ctrl.listCities);
router.get('/:id', ctrl.getCity);
router.delete('/:id', ctrl.deleteCity);

module.exports = router;
