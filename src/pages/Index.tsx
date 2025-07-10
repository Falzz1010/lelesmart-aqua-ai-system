
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import DashboardStats from "@/components/DashboardStats";
import PondManagement from "@/components/PondManagement";
import FeedRecommendations from "@/components/FeedRecommendations";
import HealthDetection from "@/components/HealthDetection";
import GrowthPredictions from "@/components/GrowthPredictions";
import UserManagement from "@/components/UserManagement";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats />;
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
      default:
        return <DashboardStats />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <SidebarInset className="flex-1">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 border-b border-blue-100/50 bg-white/80 backdrop-blur-md lg:hidden">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger className="mr-2" />
              <h1 className="font-semibold">LeleSmart</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
