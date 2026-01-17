"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimeChannel } from "@supabase/supabase-js";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Hook to subscribe to real-time message updates for a conversation
 */
export function useRealtimeMessages(conversationId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId) return;

        const channel: RealtimeChannel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    console.log("New message received:", payload);
                    // Invalidate messages query to refetch
                    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    console.log("Message updated:", payload);
                    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, queryClient]);
}

/**
 * Hook to subscribe to real-time conversation updates (new messages, status changes)
 */
export function useRealtimeConversations(organizationId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!organizationId) return;

        const channel: RealtimeChannel = supabase
            .channel(`conversations:${organizationId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "conversations",
                    filter: `organization_id=eq.${organizationId}`,
                },
                (payload) => {
                    console.log("Conversation change:", payload);
                    // Invalidate conversations list
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organizationId, queryClient]);
}

/**
 * Hook to subscribe to real-time booking updates
 */
export function useRealtimeBookings(organizationId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!organizationId) return;

        const channel: RealtimeChannel = supabase
            .channel(`bookings:${organizationId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookings",
                    filter: `organization_id=eq.${organizationId}`,
                },
                (payload) => {
                    console.log("Booking change:", payload);
                    queryClient.invalidateQueries({ queryKey: ["bookings"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [organizationId, queryClient]);
}

/**
 * Hook to subscribe to user's notifications
 */
export function useRealtimeNotifications(userId: string | undefined) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!userId) return;

        const channel: RealtimeChannel = supabase
            .channel(`notifications:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("New notification:", payload);
                    // Could trigger a toast notification here
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient]);
}
