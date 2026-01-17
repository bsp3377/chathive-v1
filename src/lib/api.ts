// API client for making requests to the backend

const API_BASE = "/api";

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
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
    list: (params?: CustomerListParams) =>
        fetchAPI("/customers", { params }),

    get: (id: string) =>
        fetchAPI(`/customers/${id}`),

    create: (data: Record<string, unknown>) =>
        fetchAPI("/customers", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>) =>
        fetchAPI(`/customers/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchAPI(`/customers/${id}`, { method: "DELETE" }),
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

export const conversationsApi = {
    list: (params?: ConversationListParams) =>
        fetchAPI("/conversations", { params }),

    get: (id: string) =>
        fetchAPI(`/conversations/${id}`),

    update: (id: string, data: Record<string, unknown>) =>
        fetchAPI(`/conversations/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    getMessages: (id: string, params?: { limit?: number; before?: string }) =>
        fetchAPI(`/conversations/${id}/messages`, { params }),

    sendMessage: (id: string, data: { type?: string; content: string; reply_to_message_id?: string }) =>
        fetchAPI(`/conversations/${id}/messages`, {
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
    list: (params?: BookingListParams) =>
        fetchAPI("/bookings", { params }),

    get: (id: string) =>
        fetchAPI(`/bookings/${id}`),

    create: (data: Record<string, unknown>) =>
        fetchAPI("/bookings", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>) =>
        fetchAPI(`/bookings/${id}`, {
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
    list: (params?: InvoiceListParams) =>
        fetchAPI("/invoices", { params }),

    get: (id: string) =>
        fetchAPI(`/invoices/${id}`),

    create: (data: Record<string, unknown>) =>
        fetchAPI("/invoices", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>) =>
        fetchAPI(`/invoices/${id}`, {
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

export const jobsApi = {
    list: (params?: JobListParams) =>
        fetchAPI("/jobs", { params }),

    get: (id: string) =>
        fetchAPI(`/jobs/${id}`),

    create: (data: Record<string, unknown>) =>
        fetchAPI("/jobs", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Record<string, unknown>) =>
        fetchAPI(`/jobs/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
};

// =============================================================
// ORGANIZATION API
// =============================================================

export const organizationApi = {
    getCurrent: () =>
        fetchAPI("/organization"),

    create: (data: Record<string, unknown>) =>
        fetchAPI("/organization", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};
