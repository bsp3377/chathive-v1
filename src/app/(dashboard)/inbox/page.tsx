"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Send,
    Smile,
    Image as ImageIcon,
    FileText,
    Sparkles,
    Check,
    CheckCheck,
    Clock,
    User,
    Calendar,
    Tag,
    MessageSquare,
    Bot,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

const conversations = [
    {
        id: 1,
        customer: "Priya Sharma",
        phone: "+91 98765 43210",
        lastMessage: "Thanks for the appointment confirmation!",
        time: "2 min ago",
        unread: 2,
        status: "open",
        tags: ["VIP", "Regular"],
    },
    {
        id: 2,
        customer: "Rahul Verma",
        phone: "+91 87654 32109",
        lastMessage: "What are your opening hours on Sunday?",
        time: "15 min ago",
        unread: 1,
        status: "ai-replied",
        tags: ["New"],
    },
    {
        id: 3,
        customer: "Anita Desai",
        phone: "+91 76543 21098",
        lastMessage: "Can I reschedule my appointment?",
        time: "1 hour ago",
        unread: 0,
        status: "pending",
        tags: [],
    },
    {
        id: 4,
        customer: "Vikram Singh",
        phone: "+91 65432 10987",
        lastMessage: "Do you offer home service?",
        time: "2 hours ago",
        unread: 0,
        status: "ai-replied",
        tags: ["Enquiry"],
    },
    {
        id: 5,
        customer: "Meera Patel",
        phone: "+91 54321 09876",
        lastMessage: "Perfect, see you tomorrow!",
        time: "3 hours ago",
        unread: 0,
        status: "resolved",
        tags: ["Regular"],
    },
    {
        id: 6,
        customer: "Suresh Kumar",
        phone: "+91 43210 98765",
        lastMessage: "How much for a beard trim?",
        time: "5 hours ago",
        unread: 0,
        status: "open",
        tags: [],
    },
];

const messages = [
    {
        id: 1,
        type: "customer",
        content: "Hi, I wanted to book an appointment for a haircut",
        time: "10:30 AM",
        status: "read",
    },
    {
        id: 2,
        type: "ai",
        content: "Hello! 👋 Thank you for reaching out to Glow Salon & Spa. I'd be happy to help you book a haircut appointment. We have slots available today and tomorrow. When would you prefer?",
        time: "10:30 AM",
        status: "read",
        confidence: 92,
    },
    {
        id: 3,
        type: "customer",
        content: "Tomorrow afternoon would be great",
        time: "10:32 AM",
        status: "read",
    },
    {
        id: 4,
        type: "ai",
        content: "We have the following slots available tomorrow afternoon:\n\n• 2:00 PM\n• 3:30 PM\n• 5:00 PM\n\nWhich time works best for you?",
        time: "10:32 AM",
        status: "read",
        confidence: 88,
    },
    {
        id: 5,
        type: "customer",
        content: "3:30 PM works for me",
        time: "10:35 AM",
        status: "read",
    },
    {
        id: 6,
        type: "staff",
        content: "Perfect! I've booked you for a haircut at 3:30 PM tomorrow. You'll receive a confirmation shortly. Please arrive 10 minutes early. Is there anything else I can help with?",
        time: "10:36 AM",
        status: "read",
        staff: "John Doe",
    },
    {
        id: 7,
        type: "customer",
        content: "Thanks for the appointment confirmation!",
        time: "10:38 AM",
        status: "read",
    },
];

