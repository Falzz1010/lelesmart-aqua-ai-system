
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import DashboardStats from "@/components/DashboardStats";
import AdminDashboard from "@/components/AdminDashboard";
import PondManagement from "@/components/PondManagement";
import FeedRecommendations from "@/components/FeedRecommendations";
import HealthDetection from "@/components/HealthDetection";
import GrowthPredictions from "@/components/GrowthPredictions";
import UserManagement from "@/components/UserManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  const { profile, loading } = useProfile(user);

  // Reset active tab when switching between admin and user
  useEffect(() => {
    setActiveTab("dashboard");
  }, [profile?.role]);

  const renderContent = () => {
    const isAdmin = profile?.role === 'admin';
    
    switch (activeTab) {
      case "dashboard":
        return isAdmin ? <AdminDashboard /> : <DashboardStats />;
      case "ponds":
        return <PondManagement />;
      case "feed":
        return <FeedRecommendations />;
      case "health":
        return <HealthDetection />;
      case "predictions":
        return <GrowthPredictions />;
      case "users":
        return <UserManagement />;
      case "system":
        return isAdmin ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pengaturan Sistem</h2>
            <p className="text-gray-600">Fitur pengaturan sistem akan segera hadir.</p>
          </div>
        ) : <DashboardStats />;
      default:
        return isAdmin ? <AdminDashboard /> : <DashboardStats />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';
  const SidebarComponent = isAdmin ? AdminSidebar : AppSidebar;
  const bgGradient = isAdmin 
    ? "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"
    : "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={`min-h-screen w-full flex ${bgGradient}`}>
        <SidebarComponent activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className={`sticky top-0 z-40 border-b ${isAdmin ? 'border-red-100/50 bg-red-50/95' : 'border-blue-100/50 bg-white/95'} backdrop-blur-md lg:hidden`}>
            <div className="flex h-12 sm:h-14 items-center px-3 sm:px-4">
              <SidebarTrigger className="mr-2" />
              <h1 className="font-semibold text-sm sm:text-base truncate">
                {isAdmin ? 'LeleSmart Admin' : 'LeleSmart'}
              </h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-hidden">
            <div className="mx-auto max-w-7xl h-full">
              <div className="h-full overflow-auto">
                {renderContent()}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
