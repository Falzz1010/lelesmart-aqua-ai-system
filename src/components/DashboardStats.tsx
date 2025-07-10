
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Fish, 
  Droplets, 
  Thermometer, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  Calendar,
  Target
} from "lucide-react";

const DashboardStats = () => {
  const ponds = [
    { id: 1, name: "Kolam A", fish: 2500, health: 95, temperature: 28, ph: 7.2, oxygen: 6.8 },
    { id: 2, name: "Kolam B", fish: 3000, health: 88, temperature: 29, ph: 7.0, oxygen: 6.5 },
    { id: 3, name: "Kolam C", fish: 2200, health: 92, temperature: 27, ph: 7.3, oxygen: 7.1 },
  ];

  const alerts = [
    { type: "warning", message: "Kolam B: Kadar oksigen sedikit rendah", time: "2 menit lalu" },
    { type: "info", message: "Prediksi hujan sore ini, siapkan penutup kolam", time: "15 menit lalu" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Ikan</p>
                <p className="text-3xl font-bold">7,700</p>
                <p className="text-blue-100 text-xs">+200 minggu ini</p>
              </div>
              <Fish className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Rata-rata Suhu</p>
                <p className="text-3xl font-bold">28°C</p>
                <p className="text-teal-100 text-xs">Optimal</p>
              </div>
              <Thermometer className="h-12 w-12 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Kesehatan Rata-rata</p>
                <p className="text-3xl font-bold">92%</p>
                <p className="text-green-100 text-xs">Sangat Baik</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Prediksi Panen</p>
                <p className="text-3xl font-bold">45</p>
                <p className="text-purple-100 text-xs">Hari lagi</p>
              </div>
              <Target className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ponds Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fish className="h-5 w-5 text-blue-600" />
              <span>Status Kolam</span>
            </CardTitle>
            <CardDescription>Monitoring real-time kondisi setiap kolam</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ponds.map((pond) => (
              <div key={pond.id} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{pond.name}</h3>
                  <Badge 
                    variant={pond.health >= 90 ? "default" : pond.health >= 80 ? "secondary" : "destructive"}
                    className={pond.health >= 90 ? "bg-green-500" : ""}
                  >
                    {pond.health}% Sehat
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Populasi: <span className="font-medium">{pond.fish.toLocaleString()}</span></p>
                    <p className="text-gray-600">Suhu: <span className="font-medium">{pond.temperature}°C</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600">pH: <span className="font-medium">{pond.ph}</span></p>
                    <p className="text-gray-600">DO: <span className="font-medium">{pond.oxygen} mg/L</span></p>
                  </div>
                </div>
                <Progress value={pond.health} className="mt-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Peringatan & Notifikasi</span>
            </CardTitle>
            <CardDescription>Peringatan penting untuk perhatian Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100/30">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
            
            {/* AI Recommendations */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200/50">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Zap className="h-4 w-4 text-blue-600 mr-2" />
                Rekomendasi AI Hari Ini
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Kurangi pakan 10% untuk Kolam B (oksigen rendah)</li>
                <li>• Tambah aerator di Kolam A (prediksi hujan)</li>
                <li>• Periksa filter Kolam C besok pagi</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle>Cuaca Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl mb-2">🌤️</div>
              <p className="text-2xl font-bold text-gray-800">26°C</p>
              <p className="text-sm text-gray-600">Berawan, kemungkinan hujan 70%</p>
              <p className="text-xs text-gray-500 mt-2">Angin: 12 km/h | Kelembaban: 78%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Jadwal Hari Ini</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-white/50 rounded">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">06:00 - Pemberian pakan pagi</p>
                  <p className="text-xs text-gray-500">Semua kolam - 45kg total</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-white/50 rounded">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">10:00 - Pengukuran kualitas air</p>
                  <p className="text-xs text-gray-500">Kolam A, B, C</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-white/50 rounded">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">16:00 - Pemberian pakan sore</p>
                  <p className="text-xs text-gray-500">Semua kolam - 40kg total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
