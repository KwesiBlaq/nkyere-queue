import { useLocation } from 'react-router-dom';
import { Ticket, MonitorPlay, Tv } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/concierge': 'Concierge Content',
    '/admin/service-types': 'Service Types',
    '/admin/counters': 'Counters',
    '/admin/staff': 'Staff',
};

const PREVIEW_LINKS = [
    { href: '/kiosk', label: 'Kiosk', icon: Ticket },
    { href: '/teller', label: 'Teller', icon: MonitorPlay },
    { href: '/display', label: 'Display', icon: Tv },
];

export default function AdminTopBar() {
    const { pathname } = useLocation();
    const title = PAGE_TITLES[pathname] ?? 'Admin';

    return (
        <header className="flex items-center justify-between border-b border-border-subtle/10 bg-surface-raised px-8 py-3">
            <p className="text-sm text-ink-muted">
                Admin <span className="mx-1.5 text-border">/</span>
                <span className="text-ink-primary">{title}</span>
            </p>

            <div className="flex items-center gap-1">
                <span className="mr-1 text-xs text-ink-muted">Preview:</span>
                {PREVIEW_LINKS.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-ink-muted transition hover:bg-surface-hover hover:text-ink-primary"
                    >
                        <link.icon size={14} />
                        {link.label}
                    </a>
                ))}
            </div>
        </header>
    );
}
