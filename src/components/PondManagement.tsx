
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PondForm } from "@/components/pond/PondForm";
import { PondCard } from "@/components/pond/PondCard";
import { usePonds, Pond } from "@/hooks/usePonds";
import { PondInsert } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Fish,
  Droplets,
  TrendingUp
} from "lucide-react";

const PondManagement = () => {
  const { ponds, isLoading, addPond, updatePond, deletePond } = usePonds();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPond, setEditingPond] = useState<Pond | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "maintenance">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleSubmit = async (formData: PondInsert) => {
    try {
      if (editingPond) {
        await updatePond(editingPond.id, {
          name: formData.name,
          size_m2: formData.size_m2,
          depth_m: formData.depth_m,
          fish_count: formData.fish_count,
          fish_age_days: formData.fish_age_days,
          status: formData.status,
          water_temperature: formData.water_temperature,
          ph_level: formData.ph_level,
        });
        toast({
          title: "Berhasil",
          description: "Data kolam berhasil diperbarui"
        });
      } else {
        await addPond(formData);
        toast({
          title: "Berhasil",
          description: "Kolam baru berhasil ditambahkan"
        });
      }
      setIsFormOpen(false);
      setEditingPond(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePond(id);
      toast({
        title: "Berhasil",
        description: "Kolam berhasil dihapus"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat menghapus kolam"
      });
    }
  };

  const filteredPonds = ponds.filter((pond) => {
    const searchMatch = pond.name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === "all" || pond.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const activePondsCount = ponds.filter(pond => pond.status === 'active').length;
  const inactivePondsCount = ponds.filter(pond => pond.status === 'inactive').length;
  const maintenancePondsCount = ponds.filter(pond => pond.status === 'maintenance').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Manajemen Kolam</h2>
          <p className="text-muted-foreground">Atur dan pantau semua kolam Anda</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kolam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Kolam</p>
                <p className="text-2xl font-bold">{ponds.length}</p>
              </div>
              <Fish className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Kolam Aktif</p>
                <p className="text-2xl font-bold">{activePondsCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Maintenance</p>
                <p className="text-2xl font-bold">{maintenancePondsCount}</p>
              </div>
              <Droplets className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Cari kolam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-64 h-9 sm:h-10 text-sm"
          />
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Cari
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive" | "maintenance") => setStatusFilter(value)}>
            <SelectTrigger className="h-9 sm:h-10 text-sm">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Pond List/Grid */}
      <div className={`grid gap-4 sm:gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredPonds.map((pond) => (
          <PondCard
            key={pond.id}
            pond={pond}
            onEdit={(pond) => {
              setEditingPond(pond);
              setIsFormOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pond Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if (!open) {
          setEditingPond(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPond ? 'Edit Kolam' : 'Tambah Kolam Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingPond 
                ? 'Perbarui informasi kolam yang sudah ada'
                : 'Isi data kolam yang akan ditambahkan ke sistem'
              }
            </DialogDescription>
          </DialogHeader>
          <PondForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PondManagement;
