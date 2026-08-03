import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBranch } from '@/hooks/useBranch';
import LoginForm from '@/components/LoginForm';
import AdminSidebar from '@/components/AdminSidebar';
import type { AuthUser, Branch } from '@/api/types';

export interface AdminContext {
    branch: Branch | null;
    user: AuthUser | null;
}

export default function AdminLayout() {
    const { branch } = useBranch();
    const { token, user, loading, login, hasRole, logout } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-[#1a1a19]" />;
    }

    if (!token) {
        return <LoginForm title="Branch Admin Login" defaultEmail="admin@nkyere.test" onLogin={login} />;
    }

    if (!hasRole('branch_admin')) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1a1a19] text-white">
                <p className="text-lg text-[#c3c2b7]">{user?.name} doesn't have branch admin access.</p>
                <button onClick={logout} className="rounded-lg bg-[#2c2c2a] px-4 py-2 text-sm hover:bg-[#383835]">
                    Log out
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#1a1a19] text-white">
            <AdminSidebar branchName={branch?.name} onLogout={logout} />
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet context={{ branch, user } satisfies AdminContext} />
            </main>
        </div>
    );
}
