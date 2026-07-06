import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://vetcare-1.onrender.com',
    timeout: 15000,
});

// ✅ Attach fresh token to every request automatically
api.interceptors.request.use(async (config) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    } catch (err) {
        console.error('Token attach error:', err.message);
    }
    return config;
});

// ✅ Handle token expiry automatically
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data: { session } } = await supabase.auth.refreshSession();
                if (session?.access_token) {
                    originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshErr) {
                console.error('Token refresh failed:', refreshErr.message);
            }

            // Refresh failed — logout
            await supabase.auth.signOut();
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(err);
    }
);

export default api;