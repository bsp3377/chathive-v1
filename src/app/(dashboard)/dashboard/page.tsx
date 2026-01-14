"use client";

import {
    MessageSquare,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    AlertCircle,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
    {
        title: "Unread Messages",
        value: "24",
        change: "+12%",
        changeType: "positive",
        icon: MessageSquare,
        color: "from-blue-500 to-blue-600",
    },
    {
        title: "Total Customers",
        value: "1,284",
        change: "+8%",
        changeType: "positive",
        icon: Users,
        color: "from-emerald-500 to-teal-600",
    },
    {
        title: "Today's Bookings",
        value: "18",
        change: "-2",
        changeType: "neutral",
        icon: Calendar,
        color: "from-violet-500 to-purple-600",
    },
    {
        title: "AI Replies Today",
        value: "47/100",
        change: "53 left",
        changeType: "info",
        icon: Sparkles,
        color: "from-amber-500 to-orange-600",
    },
];

const recentConversations = [
    {
        id: 1,
        customer: "Priya Sharma",
        avatar: null,
        lastMessage: "Thanks for the appointment confirmation!",
        time: "2 min ago",
        unread: true,
        aiReplied: false,
    },
    {
        id: 2,
        customer: "Rahul Verma",
        avatar: null,
        lastMessage: "What are your opening hours on Sunday?",
        time: "15 min ago",
        unread: true,
        aiReplied: true,
    },
    {
        id: 3,
        customer: "Anita Desai",
        avatar: null,
        lastMessage: "Can I reschedule my appointment?",
        time: "1 hour ago",
        unread: false,
        aiReplied: false,
    },
    {
        id: 4,
        customer: "Vikram Singh",
        avatar: null,
        lastMessage: "Do you offer home service?",
        time: "2 hours ago",
        unread: false,
        aiReplied: true,
    },
];

const upcomingBookings = [
    {
        id: 1,
        customer: "Meera Patel",
        service: "Hair Cut + Color",
        time: "10:00 AM",
        duration: "2 hours",
        status: "confirmed",
    },
    {
        id: 2,
        customer: "Suresh Kumar",
        service: "Beard Trim",
        time: "11:30 AM",
        duration: "30 min",
        status: "confirmed",
    },
    {
        id: 3,
        customer: "Kavita Reddy",
        service: "Full Body Massage",
        time: "2:00 PM",
        duration: "1.5 hours",
        status: "pending",
    },
    {
        id: 4,
        customer: "Arjun Nair",
        service: "Facial Treatment",
        time: "4:30 PM",
        duration: "1 hour",
        status: "confirmed",
    },
];

const pendingTasks = [
    {
        id: 1,
        title: "Follow up with Priya about her feedback",
        type: "enquiry",
        priority: "high",
        dueTime: "Today",
    },
    {
        id: 2,
        title: "Send invoice to Rahul Verma",
        type: "invoice",
        priority: "medium",
        dueTime: "Today",
    },
    {
        id: 3,
        title: "Confirm booking with Kavita Reddy",
        type: "booking",
        priority: "high",
        dueTime: "30 min",
    },
];

export default function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Good morning, John! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Here&apos;s what&apos;s happening at Glow Salon & Spa today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        WhatsApp Connected
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                                <div
                                    className={cn(
                                        "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                                        stat.color
                                    )}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1 text-sm">
                                {stat.changeType === "positive" && (
                                    <>
                                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                        <span className="text-emerald-500">{stat.change}</span>
                                        <span className="text-muted-foreground">vs last week</span>
                                    </>
                                )}
                                {stat.changeType === "negative" && (
                                    <>
                                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                                        <span className="text-red-500">{stat.change}</span>
                                        <span className="text-muted-foreground">vs last week</span>
                                    </>
                                )}
                                {stat.changeType === "neutral" && (
                                    <span className="text-muted-foreground">{stat.change} from yesterday</span>
                                )}
                                {stat.changeType === "info" && (
                                    <span className="text-muted-foreground">{stat.change}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Conversations */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold">
                            Recent Conversations
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {recentConversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50",
                                    conv.unread && "bg-emerald-50 dark:bg-emerald-950/20"
                                )}
                            >
                                <Avatar className="h-9 w-9 flex-shrink-0">
                                    <AvatarImage src={conv.avatar || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                                        {conv.customer
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={cn(
                                                "text-sm font-medium truncate",
                                                conv.unread && "font-semibold"
                                            )}
                                        >
                                            {conv.customer}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                            {conv.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {conv.aiReplied && (
                                            <Badge
                                                variant="secondary"
                                                className="h-4 px-1 text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                                            >
                                                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                                AI
                                            </Badge>
                                        )}
                                        <p className="text-xs text-muted-foreground truncate">
                                            {conv.lastMessage}
                                        </p>
                                    </div>
                                </div>
                                {conv.unread && (
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Today's Bookings */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold">
                            Today&apos;s Bookings
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs">
                            View Calendar
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {upcomingBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-muted text-center">
                                    <span className="text-sm font-bold text-foreground">
                                        {booking.time.split(" ")[0]}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {booking.time.split(" ")[1]}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {booking.customer}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {booking.service} • {booking.duration}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        booking.status === "confirmed" ? "default" : "secondary"
                                    }
                                    className={cn(
                                        "text-[10px] capitalize",
                                        booking.status === "confirmed" &&
                                        "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300",
                                        booking.status === "pending" &&
                                        "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300"
                                    )}
                                >
                                    {booking.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Pending Tasks */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold">
                            Pending Tasks
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                            {pendingTasks.length} tasks
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                            >
                                <div
                                    className={cn(
                                        "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                                        task.priority === "high" && "bg-red-500",
                                        task.priority === "medium" && "bg-amber-500",
                                        task.priority === "low" && "bg-blue-500"
                                    )}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px] capitalize">
                                            {task.type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {task.dueTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full mt-2">
                            View All Tasks
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* AI Performance Card */}
            <Card className="bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 border-violet-200 dark:border-violet-800">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">AI Auto-Reply Performance</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your AI has handled 47 conversations today with 94% accuracy
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">47</p>
                                <p className="text-xs text-muted-foreground">AI Replies</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">94%</p>
                                <p className="text-xs text-muted-foreground">Accuracy</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.3s</p>
                                <p className="text-xs text-muted-foreground">Avg Response</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">53</p>
                                <p className="text-xs text-muted-foreground">Remaining</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
