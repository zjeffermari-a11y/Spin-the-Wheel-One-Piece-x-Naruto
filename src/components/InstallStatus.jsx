import React, { useEffect, useState } from 'react';

export default function InstallStatus() {
    const [offline, setOffline] = useState(() => !navigator.onLine);
    const [ready, setReady] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [installEvent, setInstallEvent] = useState(null);
    const [failure, setFailure] = useState(false);

    useEffect(() => {
        let disposed = false;
        const onlineChanged = () => setOffline(!navigator.onLine);
        const installed = () => setInstallEvent(null);
        const installable = event => { event.preventDefault(); setInstallEvent(event); };
        window.addEventListener('online', onlineChanged);
        window.addEventListener('offline', onlineChanged);
        window.addEventListener('beforeinstallprompt', installable);
        window.addEventListener('appinstalled', installed);
        if (import.meta.env.PROD && import.meta.env.VITE_BUILD_TARGET !== 'native' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(registration => {
                if (disposed) return;
                setWaiting(Boolean(registration.waiting));
                registration.addEventListener('updatefound', () => {
                    const worker = registration.installing;
                    worker?.addEventListener('statechange', () => {
                        if (!disposed && worker.state === 'installed') setWaiting(Boolean(registration.waiting));
                        if (!disposed && worker.state === 'redundant') setFailure(true);
                    });
                });
                navigator.serviceWorker.ready.then(() => { if (!disposed) setReady(true); });
            }).catch(() => { if (!disposed) setFailure(true); });
        }
        return () => {
            disposed = true;
            window.removeEventListener('online', onlineChanged);
            window.removeEventListener('offline', onlineChanged);
            window.removeEventListener('beforeinstallprompt', installable);
            window.removeEventListener('appinstalled', installed);
        };
    }, []);

    return <aside className="mx-4 mt-3 p-3 border-2 border-black bg-white flex flex-wrap items-center gap-3 text-sm" aria-label="App availability">
        <p role="status">{offline ? 'Offline — local character creation and saves are available.' : ready ? 'Ready to reopen offline on this device.' : failure ? 'Offline setup failed. Reopen online to try again.' : 'Local character creation is always available once loaded.'}</p>
        {waiting && <p>Update ready. Save your character, then close all app tabs and windows and reopen to update.</p>}
        {installEvent && <button className="px-4 py-2 bg-black text-white" onClick={async () => {
            try { await installEvent.prompt(); await installEvent.userChoice; } finally { setInstallEvent(null); }
        }}>Install Summon</button>}
    </aside>;
}
