import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { router } from '@inertiajs/react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'document_pending' | 'document_rejected' | 'document_completed' | 'info';
    data?: any;
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: Notification[];
    unreadCount: number;
}

export default function NotificationBell({ notifications, unreadCount }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'document_pending':
                return '📄';
            case 'document_rejected':
                return '❌';
            case 'document_completed':
                return '✅';
            default:
                return '📢';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'document_pending':
                return 'text-blue-600';
            case 'document_rejected':
                return 'text-red-600';
            case 'document_completed':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'เมื่อสักครู่';
        if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
        
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read_at) {
            router.post(route('notifications.mark-read', notification.id));
        }

        // Navigate based on notification type
        if (notification.data?.document_id) {
            router.visit(route('documents.show', notification.data.document_id));
        }

        setIsOpen(false);
    };

    const markAllAsRead = () => {
        router.post(route('notifications.mark-all-read'));
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
                align="end" 
                className="w-80 max-h-96"
                sideOffset={8}
            >
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>การแจ้งเตือน</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            อ่านทั้งหมด
                        </Button>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                    </div>
                ) : (
                    <ScrollArea className="h-80">
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`p-3 cursor-pointer ${
                                        !notification.read_at 
                                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <span className="text-lg flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <h4 className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read_at && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatTimeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-center justify-center text-blue-600 hover:text-blue-700"
                            onClick={() => {
                                router.visit(route('notifications.index'));
                                setIsOpen(false);
                            }}
                        >
                            ดูการแจ้งเตือนทั้งหมด
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 