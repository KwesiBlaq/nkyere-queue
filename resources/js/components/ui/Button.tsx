import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

const VARIANT_CLASSES: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    ghost: 'text-ink-muted hover:bg-surface-hover hover:text-ink-primary',
    danger: 'text-danger hover:bg-danger/10',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    icon?: IconComponent;
    /** Icon-only button — hides the label visually but keeps it for screen readers/tooltips via `title`. */
    iconOnly?: boolean;
}

export default function Button({ variant = 'ghost', icon: Icon, iconOnly = false, className = '', children, ...rest }: Props) {
    const padding = iconOnly ? 'p-2' : 'px-4 py-2';

    return (
        <button
            {...rest}
            className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${padding} ${VARIANT_CLASSES[variant]} ${className}`}
        >
            {Icon && <Icon size={16} />}
            {!iconOnly && children}
        </button>
    );
}
