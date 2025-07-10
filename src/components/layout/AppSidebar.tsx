
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/" },
  { id: "ponds", label: "Manajemen Kolam", icon: Fish, path: "/ponds" },
  { id: "feed", label: "Rekomendasi Pakan", icon: Calendar, path: "/feed" },
  { id: "health", label: "Deteksi Kesehatan", icon: Camera, path: "/health" },
  { id: "predictions", label: "Prediksi Panen", icon: TrendingUp, path: "/predictions" },
  { id: "users", label: "Pengguna", icon: Users, path: "/users" },
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
    <Sidebar className="border-r border-blue-100/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Fish className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent truncate">
                LeleSmart
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Sistem Cerdas Budidaya</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      isActive={activeTab === item.id}
                      className="w-full justify-start"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Status Sistem</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-3 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Database Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Realtime Aktif</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">AI Standby</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3">
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="text-blue-600 border-blue-200 mb-1">
                  Peternak
                </Badge>
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 truncate">Selamat datang kembali</p>
              </div>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="text-gray-600 hover:text-red-600 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
