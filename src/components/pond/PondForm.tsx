import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Fish, Ruler, Droplets, Calendar, Activity } from "lucide-react";
import { Pond } from "@/hooks/usePonds";

interface PondFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PondFormData) => Promise<void>;
  editingPond?: Pond | null;
  isLoading?: boolean;
}

export interface PondFormData {
  name: string;
  size_m2: number;
  depth_m: number;
  fish_count: number;
  fish_age_days: number;
  status: 'active' | 'maintenance' | 'inactive';
  water_temperature?: number;
  ph_level?: number;
}

export const PondForm = ({ isOpen, onClose, onSubmit, editingPond, isLoading }: PondFormProps) => {
  const [formData, setFormData] = useState<PondFormData>({
    name: "",
    size_m2: 0,
    depth_m: 0,
    fish_count: 0,
    fish_age_days: 0,
    status: "active",
    water_temperature: undefined,
    ph_level: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingPond) {
      setFormData({
        name: editingPond.name || "",
        size_m2: editingPond.size_m2 || 0,
        depth_m: editingPond.depth_m || 0,
        fish_count: editingPond.fish_count || 0,
        fish_age_days: editingPond.fish_age_days || 0,
        status: editingPond.status || "active",
        water_temperature: editingPond.water_temperature || undefined,
        ph_level: editingPond.ph_level || undefined
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [editingPond, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama kolam wajib diisi';
    }
    
    if (formData.size_m2 <= 0) {
      newErrors.size_m2 = 'Ukuran kolam harus lebih dari 0';
    }
    
    if (formData.depth_m <= 0) {
      newErrors.depth_m = 'Kedalaman kolam harus lebih dari 0';
    }

    if (formData.fish_count < 0) {
      newErrors.fish_count = 'Jumlah ikan tidak boleh negatif';
    }

    if (formData.fish_age_days < 0) {
      newErrors.fish_age_days = 'Umur ikan tidak boleh negatif';
    }

    if (formData.water_temperature && (formData.water_temperature < 0 || formData.water_temperature > 50)) {
      newErrors.water_temperature = 'Suhu air harus antara 0-50°C';
    }

    if (formData.ph_level && (formData.ph_level < 0 || formData.ph_level > 14)) {
      newErrors.ph_level = 'pH harus antara 0-14';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      size_m2: 0,
      depth_m: 0,
      fish_count: 0,
      fish_age_days: 0,
      status: "active",
      water_temperature: undefined,
      ph_level: undefined
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    if (!editingPond) {
      resetForm();
    }
  };

  const calculateVolume = () => {
    return formData.size_m2 && formData.depth_m ? (formData.size_m2 * formData.depth_m).toFixed(1) : '0';
  };

  const calculateDensity = () => {
    const volume = formData.size_m2 * formData.depth_m;
    return volume > 0 && formData.fish_count > 0 ? (formData.fish_count / volume).toFixed(1) : '0';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingPond ? 'Edit Kolam' : 'Tambah Kolam Baru'}
          </DialogTitle>
          <DialogDescription>
            {editingPond 
              ? 'Perbarui informasi kolam budidaya ikan lele' 
              : 'Masukkan informasi kolam budidaya ikan lele baru'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Fish className="h-4 w-4" />
                Informasi Dasar
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kolam *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Kolam A, Kolam Utara, dll."
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status Kolam</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Non-aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Dimensions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Dimensi Kolam
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size_m2">Ukuran (m²) *</Label>
                  <Input
                    id="size_m2"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.size_m2 || ''}
                    onChange={(e) => setFormData({...formData, size_m2: parseFloat(e.target.value) || 0})}
                    placeholder="100"
                    className={errors.size_m2 ? "border-red-500" : ""}
                  />
                  {errors.size_m2 && <p className="text-red-500 text-sm">{errors.size_m2}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="depth_m">Kedalaman (m) *</Label>
                  <Input
                    id="depth_m"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.depth_m || ''}
                    onChange={(e) => setFormData({...formData, depth_m: parseFloat(e.target.value) || 0})}
                    placeholder="1.5"
                    className={errors.depth_m ? "border-red-500" : ""}
                  />
                  {errors.depth_m && <p className="text-red-500 text-sm">{errors.depth_m}</p>}
                </div>
              </div>

              {/* Calculated Values */}
              {(formData.size_m2 > 0 && formData.depth_m > 0) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Volume kolam:</strong> {calculateVolume()} m³
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fish Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Informasi Ikan
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fish_count">Jumlah Ikan</Label>
                  <Input
                    id="fish_count"
                    type="number"
                    min="0"
                    value={formData.fish_count || ''}
                    onChange={(e) => setFormData({...formData, fish_count: parseInt(e.target.value) || 0})}
                    placeholder="1000"
                    className={errors.fish_count ? "border-red-500" : ""}
                  />
                  {errors.fish_count && <p className="text-red-500 text-sm">{errors.fish_count}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fish_age_days">Umur Ikan (hari)</Label>
                  <Input
                    id="fish_age_days"
                    type="number"
                    min="0"
                    value={formData.fish_age_days || ''}
                    onChange={(e) => setFormData({...formData, fish_age_days: parseInt(e.target.value) || 0})}
                    placeholder="30"
                    className={errors.fish_age_days ? "border-red-500" : ""}
                  />
                  {errors.fish_age_days && <p className="text-red-500 text-sm">{errors.fish_age_days}</p>}
                </div>
              </div>

              {/* Fish Density Calculation */}
              {(formData.fish_count > 0 && formData.size_m2 > 0 && formData.depth_m > 0) && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Kepadatan ikan:</strong> {calculateDensity()} ekor/m³
                  </p>
                  {parseFloat(calculateDensity()) > 100 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ Kepadatan tinggi, pertimbangkan untuk mengurangi jumlah ikan
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Water Quality (Optional) */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Kualitas Air (Opsional)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="water_temperature">Suhu Air (°C)</Label>
                  <Input
                    id="water_temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={formData.water_temperature || ''}
                    onChange={(e) => setFormData({...formData, water_temperature: parseFloat(e.target.value) || undefined})}
                    placeholder="28.5"
                    className={errors.water_temperature ? "border-red-500" : ""}
                  />
                  {errors.water_temperature && <p className="text-red-500 text-sm">{errors.water_temperature}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ph_level">pH Air</Label>
                  <Input
                    id="ph_level"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={formData.ph_level || ''}
                    onChange={(e) => setFormData({...formData, ph_level: parseFloat(e.target.value) || undefined})}
                    placeholder="7.0"
                    className={errors.ph_level ? "border-red-500" : ""}
                  />
                  {errors.ph_level && <p className="text-red-500 text-sm">{errors.ph_level}</p>}
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Tips:</strong> Suhu optimal untuk lele: 25-30°C, pH optimal: 6.5-8.5
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
            >
              {isLoading ? 'Menyimpan...' : (editingPond ? 'Update' : 'Tambah')} Kolam
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};