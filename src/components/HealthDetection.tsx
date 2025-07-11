import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Heart,
  Activity,
  FileImage,
  Plus,
  Bot,
  Sparkles,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeHealthRecords } from "@/hooks/useRealtimeData";
import { useToast } from "@/hooks/use-toast";
import { useGeminiAI } from "@/hooks/useGeminiAI";

const HealthDetection = () => {
  const { ponds } = usePonds();
  const { healthRecords, loading, createHealthRecord } = useRealtimeHealthRecords();
  const { toast } = useToast();
  const { analyzeHealth, isLoading: aiLoading } = useGeminiAI();
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [healthPrompt, setHealthPrompt] = useState("");
  const [newRecord, setNewRecord] = useState({
    pond_id: "",
    health_status: "healthy" as "healthy" | "sick" | "critical",
    symptoms: "",
    treatment: ""
  });

  // Calculate real health statistics
  const calculateHealthStats = () => {
    if (healthRecords.length === 0) {
      return {
        totalRecords: 0,
        healthyCount: 0,
        sickCount: 0,
        criticalCount: 0,
        healthyPercentage: 0,
        trend: 'stable',
        recentActivity: 0
      };
    }

    const healthyCount = healthRecords.filter(r => r.health_status === 'healthy').length;
    const sickCount = healthRecords.filter(r => r.health_status === 'sick').length;
    const criticalCount = healthRecords.filter(r => r.health_status === 'critical').length;
    
    // Calculate trend based on recent records
    const recentRecords = healthRecords.slice(0, 5);
    const olderRecords = healthRecords.slice(5, 10);
    
    const recentHealthyRatio = recentRecords.length > 0 
      ? recentRecords.filter(r => r.health_status === 'healthy').length / recentRecords.length 
      : 0;
    const olderHealthyRatio = olderRecords.length > 0 
      ? olderRecords.filter(r => r.health_status === 'healthy').length / olderRecords.length 
      : recentHealthyRatio;
    
    let trend = 'stable';
    if (recentHealthyRatio > olderHealthyRatio + 0.1) trend = 'improving';
    else if (recentHealthyRatio < olderHealthyRatio - 0.1) trend = 'declining';

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = healthRecords.filter(r => 
      new Date(r.created_at) >= weekAgo
    ).length;

    return {
      totalRecords: healthRecords.length,
      healthyCount,
      sickCount,
      criticalCount,
      healthyPercentage: (healthyCount / healthRecords.length) * 100,
      trend,
      recentActivity
    };
  };

  // Mock analysis for image upload (keeping this as example)
  const mockAnalysis = {
    healthScore: 85,
    status: "healthy",
    confidence: 92,
    issues: [
      { 
        type: "warning", 
        severity: "medium",
        title: "Sedikit perubahan warna sisik",
        description: "Terdeteksi perubahan warna pada 12% area tubuh ikan. Kemungkinan stress ringan atau perubahan kualitas air.",
        recommendation: "Monitor kualitas air dan kurangi kepadatan ikan jika perlu."
      }
    ],
    characteristics: [
      { label: "Warna Sisik", value: "Normal", status: "good" },
      { label: "Aktivitas Gerak", value: "Aktif", status: "good" },
      { label: "Kondisi Sirip", value: "Baik", status: "good" },
      { label: "Mata", value: "Jernih", status: "good" },
      { label: "Nafsu Makan", value: "Kurang", status: "warning" }
    ]
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    // Simulate AI processing time
    setTimeout(() => {
      setAnalysisResult(mockAnalysis);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleAIAnalysis = async () => {
    if (!healthPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon masukkan deskripsi kondisi ikan"
      });
      return;
    }

    // Prepare context with real health data
    const healthContext = {
      totalPonds: ponds.length,
      pondsData: ponds.map(pond => ({
        name: pond.name,
        fishCount: pond.fish_count,
        fishAge: pond.fish_age_days,
        waterTemp: pond.water_temperature,
        phLevel: pond.ph_level,
        size: pond.size_m2,
        depth: pond.depth_m
      })),
      recentHealthRecords: healthRecords.slice(0, 5).map(record => ({
        pond: record.ponds?.name || 'Unknown',
        status: record.health_status,
        symptoms: record.symptoms,
        treatment: record.treatment,
        date: record.created_at
      })),
      healthStats: calculateHealthStats()
    };

    const fullPrompt = `
Data Kesehatan Real-time dari Sistem:
${JSON.stringify(healthContext, null, 2)}

Observasi Pengguna:
${healthPrompt}

Berdasarkan data real-time dan observasi pengguna, berikan analisis kesehatan ikan yang komprehensif mencakup:
1. Diagnosis berdasarkan gejala dan riwayat
2. Tingkat keparahan dan risiko
3. Rekomendasi pengobatan spesifik
4. Langkah pencegahan
5. Prediksi prognosis
6. Tindakan darurat jika diperlukan

Fokus pada data aktual dari sistem dan berikan rekomendasi yang dapat ditindaklanjuti.
    `;

    try {
      const result = await analyzeHealth(fullPrompt);
      setAiAnalysis(result);
      toast({
        title: "Analisis Selesai",
        description: "AI telah menganalisis kondisi kesehatan berdasarkan data real-time"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menganalisis kondisi ikan"
      });
    }
  };

  const handleCreateRecord = async () => {
    if (!newRecord.pond_id || !newRecord.health_status) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Mohon lengkapi kolam dan status kesehatan"
      });
      return;
    }

    try {
      await createHealthRecord(newRecord);
      setIsDialogOpen(false);
      setNewRecord({
        pond_id: "",
        health_status: "healthy",
        symptoms: "",
        treatment: ""
      });
      toast({
        title: "Berhasil",
        description: "Catatan kesehatan berhasil ditambahkan"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menambahkan catatan kesehatan"
      });
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (status) => {
    switch (status) {
      case "healthy": return "bg-green-500";
      case "sick": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "healthy": return "Sehat";
      case "sick": return "Sakit";
      case "critical": return "Kritis";
      default: return status;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'improving': return 'Membaik';
      case 'declining': return 'Menurun';
      default: return 'Stabil';
    }
  };

  const healthStats = calculateHealthStats();

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
          <h2 className="text-3xl font-bold text-gray-900">Deteksi Kesehatan Ikan AI</h2>
          <p className="text-gray-600 mt-1">Analisis kesehatan berdasarkan data real-time dan AI</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Catatan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Catatan Kesehatan</DialogTitle>
              <DialogDescription>
                Buat catatan kesehatan ikan secara manual
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pond">Kolam</Label>
                <Select value={newRecord.pond_id} onValueChange={(value) => setNewRecord({...newRecord, pond_id: value})}>
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
                <Label htmlFor="status">Status Kesehatan</Label>
                <Select value={newRecord.health_status} onValueChange={(value: any) => setNewRecord({...newRecord, health_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Sehat</SelectItem>
                    <SelectItem value="sick">Sakit</SelectItem>
                    <SelectItem value="critical">Kritis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Gejala (Opsional)</Label>
                <Textarea
                  id="symptoms"
                  value={newRecord.symptoms}
                  onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                  placeholder="Deskripsikan gejala yang diamati..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Pengobatan (Opsional)</Label>
                <Textarea
                  id="treatment"
                  value={newRecord.treatment}
                  onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                  placeholder="Deskripsikan pengobatan yang diberikan..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateRecord}>
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Health Statistics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">Total Catatan</p>
                <p className="text-2xl font-bold text-gray-800">{healthStats.totalRecords}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Real-time</span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">Tingkat Kesehatan</p>
                <p className="text-2xl font-bold text-green-600">{healthStats.healthyPercentage.toFixed(0)}%</p>
                <div className="flex items-center space-x-1 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Sehat</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-yellow-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">Tren Kesehatan</p>
                <p className="text-2xl font-bold text-gray-800">{getTrendText(healthStats.trend)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(healthStats.trend)}
                  <span className="text-sm text-gray-600">7 hari terakhir</span>
                </div>
              </div>
              {getTrendIcon(healthStats.trend)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-orange-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-600">Aktivitas Minggu Ini</p>
                <p className="text-2xl font-bold text-orange-600">{healthStats.recentActivity}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Catatan baru</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Text Analysis - Enhanced with real data context */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <span>Analisis AI Berbasis Data Real-time</span>
            </CardTitle>
            <CardDescription>
              AI akan menganalisis berdasarkan riwayat kesehatan dan data kolam Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthStats.totalRecords > 0 && (
              <div className="p-3 bg-blue-50/50 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-1">Konteks Data Anda:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• {healthStats.totalRecords} catatan kesehatan tersimpan</li>
                  <li>• {healthStats.healthyCount} catatan sehat, {healthStats.sickCount} sakit, {healthStats.criticalCount} kritis</li>
                  <li>• Tren kesehatan: {getTrendText(healthStats.trend)}</li>
                  <li>• {ponds.length} kolam aktif dalam sistem</li>
                </ul>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="health-prompt">Deskripsi Kondisi Ikan</Label>
              <Textarea
                id="health-prompt"
                value={healthPrompt}
                onChange={(e) => setHealthPrompt(e.target.value)}
                placeholder="Contoh: Ikan terlihat lemas, nafsu makan berkurang, ada bercak putih di tubuh, gerakan tidak normal..."
                rows={4}
              />
            </div>
            <Button 
              onClick={handleAIAnalysis} 
              disabled={aiLoading || !healthPrompt.trim()}
              className="w-full"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Menganalisis dengan Data Real-time...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analisis dengan AI (Menggunakan Data Real-time)
                </>
              )}
            </Button>
            {healthStats.totalRecords === 0 && (
              <p className="text-sm text-gray-500 text-center">
                Tambahkan beberapa catatan kesehatan untuk analisis yang lebih akurat
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upload Section - Keeping existing functionality */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <span>Upload Gambar Ikan</span>
            </CardTitle>
            <CardDescription>
              Drag & drop gambar atau klik untuk memilih file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-blue-400 bg-blue-50/50" 
                  : "border-gray-300 bg-gray-50/30"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded fish" 
                    className="mx-auto max-h-48 rounded-lg"
                  />
                  <Button 
                    onClick={() => {
                      setUploadedImage(null);
                      setAnalysisResult(null);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Upload Gambar Lain
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop gambar di sini
                    </p>
                    <p className="text-sm text-gray-500">
                      atau klik untuk memilih file
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild className="cursor-pointer">
                      <span>Pilih Gambar</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="mt-6 p-4 bg-blue-50/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  <div>
                    <p className="font-medium text-blue-800">Menganalisis gambar...</p>
                    <p className="text-sm text-blue-600">AI sedang memproses deteksi kesehatan ikan</p>
                  </div>
                </div>
                <Progress value={75} className="mt-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Results - Enhanced */}
        {aiAnalysis && (
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span>Hasil Analisis AI (Berdasarkan Data Real-time)</span>
              </CardTitle>
              <CardDescription>
                Analisis komprehensif berdasarkan riwayat {healthStats.totalRecords} catatan kesehatan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiAnalysis.healthScore && (
                  <div className="text-center p-3 bg-purple-50/50 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{aiAnalysis.healthScore}%</p>
                    <p className="text-xs text-gray-600">Skor Kesehatan</p>
                  </div>
                )}
                {aiAnalysis.confidence && (
                  <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{aiAnalysis.confidence}%</p>
                    <p className="text-xs text-gray-600">Tingkat Kepercayaan</p>
                  </div>
                )}
                {aiAnalysis.status && (
                  <div className="text-center p-3 bg-green-50/50 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600 capitalize">{aiAnalysis.status}</p>
                    <p className="text-xs text-gray-600">Status</p>
                  </div>
                )}
              </div>

              {aiAnalysis.diagnosis && (
                <div className="p-4 bg-blue-50/50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔍 Diagnosis Berdasarkan Data:</h4>
                  <p className="text-blue-700">{aiAnalysis.diagnosis}</p>
                </div>
              )}

              {aiAnalysis.symptoms && aiAnalysis.symptoms.length > 0 && (
                <div className="p-4 bg-yellow-50/50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Gejala yang Terdeteksi:</h4>
                  <ul className="text-yellow-700 space-y-1">
                    {aiAnalysis.symptoms.map((symptom, index) => (
                      <li key={index}>• {symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis.treatment && (
                <div className="p-4 bg-green-50/50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">💊 Rekomendasi Pengobatan:</h4>
                  <p className="text-green-700">{aiAnalysis.treatment}</p>
                </div>
              )}

              {aiAnalysis.prevention && (
                <div className="p-4 bg-purple-50/50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">🛡️ Tips Pencegahan:</h4>
                  <p className="text-purple-700">{aiAnalysis.prevention}</p>
                </div>
              )}

              {aiAnalysis.analysis && (
                <div className="p-4 bg-gray-50/50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">📋 Analisis Lengkap:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{aiAnalysis.analysis}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Image Analysis Results */}
        {analysisResult && (
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Hasil Analisis Gambar</span>
                </div>
                <Badge className={`${getHealthBadge(analysisResult.status)} text-white`}>
                  Skor: {analysisResult.healthScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50/50 rounded-lg">
                  <Heart className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className={`text-2xl font-bold ${getHealthColor(analysisResult.healthScore)}`}>
                    {analysisResult.healthScore}%
                  </p>
                  <p className="text-xs text-gray-600">Kesehatan</p>
                </div>
                <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{analysisResult.confidence}%</p>
                  <p className="text-xs text-gray-600">Akurasi</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Karakteristik Ikan:</h4>
                {analysisResult.characteristics.map((char, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white/50 rounded">
                    <span className="text-sm text-gray-700">{char.label}:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{char.value}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        char.status === "good" ? "bg-green-500" : 
                        char.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>

              {analysisResult.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    Temuan & Rekomendasi:
                  </h4>
                  {analysisResult.issues.map((issue, index) => (
                    <div key={index} className="p-3 bg-yellow-50/50 rounded-lg border-l-4 border-yellow-400">
                      <h5 className="font-medium text-yellow-800">{issue.title}</h5>
                      <p className="text-sm text-yellow-700 mt-1">{issue.description}</p>
                      <p className="text-sm text-yellow-600 mt-2 font-medium">
                        💡 {issue.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Health Records - Enhanced with better data display */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Riwayat Kesehatan Real-time</span>
              </div>
              <Badge variant="outline">{healthStats.totalRecords} Total Catatan</Badge>
            </CardTitle>
            <CardDescription>
              Data kesehatan terbaru dengan tren: {getTrendText(healthStats.trend)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthRecords.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada catatan kesehatan</p>
                <p className="text-sm text-gray-400">Tambah catatan kesehatan untuk memulai monitoring real-time</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthRecords.slice(0, 6).map((record) => (
                  <div key={record.id} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{record.ponds?.name || 'Unknown'}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleDateString('id-ID')} {' '}
                        {new Date(record.created_at).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getHealthBadge(record.health_status)}`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{getStatusText(record.health_status)}</p>
                        {record.symptoms && (
                          <p className="text-sm text-gray-600 line-clamp-2">{record.symptoms}</p>
                        )}
                      </div>
                    </div>

                    {record.treatment && (
                      <div className="mt-2 p-2 bg-green-50/50 rounded">
                        <p className="text-xs text-gray-500 font-medium">Pengobatan:</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{record.treatment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {healthRecords.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Lihat Semua {healthRecords.length} Catatan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips & Guidelines */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle>Tips Monitoring Kesehatan Real-time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Observasi Rutin
              </h4>
              <p className="text-sm text-gray-600">
                Lakukan pencatatan kesehatan minimal 2x seminggu untuk tren yang akurat.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Detail Gejala
              </h4>
              <p className="text-sm text-gray-600">
                Catat gejala spesifik seperti perubahan warna, perilaku, dan nafsu makan.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Konsultasi AI
              </h4>
              <p className="text-sm text-gray-600">
                Gunakan AI analysis untuk mendapat insight berdasarkan data historis Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDetection;
