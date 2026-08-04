import { useState } from 'react';
import { Landmark } from 'lucide-react';
import { Field, TextInput } from '@/components/ui/Field';
import Button from '@/components/ui/Button';

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
        <div className="flex min-h-screen items-center justify-center bg-surface text-ink-primary">
            <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border-subtle/10 bg-surface-raised p-8">
                <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                        <Landmark size={18} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold">{title}</h1>
                </div>

                <Field label="Email">
                    <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Password">
                    <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>

                {error && <p className="mb-4 text-sm text-danger">{error}</p>}

                <Button variant="primary" disabled={busy} className="w-full">
                    {busy ? 'Signing in…' : 'Log in'}
                </Button>
            </form>
        </div>
    );
}
