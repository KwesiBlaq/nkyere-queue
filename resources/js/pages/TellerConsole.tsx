import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useBranch } from '@/hooks/useBranch';
import LoginForm from '@/components/LoginForm';
import type { Counter, Ticket } from '@/api/types';

export default function TellerConsole() {
    const { branch } = useBranch();
    const { token, loading, login } = useAuth();
    const [counters, setCounters] = useState<Counter[]>([]);
    const [counterId, setCounterId] = useState<number | null>(null);
    const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!branch) return;
        api.get<Counter[]>(`/branches/${branch.id}/counters`).then((res) => setCounters(res.data));
    }, [branch]);

    if (loading) {
        return <div className="min-h-screen bg-slate-950" />;
    }

    if (!token) {
        return <LoginForm title="Teller Login" defaultEmail="teller@nkyere.test" onLogin={login} />;
    }

    async function callNext() {
        if (!counterId || busy) return;
        setBusy(true);
        setError(null);
        try {
            const res = await api.post<Ticket>(`/counters/${counterId}/call-next`);
            setCurrentTicket(res.data);
        } catch {
            setError('No tickets waiting.');
            setCurrentTicket(null);
        } finally {
            setBusy(false);
        }
    }

    async function transition(action: 'serve' | 'complete' | 'no-show') {
        if (!currentTicket || busy) return;
        setBusy(true);
        try {
            const res = await api.post<Ticket>(`/tickets/${currentTicket.id}/${action}`);
            setCurrentTicket(action === 'complete' || action === 'no-show' ? null : res.data);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <div className="mx-auto max-w-xl">
                <h1 className="mb-6 text-3xl font-bold">Teller Console</h1>

                <label className="mb-8 block">
                    <span className="mb-1 block text-sm text-slate-400">Counter</span>
                    <select
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-lg"
                        value={counterId ?? ''}
                        onChange={(e) => setCounterId(Number(e.target.value) || null)}
                    >
                        <option value="">Select a counter…</option>
                        {counters.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>

                {currentTicket ? (
                    <div className="rounded-2xl border border-emerald-700 bg-slate-900 p-8 text-center">
                        <p className="text-lg text-slate-400">Now serving</p>
                        <p className="text-6xl font-bold">{currentTicket.ticket_number}</p>
                        <p className="mt-2 text-slate-400">{currentTicket.service_type}</p>
                        <div className="mt-6 flex justify-center gap-3">
                            {currentTicket.status === 'called' && (
                                <ActionButton onClick={() => transition('serve')} disabled={busy}>
                                    Start Serving
                                </ActionButton>
                            )}
                            <ActionButton onClick={() => transition('complete')} disabled={busy} variant="primary">
                                Complete
                            </ActionButton>
                            <ActionButton onClick={() => transition('no-show')} disabled={busy} variant="danger">
                                No-show
                            </ActionButton>
                        </div>
                    </div>
                ) : (
                    <ActionButton onClick={callNext} disabled={!counterId || busy} variant="primary" full>
                        Call Next
                    </ActionButton>
                )}

                {error && <p className="mt-4 text-center text-amber-400">{error}</p>}
            </div>
        </div>
    );
}

function ActionButton({
    children,
    onClick,
    disabled,
    variant = 'default',
    full = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'primary' | 'danger';
    full?: boolean;
}) {
    const colors =
        variant === 'primary'
            ? 'bg-emerald-600 hover:bg-emerald-500'
            : variant === 'danger'
              ? 'bg-red-900 hover:bg-red-800'
              : 'bg-slate-800 hover:bg-slate-700';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`rounded-xl px-6 py-4 text-lg font-semibold transition disabled:opacity-40 ${colors} ${full ? 'w-full' : ''}`}
        >
            {children}
        </button>
    );
}
