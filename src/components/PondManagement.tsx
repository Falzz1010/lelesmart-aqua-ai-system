
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Fish, Droplets, Calendar, Trash2 } from "lucide-react";

const PondManagement = () => {
  const [ponds, setPonds] = useState([
    {
      id: 1,
      name: "Kolam A",
      size: "10x15m",
      depth: "1.5m",
      fishCount: 2500,
      fishAge: 45,
      seedType: "Sangkuriang",
      lastHarvest: "2024-01-15",
      notes: "Kolam utama dengan kondisi optimal"
    },
    {
      id: 2,
      name: "Kolam B", 
      size: "12x18m",
      depth: "1.8m",
      fishCount: 3000,
      fishAge: 60,
      seedType: "Phyton",
      lastHarvest: "2024-02-01",
      notes: "Kolam terbesar, perlu perhatian ekstra pada aerasi"
    },
    {
      id: 3,
      name: "Kolam C",
      size: "8x12m", 
      depth: "1.2m",
      fishCount: 2200,
      fishAge: 30,
      seedType: "Sangkuriang",
      lastHarvest: "2024-03-10",
      notes: "Kolam percobaan untuk bibit baru"
    }
  ]);

  const [newPond, setNewPond] = useState({
    name: "",
    size: "",
    depth: "",
    fishCount: "",
    fishAge: "",
    seedType: "",
    notes: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddPond = () => {
    if (newPond.name && newPond.size && newPond.fishCount) {
      setPonds([...ponds, {
        id: Date.now(),
        ...newPond,
        fishCount: parseInt(newPond.fishCount),
        fishAge: parseInt(newPond.fishAge) || 0,
        lastHarvest: new Date().toISOString().split('T')[0]
      }]);
      setNewPond({
        name: "",
        size: "",
        depth: "", 
        fishCount: "",
        fishAge: "",
        seedType: "",
        notes: ""
      });
      setIsDialogOpen(false);
    }
  };

  const getAgeStatus = (age: number) => {
    if (age < 30) return { label: "Muda", color: "bg-blue-500" };
    if (age < 60) return { label: "Sedang", color: "bg-yellow-500" };
    if (age < 90) return { label: "Siap Panen", color: "bg-green-500" };
    return { label: "Lewat Masa", color: "bg-red-500" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Kolam</h2>
          <p className="text-gray-600 mt-1">Kelola informasi dan monitoring kolam budidaya</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kolam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tambah Kolam Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi kolam budidaya yang akan ditambahkan
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kolam *</Label>
                  <Input
                    id="name"
                    value={newPond.name}
                    onChange={(e) => setNewPond({...newPond, name: e.target.value})}
                    placeholder="Kolam D"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Ukuran *</Label>
                  <Input
                    id="size"
                    value={newPond.size}
                    onChange={(e) => setNewPond({...newPond, size: e.target.value})}
                    placeholder="10x15m"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depth">Kedalaman</Label>
                  <Input
                    id="depth"
                    value={newPond.depth}
                    onChange={(e) => setNewPond({...newPond, depth: e.target.value})}
                    placeholder="1.5m"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fishCount">Jumlah Ikan *</Label>
                  <Input
                    id="fishCount"
                    type="number"
                    value={newPond.fishCount}
                    onChange={(e) => setNewPond({...newPond, fishCount: e.target.value})}
                    placeholder="2500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fishAge">Umur Ikan (hari)</Label>
                  <Input
                    id="fishAge"
                    type="number"
                    value={newPond.fishAge}
                    onChange={(e) => setNewPond({...newPond, fishAge: e.target.value})}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seedType">Jenis Bibit</Label>
                  <Input
                    id="seedType"
                    value={newPond.seedType}
                    onChange={(e) => setNewPond({...newPond, seedType: e.target.value})}
                    placeholder="Sangkuriang"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={newPond.notes}
                  onChange={(e) => setNewPond({...newPond, notes: e.target.value})}
                  placeholder="Catatan tambahan tentang kolam..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddPond}>
                Tambah Kolam
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ponds.map((pond) => {
          const ageStatus = getAgeStatus(pond.fishAge);
          return (
            <Card key={pond.id} className="bg-white/70 backdrop-blur-sm border-blue-100/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800">{pond.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Ukuran: {pond.size} | Kedalaman: {pond.depth}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                    <Fish className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-800">{pond.fishCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Populasi Ikan</p>
                  </div>
                  <div className="text-center p-3 bg-teal-50/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-teal-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-800">{pond.fishAge}</p>
                    <p className="text-xs text-gray-600">Hari</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jenis Bibit:</span>
                    <Badge variant="outline">{pond.seedType}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status Umur:</span>
                    <Badge className={`${ageStatus.color} text-white`}>
                      {ageStatus.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Panen Terakhir:</span>
                    <span className="text-sm font-medium">{pond.lastHarvest}</span>
                  </div>
                </div>

                {pond.notes && (
                  <div className="p-3 bg-gray-50/50 rounded-lg">
                    <p className="text-sm text-gray-700">{pond.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Droplets className="h-4 w-4 mr-1" />
                    Cek Air
                  </Button>
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                    <Fish className="h-4 w-4 mr-1" />
                    Detail
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle>Ringkasan Kolam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{ponds.length}</p>
              <p className="text-sm text-gray-600">Total Kolam</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600">
                {ponds.reduce((sum, pond) => sum + pond.fishCount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Populasi</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {ponds.filter(p => p.fishAge >= 60 && p.fishAge < 90).length}
              </p>
              <p className="text-sm text-gray-600">Siap Panen</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(ponds.reduce((sum, pond) => sum + pond.fishAge, 0) / ponds.length)}
              </p>
              <p className="text-sm text-gray-600">Rata-rata Umur</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PondManagement;
