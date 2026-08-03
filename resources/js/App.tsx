import { Navigate, Route, Routes } from 'react-router-dom';
import KioskView from '@/pages/KioskView';
import TellerConsole from '@/pages/TellerConsole';
import SignageDisplay from '@/pages/SignageDisplay';
import AdminLayout from '@/components/AdminLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import ConciergeContentPage from '@/pages/admin/ConciergeContentPage';

export default function App() {
    return (
        <Routes>
            <Route path="/kiosk" element={<KioskView />} />
            <Route path="/teller" element={<TellerConsole />} />
            <Route path="/display" element={<SignageDisplay />} />
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="concierge" element={<ConciergeContentPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/kiosk" replace />} />
        </Routes>
    );
}
