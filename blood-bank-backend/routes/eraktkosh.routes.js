const express = require('express');
const router = express.Router();

// Mock Data Source
// Borivali & Mumbai Suburbs Mock Data
const MOCK_BLOOD_BANKS = {
  'O+': [
    { id: 1, hospitalName: 'Shatabdi Hospital', distance: 1.2, address: 'SV Road, Kandivali West, Mumbai - 400067', contact: '022-28072295', component: 'Whole Blood', stock: '45 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2153, longitude: 72.8436 },
    { id: 2, hospitalName: 'Karuna Hospital', distance: 1.8, address: 'Jeevan Bima Nagar, Borivali West, Mumbai - 400103', contact: '022-61594698', component: 'Packed RBC', stock: '32 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2372, longitude: 72.8441 },
    { id: 3, hospitalName: 'Bhagwati Hospital', distance: 2.1, address: 'SVP Road, Borivali West, Mumbai - 400103', contact: '022-28932460', component: 'Whole Blood', stock: '28 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2335, longitude: 72.8488 },
    { id: 4, hospitalName: 'Apex Multispeciality Hospitals', distance: 2.5, address: 'Lokmanya Tilak Rd, Borivali West, Mumbai - 400092', contact: '022-28905353', component: 'Platelets', stock: '12 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2294, longitude: 72.8560 },
    { id: 5, hospitalName: 'Oscar Hospital', distance: 3.4, address: 'Kandivali West, Mumbai - 400067', contact: '022-28666666', component: 'Whole Blood', stock: '52 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2089, longitude: 72.8355 },
  ],
  'A+': [
    { id: 1, hospitalName: 'Navneet Hi-Tech Hospital', distance: 2.3, address: 'Dahisar East, Mumbai - 400068', contact: '022-28962626', component: 'Whole Blood', stock: '67 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2554, longitude: 72.8643 },
    { id: 2, hospitalName: 'Lotus Multispecialty Hospital', distance: 2.9, address: 'Borivali West, Mumbai - 400092', contact: '022-28954545', component: 'Packed RBC', stock: '38 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2230, longitude: 72.8590 },
    { id: 3, hospitalName: 'Phoenix Hospitals', distance: 3.1, address: 'Borivali West, Mumbai - 400092', contact: '022-28929999', component: 'Whole Blood', stock: '54 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2310, longitude: 72.8510 },
  ],
  'B+': [
    { id: 1, hospitalName: 'MM Hospital', distance: 1.5, address: 'Borivali West, Mumbai - 400092', contact: '022-28933333', component: 'Whole Blood', stock: '89 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2270, longitude: 72.8530 },
    { id: 2, hospitalName: 'Suchak Hospital', distance: 2.8, address: 'Malad East, Mumbai - 400097', contact: '022-28822222', component: 'Packed RBC', stock: '56 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1860, longitude: 72.8550 },
  ],
  'AB+': [
    { id: 1, hospitalName: 'Cloudnine Hospital', distance: 3.5, address: 'Malad West, Mumbai - 400064', contact: '022-28890000', component: 'Whole Blood', stock: '24 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1840, longitude: 72.8360 },
    { id: 2, hospitalName: 'Wockhardt Hospital', distance: 4.8, address: 'Mira Road East, Mumbai - 401107', contact: '022-28114444', component: 'Platelets', stock: '15 Units', city: 'Thane', state: 'Maharashtra', latitude: 19.2830, longitude: 72.8710 },
  ],
  'O-': [
    { id: 1, hospitalName: 'Crystal Hospital', distance: 2.2, address: 'Kandivali East, Mumbai - 400101', contact: '022-28865555', component: 'Whole Blood', stock: '12 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2120, longitude: 72.8680 },
    { id: 2, hospitalName: 'Sanjeevani Hospital', distance: 3.0, address: 'Malad East, Mumbai - 400097', contact: '022-28811111', component: 'Packed RBC', stock: '8 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1880, longitude: 72.8600 },
  ],
  'A-': [
    { id: 1, hospitalName: 'Thunga Hospital', distance: 4.2, address: 'Mira Road, Mumbai - 401107', contact: '022-28100000', component: 'Whole Blood', stock: '18 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2780, longitude: 72.8750 },
    { id: 2, hospitalName: 'Manav Kalyan Kendra', distance: 2.6, address: 'Dahisar East, Mumbai - 400068', contact: '022-28938888', component: 'FFP', stock: '11 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2520, longitude: 72.8620 },
  ],
  'B-': [
    { id: 1, hospitalName: 'Bharat Ratna Dr. Babasaheb Ambedkar Municipal General Hospital', distance: 1.9, address: 'Kandivali West, Mumbai - 400067', contact: '022-28071234', component: 'Whole Blood', stock: '9 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.2170, longitude: 72.8390 },
  ],
  'AB-': [
    { id: 1, hospitalName: 'Life Line Medicare Hospital', distance: 3.8, address: 'Goregaon West, Mumbai - 400104', contact: '022-28773333', component: 'Whole Blood', stock: '5 Units', city: 'Mumbai', state: 'Maharashtra', latitude: 19.1650, longitude: 72.8420 },
  ]
};

const MOCK_FACILITIES = [
  { id: 1, facilityId: 'FAC001', name: 'Shatabdi Hospital', address: 'SV Road, Kandivali West', city: 'Mumbai', state: 'Maharashtra', pincode: '400067', contact: '022-28072295', email: 'info@shatabdi.com', latitude: 19.2153, longitude: 72.8436, distance: 1.2, facilityType: 'Municipal General Hospital' },
  { id: 2, facilityId: 'FAC002', name: 'Karuna Hospital', address: 'Jeevan Bima Nagar, Borivali West', city: 'Mumbai', state: 'Maharashtra', pincode: '400103', contact: '022-61594698', email: 'info@karunahospital.com', latitude: 19.2372, longitude: 72.8441, distance: 1.8, facilityType: 'Multi-Specialty Hospital' },
  { id: 3, facilityId: 'FAC003', name: 'Bhagwati Hospital', address: 'SVP Road, Borivali West', city: 'Mumbai', state: 'Maharashtra', pincode: '400103', contact: '022-28932460', email: 'info@bhagwati.com', latitude: 19.2335, longitude: 72.8488, distance: 2.1, facilityType: 'Municipal Hospital' },
  { id: 4, facilityId: 'FAC004', name: 'Apex Multispeciality Hospitals', address: 'Lokmanya Tilak Rd, Borivali West', city: 'Mumbai', state: 'Maharashtra', pincode: '400092', contact: '022-28905353', email: 'info@apexhospitals.com', latitude: 19.2294, longitude: 72.8560, distance: 2.5, facilityType: 'Multi-Specialty Hospital' },
  { id: 5, facilityId: 'FAC005', name: 'Navneet Hi-Tech Hospital', address: 'Dahisar East', city: 'Mumbai', state: 'Maharashtra', pincode: '400068', contact: '022-28962626', email: 'info@navneethospital.com', latitude: 19.2554, longitude: 72.8643, distance: 2.3, facilityType: 'General Hospital' },
  { id: 6, facilityId: 'FAC006', name: 'Wockhardt Hospital', address: 'Mira Road East', city: 'Thane', state: 'Maharashtra', pincode: '401107', contact: '022-28114444', email: 'info@wockhardt.com', latitude: 19.2830, longitude: 72.8710, distance: 4.8, facilityType: 'Super Specialty Hospital' },
  { id: 7, facilityId: 'FAC007', name: 'Cloudnine Hospital', address: 'Malad West', city: 'Mumbai', state: 'Maharashtra', pincode: '400064', contact: '022-28890000', email: 'info@cloudnine.com', latitude: 19.1840, longitude: 72.8360, distance: 3.5, facilityType: 'Maternity Hospital' },
  { id: 8, facilityId: 'FAC008', name: 'Thunga Hospital', address: 'Mira Road', city: 'Thane', state: 'Maharashtra', pincode: '401107', contact: '022-28100000', email: 'info@thunga.com', latitude: 19.2780, longitude: 72.8750, distance: 4.2, facilityType: 'Multi-Specialty Hospital' },
];

/**
 * GET /api/eraktkosh/nearby-blood-stock
 * Fetch mock nearby blood bank stock
 */
router.get('/nearby-blood-stock', (req, res) => {
  try {
    const { lat, long, bg } = req.query;

    // Simulate delay
    setTimeout(() => {
      // Normalize blood group
      const normalizedBg = bg ? bg.replace(/\s+/g, '+').toUpperCase() : 'O+';

      const results = MOCK_BLOOD_BANKS[normalizedBg] || MOCK_BLOOD_BANKS['O+'];

      // Randomize slightly for dynamic feel
      const normalizedData = results.map(bank => ({
        ...bank,
        stock: `${Math.max(1, parseInt(bank.stock) + Math.floor(Math.random() * 10 - 5))} Units`
      }));

      res.json({
        success: true,
        count: normalizedData.length,
        data: normalizedData,
        source: 'Mock Data'
      });
    }, 500);

  } catch (error) {
    console.error('Mock eRaktKosh Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mock data',
      error: error.message
    });
  }
});

/**
 * GET /api/eraktkosh/nearby-facilities
 * Fetch mock nearby healthcare facilities
 */
router.get('/nearby-facilities', (req, res) => {
  try {
    const { lat, long, radius = 10 } = req.query;

    setTimeout(() => {
      res.json({
        success: true,
        count: MOCK_FACILITIES.length,
        data: MOCK_FACILITIES,
        source: 'Mock Data'
      });
    }, 500);

  } catch (error) {
    console.error('Mock Facilities Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mock facilities',
      error: error.message
    });
  }
});

module.exports = router;
