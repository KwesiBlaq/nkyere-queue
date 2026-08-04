export default function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={`rounded-2xl border border-border-subtle/10 bg-surface-raised p-6 ${className}`}>{children}</div>
    );
}
