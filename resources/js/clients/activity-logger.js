// Lightweight client-side activity logger.
// Sends small events to the server for auditing. Does NOT capture clipboard contents.

(function () {
    if (typeof window === 'undefined') return;

    // Enable the client-side logger globally by default (records key events but not clipboard contents)
    // You can opt-out on specific pages by removing the meta tag or setting window.ACTIVITY_LOGGING = false
    const path = window.location.pathname || '';
    const hasMeta = !!document.querySelector("meta[name='activity-logging']");
    const explicitlyDisabled = (typeof window.ACTIVITY_LOGGING !== 'undefined' && window.ACTIVITY_LOGGING === false);
    if (explicitlyDisabled) {
        return;
    }

    const csrfMeta = document.querySelector("meta[name='csrf-token']");
    const CSRF = csrfMeta ? csrfMeta.getAttribute('content') : null;

    function postEvent(action, meta = {}) {
        try {
            const url = (typeof route === 'function') ? route('activity-logs.event') : '/activity-logs/event';
            const payload = {
                action: action,
                meta: Object.assign({ url: window.location.href }, meta),
            };

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF || '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
                keepalive: true,
            }).catch(() => {
                // ignore network errors
            });
        } catch (e) {
            // ignore
        }
    }

    const lastSent = {};
    function sendOnce(key, action, meta, ttl = 5000) {
        const now = Date.now();
        if (lastSent[key] && (now - lastSent[key]) < ttl) return;
        lastSent[key] = now;
        postEvent(action, meta);
    }

    // Page view
    sendOnce('page_view', 'page_view', { title: document.title });

    // F12 (devtools) detection: listen for keydown of F12
    window.addEventListener('keydown', function (e) {
        if (e.key === 'F12') {
            sendOnce('f12', 'dev_tools_opened', {});
        }

        // Ctrl+C and Ctrl+V (do NOT capture clipboard contents)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
            const action = e.key === 'c' ? 'copy_pressed' : 'paste_pressed';
            sendOnce(action, action, { element: document.activeElement ? document.activeElement.tagName : null });
        }
    }, { passive: true });

    // Right click / context menu
    window.addEventListener('contextmenu', function (e) {
        sendOnce('contextmenu', 'contextmenu_opened', { x: e.clientX, y: e.clientY });
    }, { passive: true });

    // Visibility change (tab hidden / visible)
    document.addEventListener('visibilitychange', function () {
        sendOnce('visibility_' + document.visibilityState, 'visibility_change', { state: document.visibilityState });
    });

    // Optional: instrument clicks on elements with data-track attribute
    document.addEventListener('click', function (e) {
        const el = e.target.closest && e.target.closest('[data-track]');
        if (el) {
            const key = 'click_' + (el.getAttribute('data-track') || el.tagName);
            sendOnce(key, 'element_clicked', { selector: el.getAttribute('data-track') || el.tagName });
        }
    }, { passive: true });

})();
