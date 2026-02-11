const express = require('express');
const router = express.Router();
const {
    registerPatient,
    getPatients,
    getPatientById,
    patientLogin,
    getPatientProfile,
} = require('../controllers/patientController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Public routes
router.post('/register', registerPatient);
router.post('/login', patientLogin);

// Protected routes (require JWT)
router.get('/profile/:userId', isAuthenticated, getPatientProfile);
router.get('/', isAuthenticated, getPatients);
router.get('/:id', isAuthenticated, getPatientById);

module.exports = router;
