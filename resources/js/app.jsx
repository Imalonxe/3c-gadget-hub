import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global error handler for CSRF token mismatch (419)
router.on('error', (event) => {
    // Check if it's a 419 error (CSRF token mismatch / page expired)
    if (event.detail.errors && event.detail.errors.message === 'CSRF token mismatch.') {
        console.warn('CSRF token expired. Reloading page...');
        window.location.reload();
        return false; // Prevent default error handling
    }
});

// Handle HTTP errors from failed requests
document.addEventListener('inertia:error', (event) => {
    const response = event.detail.response;
    if (response && response.status === 419) {
        console.warn('419 PAGE EXPIRED detected. Reloading page...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
