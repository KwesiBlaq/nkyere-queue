type Variant = 'success' | 'neutral' | 'warning' | 'danger' | 'accent';

const VARIANT_CLASSES: Record<Variant, string> = {
    success: 'bg-success/15 text-success',
    neutral: 'bg-ink-muted/15 text-ink-muted',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/15 text-danger',
    accent: 'bg-accent/15 text-accent',
};

export default function Badge({ variant, children }: { variant: Variant; children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]}`}>
            {children}
        </span>
    );
}
