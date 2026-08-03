import { useState } from 'react';

export default function LoginForm({
    title,
    defaultEmail = '',
    onLogin,
}: {
    title: string;
    defaultEmail?: string;
    onLogin: (email: string, password: string) => Promise<void>;
}) {
    const [email, setEmail] = useState(defaultEmail);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await onLogin(email, password);
        } catch {
            setError('Invalid credentials.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h1 className="mb-6 text-2xl font-bold">{title}</h1>
                <input
                    className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
                <button
                    disabled={busy}
                    className="w-full rounded-lg bg-emerald-600 p-3 font-semibold hover:bg-emerald-500 disabled:opacity-50"
                >
                    Log in
                </button>
            </form>
        </div>
    );
}
