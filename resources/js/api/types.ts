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
