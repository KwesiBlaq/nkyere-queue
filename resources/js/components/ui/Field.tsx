import type { InputHTMLAttributes, ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="mb-3 block">
            <span className="mb-1 block text-xs text-ink-muted">{label}</span>
            {children}
        </label>
    );
}

const inputClass = 'w-full rounded-lg border border-border bg-surface p-2.5 text-sm outline-none focus:border-accent';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}
