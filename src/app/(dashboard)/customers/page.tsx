"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Search,
    Plus,
    MoreHorizontal,
    Phone,
    Mail,
    MessageSquare,
    Calendar,
    Tag,
    Building,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Users,
    Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/use-api";
import type { Customer } from "@/types/database";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading, isFetching } = useCustomers({
        page,
        limit,
        search: search || undefined,
        sort: "-last_contact_at",
    });

    const customers = data?.data || [];
    const totalPages = Math.ceil((data?.total || 0) / limit);

    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (date?: string) => {
        if (!date) return "Never";
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return "—";
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your customer relationships
                    </p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Customer
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, phone, or email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1); // Reset to first page on search
                                }}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: "Total Customers", value: data?.total || 0, icon: Users },
                    { label: "This Month", value: "—", icon: Calendar },
                    { label: "Active", value: "—", icon: MessageSquare },
                    { label: "Lifetime Value", value: "—", icon: DollarSign },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <stat.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-xl font-semibold">
                                    {typeof stat.value === "number"
                                        ? stat.value.toLocaleString()
                                        : stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[300px]">Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Last Contact</TableHead>
                                <TableHead className="text-center">Conversations</TableHead>
                                <TableHead className="text-center">Bookings</TableHead>
                                <TableHead className="text-right">Lifetime Value</TableHead>
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
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-32" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-8 mx-auto" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-8 mx-auto" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-16 ml-auto" />
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))
                            ) : customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Users className="h-10 w-10 opacity-50" />
                                            <p>No customers found</p>
                                            {search && (
                                                <Button
                                                    variant="link"
                                                    onClick={() => setSearch("")}
                                                    className="text-emerald-600"
                                                >
                                                    Clear search
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        className="hover:bg-muted/50 cursor-pointer"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={customer.avatar_url || undefined} />
                                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                                                        {getInitials(customer.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {customer.name || "Unknown"}
                                                    </p>
                                                    {customer.company_name && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Building className="h-3 w-3" />
                                                            {customer.company_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    {customer.phone}
                                                </p>
                                                {customer.email && (
                                                    <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {customer.email}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(customer.last_contact_at)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {customer.total_conversations || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {customer.total_bookings || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${(customer.lifetime_value || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                                                    <DropdownMenuItem>Create Booking</DropdownMenuItem>
                                                    <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Showing {(page - 1) * limit + 1} to{" "}
                            {Math.min(page * limit, data?.total || 0)} of {data?.total || 0}{" "}
                            customers
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || isFetching}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm min-w-[80px] text-center">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isFetching}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
