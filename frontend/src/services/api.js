
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('mq_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
}, error => Promise.reject(error));

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put('/appointments/' + id, data),
  cancel: (id) => api.delete('/appointments/' + id),
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get('/doctors/' + id),
  updateProfile: (data) => api.post('/doctors/profile', data),
  getAvailability: (doctorId, date) => api.get('/doctors/' + doctorId + '/availability?date=' + date),
};

export const queueAPI = {
  getStatus: (doctorId) => api.get('/queue/' + doctorId + '/status'),
  join: (data) => api.post('/queue/join', data),
  next: (doctorId) => api.post('/queue/' + doctorId + '/next'),
  getMyQueue: () => api.get('/queue/my'),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/order', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
};

export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  create: (data) => api.post('/prescriptions', data),
};

export const messageAPI = {
  getContacts: () => api.get('/messages/contacts'),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get('/messages/' + userId),
  send: (data) => api.post('/messages', data),
};

export const healthAPI = {
  getRecord: () => api.get('/health/record'),
  saveRecord: (data) => api.post('/health/record', data),
  getVitals: () => api.get('/health/vitals'),
  saveVitals: (data) => api.post('/health/vitals', data),
  getPatientRecord: (patientId) => api.get('/health/patient/' + patientId),
  shareRecord: () => api.post('/health/share'),
};

export const reviewAPI = {
  getDoctorReviews: (doctorId) => api.get('/reviews/doctor/' + doctorId),
  getMyReviews: () => api.get('/reviews/my'),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete('/reviews/' + id),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
