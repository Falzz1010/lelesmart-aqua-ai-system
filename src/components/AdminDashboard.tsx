
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
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { ponds } = usePonds();
  const { feedingSchedules, healthRecords, isLoading } = useRealtimeData();
  const [systemStatus, setSystemStatus] = useState({
    database: false,
    realtime: false,
    aiAnalysis: false
  });

  useEffect(() => {
    // Check database connection
    const checkDatabaseStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        setSystemStatus(prev => ({ 
          ...prev, 
          database: !error,
          aiAnalysis: !error 
        }));
      } catch (err) {
        console.error('Database connection error:', err);
        setSystemStatus(prev => ({ 
          ...prev, 
          database: false,
          aiAnalysis: false 
        }));
      }
    };

    // Check realtime connection
    const checkRealtimeStatus = () => {
      const channel = supabase
        .channel('admin_test')
        .on('presence', { event: 'sync' }, () => {
          setSystemStatus(prev => ({ ...prev, realtime: true }));
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setSystemStatus(prev => ({ ...prev, realtime: true }));
          }
        });

      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 5000);
    };

    checkDatabaseStatus();
    checkRealtimeStatus();
  }, []);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Memuat dashboard admin...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* System Status Alert */}
      {(!systemStatus.database || !systemStatus.realtime) && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                {!systemStatus.database && "Database tidak terhubung. "}
                {!systemStatus.realtime && "Realtime sync bermasalah. "}
                Periksa koneksi sistem.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-red-100/50 dark:border-gray-700/50">
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
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-red-100/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span>Status Sistem</span>
            </CardTitle>
            <CardDescription>Monitoring real-time seluruh sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${systemStatus.database ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Database Connection</span>
                </div>
                <Badge variant="outline" className={`${systemStatus.database ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'}`}>
                  {systemStatus.database ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${systemStatus.realtime ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Realtime Sync</span>
                </div>
                <Badge variant="outline" className={`${systemStatus.realtime ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'}`}>
                  {systemStatus.realtime ? 'Connected' : 'Syncing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${systemStatus.aiAnalysis ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI Analysis</span>
                </div>
                <Badge variant="outline" className={`${systemStatus.aiAnalysis ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'}`}>
                  {systemStatus.aiAnalysis ? 'Ready' : 'Offline'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-red-100/50 dark:border-gray-700/50">
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
              {!systemStatus.database && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                      Database tidak terhubung - Periksa koneksi
                    </span>
                  </div>
                </div>
              )}
              {criticalHealthIssues === 0 && pendingFeedings === 0 && systemStatus.database && systemStatus.realtime && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
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
