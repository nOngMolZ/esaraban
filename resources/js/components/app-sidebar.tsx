import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen, FilePenLine, FileText, LayoutGrid,
    Settings, Users, Building2, UserRound, FileType, Stamp
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'แดชบอร์ด',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'เอกสารทั้งหมด',
        href: '/documents',
        icon: FileText,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'จัดการผู้ใช้งาน',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'จัดการแผนก',
        href: '/admin/departments',
        icon: Building2,
    },
    {
        title: 'จัดการตำแหน่ง',
        href: '/admin/positions',
        icon: UserRound,
    },
    {
        title: 'จัดการประเภทเอกสาร',
        href: '/admin/document-types',
        icon: FileType,
    },
    {
        title: 'จัดการตราประทับ',
        href: '/admin/stamps',
        icon: Stamp,
        permission: 'manage_stamps',
    },
    {
        title: 'ตั้งค่าระบบ',
        href: '/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'ตั้งค่า',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'วิธีการใช้งาน',
        href: '#',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // ฟังก์ชันตรวจสอบ permission
    const hasPermission = (permission?: string) => {
        if (!permission) return true;
        if (!user?.role?.permissions) return false;
        return user.role.permissions.some((p: any) => p.slug === permission);
    };

    // กรองเมนู admin ตาม permission
    const filteredAdminNavItems = adminNavItems.filter(item => hasPermission(item.permission));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* ผู้ใช้งานทั่วไป */}
                <NavMain title="เมนู" items={mainNavItems} />

                <div className="h-4" />

                {/* ผู้ดูแลระบบ - แสดงเฉพาะเมนูที่มี permission */}
                {filteredAdminNavItems.length > 0 && (
                    <NavMain title="ผู้ดูแลระบบ" items={filteredAdminNavItems} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
