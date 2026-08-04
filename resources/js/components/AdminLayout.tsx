import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBranch } from '@/hooks/useBranch';
import LoginForm from '@/components/LoginForm';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopBar from '@/components/AdminTopBar';
import AdminFooter from '@/components/AdminFooter';
import Button from '@/components/ui/Button';
import type { AuthUser, Branch } from '@/api/types';

export interface AdminContext {
    branch: Branch | null;
    user: AuthUser | null;
}

export default function AdminLayout() {
    const { branch } = useBranch();
    const { token, user, loading, login, hasRole, logout } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-surface" />;
    }

    if (!token) {
        return <LoginForm title="Branch Admin Login" defaultEmail="admin@nkyere.test" onLogin={login} />;
    }

    if (!hasRole('branch_admin')) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface text-ink-primary">
                <p className="text-lg text-ink-secondary">{user?.name} doesn't have branch admin access.</p>
                <Button variant="ghost" onClick={logout} className="border border-border">
                    Log out
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-surface text-ink-primary">
            <AdminSidebar branchName={branch?.name} user={user} onLogout={logout} />
            <div className="flex flex-1 flex-col overflow-y-auto">
                <AdminTopBar />
                <main className="flex-1 p-8">
                    <Outlet context={{ branch, user } satisfies AdminContext} />
                </main>
                <AdminFooter />
            </div>
        </div>
    );
}
