import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  Fish, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Zap,
  Target,
  BarChart3,
  Plus
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeFeedingSchedules } from "@/hooks/useRealtimeData";
import { useToast } from "@/hooks/use-toast";

const FeedRecommendations = () => {
  const { ponds } = usePonds();
  const { schedules, loading, createSchedule, updateScheduleStatus } = useRealtimeFeedingSchedules();
  const { toast } = useToast();
  const [selectedPond, setSelectedPond] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    pond_id: "",
    feeding_time: "",
    feed_amount_kg: 0,
    feed_type: "Pelet Apung",
    status: "pending" as "pending" | "completed"
  });

  const filteredSchedules = selectedPond === "all" 
    ? schedules 
    : schedules.filter(schedule => schedule.pond_id === selectedPond);

  const todaySchedules = filteredSchedules.filter(schedule => {
    const today = new Date().toISOString().split('T')[0];
    const scheduleDate = new Date(schedule.created_at).toISOString().split('T')[0];
    return scheduleDate === today;
  });

  const totalFeedToday = todaySchedules.reduce((sum, schedule) => sum + schedule.feed_amount_kg, 0);
  const completedFeeds = todaySchedules.filter(schedule => schedule.status === 'completed').length;
  const pendingFeeds = todaySchedules.filter(schedule => schedule.status === 'pending').length;
  const efficiency = todaySchedules.length > 0 ? (completedFeeds / todaySchedules.length) * 100 : 0;

  const handleCreateSchedule = async () => {
    if (!newSchedule.pond_id || !newSchedule.feeding_time || newSchedule.feed_amount_kg <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan"
      });
      return;
    }

    try {
      await createSchedule({
        pond_id: newSchedule.pond_id,
        feeding_time: newSchedule.feeding_time,
        feed_amount_kg: newSchedule.feed_amount_kg,
        feed_type: newSchedule.feed_type,
        status: newSchedule.status
      });
      setIsDialogOpen(false);
      setNewSchedule({
        pond_id: "",
        feeding_time: "",
        feed_amount_kg: 0,
        feed_type: "Pelet Apung",
        status: "pending"
      });
      toast({
        title: "Berhasil",
        description: "Jadwal pakan berhasil ditambahkan"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan jadwal pakan"
      });
    }
  };

  const handleMarkCompleted = async (scheduleId: string) => {
    try {
      await updateScheduleStatus(scheduleId, 'completed');
      toast({
        title: "Berhasil",
        description: "Jadwal pakan ditandai selesai"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengupdate status jadwal"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Selesai";
      case "pending": return "Menunggu";
      default: return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Rekomendasi Pakan AI</h2>
          <p className="text-gray-600 mt-1">Jadwal pemberian pakan optimal berdasarkan AI</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPond === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPond("all")}
            className={selectedPond === "all" ? "bg-blue-600" : ""}
          >
            Semua Kolam
          </Button>
          {ponds.map((pond) => (
            <Button
              key={pond.id}
              variant={selectedPond === pond.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPond(pond.id)}
              className={selectedPond === pond.id ? "bg-blue-600" : ""}
            >
              {pond.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Pakan Hari Ini</p>
                <p className="text-2xl font-bold">{totalFeedToday} kg</p>
                <p className="text-blue-100 text-xs">{todaySchedules.length} jadwal</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Selesai</p>
                <p className="text-2xl font-bold">{completedFeeds}</p>
                <p className="text-green-100 text-xs">dari {todaySchedules.length} jadwal</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Efisiensi</p>
                <p className="text-2xl font-bold">{efficiency.toFixed(0)}%</p>
                <p className="text-purple-100 text-xs">hari ini</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Sisa Jadwal</p>
                <p className="text-2xl font-bold">{pendingFeeds}</p>
                <p className="text-orange-100 text-xs">menunggu</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feeding Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Jadwal Pakan Hari Ini</span>
                </CardTitle>
                <CardDescription>Jadwal pemberian pakan real-time</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <DialogTitle>Tambah Jadwal Pakan</DialogTitle>
                    <DialogDescription>
                      Buat jadwal pemberian pakan baru
                    </DialogDescription>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pond">Kolam</Label>
                      <Select value={newSchedule.pond_id} onValueChange={(value) => setNewSchedule({...newSchedule, pond_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kolam" />
                        </SelectTrigger>
                        <SelectContent>
                          {ponds.map((pond) => (
                            <SelectItem key={pond.id} value={pond.id}>
                              {pond.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Waktu Pemberian</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newSchedule.feeding_time}
                        onChange={(e) => setNewSchedule({...newSchedule, feeding_time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Jumlah Pakan (kg)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.1"
                        min="0"
                        value={newSchedule.feed_amount_kg || ''}
                        onChange={(e) => setNewSchedule({...newSchedule, feed_amount_kg: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Jenis Pakan</Label>
                      <Select value={newSchedule.feed_type} onValueChange={(value) => setNewSchedule({...newSchedule, feed_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pelet Apung">Pelet Apung</SelectItem>
                          <SelectItem value="Pelet Tenggelam">Pelet Tenggelam</SelectItem>
                          <SelectItem value="Pakan Alami">Pakan Alami</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleCreateSchedule}>
                        Simpan
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedules.length === 0 ? (
              <div className="text-center py-8">
                <Fish className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada jadwal pakan hari ini</p>
                <p className="text-sm text-gray-400">Tambah jadwal pakan untuk memulai</p>
              </div>
            ) : (
              todaySchedules.map((schedule) => (
                <div key={schedule.id} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(schedule.status)}`}></div>
                        <span className="font-semibold text-gray-800">{schedule.feeding_time}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(schedule.status)}>
                      {getStatusText(schedule.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Kolam:</p>
                      <p className="font-medium">{schedule.ponds?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jumlah:</p>
                      <p className="font-semibold text-lg">{schedule.feed_amount_kg} kg</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Jenis Pakan:</p>
                    <p className="font-medium">{schedule.feed_type}</p>
                  </div>

                  {schedule.status === "pending" && (
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkCompleted(schedule.id)}
                    >
                      Tandai Selesai
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Weekly Performance */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardHeader>
              <CardTitle>Performa Mingguan</CardTitle>
              <CardDescription>Efisiensi pemberian pakan 7 hari terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, index) => {
                  const daySchedules = schedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.created_at);
                    const dayOfWeek = scheduleDate.getDay();
                    return dayOfWeek === (index + 1) % 7;
                  });
                  const completed = daySchedules.filter(s => s.status === 'completed').length;
                  const total = daySchedules.length;
                  const efficiency = total > 0 ? (completed / total) * 100 : 0;
                  
                  return (
                    <div key={day} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium w-8">{day}</span>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{completed}/{total}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={efficiency} className="w-20" />
                        <span className="text-sm font-medium w-8">{efficiency.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Insight AI</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50/50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium text-green-800 mb-1">👍 Performa Baik</h4>
                <p className="text-sm text-green-700">
                  Efisiensi pemberian pakan mencapai {efficiency.toFixed(0)}% hari ini.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50/50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-800 mb-1">💡 Rekomendasi</h4>
                <p className="text-sm text-blue-700">
                  Pertahankan jadwal pemberian pakan yang konsisten untuk hasil optimal.
                </p>
              </div>

              {pendingFeeds > 0 && (
                <div className="p-3 bg-yellow-50/50 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-800 mb-1">⚠️ Perhatian</h4>
                  <p className="text-sm text-yellow-700">
                    Masih ada {pendingFeeds} jadwal pakan yang belum diselesaikan hari ini.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedRecommendations;
