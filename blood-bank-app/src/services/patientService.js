import API from './api';

// Patient API calls
export const patientAPI = {
    register: (data) => API.post('/patients/register', data),
    login: (credentials) => API.post('/patients/login', credentials),
    getAll: (params) => API.get('/patients', { params }),
    getById: (id) => API.get(`/patients/${id}`),
    getProfile: (userId) => API.get(`/patients/profile/${userId}`),
};
