
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { PondInsert } from "@/types/database";

interface PondFormProps {
  onSubmit: (data: PondInsert) => Promise<void>;
  isLoading?: boolean;
}

export const PondForm = ({ onSubmit, isLoading = false }: PondFormProps) => {
  const [formData, setFormData] = useState<PondInsert>({
    user_id: '',
    name: '',
    size_m2: 0,
    depth_m: 0,
    fish_count: 0,
    fish_age_days: 0,
    status: 'active',
    water_temperature: undefined,
    ph_level: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.size_m2 <= 0 || formData.depth_m <= 0) {
      return;
    }

    const submitData = {
      ...formData,
      user_id: '', // Will be set by the hook
    };

    await onSubmit(submitData);
    
    // Reset form
    setFormData({
      user_id: '',
      name: '',
      size_m2: 0,
      depth_m: 0,
      fish_count: 0,
      fish_age_days: 0,
      status: 'active',
      water_temperature: undefined,
      ph_level: undefined,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Tambah Kolam Baru</CardTitle>
        <CardDescription className="text-sm">
          Isi data kolam yang akan ditambahkan ke sistem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nama Kolam *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Kolam A1"
                required
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'maintenance' | 'inactive') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size_m2" className="text-sm font-medium">Luas (m²) *</Label>
              <Input
                id="size_m2"
                type="number"
                min="0"
                step="0.1"
                value={formData.size_m2 || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  size_m2: parseFloat(e.target.value) || 0 
                }))}
                placeholder="100"
                required
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth_m" className="text-sm font-medium">Kedalaman (m) *</Label>
              <Input
                id="depth_m"
                type="number"
                min="0"
                step="0.1"
                value={formData.depth_m || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  depth_m: parseFloat(e.target.value) || 0 
                }))}
                placeholder="1.5"
                required
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fish_count" className="text-sm font-medium">Jumlah Ikan</Label>
              <Input
                id="fish_count"
                type="number"
                min="0"
                value={formData.fish_count || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  fish_count: parseInt(e.target.value) || 0 
                }))}
                placeholder="1000"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fish_age_days" className="text-sm font-medium">Umur Ikan (hari)</Label>
              <Input
                id="fish_age_days"
                type="number"
                min="0"
                value={formData.fish_age_days || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  fish_age_days: parseInt(e.target.value) || 0 
                }))}
                placeholder="30"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="water_temperature" className="text-sm font-medium">Suhu Air (°C)</Label>
              <Input
                id="water_temperature"
                type="number"
                min="0"
                step="0.1"
                value={formData.water_temperature || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  water_temperature: parseFloat(e.target.value) || undefined 
                }))}
                placeholder="28.5"
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph_level" className="text-sm font-medium">pH Air</Label>
              <Input
                id="ph_level"
                type="number"
                min="0"
                max="14"
                step="0.1"
                value={formData.ph_level || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  ph_level: parseFloat(e.target.value) || undefined 
                }))}
                placeholder="7.0"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name || formData.size_m2 <= 0 || formData.depth_m <= 0}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Menyimpan...' : 'Tambah Kolam'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
