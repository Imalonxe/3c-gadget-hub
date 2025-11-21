import { useEffect } from 'react';

export default function Installs() {
    // Installer removed — redirect to homepage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }, []);

    return null;
}

