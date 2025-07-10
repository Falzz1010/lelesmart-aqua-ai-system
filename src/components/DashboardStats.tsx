
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Fish, 
  Droplets, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Activity
} from "lucide-react";
import { useRealtimePonds, useRealtimeFeedingSchedules, useRealtimeHealthRecords } from "@/hooks/useRealtimeData";

const DashboardStats = () => {
  const { ponds, loading: pondsLoading } = useRealtimePonds();
  const { schedules, loading: schedulesLoading } = useRealtimeFeedingSchedules();
  const { healthRecords, loading: healthLoading } = useRealtimeHealthRecords();

  // Calculate statistics
  const totalPonds = ponds.length;
  const activePonds = ponds.filter(pond => pond.status === 'active').length;
  const totalFish = ponds.reduce((sum, pond) => sum + (pond.fish_count || 0), 0);
  const pendingFeeds = schedules.filter(schedule => schedule.status === 'pending').length;
  const healthyPonds = ponds.filter(pond => {
    const recentHealthRecord = healthRecords
      .filter(record => record.pond_id === pond.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return !recentHealthRecord || recentHealthRecord.health_status === 'healthy';
  }).length;

  const healthPercentage = totalPonds > 0 ? (healthyPonds / totalPonds) * 100 : 100;

  if (pondsLoading || schedulesLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Ringkasan keseluruhan budidaya ikan lele Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Kolam</p>
                <p className="text-3xl font-bold">{totalPonds}</p>
                <p className="text-blue-100 text-sm">{activePonds} aktif</p>
              </div>
              <Fish className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Ikan</p>
                <p className="text-3xl font-bold">{totalFish.toLocaleString()}</p>
                <p className="text-green-100 text-sm">ekor</p>
              </div>
              <Activity className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Jadwal Pakan</p>
                <p className="text-3xl font-bold">{pendingFeeds}</p>
                <p className="text-orange-100 text-sm">menunggu</p>
              </div>
              <Calendar className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Kesehatan</p>
                <p className="text-3xl font-bold">{healthPercentage.toFixed(0)}%</p>
                <p className="text-purple-100 text-sm">sehat</p>
              </div>
              <Droplets className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Jadwal Pakan Hari Ini</span>
            </CardTitle>
            <CardDescription>Pemberian pakan yang harus dilakukan</CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada jadwal pakan</p>
            ) : (
              <div className="space-y-3">
                {schedules.slice(0, 3).map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{schedule.ponds?.name || 'Kolam'}</p>
                      <p className="text-sm text-gray-600">{schedule.feed_amount_kg}kg - {schedule.feed_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{schedule.feeding_time}</p>
                      <Badge variant={schedule.status === 'completed' ? 'default' : 'secondary'}>
                        {schedule.status === 'completed' ? 'Selesai' : 'Menunggu'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>Status Kesehatan</span>
            </CardTitle>
            <CardDescription>Kondisi kesehatan kolam budidaya</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Kolam Sehat</span>
                  <span>{healthyPonds}/{totalPonds}</span>
                </div>
                <Progress value={healthPercentage} className="h-2" />
              </div>
              {healthRecords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Catatan Terbaru:</h4>
                  {healthRecords.slice(0, 2).map((record) => (
                    <div key={record.id} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span>{record.ponds?.name || 'Kolam'}</span>
                        <Badge 
                          variant={record.health_status === 'healthy' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {record.health_status === 'healthy' ? 'Sehat' : 
                           record.health_status === 'sick' ? 'Sakit' : 'Kritis'}
                        </Badge>
                      </div>
                      {record.symptoms && (
                        <p className="text-gray-600 mt-1">{record.symptoms}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
