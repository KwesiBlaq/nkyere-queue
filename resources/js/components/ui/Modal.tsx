import { X } from 'lucide-react';

export default function Modal({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-border-subtle/10 bg-surface-raised p-6">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-ink-muted hover:text-ink-primary" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
