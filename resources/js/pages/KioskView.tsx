import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { useBranch } from '@/hooks/useBranch';
import type { ServiceType } from '@/api/types';

export default function KioskView() {
    const { branch, loading: branchLoading } = useBranch();
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [issuedNumber, setIssuedNumber] = useState<string | null>(null);
    const [issuing, setIssuing] = useState(false);

    useEffect(() => {
        if (!branch) return;
        api.get<ServiceType[]>(`/branches/${branch.id}/service-types`).then((res) => setServiceTypes(res.data));
    }, [branch]);

    async function issueTicket(serviceTypeId: number, priority: 'normal' | 'vip' | 'accessibility') {
        if (!branch || issuing) return;
        setIssuing(true);
        try {
            const res = await api.post(`/branches/${branch.id}/tickets`, { service_type_id: serviceTypeId, priority });
            setIssuedNumber(res.data.ticket_number);
            setTimeout(() => setIssuedNumber(null), 6000);
        } finally {
            setIssuing(false);
        }
    }

    if (branchLoading) {
        return <Centered>Loading…</Centered>;
    }

    if (issuedNumber) {
        return (
            <Centered>
                <p className="text-2xl text-slate-400">Your ticket number is</p>
                <p className="text-9xl font-bold tracking-wide text-white">{issuedNumber}</p>
                <p className="mt-6 text-xl text-slate-400">It won't be long — watch the screen for your call.</p>
            </Centered>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 text-white">
            <h1 className="mb-2 text-4xl font-bold">{branch?.name}</h1>
            <p className="mb-10 text-lg text-slate-400">What can we help you with today?</p>

            <div className="grid w-full max-w-2xl gap-4">
                {serviceTypes.map((type) => (
                    <button
                        key={type.id}
                        disabled={issuing}
                        onClick={() => issueTicket(type.id, 'normal')}
                        className="rounded-2xl border border-slate-700 bg-slate-900 px-8 py-6 text-left text-2xl font-semibold transition hover:border-emerald-500 hover:bg-slate-800 disabled:opacity-50"
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            <div className="mt-10 flex gap-4">
                {serviceTypes[0] && (
                    <button
                        disabled={issuing}
                        onClick={() => issueTicket(serviceTypes[0].id, 'accessibility')}
                        className="rounded-full border border-slate-700 px-6 py-3 text-sm text-slate-300 hover:border-emerald-500"
                    >
                        Priority / Accessibility ticket
                    </button>
                )}
            </div>
        </div>
    );
}

function Centered({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 text-center text-white">
            {children}
        </div>
    );
}
