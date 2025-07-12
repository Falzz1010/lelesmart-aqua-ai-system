
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Activity,
  Database,
  TrendingUp,
  Fish,
  Heart,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeData } from "@/hooks/useRealtimeData";

const AdminDashboard = () => {
  const { ponds } = usePonds();
  const { feedingSchedules, healthRecords } = useRealtimeData();

  // Calculate admin statistics
  const totalPonds = ponds?.length || 0;
  const activePonds = ponds?.filter(pond => pond.status === 'active').length || 0;
  const totalFish = ponds?.reduce((sum, pond) => sum + (pond.fish_count || 0), 0) || 0;
  const totalFeedingSchedules = feedingSchedules?.length || 0;
  const pendingFeedings = feedingSchedules?.filter(schedule => schedule.status === 'pending').length || 0;
  const totalHealthRecords = healthRecords?.length || 0;
  const criticalHealthIssues = healthRecords?.filter(record => record.health_status === 'critical').length || 0;

  const stats = [
    {
      title: "Total Kolam",
      value: totalPonds,
      description: `${activePonds} aktif`,
      icon: Fish,
      color: "bg-blue-500"
    },
    {
      title: "Total Ikan",
      value: totalFish.toLocaleString(),
      description: "Seluruh sistem",
      icon: Activity,
      color: "bg-green-500"
    },
    {
      title: "Jadwal Pakan",
      value: totalFeedingSchedules,
      description: `${pendingFeedings} pending`,
      icon: Calendar,
      color: "bg-yellow-500"
    },
    {
      title: "Kesehatan Ikan",
      value: totalHealthRecords,
      description: `${criticalHealthIssues} kritis`,
      icon: Heart,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Kelola seluruh sistem budidaya lele</p>
        </div>
        <Badge variant="outline" className="w-fit bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
          <Users className="h-3 w-3 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-100/50 dark:border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{stat.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-100/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Status Sistem</span>
            </CardTitle>
            <CardDescription>Monitoring real-time seluruh kolam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Database Online</span>
                </div>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  Aktif
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Realtime Sync</span>
                </div>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI Analysis</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  Ready
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-100/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span>Peringatan</span>
            </CardTitle>
            <CardDescription>Alert dan notifikasi penting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalHealthIssues > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                      {criticalHealthIssues} kolam dengan masalah kesehatan kritis
                    </span>
                  </div>
                </div>
              )}
              {pendingFeedings > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      {pendingFeedings} jadwal pemberian pakan tertunda
                    </span>
                  </div>
                </div>
              )}
              {criticalHealthIssues === 0 && pendingFeedings === 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Sistem berjalan normal
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
