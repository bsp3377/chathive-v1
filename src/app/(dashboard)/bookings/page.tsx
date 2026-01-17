"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import {
    Calendar as CalendarIcon,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    MoreHorizontal,
    Check,
    X,
    Filter,
    List,
    Grid,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useBookings } from "@/hooks/use-api";
import type { Booking, Customer, Service } from "@/types/database";

type ViewMode = "list" | "calendar";

export default function BookingsPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [view, setView] = useState<ViewMode>("list");

    const startOfRange = startOfWeek(selectedDate);
    const endOfRange = endOfWeek(selectedDate);

    const { data: response, isLoading } = useBookings({
        start_date: startOfRange.toISOString(),
        end_date: endOfRange.toISOString(),
        limit: 100,
    });

    const bookings = response?.data ?? [];

    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "pending":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "completed":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            case "no_show":
                return "bg-gray-100 text-gray-700 border-gray-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const weekDays = eachDayOfInterval({ start: startOfRange, end: endOfRange });

    const bookingsByDay = weekDays.map((day) => ({
        date: day,
        bookings: bookings.filter((b) => {
            const bookingDate = new Date(b.starts_at);
            return format(bookingDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
        }),
    }));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-muted-foreground">
                        Manage appointments and schedules
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Tabs
                        value={view}
                        onValueChange={(v) => setView(v as ViewMode)}
                    >
                        <TabsList className="grid w-[200px] grid-cols-2">
                            <TabsTrigger value="list" className="gap-2">
                                <List className="h-4 w-4" />
                                List
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="gap-2">
                                <Grid className="h-4 w-4" />
                                Week
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <Plus className="h-4 w-4" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Date Navigation */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="gap-2 min-w-[200px]">
                                        <CalendarIcon className="h-4 w-4" />
                                        {format(startOfRange, "MMM d")} - {format(endOfRange, "MMM d, yyyy")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedDate(new Date())}
                            >
                                Today
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {bookings.filter((b) => b.status === "confirmed").length} Confirmed
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                {bookings.filter((b) => b.status === "pending").length} Pending
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {view === "list" ? (
                // List View
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    ))
                                ) : bookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <CalendarIcon className="h-10 w-10 opacity-50" />
                                                <p>No bookings for this period</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.map((booking) => {
                                        const customer = booking.customer as Customer | undefined;
                                        const service = booking.service as Service | undefined;
                                        return (
                                            <TableRow key={booking.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                                                {getInitials(customer?.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{customer?.name || "Unknown"}</p>
                                                            <p className="text-xs text-muted-foreground">{customer?.phone}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {service && (
                                                            <div
                                                                className="h-3 w-3 rounded-full"
                                                                style={{ backgroundColor: service.color || "#3b82f6" }}
                                                            />
                                                        )}
                                                        {service?.name || booking.title || "Appointment"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {format(new Date(booking.starts_at), "EEE, MMM d")}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {format(new Date(booking.starts_at), "h:mm a")} -{" "}
                                                                {format(new Date(booking.ends_at), "h:mm a")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        {service?.duration_minutes || 60} min
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("capitalize", getStatusColor(booking.status))}>
                                                        {booking.status.replace("_", " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {booking.price ? `$${booking.price}` : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Mark Complete
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600">
                                                                <X className="h-4 w-4 mr-2" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                // Week View
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-7 gap-2">
                            {bookingsByDay.map(({ date, bookings: dayBookings }) => (
                                <div
                                    key={date.toISOString()}
                                    className={cn(
                                        "min-h-[200px] rounded-lg border p-2",
                                        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") &&
                                        "ring-2 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                                    )}
                                >
                                    <div className="text-center mb-2">
                                        <p className="text-xs text-muted-foreground uppercase">
                                            {format(date, "EEE")}
                                        </p>
                                        <p
                                            className={cn(
                                                "text-lg font-semibold",
                                                format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") &&
                                                "text-emerald-600"
                                            )}
                                        >
                                            {format(date, "d")}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        {isLoading ? (
                                            <Skeleton className="h-12 w-full" />
                                        ) : (
                                            dayBookings.slice(0, 4).map((booking) => {
                                                const service = booking.service as Service | undefined;
                                                return (
                                                    <div
                                                        key={booking.id}
                                                        className="text-xs p-2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white cursor-pointer hover:opacity-90 transition-opacity"
                                                    >
                                                        <p className="font-medium truncate">
                                                            {format(new Date(booking.starts_at), "h:mm a")}
                                                        </p>
                                                        <p className="truncate opacity-90">
                                                            {(booking.customer as Customer | undefined)?.name || "Customer"}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        )}
                                        {dayBookings.length > 4 && (
                                            <p className="text-xs text-center text-muted-foreground">
                                                +{dayBookings.length - 4} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
