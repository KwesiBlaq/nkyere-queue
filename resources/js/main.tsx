import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/echo';

const container = document.getElementById('app');

if (container) {
    createRoot(container).render(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
    );
}
