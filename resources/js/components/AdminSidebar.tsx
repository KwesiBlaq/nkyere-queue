import { NavLink } from 'react-router-dom';
import { Landmark, LayoutDashboard, Image, Tags, LayoutGrid, Users, LogOut } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { AuthUser } from '@/api/types';

const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [{ to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
        label: 'Content',
        items: [{ to: '/admin/concierge', end: false, icon: Image, label: 'Concierge Content' }],
    },
    {
        label: 'Configuration',
        items: [
            { to: '/admin/service-types', end: false, icon: Tags, label: 'Service Types' },
            { to: '/admin/counters', end: false, icon: LayoutGrid, label: 'Counters' },
            { to: '/admin/staff', end: false, icon: Users, label: 'Staff' },
        ],
    },
];

export default function AdminSidebar({
    branchName,
    user,
    onLogout,
}: {
    branchName?: string;
    user: AuthUser | null;
    onLogout: () => void;
}) {
    const initials = user?.name
        ?.split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <aside className="flex w-64 flex-shrink-0 flex-col border-r border-border-subtle/10 bg-surface-raised p-4">
            <div className="mb-8 flex items-center gap-2.5 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                    <Landmark size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-sm leading-tight font-bold">Nkyere</p>
                    <p className="truncate text-xs leading-tight text-ink-muted">{branchName ?? '—'}</p>
                </div>
            </div>

            <nav className="flex flex-1 flex-col gap-6">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">{group.label}</p>
                        <div className="flex flex-col gap-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm transition ${
                                            isActive
                                                ? 'border-accent bg-accent/10 font-semibold text-accent'
                                                : 'border-transparent text-ink-muted hover:bg-surface-hover hover:text-ink-primary'
                                        }`
                                    }
                                >
                                    <item.icon size={17} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border-subtle/10 p-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user?.name}</p>
                    <Badge variant="accent">Branch Admin</Badge>
                </div>
                <button
                    onClick={onLogout}
                    title="Log out"
                    className="flex-shrink-0 rounded-lg p-2 text-ink-muted hover:bg-surface-hover hover:text-ink-primary"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </aside>
    );
}
