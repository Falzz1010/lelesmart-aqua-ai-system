import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Fish, 
  Droplets, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Activity,
  Thermometer,
  Eye
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeFeedingSchedules, useRealtimeHealthRecords, useRealtimeWaterQuality } from "@/hooks/useRealtimeData";

const DashboardStats = () => {
  const { ponds, isLoading: pondsLoading } = usePonds();
  const { schedules, loading: schedulesLoading } = useRealtimeFeedingSchedules();
  const { healthRecords, loading: healthLoading } = useRealtimeHealthRecords();
  const { waterQualityLogs, loading: waterLoading } = useRealtimeWaterQuality();

  // Calculate statistics
  const totalPonds = ponds.length;
  const activePonds = ponds.filter(pond => pond.status === 'active').length;
  const totalFish = ponds.reduce((sum, pond) => sum + (pond.fish_count || 0), 0);
  
  // Today's feeding schedules
  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.created_at).toISOString().split('T')[0];
    return scheduleDate === today;
  });
  const pendingFeeds = todaySchedules.filter(schedule => schedule.status === 'pending').length;
  const completedFeeds = todaySchedules.filter(schedule => schedule.status === 'completed').length;

  // Health statistics
  const healthyPonds = ponds.filter(pond => {
    const recentHealthRecord = healthRecords
      .filter(record => record.pond_id === pond.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return !recentHealthRecord || recentHealthRecord.health_status === 'healthy';
  }).length;

  const healthPercentage = totalPonds > 0 ? (healthyPonds / totalPonds) * 100 : 100;

  // Water quality average
  const recentWaterQuality = waterQualityLogs.slice(0, 10);
  const avgTemperature = recentWaterQuality.length > 0 
    ? recentWaterQuality.reduce((sum, log) => sum + (log.temperature || 0), 0) / recentWaterQuality.length 
    : 0;
  const avgPH = recentWaterQuality.length > 0 
    ? recentWaterQuality.reduce((sum, log) => sum + (log.ph_level || 0), 0) / recentWaterQuality.length 
    : 0;

  if (pondsLoading || schedulesLoading || healthLoading || waterLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Ringkasan keseluruhan budidaya ikan lele Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Kolam</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalPonds}</p>
                <p className="text-blue-100 text-sm">{activePonds} aktif</p>
              </div>
              <Fish className="h-10 w-10 sm:h-12 sm:w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Ikan</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalFish.toLocaleString()}</p>
                <p className="text-green-100 text-sm">ekor</p>
              </div>
              <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Jadwal Pakan</p>
                <p className="text-2xl sm:text-3xl font-bold">{pendingFeeds}</p>
                <p className="text-orange-100 text-sm">{completedFeeds} selesai</p>
              </div>
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Kesehatan</p>
                <p className="text-2xl sm:text-3xl font-bold">{healthPercentage.toFixed(0)}%</p>
                <p className="text-purple-100 text-sm">sehat</p>
              </div>
              <Droplets className="h-10 w-10 sm:h-12 sm:w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Jadwal Pakan Hari Ini</span>
            </CardTitle>
            <CardDescription>Pemberian pakan yang harus dilakukan</CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada jadwal pakan hari ini</p>
            ) : (
              <div className="space-y-3">
                {todaySchedules.slice(0, 3).map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{schedule.ponds?.name || 'Kolam'}</p>
                      <p className="text-sm text-gray-600 truncate">{schedule.feed_amount_kg}kg - {schedule.feed_type}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-medium">{schedule.feeding_time}</p>
                      <Badge variant={schedule.status === 'completed' ? 'default' : 'secondary'}>
                        {schedule.status === 'completed' ? 'Selesai' : 'Menunggu'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {todaySchedules.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{todaySchedules.length - 3} jadwal lainnya
                  </p>
                )}
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
              {healthRecords.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Catatan Terbaru:</h4>
                  {healthRecords.slice(0, 2).map((record) => (
                    <div key={record.id} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <span className="font-medium truncate flex-1">{record.ponds?.name || 'Kolam'}</span>
                        <Badge 
                          variant={record.health_status === 'healthy' ? 'default' : 'destructive'}
                          className="text-xs ml-2 flex-shrink-0"
                        >
                          {record.health_status === 'healthy' ? 'Sehat' : 
                           record.health_status === 'sick' ? 'Sakit' : 'Kritis'}
                        </Badge>
                      </div>
                      {record.symptoms && (
                        <p className="text-gray-600 mt-1 truncate">{record.symptoms}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Belum ada catatan kesehatan
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Water Quality Overview */}
      {recentWaterQuality.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              <span>Kualitas Air Terkini</span>
            </CardTitle>
            <CardDescription>Rata-rata parameter kualitas air dari semua kolam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50/50 rounded-lg">
                <Thermometer className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{avgTemperature.toFixed(1)}°C</p>
                <p className="text-sm text-gray-600">Suhu Rata-rata</p>
              </div>
              <div className="text-center p-4 bg-green-50/50 rounded-lg">
                <Eye className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{avgPH.toFixed(1)}</p>
                <p className="text-sm text-gray-600">pH Rata-rata</p>
              </div>
              <div className="text-center p-4 bg-purple-50/50 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{recentWaterQuality.length}</p>
                <p className="text-sm text-gray-600">Log Terbaru</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Tindakan yang mungkin perlu dilakukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingFeeds > 0 && (
              <div className="p-3 bg-orange-50/50 rounded-lg border-l-4 border-orange-400">
                <h4 className="font-medium text-orange-800 mb-1">🍽️ Jadwal Pakan Tertunda</h4>
                <p className="text-sm text-orange-700">
                  {pendingFeeds} jadwal pakan belum diselesaikan hari ini
                </p>
              </div>
            )}
            
            {healthyPonds < totalPonds && (
              <div className="p-3 bg-red-50/50 rounded-lg border-l-4 border-red-400">
                <h4 className="font-medium text-red-800 mb-1">🏥 Perhatian Kesehatan</h4>
                <p className="text-sm text-red-700">
                  {totalPonds - healthyPonds} kolam memerlukan perhatian kesehatan
                </p>
              </div>
            )}

            {totalPonds === 0 && (
              <div className="p-3 bg-blue-50/50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-800 mb-1">🏊 Mulai Budidaya</h4>
                <p className="text-sm text-blue-700">
                  Tambahkan kolam pertama Anda untuk memulai monitoring
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
