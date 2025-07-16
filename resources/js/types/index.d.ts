import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface Department {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Position {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    slug: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    fname: string;
    lname: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    department_id?: number;
    position_id?: number;
    role_id?: number;
    is_active: boolean;
    department?: Department;
    position?: Position;
    role?: Role;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // เพื่อรองรับคุณสมบัติเพิ่มเติม
}

export interface DocumentType {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: number;
    title: string;
    description?: string;
    file_path: string;
    current_file_path: string;
    document_type_id: number;
    user_id: number;
    is_public: boolean;
    status: 'draft' | 'in_progress' | 'completed';
    current_step: number;
    completed_at?: string;
    documentType?: DocumentType;
    user?: User;
    created_at: string;
    updated_at: string;
}
