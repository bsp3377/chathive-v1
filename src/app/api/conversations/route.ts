import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/conversations - List conversations with filters
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's organization
        const { data: membership } = await supabase
            .from("organization_members")
            .select("organization_id, user_id")
            .eq("user_id", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "No organization found" }, { status: 404 });
        }

        // Parse query params
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "25");
        const status = searchParams.get("status"); // comma-separated
        const assignedTo = searchParams.get("assigned_to");
        const unreadOnly = searchParams.get("unread") === "true";
        const search = searchParams.get("search");
        const customerId = searchParams.get("customer_id");

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from("conversations")
            .select(`
        *,
        customer:customers(id, name, phone, avatar_url, whatsapp_id),
        assigned_user:users!conversations_assigned_to_fkey(id, first_name, last_name, avatar_url)
      `, { count: "exact" })
            .eq("organization_id", membership.organization_id)
            .order("last_message_at", { ascending: false, nullsFirst: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (status) {
            const statuses = status.split(",");
            query = query.in("status", statuses);
        }

        if (assignedTo) {
            if (assignedTo === "me") {
                query = query.eq("assigned_to", membership.user_id);
            } else if (assignedTo === "unassigned") {
                query = query.is("assigned_to", null);
            } else {
                query = query.eq("assigned_to", assignedTo);
            }
        }

        if (unreadOnly) {
            query = query.gt("unread_count", 0);
        }

        if (customerId) {
            query = query.eq("customer_id", customerId);
        }

        const { data: conversations, count, error } = await query;

        if (error) {
            console.error("Error fetching conversations:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data: conversations,
            total: count || 0,
            page,
            limit,
            has_more: (count || 0) > offset + limit,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
