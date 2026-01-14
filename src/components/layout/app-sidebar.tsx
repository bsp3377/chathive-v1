"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Users,
  Calendar,
  FileText,
  Settings,
  LayoutDashboard,
  Inbox,
  Bell,
  Brain,
  ChevronDown,
  LogOut,
  Building2,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
    badge: 12,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Calendar,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileText,
  },
];

const secondaryNavItems = [
  {
    title: "Knowledge Base",
    url: "/knowledge-base",
    icon: Brain,
  },
  {
    title: "Reminders",
    url: "/reminders",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

function AIUsageCounter() {
  const used = 47;
  const limit = 100;
  const percentage = (used / limit) * 100;
  
  const getColor = () => {
    if (percentage <= 50) return "bg-emerald-500";
    if (percentage <= 80) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="px-3 py-2 mx-2 rounded-lg bg-sidebar-accent/50">
      <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70 mb-1">
        <Sparkles className="h-3 w-3" />
        <span>AI Replies Today</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-sidebar-foreground">
          {used}/{limit}
        </span>
        <span className="text-xs text-sidebar-foreground/60">
          {limit - used} left
        </span>
      </div>
      <div className="h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-sidebar-foreground">
                  ChatHive
                </span>
                <span className="text-xs text-sidebar-foreground/60">
                  WhatsApp CRM
                </span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="py-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider px-3">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        className="mx-2 rounded-lg"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant="default"
                              className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5 min-w-5 flex items-center justify-center"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider px-3">
                Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        className="mx-2 rounded-lg"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto pt-4">
              <AIUsageCounter />
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user.jpg" />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                      John Doe
                    </span>
                    <span className="text-xs text-sidebar-foreground/60 truncate w-full">
                      Glow Salon & Spa
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4" />
                  Organization Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>WhatsApp Connected</span>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
