"use client";

import {
    Search,
    Plus,
    FileText,
    Link as LinkIcon,
    Upload,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    MessageSquare,
    Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const articles = [
    {
        id: 1,
        title: "Services and Pricing",
        category: "General",
        content: "Our services include hair cuts (₹500), hair color (₹1500-3000), facial (₹800), body massage (₹1500)...",
        chunks: 8,
        lastUpdated: "2 days ago",
    },
    {
        id: 2,
        title: "Opening Hours",
        category: "General",
        content: "We are open Monday to Saturday, 10 AM to 8 PM. Closed on Sundays. Special appointments available...",
        chunks: 3,
        lastUpdated: "1 week ago",
    },
    {
        id: 3,
        title: "Booking Policy",
        category: "Policies",
        content: "Appointments can be booked via WhatsApp or phone. A 24-hour notice is required for cancellations...",
        chunks: 5,
        lastUpdated: "3 days ago",
    },
    {
        id: 4,
        title: "Hair Treatment FAQ",
        category: "FAQs",
        content: "Q: How long does hair coloring take? A: Typically 2-3 hours depending on the style...",
        chunks: 12,
        lastUpdated: "5 days ago",
    },
    {
        id: 5,
        title: "Spa Services",
        category: "Services",
        content: "Our spa services include Swedish massage, deep tissue massage, aromatherapy, hot stone therapy...",
        chunks: 6,
        lastUpdated: "1 week ago",
    },
];

const stats = [
    { title: "Total Articles", value: "24", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { title: "Total Chunks", value: "156", icon: FileText, color: "bg-violet-100 text-violet-600" },
    { title: "AI Queries Today", value: "47", icon: MessageSquare, color: "bg-emerald-100 text-emerald-600" },
    { title: "Accuracy Rate", value: "94%", icon: Sparkles, color: "bg-amber-100 text-amber-600" },
];

const categories = ["All", "General", "Services", "Policies", "FAQs"];

export default function KnowledgeBasePage() {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
                    <p className="text-muted-foreground">
                        Train your AI with business information to answer customer queries accurately.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Article
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add Knowledge Base Article</DialogTitle>
                                <DialogDescription>
                                    Add information that the AI can use to answer customer questions.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input placeholder="e.g., Services and Pricing" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="services">Services</SelectItem>
                                            <SelectItem value="policies">Policies</SelectItem>
                                            <SelectItem value="faqs">FAQs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Textarea
                                        placeholder="Enter detailed information..."
                                        className="min-h-[200px]"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        The AI will automatically chunk this content for optimal retrieval.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    Save Article
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
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upload Section */}
            <Card className="border-dashed">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-semibold mb-1">Upload Documents</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Upload PDF, DOC, or TXT files. The AI will automatically extract and chunk the content.
                            </p>
                            <div className="flex gap-2 justify-center sm:justify-start">
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload File
                                </Button>
                                <Button variant="outline">
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Add URL
                                </Button>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <Badge variant="secondary">PDF</Badge>
                            <Badge variant="secondary">DOC</Badge>
                            <Badge variant="secondary">TXT</Badge>
                            <Badge variant="secondary">URL</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Articles */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <Tabs defaultValue="All" className="w-full sm:w-auto">
                        <TabsList>
                            {categories.map((cat) => (
                                <TabsTrigger key={cat} value={cat}>
                                    {cat}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search articles..." className="pl-9" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                        <Card key={article.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base truncate">{article.title}</CardTitle>
                                        <Badge variant="outline" className="mt-1 text-xs">
                                            {article.category}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {article.content}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {article.chunks} chunks
                                    </span>
                                    <span>Updated {article.lastUpdated}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
