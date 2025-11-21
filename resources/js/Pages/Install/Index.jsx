import { useEffect } from 'react';

export default function InstallIndex() {
    // Installer removed — redirect to homepage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }, []);

    return null;
}
