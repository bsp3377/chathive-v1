"use client";

import { useState } from "react";
import { ConversationList, ChatWindow, CustomerPanel } from "@/components/inbox";
import type { Conversation, Customer } from "@/types/database";

export default function InboxPage() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background">
            {/* Conversation List */}
            <ConversationList
                selectedId={selectedConversation?.id}
                onSelect={handleSelectConversation}
            />

            {/* Chat Window */}
            <ChatWindow conversationId={selectedConversation?.id} />

            {/* Customer Panel */}
            <CustomerPanel customer={selectedConversation?.customer as Customer | undefined} />
        </div>
    );
}
