import React from 'react';
import { Link } from '@inertiajs/react';
import MainLayout from './MainLayout';

const AppLayout = ({ children, flash }) => {
    return (
        <MainLayout flash={flash}>
            {children}
        </MainLayout>
    );
};

export default AppLayout;

