import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Intercept requests to inject the token if available
api.interceptors.request.use(config => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            const parsed = JSON.parse(userInfo);
            if (parsed.token) {
                config.headers.Authorization = `Bearer ${parsed.token}`;
            }
        } catch { /* no token, skip */ }
    }
    return config;
}, error => Promise.reject(error));

api.interceptors.response.use(
    response => response.data,
    error => {
        const message = error.response?.data?.message || error.message || 'API request failed';
        return Promise.reject(new Error(message));
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me')
};

export const destinationsAPI = {
    getAll: (params) => api.get('/destinations', { params }),
    getById: (id) => api.get(`/destinations/${id}`),
    create: (data) => api.post('/destinations', data),
    update: (id, data) => api.put(`/destinations/${id}`, data),
    delete: (id) => api.delete(`/destinations/${id}`),
    uploadImage: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const tripsAPI = {
    getAll: () => api.get('/trips'),
    create: (data) => api.post('/trips', data),
    update: (id, data) => api.put(`/trips/${id}`, data),
    delete: (id) => api.delete(`/trips/${id}`),
};

export const recommendationsAPI = {
    get: (prefs) => api.post('/recommendations', prefs),
};

export const plannerAPI = {
    planTrip: (data) => api.post('/plan-trip', data),
};

export const analyticsAPI = {
    getSummary: () => api.get('/analytics/summary'),
    getPopular: () => api.get('/analytics/popular'),
    getTrends: () => api.get('/analytics/trends'),
};

export default api;
