"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import {
    MessageSquare,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Sparkles,
    Inbox,
    ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
    stats: {
        unread_messages: number;
        total_customers: number;
        today_bookings: number;
        open_conversations: number;
    };
    recent_conversations: Array<{
        id: string;
        last_message_at: string;
        last_message_preview: string;
        unread_count: number;
        customer: { id: string; name: string; phone: string; avatar_url?: string };
    }>;
    upcoming_bookings: Array<{
        id: string;
        starts_at: string;
        ends_at: string;
        title: string;
        status: string;
        customer: { id: string; name: string; phone: string };
        service: { id: string; name: string; duration_minutes: number };
    }>;
}

function useDashboard() {
    return useQuery<DashboardData>({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard");
            if (!res.ok) throw new Error("Failed to fetch dashboard");
            return res.json();
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}

export default function DashboardPage() {
    const { data, isLoading, error } = useDashboard();

    const stats = [
        {
            title: "Unread Messages",
            value: data?.stats.unread_messages ?? 0,
            icon: MessageSquare,
            color: "from-blue-500 to-blue-600",
            href: "/inbox",
        },
        {
            title: "Total Customers",
            value: data?.stats.total_customers ?? 0,
            icon: Users,
            color: "from-emerald-500 to-teal-600",
            href: "/customers",
        },
        {
            title: "Today's Bookings",
            value: data?.stats.today_bookings ?? 0,
            icon: Calendar,
            color: "from-violet-500 to-purple-600",
            href: "/bookings",
        },
        {
            title: "Open Conversations",
            value: data?.stats.open_conversations ?? 0,
            icon: Inbox,
            color: "from-amber-500 to-orange-600",
            href: "/inbox",
        },
    ];

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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s what&apos;s happening today.
                    </p>
                </div>
                <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                >
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={i} href={stat.href}>
                            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {stat.title}
                                            </p>
                                            {isLoading ? (
                                                <Skeleton className="h-8 w-16" />
                                            ) : (
                                                <p className="text-3xl font-bold tracking-tight">
                                                    {stat.value.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div
                                            className={cn(
                                                "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                                stat.color
                                            )}
                                        >
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Conversations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold">
                            Recent Conversations
                        </CardTitle>
                        <Link href="/inbox">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View all
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))
                        ) : data?.recent_conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Inbox className="h-10 w-10 mb-2 opacity-50" />
                                <p className="text-sm">No conversations yet</p>
                            </div>
                        ) : (
                            data?.recent_conversations.map((conv) => (
                                <Link key={conv.id} href="/inbox">
                                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={conv.customer?.avatar_url} />
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                                                {getInitials(conv.customer?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={cn(
                                                        "text-sm truncate",
                                                        conv.unread_count > 0 && "font-semibold"
                                                    )}
                                                >
                                                    {conv.customer?.name || conv.customer?.phone || "Unknown"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(conv.last_message_at), {
                                                        addSuffix: false,
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.last_message_preview || "No messages"}
                                            </p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <Badge className="bg-emerald-500 text-white text-[10px] h-5 min-w-5">
                                                {conv.unread_count}
                                            </Badge>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Bookings */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold">
                            Upcoming Bookings
                        </CardTitle>
                        <Link href="/bookings">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View all
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ))
                        ) : data?.upcoming_bookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Calendar className="h-10 w-10 mb-2 opacity-50" />
                                <p className="text-sm">No upcoming bookings</p>
                            </div>
                        ) : (
                            data?.upcoming_bookings.map((booking) => (
                                <Link key={booking.id} href="/bookings">
                                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex flex-col items-center justify-center text-white">
                                            <span className="text-xs font-medium">
                                                {format(new Date(booking.starts_at), "MMM")}
                                            </span>
                                            <span className="text-lg font-bold leading-none">
                                                {format(new Date(booking.starts_at), "d")}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {booking.customer?.name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.service?.name || booking.title || "Appointment"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {format(new Date(booking.starts_at), "h:mm a")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.service?.duration_minutes || 60} min
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
