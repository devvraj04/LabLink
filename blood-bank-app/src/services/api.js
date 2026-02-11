import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to every request
API.interceptors.request.use(
  (config) => {
    // Check if it's a hospital route
    const isHospitalRoute = config.url?.includes('/hospital/') || config.url?.includes('/chat/hospital') || config.url?.includes('/requests/hospital');
    
    const token = isHospitalRoute 
      ? localStorage.getItem('hospitalToken')
      : localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Check if it's a hospital route
      const isHospitalRoute = error.config?.url?.includes('/hospital/') || 
                             error.config?.url?.includes('/chat/hospital') || 
                             error.config?.url?.includes('/requests/hospital');
      
      if (isHospitalRoute) {
        // Unauthorized hospital - clear hospital token and redirect to hospital login
        localStorage.removeItem('hospitalToken');
        localStorage.removeItem('hospital');
        window.location.href = '/login';
      } else {
        // Unauthorized admin - clear token and redirect to admin login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getCurrentUser: () => API.get('/auth/me'),
};

// Donors API calls
export const donorsAPI = {
  getAll: (params) => API.get('/donors', { params }),
  getById: (id) => API.get(`/donors/${id}`),
  create: (data) => API.post('/donors', data),
  update: (id, data) => API.put(`/donors/${id}`, data),
  delete: (id) => API.delete(`/donors/${id}`),
  getStats: () => API.get('/donors/stats'),
};

// Recipients API calls
export const recipientsAPI = {
  getAll: (params) => API.get('/recipients', { params }),
  getById: (id) => API.get(`/recipients/${id}`),
  create: (data) => API.post('/recipients', data),
  update: (id, data) => API.put(`/recipients/${id}`, data),
  delete: (id) => API.delete(`/recipients/${id}`),
  updateStatus: (id, status) => API.patch(`/recipients/${id}/status`, { status }),
};

// Blood Specimens API calls
export const bloodSpecimensAPI = {
  getAll: (params) => API.get('/blood-specimens', { params }),
  getById: (id) => API.get(`/blood-specimens/${id}`),
  create: (data) => API.post('/blood-specimens', data),
  update: (id, data) => API.put(`/blood-specimens/${id}`, data),
  delete: (id) => API.delete(`/blood-specimens/${id}`),
  updateStatus: (id, status) => API.patch(`/blood-specimens/${id}/status`, { status }),
  getInventoryStats: () => API.get('/blood-specimens/stats/inventory'),
};

// Hospitals API calls
export const hospitalsAPI = {
  getAll: (params) => API.get('/hospitals', { params }),
  getById: (id) => API.get(`/hospitals/${id}`),
  create: (data) => API.post('/hospitals', data),
  update: (id, data) => API.put(`/hospitals/${id}`, data),
  delete: (id) => API.delete(`/hospitals/${id}`),
};

// Cities API calls
export const citiesAPI = {
  getAll: () => API.get('/cities'),
  getById: (id) => API.get(`/cities/${id}`),
  create: (data) => API.post('/cities', data),
  delete: (id) => API.delete(`/cities/${id}`),
};

// Hospital Portal API calls
export const hospitalAuthAPI = {
  register: (hospitalData) => API.post('/hospital/auth/register', hospitalData),
  login: (credentials) => API.post('/hospital/auth/login', credentials),
  getProfile: () => API.get('/hospital/auth/me'),
  updateProfile: (data) => API.put('/hospital/auth/profile', data),
  changePassword: (data) => API.put('/hospital/auth/change-password', data),
};

// Hospital Chat API calls
export const hospitalChatAPI = {
  sendMessage: (message) => API.post('/chat/hospital/send', { message }),
  getMessages: () => API.get('/chat/hospital/messages'),
  getUnreadCount: () => API.get('/chat/hospital/unread-count'),
};

// Hospital Blood Requests API calls
export const hospitalRequestsAPI = {
  create: (data) => API.post('/requests/hospital', data),
  getAll: (params) => API.get('/requests/hospital', { params }),
  getById: (id) => API.get(`/requests/hospital/${id}`),
  cancel: (id) => API.put(`/requests/hospital/${id}/cancel`),
  getStats: () => API.get('/requests/hospital/stats'),
  checkAvailability: (bloodGroup) => API.get(`/requests/hospital/blood-availability/${bloodGroup}`),
  getInventory: () => API.get('/requests/hospital/inventory'),
  getInventorySummary: () => API.get('/requests/hospital/inventory/summary'),
};

// Admin Chat API calls
export const adminChatAPI = {
  getConversations: () => API.get('/chat/admin/conversations'),
  getMessages: (hospitalId) => API.get(`/chat/admin/messages/${hospitalId}`),
  sendMessage: (hospitalId, message) => API.post(`/chat/admin/send/${hospitalId}`, { message }),
  getUnreadCount: () => API.get('/chat/admin/unread-count'),
};

// Admin Blood Requests API calls
export const adminRequestsAPI = {
  getAll: (params) => API.get('/requests/admin', { params }),
  updateStatus: (id, status, adminNotes) => API.put(`/requests/admin/${id}/status`, { status, adminNotes }),
  getStats: () => API.get('/requests/admin/stats'),
};

// Admin Hospital Management API calls (addition to existing hospitalsAPI)
export const adminHospitalsAPI = {
  ...hospitalsAPI,
  getPending: () => API.get('/hospitals/pending'),
  updateApproval: (id, isApproved) => API.put(`/hospitals/${id}/approval`, { isApproved }),
};

// Emergency SOS API calls
export const emergencyAPI = {
  broadcast: (data) => API.post('/emergency/broadcast', data),
  getActive: (params) => API.get('/emergency/active', { params }),
  getById: (id) => API.get(`/emergency/${id}`),
  respond: (id, data) => API.post(`/emergency/${id}/respond`, data),
  updateStatus: (id, status) => API.put(`/emergency/${id}/status`, { status }),
};

// Appointments API calls
export const appointmentsAPI = {
  create: (data) => API.post('/appointments', data),
  getAll: (params) => API.get('/appointments', { params }),
  getByDonor: (donorId) => API.get(`/appointments/donor/${donorId}`),
  getAvailableSlots: (params) => API.get('/appointments/available-slots', { params }),
  updateStatus: (id, status, notes) => API.put(`/appointments/${id}/status`, { status, notes }),
  cancel: (id) => API.delete(`/appointments/${id}`),
};

// Rewards API calls
export const rewardsAPI = {
  getDonorRewards: (donorId) => API.get(`/rewards/donor/${donorId}`),
  getLeaderboard: (params) => API.get('/rewards/leaderboard', { params }),
  awardBadge: (data) => API.post('/rewards/badge', data),
  getStats: () => API.get('/rewards/stats'),
};

// Donation Camps API calls
export const campsAPI = {
  create: (data) => API.post('/camps', data),
  getAll: (params) => API.get('/camps', { params }),
  getUpcoming: () => API.get('/camps/upcoming'),
  register: (id, data) => API.post(`/camps/${id}/register`, data),
  markAttendance: (campId, registrationId, data) => API.put(`/camps/${campId}/attendance/${registrationId}`, data),
  updateStatus: (id, status) => API.put(`/camps/${id}/status`, { status }),
};

// QR Code API calls
export const qrAPI = {
  generateDonorQR: (donorId) => API.get(`/qr/donor/${donorId}`),
  generateSpecimenQR: (specimenId) => API.get(`/qr/specimen/${specimenId}`),
  scanQR: (qrData) => API.post('/qr/scan', { qrData }),
};

// Analytics API calls
export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
  getForecast: () => API.get('/analytics/forecast'),
};

export default API;
