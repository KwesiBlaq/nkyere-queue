import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import type { Branch } from '@/api/types';

export function useBranch() {
    const [branch, setBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Branch>('/branch')
            .then((res) => setBranch(res.data))
            .finally(() => setLoading(false));
    }, []);

    return { branch, loading };
}
