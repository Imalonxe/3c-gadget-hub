import React, { useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';

// Settings page has been removed. Immediately redirect to admin dashboard if this page is hit.
export default function Index() {
    useEffect(() => {
        Inertia.visit(route('admin.dashboard'));
    }, []);

    return null;
}

