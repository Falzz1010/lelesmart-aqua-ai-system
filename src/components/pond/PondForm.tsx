
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
}

export const PondForm = ({ isOpen, onClose, onSubmit, editingPond, isLoading }: PondFormProps) => {
  const [formData, setFormData] = useState<PondFormData>({
    name: editingPond?.name || "",
    size_m2: editingPond?.size_m2 || 0,
    depth_m: editingPond?.depth_m || 0,
    fish_count: editingPond?.fish_count || 0,
    fish_age_days: editingPond?.fish_age_days || 0,
    status: editingPond?.status || "active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama kolam wajib diisi');
      return;
    }
    
    if (formData.size_m2 <= 0 || formData.depth_m <= 0) {
      alert('Ukuran dan kedalaman kolam harus lebih dari 0');
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
      status: "active"
    });
  };

  const handleClose = () => {
    onClose();
    if (!editingPond) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPond ? 'Edit Kolam' : 'Tambah Kolam Baru'}</DialogTitle>
          <DialogDescription>
            Masukkan informasi kolam budidaya ikan lele
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kolam *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Kolam A"
              required
            />
          </div>
          
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
                required
              />
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
                required
              />
            </div>
          </div>

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
              />
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
              />
            </div>
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

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : (editingPond ? 'Update' : 'Tambah')} Kolam
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
