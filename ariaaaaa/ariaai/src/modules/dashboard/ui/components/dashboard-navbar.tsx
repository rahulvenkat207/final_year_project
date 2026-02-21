"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft, Search, Bell, Command, Settings } from "lucide-react";
import { DashboardCommand } from "./dashboard-command";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key?.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />

      <header className={cn(
        "sticky top-0 z-50 flex items-center justify-between px-6 h-20 transition-all duration-300",
        scrolled ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50" : "bg-transparent"
      )}>
        <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border-none"
            >
                <PanelLeft className="h-5 w-5 text-zinc-500" />
            </Button>
            
            <div className="hidden md:block h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2" />

            <div className="hidden md:flex items-center text-sm font-medium text-zinc-400 gap-2">
                <span className="hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors px-2">Workspace</span>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                <span className="text-zinc-900 dark:text-zinc-100 px-2 font-bold tracking-tight">Main Hub</span>
            </div>
        </div>

        <div className="flex items-center gap-3">
             {/* Integrated Search Bar */}
            <button
              className="flex items-center gap-3 px-4 h-11 w-40 lg:w-64 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-900 transition-all group"
              onClick={() => setCommandOpen((open) => !open)}
            >
              <Search className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">Quick Find...</span>
              <div className="ml-auto flex items-center gap-1 opacity-50">
                 <Command className="w-3 h-3" />
                 <span className="text-[10px] font-black">K</span>
              </div>
            </button>

            <div className="block h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 relative">
                    <Bell className="h-5 w-5 text-zinc-500" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-white dark:border-zinc-950" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900">
                    <Settings className="h-5 w-5 text-zinc-500" />
                </Button>
            </div>
        </div>
      </header>
    </>
  );
};
