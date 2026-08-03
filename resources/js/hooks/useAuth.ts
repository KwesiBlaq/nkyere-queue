import { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { AuthUser } from '@/api/types';

export function useAuth() {
    const [token, setToken] = useState(() => localStorage.getItem('nkyere_token'));
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(!!token);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        api.get<AuthUser>('/auth/me')
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem('nkyere_token');
                setToken(null);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('nkyere_token', res.data.token);
        setUser(res.data.user);
        setToken(res.data.token);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('nkyere_token');
        setToken(null);
        setUser(null);
    }, []);

    const hasRole = useCallback((role: string) => user?.roles.includes(role) ?? false, [user]);

    return { token, user, loading, login, logout, hasRole };
}
