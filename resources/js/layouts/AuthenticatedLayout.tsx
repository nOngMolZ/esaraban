import React, { ReactNode } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface AuthenticatedLayoutProps {
    children: ReactNode;
    header?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AuthenticatedLayout({ 
    children, 
    header, 
    breadcrumbs = [] 
}: AuthenticatedLayoutProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {header && (
                <div className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </div>
            )}
            <main>
                {children}
            </main>
        </AppLayout>
    );
} 