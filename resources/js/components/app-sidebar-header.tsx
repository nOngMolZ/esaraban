import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import NotificationBell from '@/components/NotificationBell';
import { usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'document_pending' | 'document_rejected' | 'document_completed' | 'info';
    data?: any;
    read_at: string | null;
    created_at: string;
}

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // ดึงข้อมูล notifications เมื่อ component mount
    useEffect(() => {
        fetchNotifications();
        
        // ตั้งค่า interval เพื่อดึงข้อมูลใหม่ทุก 30 วินาที
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Use relative URL to avoid port mismatch issues
            const url = '/notifications/recent';
            console.log('Fetching notifications from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response not ok:', response.status, response.statusText, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Notifications data received:', data);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('This is likely a network connectivity issue or the server is not running');
            }
            // Set empty state on error to prevent UI issues
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {/* Notification Bell */}
            <div className="flex items-center gap-2">
                <NotificationBell 
                    notifications={notifications} 
                    unreadCount={unreadCount} 
                />
            </div>
        </header>
    );
}
