"use client";

import { useState } from "react";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Filter,
    MoreHorizontal,
    Clock,
    User,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
];

const bookings = [
    {
        id: 1,
        customer: "Meera Patel",
        phone: "+91 54321 09876",
        service: "Hair Cut + Color",
        staff: "Sunita",
        time: "10:00 AM",
        duration: 120,
        status: "confirmed",
    },
    {
        id: 2,
        customer: "Suresh Kumar",
        phone: "+91 43210 98765",
        service: "Beard Trim",
        staff: "Raj",
        time: "11:30 AM",
        duration: 30,
        status: "confirmed",
    },
    {
        id: 3,
        customer: "Kavita Reddy",
        phone: "+91 32109 87654",
        service: "Full Body Massage",
        staff: "Priya",
        time: "02:00 PM",
        duration: 90,
        status: "pending",
    },
    {
        id: 4,
        customer: "Arjun Nair",
        phone: "+91 21098 76543",
        service: "Facial Treatment",
        staff: "Sunita",
        time: "04:30 PM",
        duration: 60,
        status: "confirmed",
    },
    {
        id: 5,
        customer: "Deepa Sharma",
        phone: "+91 10987 65432",
        service: "Manicure + Pedicure",
        staff: "Neha",
        time: "03:00 PM",
        duration: 75,
        status: "confirmed",
    },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function generateCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, currentMonth: false, hasBookings: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
        days.push({
            day: i,
            currentMonth: true,
            hasBookings: [14, 15, 16, 18, 20, 22, 25].includes(i),
            isToday: i === 14,
        });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ day: i, currentMonth: false, hasBookings: false });
    }

    return days;
}

export default function BookingsPage() {
    const [view, setView] = useState<"calendar" | "list" | "day">("day");
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 14));
    const [currentYear, setCurrentYear] = useState(2026);
    const [currentMonth, setCurrentMonth] = useState(0);

    const calendarDays = generateCalendarDays(currentYear, currentMonth);

    const navigateMonth = (direction: "prev" | "next") => {
        if (direction === "prev") {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const getBookingHeight = (duration: number) => {
        return (duration / 30) * 40; // 40px per 30 min slot
    };

    const getBookingTop = (time: string) => {
        const index = timeSlots.indexOf(time);
        return index * 40;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-muted-foreground">
                        Manage appointments and calendar
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                        <TabsList>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="calendar">Calendar</TabsTrigger>
                            <TabsTrigger value="list">List</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4 mr-2" />
                                New Booking
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Booking</DialogTitle>
                                <DialogDescription>
                                    Schedule a new appointment for a customer.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Customer</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="priya">Priya Sharma</SelectItem>
                                            <SelectItem value="rahul">Rahul Verma</SelectItem>
                                            <SelectItem value="meera">Meera Patel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Service</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="haircut">Hair Cut - ₹500 (45 min)</SelectItem>
                                            <SelectItem value="color">Hair Color - ₹1500 (90 min)</SelectItem>
                                            <SelectItem value="facial">Facial - ₹800 (60 min)</SelectItem>
                                            <SelectItem value="massage">Massage - ₹1200 (90 min)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" defaultValue="2026-01-15" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={slot} value={slot}>
                                                        {slot}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Assign Staff</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select staff" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sunita">Sunita</SelectItem>
                                            <SelectItem value="raj">Raj</SelectItem>
                                            <SelectItem value="priya">Priya K.</SelectItem>
                                            <SelectItem value="neha">Neha</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes (Optional)</Label>
                                    <Textarea placeholder="Any special requests..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    Create Booking
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">18</p>
                            <p className="text-sm text-muted-foreground">Today&apos;s Bookings</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">14</p>
                            <p className="text-sm text-muted-foreground">Confirmed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">3</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">6.5h</p>
                            <p className="text-sm text-muted-foreground">Total Duration</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
                {/* Mini Calendar */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                {months[currentMonth]} {currentYear}
                            </CardTitle>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth("prev")}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth("next")}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {weekDays.map((day) => (
                                <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, index) => (
                                <button
                                    key={index}
                                    className={cn(
                                        "h-9 w-9 rounded-lg text-sm transition-colors relative",
                                        !day.currentMonth && "text-muted-foreground/40",
                                        day.currentMonth && "hover:bg-muted",
                                        day.isToday && "bg-emerald-600 text-white hover:bg-emerald-700",
                                        day.hasBookings && !day.isToday && "font-medium"
                                    )}
                                >
                                    {day.day}
                                    {day.hasBookings && !day.isToday && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Day View / Booking List */}
                {view === "day" && (
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <CardTitle className="text-lg">
                                        Tuesday, January 14, 2026
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button variant="outline" size="sm">Today</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px]">
                                <div className="relative">
                                    {/* Time slots */}
                                    {timeSlots.map((slot, index) => (
                                        <div
                                            key={slot}
                                            className="flex items-start h-10 border-t border-dashed"
                                        >
                                            <span className="w-20 text-xs text-muted-foreground pr-3 -mt-2 text-right">
                                                {slot}
                                            </span>
                                            <div className="flex-1 border-l pl-3 h-full relative">
                                                {/* Bookings overlaid here */}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Booking cards as absolute positioned */}
                                    <div className="absolute left-20 right-0 top-0">
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className={cn(
                                                    "absolute left-3 right-2 rounded-lg p-2 border cursor-pointer transition-all hover:shadow-md",
                                                    booking.status === "confirmed" &&
                                                    "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
                                                    booking.status === "pending" &&
                                                    "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                                                )}
                                                style={{
                                                    top: getBookingTop(booking.time),
                                                    height: getBookingHeight(booking.duration) - 4,
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {booking.customer}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {booking.service}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-[10px] h-4",
                                                                    booking.status === "confirmed" &&
                                                                    "border-emerald-500 text-emerald-700",
                                                                    booking.status === "pending" &&
                                                                    "border-amber-500 text-amber-700"
                                                                )}
                                                            >
                                                                {booking.status}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {booking.staff}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 -mr-1"
                                                            >
                                                                <MoreHorizontal className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                                                            <DropdownMenuItem>Mark No-Show</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive">
                                                                Cancel Booking
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {view === "list" && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">All Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-muted text-center">
                                            <span className="text-lg font-bold">
                                                {booking.time.split(" ")[0].split(":")[0]}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {booking.time.split(" ")[1]}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium">{booking.customer}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.service} • {booking.duration} min
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        booking.status === "confirmed" &&
                                                        "border-emerald-500 text-emerald-700 bg-emerald-50",
                                                        booking.status === "pending" &&
                                                        "border-amber-500 text-amber-700 bg-amber-50"
                                                    )}
                                                >
                                                    {booking.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {booking.staff}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Phone className="h-3 w-3 mr-1" />
                                                Call
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        Cancel
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {view === "calendar" && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-muted-foreground py-12">
                                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Month View Coming Soon</p>
                                <p className="text-sm">Switch to Day or List view to see bookings</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
