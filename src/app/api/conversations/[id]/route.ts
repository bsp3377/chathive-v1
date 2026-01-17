import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/conversations/[id] - Get single conversation with details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: conversation, error } = await supabase
            .from("conversations")
            .select(`
        *,
        customer:customers(*),
        assigned_user:users!conversations_assigned_to_fkey(id, first_name, last_name, avatar_url)
      `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching conversation:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/conversations/[id] - Update conversation (assign, status, priority)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get current user's ID in our users table
        const { data: currentUser } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", user.id)
            .single();

        const updateData: Record<string, unknown> = {};

        // Handle status changes
        if (body.status) {
            updateData.status = body.status;
            if (body.status === "closed") {
                updateData.closed_at = new Date().toISOString();
                updateData.closed_by = currentUser?.id;
            } else if (body.status === "snoozed" && body.snoozed_until) {
                updateData.snoozed_until = body.snoozed_until;
            }
        }

        // Handle assignment
        if ("assigned_to" in body) {
            updateData.assigned_to = body.assigned_to;
            updateData.assigned_at = new Date().toISOString();
            updateData.assigned_by = currentUser?.id;
        }

        // Handle priority
        if (body.priority) {
            updateData.priority = body.priority;
        }

        // Mark as read
        if (body.mark_as_read) {
            updateData.unread_count = 0;
        }

        const { data: conversation, error } = await supabase
            .from("conversations")
            .update(updateData)
            .eq("id", id)
            .select(`
        *,
        customer:customers(id, name, phone, avatar_url),
        assigned_user:users!conversations_assigned_to_fkey(id, first_name, last_name, avatar_url)
      `)
            .single();

        if (error) {
            console.error("Error updating conversation:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(conversation);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
