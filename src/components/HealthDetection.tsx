
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, AlertTriangle, CheckCircle, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePonds } from "@/hooks/usePonds";
import { useRealtimeData } from "@/hooks/useRealtimeData";

const HealthDetection = () => {
  const [selectedPond, setSelectedPond] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { ponds } = usePonds();
  const { healthRecords } = useRealtimeData();

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Deteksi Kesehatan</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor dan catat kondisi kesehatan ikan lele</p>
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

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Foto Ikan
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Gambar
                </Button>
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

        {/* Recent Health Records */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-100/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Riwayat Kesehatan Terkini</CardTitle>
            <CardDescription>Catatan kesehatan dari semua kolam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {healthRecords?.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Belum ada catatan kesehatan
                </p>
              ) : (
                healthRecords?.map((record) => {
                  const pond = ponds?.find(p => p.id === record.pond_id);
                  return (
                    <div key={record.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{pond?.name || 'Unknown Pond'}</h4>
                        <Badge className={getStatusColor(record.health_status)}>
                          {getStatusIcon(record.health_status)}
                          <span className="ml-1">
                            {record.health_status === 'healthy' ? 'Sehat' : 
                             record.health_status === 'sick' ? 'Sakit' : 'Kritis'}
                          </span>
                        </Badge>
                      </div>
                      {record.symptoms && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <strong>Gejala:</strong> {record.symptoms}
                        </p>
                      )}
                      {record.treatment && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <strong>Pengobatan:</strong> {record.treatment}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(record.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
