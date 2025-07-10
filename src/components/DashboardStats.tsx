
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Fish, 
  Droplets, 
  Thermometer, 
  TrendingUp, 
  AlertTriangle, 
  Activity
} from "lucide-react";
import { useRealtimePonds, useRealtimeFeedingSchedules, useRealtimeHealthRecords } from "@/hooks/useRealtimeData";

const DashboardStats = () => {
  const { ponds, loading: pondsLoading } = useRealtimePonds();
  const { schedules, loading: schedulesLoading } = useRealtimeFeedingSchedules();
  const { healthRecords, loading: healthLoading } = useRealtimeHealthRecords();

  if (pondsLoading || schedulesLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalFish = ponds.reduce((sum, pond) => sum + (pond.fish_count || 0), 0);
  const activePonds = ponds.filter(pond => pond.status === 'active').length;
  const pendingFeedings = schedules.filter(schedule => schedule.status === 'pending').length;
  const criticalHealth = healthRecords.filter(record => record.health_status === 'critical').length;

  const stats = [
    {
      title: "Total Ikan",
      value: totalFish.toLocaleString(),
      change: "+12%",
      icon: Fish,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Kolam Aktif", 
      value: activePonds,
      change: "Stabil",
      icon: Droplets,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      title: "Jadwal Pakan",
      value: pendingFeedings,
      change: "Hari ini",
      icon: Activity,
      color: "text-green-600", 
      bgColor: "bg-green-50"
    },
    {
      title: "Alert Kesehatan",
      value: criticalHealth,
      change: criticalHealth > 0 ? "Perlu perhatian" : "Normal",
      icon: AlertTriangle,
      color: criticalHealth > 0 ? "text-red-600" : "text-gray-600",
      bgColor: criticalHealth > 0 ? "bg-red-50" : "bg-gray-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Monitoring realtime sistem budidaya lele</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-blue-100/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Ponds */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fish className="h-5 w-5 text-blue-600" />
            <span>Status Kolam Terkini</span>
          </CardTitle>
          <CardDescription>Monitoring kondisi kolam secara realtime</CardDescription>
        </CardHeader>
        <CardContent>
          {ponds.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada data kolam. Silakan tambah kolam baru.</p>
          ) : (
            <div className="space-y-4">
              {ponds.slice(0, 5).map((pond) => (
                <div key={pond.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">{pond.name}</h4>
                    <p className="text-sm text-gray-600">
                      {pond.fish_count} ekor • {pond.fish_age_days} hari • {pond.size_m2}m²
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={pond.status === 'active' ? 'default' : 'secondary'}
                      className={pond.status === 'active' ? 'bg-green-500' : ''}
                    >
                      {pond.status === 'active' ? 'Aktif' : 'Maintenance'}
                    </Badge>
                    {pond.water_temperature && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Thermometer className="h-3 w-3" />
                        <span>{pond.water_temperature}°C</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle>Jadwal Pakan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="text-gray-500">Belum ada jadwal pakan</p>
            ) : (
              <div className="space-y-3">
                {schedules.slice(0, 3).map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{schedule.ponds?.name}</p>
                      <p className="text-sm text-gray-600">{schedule.feed_amount_kg}kg • {schedule.feed_type}</p>
                    </div>
                    <Badge variant={schedule.status === 'completed' ? 'default' : 'secondary'}>
                      {schedule.status === 'completed' ? 'Selesai' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle>Kesehatan Ikan</CardTitle>
          </CardHeader>
          <CardContent>
            {healthRecords.length === 0 ? (
              <p className="text-gray-500">Belum ada record kesehatan</p>
            ) : (
              <div className="space-y-3">
                {healthRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{record.ponds?.name}</p>
                      <p className="text-sm text-gray-600">{record.symptoms || 'Pemeriksaan rutin'}</p>
                    </div>
                    <Badge 
                      variant={record.health_status === 'healthy' ? 'default' : 'destructive'}
                      className={record.health_status === 'healthy' ? 'bg-green-500' : ''}
                    >
                      {record.health_status === 'healthy' ? 'Sehat' : 
                       record.health_status === 'sick' ? 'Sakit' : 'Kritis'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
