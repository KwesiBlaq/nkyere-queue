import { Navigate, Route, Routes } from 'react-router-dom';
import KioskView from '@/pages/KioskView';
import TellerConsole from '@/pages/TellerConsole';
import SignageDisplay from '@/pages/SignageDisplay';
import AdminDashboard from '@/pages/AdminDashboard';

export default function App() {
    return (
        <Routes>
            <Route path="/kiosk" element={<KioskView />} />
            <Route path="/teller" element={<TellerConsole />} />
            <Route path="/display" element={<SignageDisplay />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/kiosk" replace />} />
        </Routes>
    );
}
