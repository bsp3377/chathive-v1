"use client";

import { useState } from "react";
import {
    Search,
    Plus,
    MoreHorizontal,
    Filter,
    Download,
    Upload,
    Phone,
    Mail,
    MessageSquare,
    Calendar,
    FileText,
    Tag,
    ChevronDown,
    ArrowUpDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const customers = [
    {
        id: 1,
        name: "Priya Sharma",
        phone: "+91 98765 43210",
        email: "priya.sharma@email.com",
        tags: ["VIP", "Regular"],
        totalVisits: 24,
        totalSpent: 45000,
        lastVisit: "Jan 12, 2026",
        status: "active",
    },
    {
        id: 2,
        name: "Rahul Verma",
        phone: "+91 87654 32109",
        email: "rahul.v@email.com",
        tags: ["New"],
        totalVisits: 2,
        totalSpent: 3500,
        lastVisit: "Jan 10, 2026",
        status: "active",
    },
    {
        id: 3,
        name: "Anita Desai",
        phone: "+91 76543 21098",
        email: "anita.desai@email.com",
        tags: ["Regular"],
        totalVisits: 15,
        totalSpent: 28000,
        lastVisit: "Jan 8, 2026",
        status: "active",
    },
    {
        id: 4,
        name: "Vikram Singh",
        phone: "+91 65432 10987",
        email: null,
        tags: ["Enquiry"],
        totalVisits: 0,
        totalSpent: 0,
        lastVisit: "Never",
        status: "lead",
    },
    {
        id: 5,
        name: "Meera Patel",
        phone: "+91 54321 09876",
        email: "meera.p@email.com",
        tags: ["VIP", "Regular"],
        totalVisits: 32,
        totalSpent: 68000,
        lastVisit: "Jan 14, 2026",
        status: "active",
    },
    {
        id: 6,
        name: "Suresh Kumar",
        phone: "+91 43210 98765",
        email: "suresh.k@email.com",
        tags: [],
        totalVisits: 5,
        totalSpent: 7500,
        lastVisit: "Dec 28, 2025",
        status: "inactive",
    },
    {
        id: 7,
        name: "Kavita Reddy",
        phone: "+91 32109 87654",
        email: "kavita.r@email.com",
        tags: ["Regular"],
        totalVisits: 18,
        totalSpent: 35000,
        lastVisit: "Jan 6, 2026",
        status: "active",
    },
];

const stats = [
    { title: "Total Customers", value: "1,284", change: "+12% this month" },
    { title: "Active Customers", value: "856", change: "67% of total" },
    { title: "New This Month", value: "48", change: "+8% vs last month" },
    { title: "Avg. Lifetime Value", value: "₹12,400", change: "+5% increase" },
];

export default function CustomersPage() {
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleSelectAll = () => {
        if (selectedCustomers.length === customers.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(customers.map((c) => c.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedCustomers.includes(id)) {
            setSelectedCustomers(selectedCustomers.filter((i) => i !== id));
        } else {
            setSelectedCustomers([...selectedCustomers, id]);
        }
    };

    const filteredCustomers = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your customer database and relationships
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Customer</DialogTitle>
                                <DialogDescription>
                                    Enter customer details to add them to your database.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" placeholder="Enter name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Optional)</Label>
                                    <Input id="email" type="email" placeholder="customer@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <Input id="tags" placeholder="VIP, Regular, etc." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea id="notes" placeholder="Any additional notes..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    Add Customer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuItem>All Customers</DropdownMenuItem>
                            <DropdownMenuItem>Active</DropdownMenuItem>
                            <DropdownMenuItem>Inactive</DropdownMenuItem>
                            <DropdownMenuItem>Leads</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Tags</DropdownMenuLabel>
                            <DropdownMenuItem>VIP</DropdownMenuItem>
                            <DropdownMenuItem>Regular</DropdownMenuItem>
                            <DropdownMenuItem>New</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {selectedCustomers.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {selectedCustomers.length} selected
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Tag className="h-4 w-4 mr-2" />
                                    Add Tags
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Selected
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    Delete Selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Customer Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedCustomers.length === customers.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" className="h-auto p-0 font-semibold hover:bg-transparent">
                                    Customer
                                    <ArrowUpDown className="h-4 w-4 ml-2" />
                                </Button>
                            </TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead className="text-right">
                                <Button variant="ghost" className="h-auto p-0 font-semibold hover:bg-transparent">
                                    Total Spent
                                    <ArrowUpDown className="h-4 w-4 ml-2" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">Visits</TableHead>
                            <TableHead>Last Visit</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedCustomers.includes(customer.id)}
                                        onCheckedChange={() => toggleSelect(customer.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                                                {customer.name.split(" ").map((n) => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{customer.name}</p>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[10px] capitalize mt-0.5",
                                                    customer.status === "active" &&
                                                    "border-emerald-200 bg-emerald-50 text-emerald-700",
                                                    customer.status === "inactive" &&
                                                    "border-gray-200 bg-gray-50 text-gray-600",
                                                    customer.status === "lead" &&
                                                    "border-blue-200 bg-blue-50 text-blue-700"
                                                )}
                                            >
                                                {customer.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <p className="flex items-center gap-1.5">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            {customer.phone}
                                        </p>
                                        {customer.email && (
                                            <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                <Mail className="h-3 w-3" />
                                                {customer.email}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {customer.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {customer.tags.length === 0 && (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ₹{customer.totalSpent.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-center">{customer.totalVisits}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {customer.lastVisit}
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
                                            <DropdownMenuItem>
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Send Message
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Create Booking
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Create Invoice
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
