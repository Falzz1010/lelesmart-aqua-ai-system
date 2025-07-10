
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Fish, 
  Plus, 
  Edit, 
  Trash2,
  Droplets,
  Thermometer,
  Activity
} from "lucide-react";
import { useRealtimePonds } from "@/hooks/useRealtimeData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PondManagement = () => {
  const { ponds, loading } = useRealtimePonds();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPond, setEditingPond] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    size_m2: "",
    depth_m: "",
    fish_count: "",
    fish_age_days: "",
    status: "active" as const
  });

  const resetForm = () => {
    setFormData({
      name: "",
      size_m2: "",
      depth_m: "",
      fish_count: "",
      fish_age_days: "",
      status: "active"
    });
    setEditingPond(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pondData = {
      name: formData.name,
      size_m2: parseFloat(formData.size_m2),
      depth_m: parseFloat(formData.depth_m),
      fish_count: parseInt(formData.fish_count) || 0,
      fish_age_days: parseInt(formData.fish_age_days) || 0,
      status: formData.status,
      user_id: user?.id
    };

    try {
      if (editingPond) {
        const { error } = await (supabase as any)
          .from('ponds')
          .update(pondData)
          .eq('id', editingPond.id);
        
        if (error) throw error;
        toast({ title: "Berhasil", description: "Kolam berhasil diupdate" });
      } else {
        const { error } = await (supabase as any)
          .from('ponds')
          .insert([pondData]);
        
        if (error) throw error;
        toast({ title: "Berhasil", description: "Kolam baru berhasil ditambahkan" });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const handleEdit = (pond: any) => {
    setEditingPond(pond);
    setFormData({
      name: pond.name,
      size_m2: pond.size_m2.toString(),
      depth_m: pond.depth_m.toString(),
      fish_count: pond.fish_count.toString(),
      fish_age_days: pond.fish_age_days.toString(),
      status: pond.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (pondId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('ponds')
        .delete()
        .eq('id', pondId);
      
      if (error) throw error;
      toast({ title: "Berhasil", description: "Kolam berhasil dihapus" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Kolam</h2>
          <p className="text-gray-600 mt-1">Kelola dan monitor kolam budidaya ikan lele</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kolam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size_m2">Ukuran (m²) *</Label>
                  <Input
                    id="size_m2"
                    type="number"
                    step="0.1"
                    value={formData.size_m2}
                    onChange={(e) => setFormData({...formData, size_m2: e.target.value})}
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
                    value={formData.depth_m}
                    onChange={(e) => setFormData({...formData, depth_m: e.target.value})}
                    placeholder="1.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fish_count">Jumlah Ikan</Label>
                  <Input
                    id="fish_count"
                    type="number"
                    value={formData.fish_count}
                    onChange={(e) => setFormData({...formData, fish_count: e.target.value})}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fish_age_days">Umur Ikan (hari)</Label>
                  <Input
                    id="fish_age_days"
                    type="number"
                    value={formData.fish_age_days}
                    onChange={(e) => setFormData({...formData, fish_age_days: e.target.value})}
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

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingPond ? 'Update' : 'Tambah'} Kolam
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ponds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ponds.map((pond) => (
          <Card key={pond.id} className="bg-white/70 backdrop-blur-sm border-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{pond.name}</h3>
                <Badge 
                  variant={pond.status === 'active' ? 'default' : 'secondary'}
                  className={pond.status === 'active' ? 'bg-green-500' : ''}
                >
                  {pond.status === 'active' ? 'Aktif' : 
                   pond.status === 'maintenance' ? 'Maintenance' : 'Non-aktif'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Fish className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-900">{pond.fish_count}</p>
                  <p className="text-sm text-blue-600">Ekor</p>
                </div>
                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                  <Activity className="h-6 w-6 text-cyan-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-cyan-900">{pond.fish_age_days}</p>
                  <p className="text-sm text-cyan-600">Hari</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ukuran:</span>
                  <span className="font-medium">{pond.size_m2}m²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kedalaman:</span>
                  <span className="font-medium">{pond.depth_m}m</span>
                </div>
                {pond.water_temperature && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Suhu:</span>
                    <span className="font-medium flex items-center">
                      <Thermometer className="h-3 w-3 mr-1" />
                      {pond.water_temperature}°C
                    </span>
                  </div>
                )}
                {pond.ph_level && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">pH:</span>
                    <span className="font-medium">{pond.ph_level}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(pond)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(pond.id)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ponds.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="text-center py-12">
            <Fish className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum Ada Kolam</h3>
            <p className="text-gray-500 mb-4">Mulai dengan menambahkan kolam budidaya pertama Anda</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kolam Pertama
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PondManagement;
