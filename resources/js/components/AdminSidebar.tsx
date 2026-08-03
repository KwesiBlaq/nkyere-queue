import { NavLink } from 'react-router-dom';

export default function AdminSidebar({ branchName, onLogout }: { branchName?: string; onLogout: () => void }) {
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `block rounded-lg px-3 py-2 text-sm transition ${
            isActive ? 'bg-[#2c2c2a] font-semibold text-white' : 'text-[#898781] hover:text-white'
        }`;

    return (
        <aside className="flex w-56 flex-shrink-0 flex-col border-r border-[rgba(255,255,255,0.10)] p-4">
            <div className="mb-6 px-3">
                <p className="text-xs tracking-wide text-[#898781] uppercase">Nkyere Admin</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{branchName ?? '—'}</p>
            </div>
            <nav className="flex flex-1 flex-col gap-1">
                <NavLink to="/admin" end className={linkClass}>
                    Dashboard
                </NavLink>
                <NavLink to="/admin/concierge" className={linkClass}>
                    Concierge Content
                </NavLink>
                <NavLink to="/admin/service-types" className={linkClass}>
                    Service Types
                </NavLink>
                <NavLink to="/admin/counters" className={linkClass}>
                    Counters
                </NavLink>
                <NavLink to="/admin/staff" className={linkClass}>
                    Staff
                </NavLink>
            </nav>
            <button onClick={onLogout} className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-[#898781] hover:text-white">
                Log out
            </button>
        </aside>
    );
}
