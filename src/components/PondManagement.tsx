import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { PondForm, PondFormData } from "@/components/pond/PondForm";
import { PondCard } from "@/components/pond/PondCard";
import { Pond } from "@/hooks/usePonds";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PondManagement = () => {
  const { ponds, loading, createPond, updatePond, deletePond } = usePonds();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPond, setEditingPond] = useState<Pond | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter ponds based on search and status
  const filteredPonds = ponds.filter(pond => {
    const matchesSearch = pond.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pond.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: ponds.length,
    active: ponds.filter(p => p.status === 'active').length,
    maintenance: ponds.filter(p => p.status === 'maintenance').length,
    inactive: ponds.filter(p => p.status === 'inactive').length,
    totalFish: ponds.reduce((sum, pond) => sum + (pond.fish_count || 0), 0),
    avgAge: ponds.length > 0 ? Math.round(ponds.reduce((sum, pond) => sum + (pond.fish_age_days || 0), 0) / ponds.length) : 0
  };

  const handleSubmit = async (formData: PondFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPond) {
        await updatePond(editingPond.id, formData);
      } else {
        await createPond(formData);
      }
      setIsDialogOpen(false);
      setEditingPond(null);
    } catch (error) {
      console.error('Error submitting pond:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pond: Pond) => {
    setEditingPond(pond);
    setIsDialogOpen(true);
  };

  const handleDelete = async (pondId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kolam ini?')) {
      await deletePond(pondId);
    }
  };

  const handleAddNew = () => {
    setEditingPond(null);
    setIsDialogOpen(true);
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
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Manajemen Kolam</h2>
            <p className="text-gray-600 mt-1">Kelola dan monitor kolam budidaya ikan lele</p>
          </div>
          
          <Button 
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 w-full sm:w-auto shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kolam
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Total</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <p className="text-green-100 text-xs sm:text-sm font-medium">Aktif</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <p className="text-yellow-100 text-xs sm:text-sm font-medium">Maintenance</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.maintenance}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <p className="text-gray-100 text-xs sm:text-sm font-medium">Non-aktif</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.inactive}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Ikan</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalFish.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <p className="text-teal-100 text-xs sm:text-sm font-medium">Rata-rata Umur</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.avgAge}</p>
                <p className="text-teal-100 text-xs">hari</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari kolam..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              {/* Status Filter */}
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Non-aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Filter aktif:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Pencarian: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="h-6 px-2 text-xs"
              >
                Hapus semua
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {filteredPonds.length !== ponds.length && (
        <div className="text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg">
          Menampilkan {filteredPonds.length} dari {ponds.length} kolam
        </div>
      )}

      {/* Ponds Grid/List */}
      {filteredPonds.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {ponds.length === 0 ? "Belum Ada Kolam" : "Tidak Ada Hasil"}
            </h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              {ponds.length === 0 
                ? "Mulai dengan menambahkan kolam budidaya pertama Anda" 
                : "Coba ubah filter atau kata kunci pencarian"
              }
            </p>
            {ponds.length === 0 ? (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kolam Pertama
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full sm:w-auto"
              >
                Reset Filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
            : "space-y-4"
        }>
          {filteredPonds.map((pond) => (
            <PondCard
              key={pond.id}
              pond={pond}
              onEdit={handleEdit}
              onDelete={handleDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pond Form Dialog */}
      <PondForm
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingPond(null);
        }}
        onSubmit={handleSubmit}
        editingPond={editingPond}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default PondManagement;