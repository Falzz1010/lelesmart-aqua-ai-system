
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Fish, 
  BarChart3,
  Users,
  Calendar,
  Camera,
  TrendingUp,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "ponds", label: "Manajemen Kolam", icon: Fish },
  { id: "feed", label: "Rekomendasi Pakan", icon: Calendar },
  { id: "health", label: "Deteksi Kesehatan", icon: Camera },
  { id: "predictions", label: "Prediksi Panen", icon: TrendingUp },
  { id: "users", label: "Pengguna", icon: Users },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-border/50 bg-card/95 backdrop-blur-sm">
      <SidebarHeader className="p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Fish className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent truncate">
                LeleSmart
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Sistem Cerdas Budidaya
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 sm:px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm text-muted-foreground">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start h-9 sm:h-10 text-sm px-2 sm:px-3 hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="truncate text-xs sm:text-sm ml-2 sm:ml-3">
                          {item.label}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-xs sm:text-sm text-muted-foreground">Status Sistem</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2 px-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-foreground truncate">Database Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-foreground truncate">Realtime Aktif</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-foreground truncate">AI Standby</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 sm:p-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-primary border-primary/20 mb-1 text-xs">
                Peternak
              </Badge>
              <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">Selamat datang kembali</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