export default function InboxPage() {
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [messageInput, setMessageInput] = useState("");
    const [aiEnabled, setAiEnabled] = useState(true);

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Conversation List */}
            <div className="w-80 border-r flex flex-col bg-background">
                <div className="p-4 border-b space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg">Inbox</h2>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            24 unread
                        </Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search conversations..." className="pl-9" />
                    </div>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="w-full grid grid-cols-4">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                            <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
                            <TabsTrigger value="open" className="text-xs">Open</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                                    selectedConversation.id === conv.id
                                        ? "bg-muted"
                                        : "hover:bg-muted/50",
                                    conv.unread > 0 && "bg-emerald-50 dark:bg-emerald-950/20"
                                )}
                            >
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                                        {conv.customer.split(" ").map((n) => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={cn("text-sm truncate", conv.unread > 0 && "font-semibold")}>
                                            {conv.customer}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                            {conv.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {conv.status === "ai-replied" && (
                                            <Sparkles className="h-3 w-3 text-violet-500 flex-shrink-0" />
                                        )}
                                        <p className="text-xs text-muted-foreground truncate">
                                            {conv.lastMessage}
                                        </p>
                                    </div>
                                    {conv.tags.length > 0 && (
                                        <div className="flex gap-1 mt-1.5">
                                            {conv.tags.slice(0, 2).map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="text-[10px] py-0 h-4"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {conv.unread > 0 && (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-medium">
                                        {conv.unread}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
                {/* Thread Header */}
                <div className="h-16 border-b flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                {selectedConversation.customer.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">{selectedConversation.customer}</h3>
                            <p className="text-xs text-muted-foreground">{selectedConversation.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={aiEnabled ? "default" : "outline"}
                                        size="sm"
                                        className={cn(
                                            "gap-1.5",
                                            aiEnabled && "bg-violet-600 hover:bg-violet-700"
                                        )}
                                        onClick={() => setAiEnabled(!aiEnabled)}
                                    >
                                        <Bot className="h-4 w-4" />
                                        AI {aiEnabled ? "On" : "Off"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {aiEnabled ? "Disable AI auto-reply for this chat" : "Enable AI auto-reply"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button variant="outline" size="icon">
                            <User className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Calendar className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Tag className="h-4 w-4 mr-2" />
                                    Add Tags
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Create Booking
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div className="flex justify-center">
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                Today
                            </Badge>
                        </div>

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex",
                                    msg.type === "customer" ? "justify-start" : "justify-end"
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[70%] rounded-2xl px-4 py-2.5 relative group",
                                        msg.type === "customer" && "message-bubble-customer",
                                        msg.type === "staff" && "message-bubble-staff",
                                        msg.type === "ai" && "message-bubble-ai"
                                    )}
                                >
                                    {msg.type === "ai" && (
                                        <div className="flex items-center gap-1.5 mb-1 text-white/80">
                                            <Sparkles className="h-3 w-3" />
                                            <span className="text-[10px] font-medium">
                                                AI Reply • {msg.confidence}% confidence
                                            </span>
                                        </div>
                                    )}
                                    {msg.type === "staff" && (
                                        <div className="flex items-center gap-1.5 mb-1 text-white/80">
                                            <User className="h-3 w-3" />
                                            <span className="text-[10px] font-medium">{msg.staff}</span>
                                        </div>
                                    )}
                                    <p className={cn(
                                        "text-sm whitespace-pre-wrap",
                                        msg.type === "customer" && "text-foreground"
                                    )}>
                                        {msg.content}
                                    </p>
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 mt-1",
                                            msg.type === "customer" ? "text-muted-foreground" : "text-white/60",
                                            msg.type === "customer" ? "justify-start" : "justify-end"
                                        )}
                                    >
                                        <span className="text-[10px]">{msg.time}</span>
                                        {msg.type !== "customer" && (
                                            msg.status === "read" ? (
                                                <CheckCheck className="h-3 w-3 text-blue-400" />
                                            ) : (
                                                <Check className="h-3 w-3" />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-end gap-2">
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <ImageIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 relative">
                                <Textarea
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="min-h-[44px] max-h-32 resize-none pr-10"
                                    rows={1}
                                />
                                <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8">
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        {aiEnabled && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Sparkles className="h-3 w-3 text-violet-500" />
                                <span>AI auto-reply is enabled for this conversation</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Details Panel */}
            <div className="w-72 border-l bg-muted/30 p-4 hidden xl:block">
                <div className="space-y-6">
                    <div className="text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-3">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl">
                                {selectedConversation.customer.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{selectedConversation.customer}</h3>
                        <p className="text-sm text-muted-foreground">{selectedConversation.phone}</p>
                        <div className="flex justify-center gap-1 mt-2">
                            {selectedConversation.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Separator />

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

                    <div>
                        <h4 className="text-sm font-medium mb-3">Customer Info</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Visits</span>
                                <span className="font-medium">12</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Spent</span>
                                <span className="font-medium">₹24,500</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Visit</span>
                                <span className="font-medium">Jan 8, 2026</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Member Since</span>
                                <span className="font-medium">Mar 2024</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="text-sm font-medium mb-3">Upcoming Booking</h4>
                        <Card className="p-3 bg-background">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-center">
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">15</span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Jan</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Hair Cut</p>
                                    <p className="text-xs text-muted-foreground">3:30 PM • 1 hour</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
