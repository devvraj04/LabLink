import API from './api';

// Lab Test Catalog
export const labAPI = {
    // Tests
    getTests: (params) => API.get('/lab/tests', { params }),
    createTest: (data) => API.post('/lab/tests', data),

    // Patient Cart & Orders
    addToCart: (data) => API.post('/lab/orders/add-to-cart', data),
    getCart: (sessionId, userId) => API.get('/lab/orders/cart', { params: { sessionId, userId } }),
    removeFromCart: (orderId) => API.delete(`/lab/orders/cart/${orderId}`),
    checkout: (data) => API.post('/lab/orders/checkout', data),
    getOrders: (params) => API.get('/lab/orders', { params }),

    // Technician
    getTechnicianRequests: (params) => API.get('/lab/technician/requests', { params }),
    approveOrder: (orderId) => API.put(`/lab/technician/approve/${orderId}`),
    generateBarcode: (data) => API.post('/lab/technician/barcode', data),
    submitResult: (data) => API.post('/lab/technician/results', data),
    updateResult: (orderId, data) => API.put(`/lab/technician/results/${orderId}`, data),

    // Inventory
    getInventory: () => API.get('/lab/inventory'),
    createInventoryItem: (data) => API.post('/lab/inventory', data),

    // Payments
    recordPayment: (data) => API.post('/lab/payments/record', data),
    getPaymentSummary: () => API.get('/lab/payments/summary'),

    // Seed
    seedData: () => API.post('/lab/seed'),
};

export default labAPI;
