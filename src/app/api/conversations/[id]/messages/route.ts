import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/conversations/[id]/messages - List messages in conversation
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const limit = parseInt(searchParams.get("limit") || "50");
        const before = searchParams.get("before"); // cursor for pagination

        let query = supabase
            .from("messages")
            .select(`
        *,
        sender_user:users!messages_sender_user_id_fkey(id, first_name, last_name, avatar_url)
      `)
            .eq("conversation_id", id)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (before) {
            query = query.lt("created_at", before);
        }

        const { data: messages, error } = await query;

        if (error) {
            console.error("Error fetching messages:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return in chronological order for display
        const sortedMessages = messages?.reverse() || [];

        return NextResponse.json({
            data: sortedMessages,
            has_more: messages?.length === limit,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/conversations/[id]/messages - Send a new message
export async function POST(
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

        // Get conversation details
        const { data: conversation } = await supabase
            .from("conversations")
            .select("organization_id, customer_id")
            .eq("id", id)
            .single();

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // Create message
        const messageData = {
            organization_id: conversation.organization_id,
            conversation_id: id,
            customer_id: conversation.customer_id,
            direction: "outbound" as const,
            sender_type: "user" as const,
            sender_user_id: currentUser?.id,
            message_type: body.type || "text",
            content: body.content,
            media_url: body.media_url,
            media_mime_type: body.media_mime_type,
            media_filename: body.media_filename,
            template_name: body.template_name,
            template_language: body.template_language,
            reply_to_message_id: body.reply_to_message_id,
            status: "sent" as const, // Will be updated by webhook
        };

        const { data: message, error } = await supabase
            .from("messages")
            .insert(messageData)
            .select(`
        *,
        sender_user:users!messages_sender_user_id_fkey(id, first_name, last_name, avatar_url)
      `)
            .single();

        if (error) {
            console.error("Error creating message:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // TODO: Send via WhatsApp Cloud API
        // For now, we just save to database

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
