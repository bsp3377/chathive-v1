"use client";

import {
    Building2,
    MessageSquare,
    Brain,
    Bell,
    Users,
    Shield,
    Palette,
    Globe,
    Save,
    Upload,
    ExternalLink,
    Smartphone,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your organization and app preferences
                </p>
            </div>

            <Tabs defaultValue="organization" className="space-y-6">
                <TabsList className="grid w-full max-w-xl grid-cols-5">
                    <TabsTrigger value="organization">
                        <Building2 className="h-4 w-4 mr-2 hidden sm:inline" />
                        Organization
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp">
                        <MessageSquare className="h-4 w-4 mr-2 hidden sm:inline" />
                        WhatsApp
                    </TabsTrigger>
                    <TabsTrigger value="ai">
                        <Brain className="h-4 w-4 mr-2 hidden sm:inline" />
                        AI
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2 hidden sm:inline" />
                        Alerts
                    </TabsTrigger>
                    <TabsTrigger value="team">
                        <Users className="h-4 w-4 mr-2 hidden sm:inline" />
                        Team
                    </TabsTrigger>
                </TabsList>

                {/* Organization Settings */}
                <TabsContent value="organization" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                            <CardDescription>
                                Update your business details shown to customers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                                        G
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                                    >
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Business Name</Label>
                                            <Input defaultValue="Glow Salon & Spa" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Business Type</Label>
                                            <Select defaultValue="salon">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="salon">Salon & Spa</SelectItem>
                                                    <SelectItem value="clinic">Clinic</SelectItem>
                                                    <SelectItem value="gym">Gym & Fitness</SelectItem>
                                                    <SelectItem value="restaurant">Restaurant</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Business Description</Label>
                                        <Textarea
                                            placeholder="Tell customers about your business..."
                                            defaultValue="Premium salon and spa services in the heart of the city. We offer expert hair care, skincare, and relaxation treatments."
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input defaultValue="+91 98765 00000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input defaultValue="hello@glowsalon.in" type="email" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea
                                    defaultValue="123 MG Road, Koramangala, Bangalore, Karnataka 560034"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <Select defaultValue="asia-kolkata">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asia-kolkata">
                                                Asia/Kolkata (IST)
                                            </SelectItem>
                                            <SelectItem value="asia-dubai">
                                                Asia/Dubai (GST)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select defaultValue="inr">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="inr">₹ INR</SelectItem>
                                            <SelectItem value="usd">$ USD</SelectItem>
                                            <SelectItem value="aed">د.إ AED</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* WhatsApp Settings */}
                <TabsContent value="whatsapp" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-emerald-600" />
                                WhatsApp Business Configuration
                            </CardTitle>
                            <CardDescription>
                                Connect your WhatsApp Business account to receive and send messages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-lg border bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium">WhatsApp Connected</p>
                                        <p className="text-sm text-muted-foreground">
                                            +91 98765 00000 • Glow Salon & Spa
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-600">Active</Badge>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">API Configuration</h4>
                                <div className="space-y-2">
                                    <Label>Phone Number ID</Label>
                                    <Input defaultValue="1234567890123456" readOnly className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp Business Account ID</Label>
                                    <Input defaultValue="9876543210987654" readOnly className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Access Token</Label>
                                    <div className="flex gap-2">
                                        <Input type="password" defaultValue="EAAxxxxxxxxxxxxxxxx" className="flex-1" />
                                        <Button variant="outline">Update</Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Get your access token from{" "}
                                        <a href="#" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
                                            Meta Business Suite <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Webhook Configuration</h4>
                                <div className="space-y-2">
                                    <Label>Webhook URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            readOnly
                                            value="https://chathive.app/api/webhooks/whatsapp/your-org-id"
                                            className="flex-1 bg-muted"
                                        />
                                        <Button variant="outline">Copy</Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Verify Token</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value="chathive_verify_abc123xyz" className="flex-1 bg-muted" />
                                        <Button variant="outline">Copy</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Settings */}
                <TabsContent value="ai" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-violet-600" />
                                AI Auto-Reply Settings
                            </CardTitle>
                            <CardDescription>
                                Configure how the AI responds to customer messages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <p className="font-medium">Enable AI Auto-Reply</p>
                                    <p className="text-sm text-muted-foreground">
                                        AI will automatically respond to customer messages
                                    </p>
                                </div>
                                <input type="checkbox" defaultChecked className="h-5 w-5" />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Daily Usage Limit</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>47 / 100 replies used today</span>
                                            <span className="text-muted-foreground">Resets at midnight</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full w-[47%] rounded-full bg-gradient-to-r from-violet-500 to-purple-600" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Demo version includes 100 AI replies per day. After the limit, manual replies only.
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Response Behavior</h4>
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <div>
                                            <p className="font-medium">Confidence Threshold</p>
                                            <p className="text-sm text-muted-foreground">
                                                Only auto-reply when AI confidence is above this level
                                            </p>
                                        </div>
                                        <Select defaultValue="80">
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="70">70%</SelectItem>
                                                <SelectItem value="80">80%</SelectItem>
                                                <SelectItem value="90">90%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <div>
                                            <p className="font-medium">Business Hours Only</p>
                                            <p className="text-sm text-muted-foreground">
                                                Only enable AI auto-reply during working hours
                                            </p>
                                        </div>
                                        <input type="checkbox" className="h-5 w-5" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <div>
                                            <p className="font-medium">Handle Bookings</p>
                                            <p className="text-sm text-muted-foreground">
                                                Allow AI to create and manage bookings
                                            </p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Knowledge Base</CardTitle>
                            <CardDescription>
                                Add information to help the AI answer customer questions accurately.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card className="p-4 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="text-center">
                                        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-2">
                                            <Upload className="h-5 w-5 text-violet-600" />
                                        </div>
                                        <p className="font-medium text-sm">Upload Documents</p>
                                        <p className="text-xs text-muted-foreground">PDF, DOC, TXT</p>
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">8</Badge>
                                        <div>
                                            <p className="font-medium text-sm">Services & Pricing</p>
                                            <p className="text-xs text-muted-foreground">Last updated 2d ago</p>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">12</Badge>
                                        <div>
                                            <p className="font-medium text-sm">FAQs</p>
                                            <p className="text-xs text-muted-foreground">Last updated 1w ago</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <Button variant="outline" className="w-full">
                                Manage Knowledge Base
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose how you want to be notified about important events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { title: "New Messages", desc: "When a customer sends a new message" },
                                { title: "New Bookings", desc: "When a new booking is created" },
                                { title: "Booking Reminders", desc: "Reminder before scheduled appointments" },
                                { title: "AI Limit Warning", desc: "When approaching daily AI reply limit" },
                                { title: "Payment Received", desc: "When invoice is marked as paid" },
                            ].map((item) => (
                                <div key={item.title} className="flex items-center justify-between p-4 rounded-lg border">
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <input type="checkbox" defaultChecked className="h-5 w-5" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team */}
                <TabsContent value="team" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage staff access to your ChatHive dashboard. Demo limit: 10 members.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    3 of 10 seats used
                                </div>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                    Invite Member
                                </Button>
                            </div>

                            {[
                                { name: "John Doe", email: "john@glowsalon.in", role: "Owner" },
                                { name: "Sunita Rao", email: "sunita@glowsalon.in", role: "Manager" },
                                { name: "Raj Kumar", email: "raj@glowsalon.in", role: "Staff" },
                            ].map((member) => (
                                <div key={member.email} className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
                                            {member.name.split(" ").map((n) => n[0]).join("")}
                                        </div>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{member.role}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
