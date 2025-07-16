import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'การตั้งค่าการแสดงผล',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="การตั้งค่าการแสดงผล" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="การตั้งค่ารูปแบบการแสดงผล" description="อัปเดตรูปแบบการแสดงผลของบัญชีของคุณ" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
