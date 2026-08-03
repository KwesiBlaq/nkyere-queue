import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nkyere_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
