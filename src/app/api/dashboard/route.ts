import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's organization
        const { data: membership } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        const orgId = membership.organization_id;

        // Parallel queries for stats
        const [
            unreadResult,
            customersResult,
            todayBookingsResult,
            openConversationsResult,
            recentConversationsResult,
            upcomingBookingsResult,
        ] = await Promise.all([
            // Unread message count
            supabase
                .from("conversations")
                .select("unread_count")
                .eq("organization_id", orgId)
                .gt("unread_count", 0),

            // Total customers
            supabase
                .from("customers")
                .select("id", { count: "exact", head: true })
                .eq("organization_id", orgId),

            // Today's bookings
            supabase
                .from("bookings")
                .select("id", { count: "exact", head: true })
                .eq("organization_id", orgId)
                .gte("starts_at", new Date().toISOString().split("T")[0])
                .lte("starts_at", new Date().toISOString().split("T")[0] + "T23:59:59"),

            // Open conversations
            supabase
                .from("conversations")
                .select("id", { count: "exact", head: true })
                .eq("organization_id", orgId)
                .eq("status", "open"),

            // Recent conversations
            supabase
                .from("conversations")
                .select(`
          id,
          last_message_at,
          last_message_preview,
          unread_count,
          customer:customers(id, name, phone, avatar_url)
        `)
                .eq("organization_id", orgId)
                .order("last_message_at", { ascending: false })
                .limit(5),

            // Upcoming bookings (today and tomorrow)
            supabase
                .from("bookings")
                .select(`
          id,
          starts_at,
          ends_at,
          title,
          status,
          customer:customers(id, name, phone),
          service:services(id, name, duration_minutes)
        `)
                .eq("organization_id", orgId)
                .gte("starts_at", new Date().toISOString())
                .order("starts_at", { ascending: true })
                .limit(5),
        ]);

        // Calculate unread total
        const unreadTotal = unreadResult.data?.reduce((sum, c) => sum + c.unread_count, 0) || 0;

        return NextResponse.json({
            stats: {
                unread_messages: unreadTotal,
                total_customers: customersResult.count || 0,
                today_bookings: todayBookingsResult.count || 0,
                open_conversations: openConversationsResult.count || 0,
            },
            recent_conversations: recentConversationsResult.data || [],
            upcoming_bookings: upcomingBookingsResult.data || [],
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
