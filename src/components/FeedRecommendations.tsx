import React, { Fragment } from 'react';
import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Fish, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Zap,
  Target,
  BarChart3
} from "lucide-react";

const FeedRecommendations = () => {
  const [selectedPond, setSelectedPond] = useState("all");

  const ponds = [
    { id: "all", name: "Semua Kolam" },
    { id: "1", name: "Kolam A" },
    { id: "2", name: "Kolam B" }, 
    { id: "3", name: "Kolam C" }
  ];

  const feedingSchedule = [
    {
      time: "06:00",
      period: "Pagi",
      amount: 45,
      type: "Pelet Apung",
      ponds: ["Kolam A", "Kolam B", "Kolam C"],
      status: "completed",
      aiNote: "Optimal - cuaca cerah, ikan aktif"
    },
    {
      time: "11:00", 
      period: "Siang",
      amount: 35,
      type: "Pelet Tenggelam",
      ponds: ["Kolam A", "Kolam C"],
      status: "pending",
      aiNote: "Kurangi 5kg - suhu tinggi"
    },
    {
      time: "16:00",
      period: "Sore", 
      amount: 40,
      type: "Pelet Apung",
      ponds: ["Kolam A", "Kolam B", "Kolam C"],
      status: "scheduled",
      aiNote: "Normal - kondisi ideal"
    },
    {
      time: "20:00",
      period: "Malam",
      amount: 25,
      type: "Pelet Tenggelam", 
      ponds: ["Kolam B"],
      status: "scheduled",
      aiNote: "Opsional - hanya jika ikan masih aktif"
    }
  ];

  const weeklyStats = [
    { day: "Sen", planned: 140, actual: 135, efficiency: 96 },
    { day: "Sel", planned: 140, actual: 140, efficiency: 100 },
    { day: "Rab", planned: 135, actual: 130, efficiency: 96 },
    { day: "Kam", planned: 145, actual: 145, efficiency: 100 },
    { day: "Jum", planned: 140, actual: 138, efficiency: 99 },
    { day: "Sab", planned: 135, actual: 135, efficiency: 100 },
    { day: "Min", planned: 130, actual: 125, efficiency: 96 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "scheduled": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Selesai";
      case "pending": return "Tertunda";
      case "scheduled": return "Terjadwal";
      default: return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Rekomendasi Pakan AI</h2>
          <p className="text-gray-600 mt-1">Jadwal pemberian pakan optimal berdasarkan AI</p>
        </div>
        {/* Make buttons wrap on narrow viewports */}
        <div className="flex flex-wrap gap-2">
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
                <p className="text-2xl font-bold">145 kg</p>
                <p className="text-blue-100 text-xs">Target: 140 kg</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">FCR Minggu Ini</p>
                <p className="text-2xl font-bold">1.2</p>
                <p className="text-green-100 text-xs">↓ 0.1 dari minggu lalu</p>
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
                <p className="text-2xl font-bold">98%</p>
                <p className="text-purple-100 text-xs">Sangat baik</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Sesi Tersisa</p>
                <p className="text-2xl font-bold">2</p>
                <p className="text-orange-100 text-xs">Siang & Sore</p>
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
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Jadwal Pakan Hari Ini</span>
            </CardTitle>
            <CardDescription>Rekomendasi AI berdasarkan kondisi real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedingSchedule.map((schedule, index) => (
              <div key={index} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(schedule.status)}`}></div>
                      <span className="font-semibold text-gray-800">{schedule.time}</span>
                      <Badge variant="outline" className="text-xs">
                        {schedule.period}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(schedule.status)}>
                    {getStatusText(schedule.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Jumlah:</p>
                    <p className="font-semibold text-lg">{schedule.amount} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jenis:</p>
                    <p className="font-medium">{schedule.type}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Kolam:</p>
                  <div className="flex flex-wrap gap-1">
                    {schedule.ponds.map((pond, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {pond}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-2 bg-blue-50/50 rounded border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{schedule.aiNote}</p>
                  </div>
                </div>

                {schedule.status === "pending" && (
                  <Button size="sm" className="w-full mt-3 bg-green-600 hover:bg-green-700">
                    Tandai Selesai
                  </Button>
                )}
              </div>
            ))}
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
                {weeklyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-8">{stat.day}</span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{stat.actual}/{stat.planned}kg</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={stat.efficiency} className="w-20" />
                      <span className="text-sm font-medium w-8">{stat.efficiency}%</span>
                    </div>
                  </div>
                ))}
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
                <p className="text-sm text-green-700">FCR minggu ini mencapai 1.2, lebih baik 8% dari target standar industri.</p>
              </div>
              
              <div className="p-3 bg-blue-50/50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-800 mb-1">💡 Rekomendasi</h4>
                <p className="text-sm text-blue-700">Pertimbangkan mengurangi pakan siang 5-10% karena suhu air tinggi (29°C+) mengurangi nafsu makan.</p>
              </div>

              <div className="p-3 bg-yellow-50/50 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-medium text-yellow-800 mb-1">⚠️ Perhatian</h4>
                <p className="text-sm text-yellow-700">Kolam B menunjukkan penurunan aktivitas makan. Periksa kualitas air dan kesehatan ikan.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedRecommendations;
