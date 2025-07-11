
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  AlertTriangle, 
  Activity, 
  Fish, 
  Thermometer,
  Droplets,
  Plus,
  Bot,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeHealthRecords } from "@/hooks/useRealtimeData";
import { useToast } from "@/hooks/use-toast";
import { useGeminiAI } from "@/hooks/useGeminiAI";

const HealthDetection = () => {
  const { ponds } = usePonds();
  const { healthRecords, loading, createHealthRecord } = useRealtimeHealthRecords();
  const { analyzeHealth, isLoading: aiLoading } = useGeminiAI();
  const { toast } = useToast();
  
  const [selectedPond, setSelectedPond] = useState("");
  const [healthStatus, setHealthStatus] = useState<"healthy" | "sick" | "critical" | "">("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");

  // Calculate health statistics from real data
  const healthStats = {
    totalRecords: healthRecords.length,
    healthyCount: healthRecords.filter(r => r.health_status === 'healthy').length,
    sickCount: healthRecords.filter(r => r.health_status === 'sick').length,
    criticalCount: healthRecords.filter(r => r.health_status === 'critical').length,
    healthyPercentage: healthRecords.length > 0 ? 
      Math.round((healthRecords.filter(r => r.health_status === 'healthy').length / healthRecords.length) * 100) : 0
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPond || !healthStatus || healthStatus === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon pilih kolam dan status kesehatan"
      });
      return;
    }

    try {
      await createHealthRecord({
        pond_id: selectedPond,
        health_status: healthStatus as "healthy" | "sick" | "critical",
        symptoms: symptoms || null,
        treatment: treatment || null
      });

      // Reset form
      setSelectedPond("");
      setHealthStatus("");
      setSymptoms("");
      setTreatment("");
      
      toast({
        title: "Berhasil",
        description: "Data kesehatan berhasil ditambahkan"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan data kesehatan"
      });
    }
  };

  const handleAIAnalysis = async () => {
    if (!aiPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon masukkan deskripsi gejala atau kondisi ikan"
      });
      return;
    }

    // Prepare context with real pond and health data
    const contextData = {
      totalPonds: ponds.length,
      activePonds: ponds.filter(p => p.status === 'active').length,
      recentHealthRecords: healthRecords.slice(0, 5).map(record => ({
        status: record.health_status,
        symptoms: record.symptoms,
        treatment: record.treatment,
        date: record.created_at
      })),
      avgWaterTemp: ponds.length > 0 ? 
        ponds.reduce((sum, p) => sum + (p.water_temperature || 28), 0) / ponds.length : 28,
      avgPHLevel: ponds.length > 0 ? 
        ponds.reduce((sum, p) => sum + (p.ph_level || 7), 0) / ponds.length : 7,
      healthStats: {
        healthy: healthStats.healthyCount,
        sick: healthStats.sickCount,
        critical: healthStats.criticalCount,
        percentage: healthStats.healthyPercentage
      }
    };

    const fullPrompt = `
Data Kolam Real-time:
- Total kolam: ${contextData.totalPonds}
- Kolam aktif: ${contextData.activePonds}
- Rata-rata suhu air: ${contextData.avgWaterTemp.toFixed(1)}°C
- Rata-rata pH: ${contextData.avgPHLevel.toFixed(1)}
- Status kesehatan: ${contextData.healthStats.healthy} sehat, ${contextData.healthStats.sick} sakit, ${contextData.healthStats.critical} kritis

Riwayat Kesehatan Terbaru:
${contextData.recentHealthRecords.map(r => 
  `- Status: ${r.status}, Gejala: ${r.symptoms || 'Tidak ada'}, Treatment: ${r.treatment || 'Tidak ada'}`
).join('\n')}

Deskripsi Kondisi/Gejala dari User:
${aiPrompt}

Berdasarkan data real-time di atas, berikan analisis kesehatan ikan lele yang spesifik dan akurat.
    `;

    try {
      const result = await analyzeHealth(fullPrompt);
      setAiAnalysis(result);
      toast({
        title: "Analisis Selesai",
        description: "AI telah menganalisis kondisi berdasarkan data real-time"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mendapatkan analisis dari AI"
      });
    }
  };

  const getHealthBadgeColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'sick': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <Heart className="h-4 w-4" />;
      case 'sick': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <Activity className="h-4 w-4" />;
      default: return <Fish className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Deteksi Kesehatan Ikan</h2>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor dan analisis kesehatan ikan lele dengan bantuan AI</p>
      </div>

      {/* Health Statistics - Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-green-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Sehat</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">{healthStats.healthyCount}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-green-600">{healthStats.healthyPercentage}%</span>
                </div>
              </div>
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-yellow-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Sakit</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600 truncate">{healthStats.sickCount}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                  <span className="text-xs sm:text-sm text-yellow-600">Perlu perhatian</span>
                </div>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-red-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Kritis</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">{healthStats.criticalCount}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                  <span className="text-xs sm:text-sm text-red-600">Butuh tindakan</span>
                </div>
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Total Check</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">{healthStats.totalRecords}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  <span className="text-xs sm:text-sm text-blue-600">Pemeriksaan</span>
                </div>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Health Analysis */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <span>Analisis Kesehatan dengan AI</span>
          </CardTitle>
          <CardDescription>
            Dapatkan diagnosis dan rekomendasi berdasarkan data real-time kolam Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Deskripsi Gejala atau Kondisi Ikan</Label>
            <Textarea
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Contoh: Ikan terlihat lemas, nafsu makan menurun, ada bercak putih di tubuh, ikan mengambang di permukaan..."
              rows={3}
            />
          </div>
          <Button 
            onClick={handleAIAnalysis} 
            disabled={aiLoading || !aiPrompt.trim()}
            className="w-full"
          >
            {aiLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Menganalisis dengan AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisis dengan AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <Card className="bg-white/70 backdrop-blur-sm border-purple-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <span>Hasil Analisis AI (Berdasarkan Data Real-time)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiAnalysis.healthScore && (
                <div className="p-4 bg-blue-50/50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Skor Kesehatan:</h4>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-200 rounded-full px-3 py-1">
                      <span className="text-blue-800 font-bold">{aiAnalysis.healthScore}/100</span>
                    </div>
                    <span className="text-blue-700 capitalize">{aiAnalysis.status}</span>
                  </div>
                </div>
              )}
              
              {aiAnalysis.diagnosis && (
                <div className="p-4 bg-red-50/50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🔍 Diagnosis:</h4>
                  <p className="text-red-700">{aiAnalysis.diagnosis}</p>
                </div>
              )}

              {aiAnalysis.symptoms && aiAnalysis.symptoms.length > 0 && (
                <div className="p-4 bg-yellow-50/50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Gejala Teridentifikasi:</h4>
                  <ul className="text-yellow-700 space-y-1">
                    {aiAnalysis.symptoms.map((symptom, i) => (
                      <li key={i} className="break-words">• {symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis.treatment && (
                <div className="p-4 bg-green-50/50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">💊 Rekomendasi Treatment:</h4>
                  <p className="text-green-700">{aiAnalysis.treatment}</p>
                </div>
              )}

              {aiAnalysis.prevention && (
                <div className="p-4 bg-purple-50/50 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-purple-800 mb-2">🛡️ Tips Pencegahan:</h4>
                  <p className="text-purple-700">{aiAnalysis.prevention}</p>
                </div>
              )}

              {aiAnalysis.confidence && (
                <div className="p-4 bg-gray-50/50 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 Tingkat Kepercayaan AI:</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${aiAnalysis.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-700 font-medium">{aiAnalysis.confidence}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Health Record Form */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <span>Tambah Data Kesehatan</span>
          </CardTitle>
          <CardDescription>Catat kondisi kesehatan ikan di kolam Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pond">Pilih Kolam</Label>
                <Select value={selectedPond} onValueChange={setSelectedPond}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kolam" />
                  </SelectTrigger>
                  <SelectContent>
                    {ponds.map(pond => (
                      <SelectItem key={pond.id} value={pond.id}>
                        {pond.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="health-status">Status Kesehatan</Label>
                <Select value={healthStatus} onValueChange={(value: "healthy" | "sick" | "critical") => setHealthStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Sehat</SelectItem>
                    <SelectItem value="sick">Sakit</SelectItem>
                    <SelectItem value="critical">Kritis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Gejala (Opsional)</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Deskripsi gejala yang diamati..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment (Opsional)</Label>
              <Textarea
                id="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Treatment atau obat yang diberikan..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={!selectedPond || !healthStatus}>
              <Plus className="h-4 w-4 mr-2" />
              Simpan Data Kesehatan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Health Records List - Real Data */}
      {healthRecords.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <Fish className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">Belum Ada Data Kesehatan</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">Mulai monitor kesehatan ikan dengan menambah data kesehatan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Kesehatan Terbaru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {healthRecords.slice(0, 6).map((record) => (
              <Card key={record.id} className="bg-white/70 backdrop-blur-sm border-blue-100/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base truncate">
                      {record.ponds?.name || 'Kolam'}
                    </CardTitle>
                    <Badge className={getHealthBadgeColor(record.health_status)}>
                      {getHealthIcon(record.health_status)}
                      <span className="ml-1 capitalize">{record.health_status}</span>
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(record.created_at).toLocaleDateString('id-ID')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {record.symptoms && (
                    <div className="p-2 bg-yellow-50/50 rounded">
                      <p className="text-xs font-medium text-yellow-800 mb-1">Gejala:</p>
                      <p className="text-xs text-yellow-700 break-words">{record.symptoms}</p>
                    </div>
                  )}
                  {record.treatment && (
                    <div className="p-2 bg-green-50/50 rounded">
                      <p className="text-xs font-medium text-green-800 mb-1">Treatment:</p>
                      <p className="text-xs text-green-700 break-words">{record.treatment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthDetection;
