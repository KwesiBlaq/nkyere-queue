export interface Branch {
    id: number;
    name: string;
    code: string;
}

export interface ServiceType {
    id: number;
    name: string;
    prefix: string;
}

export interface Counter {
    id: number;
    label: string;
}

export interface Ticket {
    id: number;
    ticket_number: string;
    status: 'waiting' | 'called' | 'serving' | 'done' | 'no_show';
    priority: 'normal' | 'vip' | 'accessibility';
    service_type: string;
    counter: string | null;
    called_at: string | null;
    served_at: string | null;
    completed_at: string | null;
    created_at: string;
}

export interface PromoItem {
    id: number;
    title: string;
    body: string | null;
    image_url: string | null;
    display_seconds: number;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

export interface ReportOverview {
    issued: number;
    completed: number;
    no_show: number;
    no_show_rate: number;
    avg_wait_seconds: number | null;
    avg_service_seconds: number | null;
}

export interface ServiceTypeVolume {
    service_type: string;
    ticket_count: number;
}

export interface TellerThroughput {
    teller: string;
    tickets_served: number;
    avg_service_seconds: number | null;
}

export interface PromoContentAdmin {
    id: number;
    title: string;
    body: string | null;
    image_url: string | null;
    display_seconds: number;
    sort_order: number;
    is_active: boolean;
}

export interface ServiceTypeAdmin {
    id: number;
    name: string;
    prefix: string;
    is_active: boolean;
}

export interface CounterAdmin {
    id: number;
    label: string;
    is_open: boolean;
}

export interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: 'teller' | 'branch_admin';
    is_active: boolean;
}
