"use client";

import { useState } from "react";
import {
    Search,
    Plus,
    MoreHorizontal,
    Filter,
    Download,
    Send,
    Eye,
    FileText,
    ChevronDown,
    CheckCircle,
    Clock,
    AlertCircle,
    IndianRupee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const invoices = [
    {
        id: 1,
        invoiceNo: "INV-2026-001",
        customer: "Priya Sharma",
        phone: "+91 98765 43210",
        date: "Jan 14, 2026",
        dueDate: "Jan 21, 2026",
        amount: 4500,
        status: "paid",
        items: ["Hair Color", "Hair Cut"],
    },
    {
        id: 2,
        invoiceNo: "INV-2026-002",
        customer: "Rahul Verma",
        phone: "+91 87654 32109",
        date: "Jan 14, 2026",
        dueDate: "Jan 21, 2026",
        amount: 800,
        status: "pending",
        items: ["Beard Trim"],
    },
    {
        id: 3,
        invoiceNo: "INV-2026-003",
        customer: "Meera Patel",
        phone: "+91 54321 09876",
        date: "Jan 13, 2026",
        dueDate: "Jan 20, 2026",
        amount: 2800,
        status: "paid",
        items: ["Facial", "Manicure"],
    },
    {
        id: 4,
        invoiceNo: "INV-2026-004",
        customer: "Kavita Reddy",
        phone: "+91 32109 87654",
        date: "Jan 12, 2026",
        dueDate: "Jan 19, 2026",
        amount: 3500,
        status: "overdue",
        items: ["Full Body Massage"],
    },
    {
        id: 5,
        invoiceNo: "INV-2026-005",
        customer: "Arjun Nair",
        phone: "+91 21098 76543",
        date: "Jan 10, 2026",
        dueDate: "Jan 17, 2026",
        amount: 1200,
        status: "paid",
        items: ["Hair Cut"],
    },
];

const stats = [
    {
        title: "Total Revenue",
        value: "₹1,24,500",
        subtext: "This month",
        icon: IndianRupee,
        color: "bg-emerald-100 text-emerald-600",
    },
    {
        title: "Paid",
        value: "₹98,200",
        subtext: "42 invoices",
        icon: CheckCircle,
        color: "bg-emerald-100 text-emerald-600",
    },
    {
        title: "Pending",
        value: "₹18,800",
        subtext: "8 invoices",
        icon: Clock,
        color: "bg-amber-100 text-amber-600",
    },
    {
        title: "Overdue",
        value: "₹7,500",
        subtext: "3 invoices",
        icon: AlertCircle,
        color: "bg-red-100 text-red-600",
    },
];

const services = [
    { name: "Hair Cut", price: 500 },
    { name: "Hair Color", price: 1500 },
    { name: "Beard Trim", price: 200 },
    { name: "Facial", price: 800 },
    { name: "Full Body Massage", price: 1500 },
    { name: "Manicure", price: 400 },
    { name: "Pedicure", price: 500 },
];

export default function InvoicesPage() {
    const [filter, setFilter] = useState("all");

    const filteredInvoices =
        filter === "all"
            ? invoices
            : invoices.filter((inv) => inv.status === filter);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">
                        Create and manage customer invoices
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create New Invoice</DialogTitle>
                                <DialogDescription>
                                    Generate an invoice for a customer.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                        <Label>Due Date</Label>
                                        <Input type="date" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Services</Label>
                                    <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                                        {services.map((service) => (
                                            <div
                                                key={service.name}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="rounded" />
                                                    <span>{service.name}</span>
                                                </label>
                                                <span className="text-muted-foreground">
                                                    ₹{service.price}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Discount (%)</Label>
                                        <Input type="number" placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tax (%)</Label>
                                        <Input type="number" placeholder="18" defaultValue="18" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total</Label>
                                        <Input value="₹0.00" readOnly className="bg-muted" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes (Optional)</Label>
                                    <Textarea placeholder="Payment terms, thank you message, etc." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button variant="outline">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    Create & Send
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.subtext}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="paid">Paid</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="overdue">Overdue</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search invoices..." className="pl-9" />
                </div>
            </div>

            {/* Invoice Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{invoice.invoiceNo}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{invoice.customer}</p>
                                        <p className="text-xs text-muted-foreground">{invoice.phone}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {invoice.date}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {invoice.dueDate}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {invoice.items.slice(0, 2).map((item) => (
                                            <Badge key={item} variant="outline" className="text-xs">
                                                {item}
                                            </Badge>
                                        ))}
                                        {invoice.items.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{invoice.items.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ₹{invoice.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "capitalize",
                                            invoice.status === "paid" &&
                                            "border-emerald-500 text-emerald-700 bg-emerald-50",
                                            invoice.status === "pending" &&
                                            "border-amber-500 text-amber-700 bg-amber-50",
                                            invoice.status === "overdue" &&
                                            "border-red-500 text-red-700 bg-red-50"
                                        )}
                                    >
                                        {invoice.status}
                                    </Badge>
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
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Invoice
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send via WhatsApp
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {invoice.status !== "paid" && (
                                                <DropdownMenuItem>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Mark as Paid
                                                </DropdownMenuItem>
                                            )}
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
