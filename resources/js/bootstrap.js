import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF Token setup
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Real-time: Laravel Echo + Pusher (for laravel-websockets)
// Environment variables used (Vite): VITE_PUSHER_APP_KEY, VITE_PUSHER_HOST, VITE_PUSHER_PORT, VITE_PUSHER_SCHEME
try {
    import('laravel-echo').then(({ default: Echo }) => {
        import('pusher-js').then((PusherModule) => {
            const Pusher = PusherModule.default || PusherModule;

            window.Pusher = Pusher;

            window.Echo = new Echo({
                broadcaster: 'pusher',
                key: import.meta.env.VITE_PUSHER_APP_KEY || import.meta.env.VITE_PUSHER_KEY || 'local',
                wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
                wsPort: import.meta.env.VITE_PUSHER_PORT || 6001,
                forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'http') === 'https',
                encrypted: (import.meta.env.VITE_PUSHER_SCHEME || 'http') === 'https',
                disableStats: true,
                enabledTransports: ['ws', 'wss'],
            });
        }).catch((e) => {
            // optional: pusher not installed in dev
            // console.warn('pusher-js not available', e);
        });
    }).catch((e) => {
        // echo not installed
        // console.warn('laravel-echo not available', e);
    });
} catch (e) {
    // ignore
}

// Client-side activity logger (captures F12, copy/paste presses, contextmenu, etc.)
import './clients/activity-logger';
