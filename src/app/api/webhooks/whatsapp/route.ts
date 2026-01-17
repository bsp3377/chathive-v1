import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Use service role for webhook handler (bypasses RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/webhooks/whatsapp - Webhook Verification
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "chathive-webhook-verify";

    if (mode === "subscribe" && token === verifyToken) {
        console.log("Webhook verified successfully");
        return new NextResponse(challenge, { status: 200 });
    }

    console.error("Webhook verification failed", { mode, token });
    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST /api/webhooks/whatsapp - Receive Messages & Status Updates
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Verify webhook signature (optional but recommended)
        const signature = request.headers.get("x-hub-signature-256");
        if (process.env.META_APP_SECRET && signature) {
            const isValid = verifySignature(JSON.stringify(body), signature);
            if (!isValid) {
                console.error("Invalid webhook signature");
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        }

        console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

        // Process webhook payload
        if (body.object === "whatsapp_business_account") {
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    if (change.field === "messages") {
                        const value = change.value;
                        const phoneNumberId = value.metadata?.phone_number_id;

                        // Find organization by phone number ID
                        const { data: org } = await supabase
                            .from("organizations")
                            .select("id")
                            .eq("whatsapp_phone_number_id", phoneNumberId)
                            .single();

                        if (!org) {
                            console.log("No organization found for phone number:", phoneNumberId);
                            continue;
                        }

                        // Process incoming messages
                        if (value.messages) {
                            for (const message of value.messages) {
                                await processIncomingMessage(org.id, value.contacts, message);
                            }
                        }

                        // Process status updates
                        if (value.statuses) {
                            for (const status of value.statuses) {
                                await processStatusUpdate(status);
                            }
                        }
                    }
                }
            }
        }

        // Always respond with 200 quickly to acknowledge receipt
        return NextResponse.json({ status: "received" });
    } catch (error) {
        console.error("Webhook processing error:", error);
        // Still return 200 to prevent retries for unrecoverable errors
        return NextResponse.json({ status: "error", message: String(error) });
    }
}

// Process incoming WhatsApp message
async function processIncomingMessage(
    organizationId: string,
    contacts: Array<{ profile: { name: string }; wa_id: string }>,
    message: {
        id: string;
        from: string;
        timestamp: string;
        type: string;
        text?: { body: string };
        image?: { id: string; mime_type: string; sha256: string };
        document?: { id: string; mime_type: string; sha256: string; filename: string };
        audio?: { id: string; mime_type: string; sha256: string };
        video?: { id: string; mime_type: string; sha256: string };
        location?: { latitude: number; longitude: number; name?: string; address?: string };
        context?: { message_id: string };
    }
) {
    const contact = contacts?.find((c) => c.wa_id === message.from);
    const customerName = contact?.profile?.name || message.from;
    const phoneNumber = message.from;

    // Upsert customer
    const { data: customer } = await supabase
        .from("customers")
        .upsert(
            {
                organization_id: organizationId,
                whatsapp_id: message.from,
                phone: phoneNumber,
                name: customerName,
                first_contact_at: new Date().toISOString(),
                is_opted_in: true,
                opted_in_at: new Date().toISOString(),
            },
            {
                onConflict: "organization_id,phone",
                ignoreDuplicates: false,
            }
        )
        .select()
        .single();

    if (!customer) {
        console.error("Failed to upsert customer");
        return;
    }

    // Update customer's last contact
    await supabase
        .from("customers")
        .update({
            last_contact_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

    // Find or create conversation
    let { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("customer_id", customer.id)
        .in("status", ["open", "waiting", "snoozed"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (!conversation) {
        // Create new conversation
        const { data: newConv } = await supabase
            .from("conversations")
            .insert({
                organization_id: organizationId,
                customer_id: customer.id,
                status: "open",
                conversation_origin: "user_initiated",
                customer_service_window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            })
            .select()
            .single();
        conversation = newConv;
    } else {
        // Update 24h window
        await supabase
            .from("conversations")
            .update({
                status: "open",
                customer_service_window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq("id", conversation.id);
    }

    if (!conversation) {
        console.error("Failed to get/create conversation");
        return;
    }

    // Extract message content
    let content = "";
    let mediaUrl = null;
    let mediaMimeType = null;
    let mediaFilename = null;

    switch (message.type) {
        case "text":
            content = message.text?.body || "";
            break;
        case "image":
            content = "[Image]";
            mediaMimeType = message.image?.mime_type;
            break;
        case "document":
            content = `[Document: ${message.document?.filename || "file"}]`;
            mediaMimeType = message.document?.mime_type;
            mediaFilename = message.document?.filename;
            break;
        case "audio":
            content = "[Audio]";
            mediaMimeType = message.audio?.mime_type;
            break;
        case "video":
            content = "[Video]";
            mediaMimeType = message.video?.mime_type;
            break;
        case "location":
            content = `[Location: ${message.location?.name || message.location?.address || "Location shared"}]`;
            break;
        default:
            content = `[${message.type}]`;
    }

    // Create message
    await supabase.from("messages").insert({
        organization_id: organizationId,
        conversation_id: conversation.id,
        customer_id: customer.id,
        whatsapp_message_id: message.id,
        direction: "inbound",
        sender_type: "customer",
        message_type: message.type,
        content,
        media_url: mediaUrl,
        media_mime_type: mediaMimeType,
        media_filename: mediaFilename,
        reply_to_message_id: message.context?.message_id
            ? await getMessageIdByWhatsAppId(message.context.message_id)
            : null,
        status: "delivered",
        whatsapp_timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
    });

    console.log("Message processed:", message.id);
}

// Process message status update
async function processStatusUpdate(status: {
    id: string;
    status: string;
    timestamp: string;
    recipient_id: string;
    errors?: Array<{ code: number; title: string }>;
}) {
    const statusMap: Record<string, string> = {
        sent: "sent",
        delivered: "delivered",
        read: "read",
        failed: "failed",
    };

    const mappedStatus = statusMap[status.status];
    if (!mappedStatus) return;

    const updateData: Record<string, unknown> = {
        status: mappedStatus,
        status_updated_at: new Date(parseInt(status.timestamp) * 1000).toISOString(),
    };

    if (status.errors?.length) {
        updateData.error_code = String(status.errors[0].code);
        updateData.error_message = status.errors[0].title;
    }

    await supabase
        .from("messages")
        .update(updateData)
        .eq("whatsapp_message_id", status.id);

    console.log("Status updated:", status.id, "->", mappedStatus);
}

// Helper to get internal message ID from WhatsApp message ID
async function getMessageIdByWhatsAppId(waMessageId: string): Promise<string | null> {
    const { data } = await supabase
        .from("messages")
        .select("id")
        .eq("whatsapp_message_id", waMessageId)
        .single();
    return data?.id || null;
}

// Verify webhook signature
function verifySignature(payload: string, signature: string): boolean {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) return true; // Skip if not configured

    const expectedSignature =
        "sha256=" +
        crypto.createHmac("sha256", appSecret).update(payload).digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
