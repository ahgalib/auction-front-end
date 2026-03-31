import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.Pusher = Pusher;

const realtimeEnabled = String(import.meta.env.VITE_ENABLE_REALTIME || 'false') === 'true';
if (realtimeEnabled && import.meta.env.VITE_PUSHER_APP_KEY) {
    const pusherConfig = {
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    };

    // For hosted Pusher, do not override wsHost/wsPort by default.
    // Use custom host only when explicitly enabled.
    const customHostEnabled = String(import.meta.env.VITE_PUSHER_USE_CUSTOM_HOST || 'false') === 'true';
    if (customHostEnabled && import.meta.env.VITE_PUSHER_HOST) {
        pusherConfig.wsHost = import.meta.env.VITE_PUSHER_HOST;
        pusherConfig.wsPort = Number(import.meta.env.VITE_PUSHER_PORT || 80);
        pusherConfig.wssPort = Number(import.meta.env.VITE_PUSHER_PORT || 443);
    }

    window.Echo = new Echo(pusherConfig);
}
