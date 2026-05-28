import axios from 'axios';

const api = axios.create({
    baseURL: typeof window !== 'undefined'
        ? `http://${window.location.hostname}:5000/api`
        : 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
