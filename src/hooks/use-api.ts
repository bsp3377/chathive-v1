"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    customersApi,
    conversationsApi,
    bookingsApi,
    invoicesApi,
    jobsApi,
    organizationApi,
    type CustomerListParams,
    type ConversationListParams,
    type BookingListParams,
    type InvoiceListParams,
    type JobListParams,
} from "@/lib/api";
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

// =============================================================
// ORGANIZATION HOOKS
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

export function useOrganization() {
    return useQuery<OrganizationResponse>({
        queryKey: ["organization"],
        queryFn: () => organizationApi.getCurrent(),
    });
}

// =============================================================
// CUSTOMER HOOKS
// =============================================================

export function useCustomers(params?: CustomerListParams) {
    return useQuery<PaginatedResponse<Customer>>({
        queryKey: ["customers", params],
        queryFn: () => customersApi.list(params),
    });
}

export function useCustomer(id: string | undefined) {
    return useQuery<Customer>({
        queryKey: ["customers", id],
        queryFn: () => customersApi.get(id!),
        enabled: !!id,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Customer>) => customersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        },
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
            customersApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["customers", id] });
        },
    });
}

// =============================================================
// CONVERSATION HOOKS
// =============================================================

export function useConversations(params?: ConversationListParams) {
    return useQuery<PaginatedResponse<Conversation>>({
        queryKey: ["conversations", params],
        queryFn: () => conversationsApi.list(params),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

export function useConversation(id: string | undefined) {
    return useQuery<Conversation>({
        queryKey: ["conversations", id],
        queryFn: () => conversationsApi.get(id!),
        enabled: !!id,
    });
}

export function useUpdateConversation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
            conversationsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["conversations", id] });
        },
    });
}

interface MessagesResponse {
    data: Message[];
    has_more: boolean;
}

export function useMessages(conversationId: string | undefined) {
    return useQuery<MessagesResponse>({
        queryKey: ["messages", conversationId],
        queryFn: () => conversationsApi.getMessages(conversationId!),
        enabled: !!conversationId,
        refetchInterval: 5000, // Refetch every 5 seconds for near real-time
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            conversationId,
            content,
            type = "text",
        }: {
            conversationId: string;
            content: string;
            type?: string;
        }) => conversationsApi.sendMessage(conversationId, { type, content }),
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}

// =============================================================
// BOOKING HOOKS
// =============================================================

export function useBookings(params?: BookingListParams) {
    return useQuery<PaginatedResponse<Booking>>({
        queryKey: ["bookings", params],
        queryFn: () => bookingsApi.list(params),
    });
}

export function useBooking(id: string | undefined) {
    return useQuery<Booking>({
        queryKey: ["bookings", id],
        queryFn: () => bookingsApi.get(id!),
        enabled: !!id,
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Booking>) => bookingsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
}

// =============================================================
// INVOICE HOOKS
// =============================================================

export function useInvoices(params?: InvoiceListParams) {
    return useQuery<PaginatedResponse<Invoice>>({
        queryKey: ["invoices", params],
        queryFn: () => invoicesApi.list(params),
    });
}

export function useInvoice(id: string | undefined) {
    return useQuery<Invoice>({
        queryKey: ["invoices", id],
        queryFn: () => invoicesApi.get(id!),
        enabled: !!id,
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Record<string, unknown>) => invoicesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });
}

// =============================================================
// JOB HOOKS
// =============================================================

interface JobsResponse {
    jobs: Job[];
    stages: JobStage[];
}

export function useJobs(params?: JobListParams) {
    return useQuery<JobsResponse>({
        queryKey: ["jobs", params],
        queryFn: () => jobsApi.list(params),
    });
}

export function useJob(id: string | undefined) {
    return useQuery<Job>({
        queryKey: ["jobs", id],
        queryFn: () => jobsApi.get(id!),
        enabled: !!id,
    });
}

export function useCreateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Job>) => jobsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
        },
    });
}

export function useUpdateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
            jobsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["jobs", id] });
        },
    });
}
