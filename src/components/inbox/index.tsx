"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Search,
    MoreVertical,
    Paperclip,
    Send,
    Smile,
    Image as ImageIcon,
    User,
    Calendar,
    Tag,
    Bot,
    Check,
    CheckCheck,
    Sparkles,
    FileText,
    Phone,
    ChevronDown,
    Inbox,
    Clock,
    X,
    Archive,
    RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    useConversations,
    useConversation,
    useMessages,
    useSendMessage,
    useUpdateConversation,
} from "@/hooks/use-api";
import { useRealtimeMessages } from "@/hooks/use-realtime";
import type { Conversation, Message as MessageType, Customer } from "@/types/database";

// =============================================================
// CONVERSATION LIST
// =============================================================

interface ConversationListProps {
    selectedId?: string;
    onSelect: (conversation: Conversation) => void;
    filter?: string;
}

export function ConversationList({ selectedId, onSelect, filter }: ConversationListProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("open,waiting");

    const { data, isLoading, refetch } = useConversations({
        status: statusFilter || undefined,
        limit: 50,
    });

    const conversations = data?.data || [];

    const filteredConversations = conversations.filter((conv) => {
        if (!search) return true;
        const customer = conv.customer as Customer | undefined;
        const searchLower = search.toLowerCase();
        return (
            customer?.name?.toLowerCase().includes(searchLower) ||
            customer?.phone?.includes(search)
        );
    });

    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (date?: string) => {
        if (!date) return "";
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: false });
        } catch {
            return "";
        }
    };

    return (
        <div className="w-80 border-r flex flex-col bg-background h-full">
            {/* Header */}
            <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Inbox className="h-5 w-5" />
                        Inbox
                    </h2>
                    <div className="flex items-center gap-1">
                        <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                        >
                            {conversations.filter((c) => c.unread_count > 0).length} unread
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-muted/50"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1">
                    {[
                        { value: "open,waiting", label: "Open" },
                        { value: "", label: "All" },
                        { value: "closed", label: "Closed" },
                    ].map((tab) => (
                        <Button
                            key={tab.value}
                            variant={statusFilter === tab.value ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                                "flex-1 h-8",
                                statusFilter === tab.value &&
                                "bg-emerald-600 hover:bg-emerald-700"
                            )}
                            onClick={() => setStatusFilter(tab.value)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            </div>
                        ))
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Inbox className="h-12 w-12 mb-3 opacity-50" />
                            <p className="text-sm">No conversations found</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const customer = conv.customer as Customer | undefined;
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelect(conv)}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200",
                                        selectedId === conv.id
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200 dark:ring-emerald-800"
                                            : "hover:bg-muted/50",
                                        conv.unread_count > 0 &&
                                        selectedId !== conv.id &&
                                        "bg-emerald-50/50 dark:bg-emerald-950/20"
                                    )}
                                >
                                    {/* Avatar with status indicator */}
                                    <div className="relative">
                                        <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-background">
                                            <AvatarImage src={customer?.avatar_url || undefined} />
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-medium">
                                                {getInitials(customer?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {conv.status === "open" && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={cn(
                                                    "text-sm truncate",
                                                    conv.unread_count > 0 && "font-semibold"
                                                )}
                                            >
                                                {customer?.name || customer?.phone || "Unknown"}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground flex-shrink-0">
                                                {formatTime(conv.last_message_at)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {conv.last_message_direction === "outbound" && (
                                                <CheckCheck className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                            )}
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.last_message_preview || "No messages yet"}
                                            </p>
                                        </div>

                                        {/* Priority badge */}
                                        {conv.priority === "high" || conv.priority === "urgent" ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "mt-1.5 text-[10px] h-5",
                                                    conv.priority === "urgent" &&
                                                    "border-red-300 text-red-600 bg-red-50"
                                                )}
                                            >
                                                {conv.priority}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    {/* Unread badge */}
                                    {conv.unread_count > 0 && (
                                        <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-medium px-1.5">
                                            {conv.unread_count > 99 ? "99+" : conv.unread_count}
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

// =============================================================
// CHAT WINDOW
// =============================================================

interface ChatWindowProps {
    conversationId?: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const [messageInput, setMessageInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: conversation, isLoading: convLoading } = useConversation(conversationId);
    const { data: messagesData, isLoading: msgLoading } = useMessages(conversationId);
    const sendMessage = useSendMessage();
    const updateConversation = useUpdateConversation();

    // Subscribe to real-time updates
    useRealtimeMessages(conversationId);

    const messages = messagesData?.data || [];
    const customer = conversation?.customer as Customer | undefined;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    // Mark as read when opening
    useEffect(() => {
        if (conversationId && conversation?.unread_count && conversation.unread_count > 0) {
            updateConversation.mutate({
                id: conversationId,
                data: { mark_as_read: true },
            });
        }
    }, [conversationId, conversation?.unread_count]);

    const handleSend = async () => {
        if (!messageInput.trim() || !conversationId) return;

        const content = messageInput.trim();
        setMessageInput("");

        try {
            await sendMessage.mutateAsync({
                conversationId,
                content,
                type: "text",
            });
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessageInput(content); // Restore on error
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatMessageTime = (date?: string) => {
        if (!date) return "";
        try {
            return new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    // Empty state
    if (!conversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                <div className="flex flex-col items-center max-w-md text-center p-8">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
                        <Inbox className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        Select a conversation
                    </h3>
                    <p className="text-sm">
                        Choose a conversation from the list to start chatting with your
                        customers.
                    </p>
                </div>
            </div>
        );
    }

    // Loading state
    if (convLoading) {
        return (
            <div className="flex-1 flex flex-col">
                <div className="h-16 border-b flex items-center px-4 gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}
                        >
                            <Skeleton className="h-16 w-64 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-4 bg-background">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-emerald-100 dark:ring-emerald-900">
                        <AvatarImage src={customer?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium">
                            {getInitials(customer?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm">
                            {customer?.name || "Unknown"}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer?.phone}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <User className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Customer</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <Calendar className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Create Booking</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Create Invoice</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Tag className="h-4 w-4 mr-2" />
                                Add Tags
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Clock className="h-4 w-4 mr-2" />
                                Snooze
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() =>
                                    updateConversation.mutate({
                                        id: conversationId,
                                        data: { status: "closed" },
                                    })
                                }
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Close Conversation
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                    {msgLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}
                            >
                                <Skeleton className="h-14 w-52 rounded-2xl" />
                            </div>
                        ))
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Inbox className="h-12 w-12 mb-3 opacity-50" />
                            <p className="text-sm">No messages yet</p>
                            <p className="text-xs mt-1">Send a message to start the conversation</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                customerName={customer?.name}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4 bg-background">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-2">
                        <div className="flex gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9">
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Attach file</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Send image</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="flex-1 relative">
                            <Textarea
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="min-h-[44px] max-h-32 resize-none pr-10 bg-muted/50"
                                rows={1}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 bottom-1 h-8 w-8"
                            >
                                <Smile className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleSend}
                            disabled={!messageInput.trim() || sendMessage.isPending}
                            className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// MESSAGE BUBBLE
// =============================================================

interface MessageBubbleProps {
    message: MessageType;
    customerName?: string;
}

function MessageBubble({ message, customerName }: MessageBubbleProps) {
    const isInbound = message.direction === "inbound";
    const isBot = message.sender_type === "bot";
    const senderUser = message.sender_user as { first_name?: string; last_name?: string } | undefined;

    const formatTime = (date?: string) => {
        if (!date) return "";
        try {
            return new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    const getStatusIcon = () => {
        switch (message.status) {
            case "read":
                return <CheckCheck className="h-3 w-3 text-blue-400" />;
            case "delivered":
                return <CheckCheck className="h-3 w-3" />;
            case "sent":
                return <Check className="h-3 w-3" />;
            case "failed":
                return <X className="h-3 w-3 text-red-400" />;
            default:
                return <Clock className="h-3 w-3 animate-pulse" />;
        }
    };

    return (
        <div className={cn("flex", isInbound ? "justify-start" : "justify-end")}>
            <div
                className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 relative group",
                    isInbound
                        ? "bg-muted text-foreground rounded-tl-md"
                        : isBot
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-md"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-md"
                )}
            >
                {/* Sender indicator for outbound */}
                {!isInbound && (
                    <div className="flex items-center gap-1.5 mb-1 text-white/80">
                        {isBot ? (
                            <>
                                <Sparkles className="h-3 w-3" />
                                <span className="text-[10px] font-medium">AI Reply</span>
                            </>
                        ) : senderUser ? (
                            <>
                                <User className="h-3 w-3" />
                                <span className="text-[10px] font-medium">
                                    {senderUser.first_name || "You"}
                                </span>
                            </>
                        ) : null}
                    </div>
                )}

                {/* Message content */}
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                {/* Time and status */}
                <div
                    className={cn(
                        "flex items-center gap-1 mt-1",
                        isInbound
                            ? "text-muted-foreground justify-start"
                            : "text-white/60 justify-end"
                    )}
                >
                    <span className="text-[10px]">{formatTime(message.created_at)}</span>
                    {!isInbound && getStatusIcon()}
                </div>
            </div>
        </div>
    );
}

// =============================================================
// CUSTOMER PANEL
// =============================================================

interface CustomerPanelProps {
    customer?: Customer;
    onClose?: () => void;
}

export function CustomerPanel({ customer, onClose }: CustomerPanelProps) {
    if (!customer) return null;

    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="w-72 border-l bg-muted/30 p-4 hidden xl:block">
            <div className="space-y-6">
                {/* Customer Info */}
                <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-emerald-100 dark:ring-emerald-900">
                        <AvatarImage src={customer.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-semibold">
                            {getInitials(customer.name)}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">{customer.name || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    {customer.email && (
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                    )}
                </div>

                <Separator />

                {/* Quick Actions */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs">Book</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                            <FileText className="h-4 w-4" />
                            <span className="text-xs">Invoice</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                            <Tag className="h-4 w-4" />
                            <span className="text-xs">Tags</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-auto py-3 flex-col gap-1">
                            <User className="h-4 w-4" />
                            <span className="text-xs">Profile</span>
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Stats */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Customer Info</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Visits</span>
                            <span className="font-medium">{customer.total_bookings || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Spent</span>
                            <span className="font-medium">
                                ${customer.lifetime_value?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Conversations</span>
                            <span className="font-medium">{customer.total_conversations || 0}</span>
                        </div>
                        {customer.first_contact_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Member Since</span>
                                <span className="font-medium">
                                    {new Date(customer.first_contact_at).toLocaleDateString([], {
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {customer.notes && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-medium mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{customer.notes}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
