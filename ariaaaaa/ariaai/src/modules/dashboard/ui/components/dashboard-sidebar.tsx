"use client";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  Video, 
  LayoutDashboard, 
  Sparkles, 
  Zap,
  ChevronRight,
  Plus
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardUserButton } from "./dashboart-user-button";
import { Badge } from "@/components/ui/badge";

const firstSection = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Video,
    label: "Meetings",
    href: "/meetings",
  },
  {
    icon: Bot,
    label: "Agents",
    href: "/agents",
  },
];


export const DashBoardSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
      {/* Header */}
      <SidebarHeader className="p-8 pb-4">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="h-12 w-12 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500 bg-zinc-900">
            <Image 
                src="/logo.svg" 
                height={28} 
                width={28} 
                alt="Aria.AI" 
                className="brightness-0 invert opacity-100"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-2xl font-black tracking-tighter text-white uppercase leading-tight">Aria<span className="text-primary/90 italic">.AI</span></p>
            <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] -mt-1 opacity-80">Intelligence Hub</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="flex-1 px-4 py-6 space-y-8">
        
        {/* Quick Action */}
        <div className="px-2">
            <Link href="/meetings">
                <button className="w-full flex items-center justify-center gap-2 premium-gradient h-11 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    New Session
                </button>
            </Link>
        </div>

        {/* Navigation Group */}
        <SidebarGroup>
          <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Navspace</p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-12 px-4 rounded-2xl transition-all duration-200 border border-transparent font-medium",
                      pathname === item.href 
                        ? "bg-indigo-50 dark:bg-indigo-950/30 text-primary border-indigo-100 dark:border-indigo-900/50" 
                        : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("size-5", pathname === item.href ? "text-primary" : "text-zinc-400")} />
                        <span className="text-sm font-bold uppercase tracking-tight">
                            {item.label}
                        </span>
                      </div>
                      {pathname === item.href && <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow shadow-primary" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {/* Pro Banner */}
        <div className="px-4">
            <div className="bg-zinc-900 dark:bg-zinc-900 rounded-3xl p-5 border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <Zap className="w-16 h-16 fill-indigo-500 text-indigo-500" />
                 </div>
                 <Badge className="bg-indigo-600 border-none text-[8px] font-black uppercase tracking-widest rounded-full mb-3">Enterprise</Badge>
                 <p className="text-white text-xs font-bold leading-tight mb-4">Unlock Aria Intelligence Cloud for your team.</p>
                 <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-300 transition-colors">
                    Learn More <ChevronRight className="w-3 h-3" />
                 </button>
            </div>
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-6 border-t border-zinc-100 dark:border-zinc-900">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};