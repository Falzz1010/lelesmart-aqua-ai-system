
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Budi Santoso",
      email: "budi@lelesmart.com",
      role: "farmer",
      phone: "081234567890",
      location: "Kolam A-C",
      status: "active",
      lastLogin: "2024-01-15 10:30",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Dr. Siti Rahayu",
      email: "siti@lelesmart.com", 
      role: "supervisor",
      phone: "081234567891",
      location: "Area Utara",
      status: "active",
      lastLogin: "2024-01-15 09:15",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Ahmad Wijaya",
      email: "ahmad@lelesmart.com",
      role: "admin",
      phone: "081234567892", 
      location: "Pusat Kontrol",
      status: "active",
      lastLogin: "2024-01-15 08:00",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "Rina Marlina",
      email: "rina@lelesmart.com",
      role: "farmer", 
      phone: "081234567893",
      location: "Kolam D-F",
      status: "inactive",
      lastLogin: "2024-01-10 16:45",
      avatar: "/api/placeholder/40/40"
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    location: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const roleConfig = {
    admin: {
      label: "Administrator",
      icon: ShieldCheck,
      color: "bg-red-500",
      description: "Akses penuh ke semua fitur sistem"
    },
    supervisor: {
      label: "Supervisor",
      icon: Shield,
      color: "bg-blue-500", 
      description: "Monitoring dan kontrol operasional"
    },
    farmer: {
      label: "Peternak",
      icon: User,
      color: "bg-green-500",
      description: "Akses kolam dan monitoring dasar"
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.role) {
      setUsers([...users, {
        id: Date.now(),
        ...newUser,
        status: "active",
        lastLogin: "Belum pernah login",
        avatar: "/api/placeholder/40/40"
      }]);
      setNewUser({
        name: "",
        email: "",
        role: "",
        phone: "",
        location: ""
      });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" }
        : user
    ));
  };

  const getRoleStats = () => {
    const stats = { admin: 0, supervisor: 0, farmer: 0 };
    users.forEach(user => {
      stats[user.role]++;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h2>
          <p className="text-gray-600 mt-1">Kelola akses dan peran pengguna sistem</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi pengguna yang akan ditambahkan ke sistem
              </DialogDescription>
            </div>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@lelesmart.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Peran *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Peternak</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="081234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi/Area</Label>
                  <Input
                    id="location"
                    value={newUser.location}
                    onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                    placeholder="Kolam A-C"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddUser}>
                Tambah Pengguna
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon;
          return (
            <Card key={role} className="bg-white/70 backdrop-blur-sm border-blue-100/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{roleStats[role]}</p>
                    <p className="text-sm text-gray-600">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users List */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Daftar Pengguna</span>
          </CardTitle>
          <CardDescription>
            Total {users.length} pengguna terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => {
              const roleInfo = roleConfig[user.role];
              const RoleIcon = roleInfo.icon;
              
              return (
                <div key={user.id} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-800">{user.name}</h3>
                          <Badge className={`${roleInfo.color} text-white`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                          <Badge 
                            variant={user.status === "active" ? "default" : "secondary"}
                            className={user.status === "active" ? "bg-green-500" : "bg-gray-500"}
                          >
                            {user.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{user.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          Login terakhir: {user.lastLogin}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUserStatus(user.id)}
                        className={user.status === "active" ? "text-orange-600" : "text-green-600"}
                      >
                        {user.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50">
        <CardHeader>
          <CardTitle>Hak Akses Peran</CardTitle>
          <CardDescription>Ringkasan akses yang dimiliki setiap peran pengguna</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(roleConfig).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <div key={role} className="p-4 bg-white/50 rounded-lg border border-blue-100/30">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded ${config.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800">{config.label}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    {role === "admin" && (
                      <>
                        <p>✓ Akses semua fitur</p>
                        <p>✓ Manajemen pengguna</p>
                        <p>✓ Konfigurasi sistem</p>
                        <p>✓ Laporan lengkap</p>
                      </>
                    )}
                    {role === "supervisor" && (
                      <>
                        <p>✓ Monitoring semua kolam</p>
                        <p>✓ Kontrol AI dan prediksi</p>
                        <p>✓ Laporan operasional</p>
                        <p>✗ Manajemen pengguna</p>
                      </>
                    )}
                    {role === "farmer" && (
                      <>
                        <p>✓ Monitoring kolam tertentu</p>
                        <p>✓ Input data harian</p>
                        <p>✓ Notifikasi dan alarm</p>
                        <p>✗ Akses data keuangan</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
