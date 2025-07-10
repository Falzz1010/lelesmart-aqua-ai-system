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
  Plus
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeHealthRecords } from "@/hooks/useRealtimeData";
import { useToast } from "@/hooks/use-toast";

const HealthDetection = () => {
  const { ponds } = usePonds();
  const { healthRecords, loading, createHealthRecord } = useRealtimeHealthRecords();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    pond_id: "",
    health_status: "healthy" as "healthy" | "sick" | "critical",
    symptoms: "",
    treatment: ""
  });

  // Mock analysis results for demonstration
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
          <p className="text-gray-600 mt-1">Upload foto atau video ikan untuk analisis kesehatan otomatis</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
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

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Hasil Analisis</span>
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

        {/* Recent Health Records */}
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Riwayat Kesehatan Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthRecords.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada catatan kesehatan</p>
                <p className="text-sm text-gray-400">Tambah catatan kesehatan untuk memulai monitoring</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthRecords.slice(0, 6).map((record) => (
                  <div key={record.id} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{record.ponds?.name || 'Unknown'}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getHealthBadge(record.health_status)}`}></div>
                      <div>
                        <p className="font-medium text-gray-800">{getStatusText(record.health_status)}</p>
                        {record.symptoms && (
                          <p className="text-sm text-gray-600 truncate">{record.symptoms}</p>
                        )}
                      </div>
                    </div>

                    {record.treatment && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Pengobatan:</p>
                        <p className="text-sm text-gray-700 truncate">{record.treatment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips & Guidelines */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle>Tips Pengambilan Foto yang Baik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Pencahayaan
              </h4>
              <p className="text-sm text-gray-600">
                Gunakan cahaya natural atau lampu terang. Hindari bayangan pada ikan.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Jarak & Sudut
              </h4>
              <p className="text-sm text-gray-600">
                Ambil foto dari jarak 20-30cm dengan sudut 45° untuk hasil terbaik.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Kejelasan
              </h4>
              <p className="text-sm text-gray-600">
                Pastikan foto tidak blur dan ikan terlihat jelas tanpa gangguan objek lain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDetection;