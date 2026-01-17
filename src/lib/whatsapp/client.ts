/**
 * WhatsApp Cloud API Client
 * Handles sending messages via the WhatsApp Business Cloud API
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";

interface WhatsAppConfig {
    phoneNumberId: string;
    accessToken: string;
}

interface SendMessageResponse {
    messaging_product: string;
    contacts: Array<{ input: string; wa_id: string }>;
    messages: Array<{ id: string }>;
}

interface SendMessageError {
    error: {
        message: string;
        type: string;
        code: number;
        error_subcode?: number;
        fbtrace_id: string;
    };
}

/**
 * Send a text message
 */
export async function sendTextMessage(
    config: WhatsAppConfig,
    to: string,
    text: string,
    replyToMessageId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const payload: Record<string, unknown> = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: { body: text },
        };

        if (replyToMessageId) {
            payload.context = { message_id: replyToMessageId };
        }

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const error = data as SendMessageError;
            return {
                success: false,
                error: error.error?.message || "Failed to send message",
            };
        }

        const result = data as SendMessageResponse;
        return {
            success: true,
            messageId: result.messages?.[0]?.id,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send a template message (for outside 24h window)
 */
export async function sendTemplateMessage(
    config: WhatsAppConfig,
    to: string,
    templateName: string,
    languageCode: string,
    components?: Array<{
        type: string;
        parameters: Array<{ type: string; text?: string; image?: { link: string } }>;
    }>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const payload: Record<string, unknown> = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                components,
            },
        };

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const error = data as SendMessageError;
            return {
                success: false,
                error: error.error?.message || "Failed to send template",
            };
        }

        const result = data as SendMessageResponse;
        return {
            success: true,
            messageId: result.messages?.[0]?.id,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send an image message
 */
export async function sendImageMessage(
    config: WhatsAppConfig,
    to: string,
    imageUrl: string,
    caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "image",
            image: {
                link: imageUrl,
                caption,
            },
        };

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const error = data as SendMessageError;
            return {
                success: false,
                error: error.error?.message || "Failed to send image",
            };
        }

        const result = data as SendMessageResponse;
        return {
            success: true,
            messageId: result.messages?.[0]?.id,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send a document message
 */
export async function sendDocumentMessage(
    config: WhatsAppConfig,
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "document",
            document: {
                link: documentUrl,
                filename,
                caption,
            },
        };

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const error = data as SendMessageError;
            return {
                success: false,
                error: error.error?.message || "Failed to send document",
            };
        }

        const result = data as SendMessageResponse;
        return {
            success: true,
            messageId: result.messages?.[0]?.id,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(
    config: WhatsAppConfig,
    messageId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const payload = {
            messaging_product: "whatsapp",
            status: "read",
            message_id: messageId,
        };

        const response = await fetch(
            `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error?.message || "Failed to mark as read",
            };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get media URL from media ID
 */
export async function getMediaUrl(
    accessToken: string,
    mediaId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const response = await fetch(`${WHATSAPP_API_URL}/${mediaId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error?.message || "Failed to get media URL",
            };
        }

        return {
            success: true,
            url: data.url,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
