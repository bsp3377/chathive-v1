// API client for making requests to the backend

import type {
    Customer,
    Conversation,
    Message,
    Booking,
    Invoice,
    Job,
    JobStage,
    Organization,
    User,
    PaginatedResponse,
} from "@/types/database";

const API_BASE = "/api";

interface FetchOptions extends RequestInit {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: Record<string, any>;
}

async function fetchAPI<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${API_BASE}${endpoint}`;

    // Add query params
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Network error" }));
        throw new Error(error.message || error.error || "Request failed");
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

// =============================================================
// CUSTOMERS API
// =============================================================

export interface CustomerListParams {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    sort?: string;
}

export const customersApi = {
    list: (params?: CustomerListParams): Promise<PaginatedResponse<Customer>> =>
        fetchAPI<PaginatedResponse<Customer>>("/customers", { params }),

    get: (id: string): Promise<Customer> =>
        fetchAPI<Customer>(`/customers/${id}`),

    create: (data: Record<string, unknown>): Promise<Customer> =>
        fetchAPI<Customer>("/customers", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>): Promise<Customer> =>
        fetchAPI<Customer>(`/customers/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    delete: (id: string): Promise<void> =>
        fetchAPI<void>(`/customers/${id}`, { method: "DELETE" }),
};

// =============================================================
// CONVERSATIONS API
// =============================================================

export interface ConversationListParams {
    page?: number;
    limit?: number;
    status?: string;
    assigned_to?: string;
    unread?: boolean;
    customer_id?: string;
}

interface MessagesResponse {
    data: Message[];
    has_more: boolean;
}

export const conversationsApi = {
    list: (params?: ConversationListParams): Promise<PaginatedResponse<Conversation>> =>
        fetchAPI<PaginatedResponse<Conversation>>("/conversations", { params }),

    get: (id: string): Promise<Conversation> =>
        fetchAPI<Conversation>(`/conversations/${id}`),

    update: (id: string, data: Record<string, unknown>): Promise<Conversation> =>
        fetchAPI<Conversation>(`/conversations/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    getMessages: (id: string, params?: { limit?: number; before?: string }): Promise<MessagesResponse> =>
        fetchAPI<MessagesResponse>(`/conversations/${id}/messages`, { params }),

    sendMessage: (id: string, data: { type?: string; content: string; reply_to_message_id?: string }): Promise<Message> =>
        fetchAPI<Message>(`/conversations/${id}/messages`, {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

// =============================================================
// BOOKINGS API
// =============================================================

export interface BookingListParams {
    page?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    customer_id?: string;
    assigned_to?: string;
}

export const bookingsApi = {
    list: (params?: BookingListParams): Promise<PaginatedResponse<Booking>> =>
        fetchAPI<PaginatedResponse<Booking>>("/bookings", { params }),

    get: (id: string): Promise<Booking> =>
        fetchAPI<Booking>(`/bookings/${id}`),

    create: (data: Record<string, unknown>): Promise<Booking> =>
        fetchAPI<Booking>("/bookings", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>): Promise<Booking> =>
        fetchAPI<Booking>(`/bookings/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
};

// =============================================================
// INVOICES API
// =============================================================

export interface InvoiceListParams {
    page?: number;
    limit?: number;
    status?: string;
    customer_id?: string;
}

export const invoicesApi = {
    list: (params?: InvoiceListParams): Promise<PaginatedResponse<Invoice>> =>
        fetchAPI<PaginatedResponse<Invoice>>("/invoices", { params }),

    get: (id: string): Promise<Invoice> =>
        fetchAPI<Invoice>(`/invoices/${id}`),

    create: (data: Record<string, unknown>): Promise<Invoice> =>
        fetchAPI<Invoice>("/invoices", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>): Promise<Invoice> =>
        fetchAPI<Invoice>(`/invoices/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
};

// =============================================================
// JOBS API
// =============================================================

export interface JobListParams {
    status?: string;
    stage_id?: string;
    assigned_to?: string;
    customer_id?: string;
}

interface JobsResponse {
    jobs: Job[];
    stages: JobStage[];
}

export const jobsApi = {
    list: (params?: JobListParams): Promise<JobsResponse> =>
        fetchAPI<JobsResponse>("/jobs", { params }),

    get: (id: string): Promise<Job> =>
        fetchAPI<Job>(`/jobs/${id}`),

    create: (data: Record<string, unknown>): Promise<Job> =>
        fetchAPI<Job>("/jobs", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>): Promise<Job> =>
        fetchAPI<Job>(`/jobs/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
};

// =============================================================
// ORGANIZATION API
// =============================================================

interface OrganizationResponse {
    user: User | null;
    organization: Organization | null;
    membership: {
        id: string;
        role: string;
        is_available: boolean;
    } | null;
}

export const organizationApi = {
    getCurrent: (): Promise<OrganizationResponse> =>
        fetchAPI<OrganizationResponse>("/organization"),

    create: (data: Record<string, unknown>): Promise<Organization> =>
        fetchAPI<Organization>("/organization", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};
