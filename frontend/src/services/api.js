import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('mq_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mq_token');
      localStorage.removeItem('mq_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
};

export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  book: (data) => api.post('/appointments', data),
  cancel: (id) => api.patch('/appointments/' + id + '/cancel')
};

export const queueAPI = {
  join: (appointment_id) => api.post('/queue/join', { appointment_id }),
  getStatus: (doctorId) => api.get('/queue/' + doctorId + '/status'),
  callNext: (doctorId) => api.post('/queue/' + doctorId + '/next')
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get('/doctors/' + id),
  getAvailability: (id, date) => api.get('/doctors/' + id + '/availability?date=' + date)
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users')
};

export default api;