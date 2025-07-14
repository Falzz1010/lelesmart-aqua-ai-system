
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, AlertTriangle, CheckCircle, Upload, Camera, Bot, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { useGeminiAI } from "@/hooks/useGeminiAI";

const HealthDetection = () => {
  const [selectedPond, setSelectedPond] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { ponds } = usePonds();
  const { healthRecords } = useRealtimeData();
  const { analyzeHealth, isLoading: aiLoading } = useGeminiAI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPond || !healthStatus) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('health_records')
        .insert({
          pond_id: selectedPond,
          health_status: healthStatus,
          symptoms: symptoms || null,
          treatment: treatment || null
        });

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Catatan kesehatan berhasil disimpan."
      });

      // Reset form
      setSelectedPond("");
      setHealthStatus("");
      setSymptoms("");
      setTreatment("");
      setSelectedImage(null);
      setAiAnalysis(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan catatan kesehatan."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "sick": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4" />;
      case "sick": return <AlertTriangle className="h-4 w-4" />;
      case "critical": return <Heart className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setAiAnalysis(null);
        toast({
          title: "Gambar Dipilih",
          description: "Siap untuk dianalisis dengan AI"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Format File Salah",
          description: "Pilih file gambar (JPG, PNG, dll)"
        });
      }
    }
  };

  const handleAIAnalysis = async () => {
    if (!selectedImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pilih gambar terlebih dahulu"
      });
      return;
    }

    try {
      const selectedPondData = ponds?.find(p => p.id === selectedPond);
      
      const analysisPrompt = `
Analisis Gambar Ikan Lele:

Data Kolam (jika tersedia):
- Nama Kolam: ${selectedPondData?.name || 'Tidak dipilih'}
- Umur Ikan: ${selectedPondData?.fish_age_days || 'Tidak diketahui'} hari
- Jumlah Ikan: ${selectedPondData?.fish_count || 'Tidak diketahui'} ekor
- Ukuran Kolam: ${selectedPondData?.size_m2 || 'Tidak diketahui'} m²
- Suhu Air: ${selectedPondData?.water_temperature || 'Tidak diketahui'}°C
- pH: ${selectedPondData?.ph_level || 'Tidak diketahui'}

Gejala yang diamati: ${symptoms || 'Tidak ada'}

Berdasarkan informasi di atas dan gambar yang diberikan, berikan analisis detil mengenai:
1. Kondisi kesehatan ikan lele yang terlihat
2. Identifikasi potensi penyakit atau masalah kesehatan
3. Rekomendasi tindakan pengobatan yang tepat
4. Langkah pencegahan untuk ke depannya
5. Estimasi tingkat keparahan (ringan/sedang/berat)

Fokus pada identifikasi visual seperti:
- Warna dan kondisi kulit/sisik
- Postur dan gerakan ikan
- Kondisi mata, mulut, dan insang
- Adanya luka, bintik, atau kelainan
- Pola berenang dan perilaku

Berikan rekomendasi yang praktis dan dapat dilakukan oleh peternak.
      `;

      const result = await analyzeHealth(analysisPrompt);
      setAiAnalysis(result);
      
      toast({
        title: "Analisis Selesai",
        description: "AI telah menganalisis gambar dan memberikan rekomendasi"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menganalisis gambar dengan AI"
      });
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setAiAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Deteksi Kesehatan</h2>
        <p className="text-muted-foreground mt-1">Monitor dan catat kondisi kesehatan ikan lele</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Input */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-100/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Catat Kondisi Kesehatan</span>
            </CardTitle>
            <CardDescription>Tambahkan catatan kesehatan baru untuk kolam Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pond">Pilih Kolam</Label>
                <Select value={selectedPond} onValueChange={setSelectedPond}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kolam..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ponds?.map((pond) => (
                      <SelectItem key={pond.id} value={pond.id}>
                        {pond.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status Kesehatan</Label>
                <Select value={healthStatus} onValueChange={setHealthStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Sehat</SelectItem>
                    <SelectItem value="sick">Sakit</SelectItem>
                    <SelectItem value="critical">Kritis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Gejala yang Diamati</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Deskripsikan gejala yang terlihat..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Tindakan Pengobatan</Label>
                <Textarea
                  id="treatment"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Tindakan yang telah atau akan dilakukan..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload Gambar Ikan untuk Analisis AI</Label>
                  <div className="flex space-x-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih Gambar
                    </Button>
                  </div>
                  {selectedImage && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground truncate">
                          {selectedImage.name}
                        </span>
                        <Button variant="ghost" size="sm" onClick={removeImage}>
                          ×
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedImage && (
                  <Button 
                    onClick={handleAIAnalysis}
                    disabled={aiLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Menganalisis Gambar...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 mr-2" />
                        Analisis dengan AI
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                disabled={isSubmitting || !selectedPond || !healthStatus}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Catatan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100/50 dark:border-purple-700/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span>Hasil Analisis AI</span>
              </CardTitle>
              <CardDescription>Analisis kondisi kesehatan berdasarkan gambar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                <div className="whitespace-pre-wrap text-sm">{aiAnalysis}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Health Records */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-100/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Riwayat Kesehatan Terkini</CardTitle>
            <CardDescription>Catatan kesehatan dari semua kolam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {healthRecords?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada catatan kesehatan. Mulai monitoring kesehatan kolam Anda.
                  </p>
                </div>
              ) : (
                healthRecords?.map((record) => {
                  const pond = ponds?.find(p => p.id === record.pond_id);
                  return (
                    <div key={record.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{pond?.name || 'Unknown Pond'}</h4>
                        <Badge className={getStatusColor(record.health_status)}>
                          {getStatusIcon(record.health_status)}
                          <span className="ml-1">
                            {record.health_status === 'healthy' ? 'Sehat' : 
                             record.health_status === 'sick' ? 'Sakit' : 'Kritis'}
                          </span>
                        </Badge>
                      </div>
                      {record.symptoms && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Gejala:</strong> {record.symptoms}
                        </p>
                      )}
                      {record.treatment && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Pengobatan:</strong> {record.treatment}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70">
                        Tanggal: {new Date(record.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthDetection;
