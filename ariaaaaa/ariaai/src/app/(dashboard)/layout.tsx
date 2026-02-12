import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashBoardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <DashBoardSidebar />
      <SidebarInset>
        <DashboardNavbar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;