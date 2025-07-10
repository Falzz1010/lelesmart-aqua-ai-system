import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Fish, 
  Edit, 
  Trash2,
  Thermometer,
  Activity,
  Calendar,
  Ruler,
  Droplets
} from "lucide-react";
import { Pond } from "@/hooks/usePonds";

interface PondCardProps {
  pond: Pond;
  onEdit: (pond: Pond) => void;
  onDelete: (id: string) => void;
  viewMode?: "grid" | "list";
}

export const PondCard = ({ pond, onEdit, onDelete, viewMode = "grid" }: PondCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Maintenance</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Non-aktif</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-200 bg-green-50/30';
      case 'maintenance': return 'border-yellow-200 bg-yellow-50/30';
      case 'inactive': return 'border-gray-200 bg-gray-50/30';
      default: return 'border-blue-200 bg-blue-50/30';
    }
  };

  if (viewMode === "list") {
    return (
      <Card className={`bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200 ${getStatusColor(pond.status)}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{pond.name}</h3>
                {getStatusBadge(pond.status)}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Fish className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Ikan:</span>
                  <span className="font-medium">{pond.fish_count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Umur:</span>
                  <span className="font-medium">{pond.fish_age_days} hari</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600">Ukuran:</span>
                  <span className="font-medium">{pond.size_m2}m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-600" />
                  <span className="text-gray-600">Kedalaman:</span>
                  <span className="font-medium">{pond.depth_m}m</span>
                </div>
              </div>

              {(pond.water_temperature || pond.ph_level) && (
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  {pond.water_temperature && (
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3 text-red-500" />
                      <span className="text-gray-600">Suhu:</span>
                      <span className="font-medium">{pond.water_temperature}°C</span>
                    </div>
                  )}
                  {pond.ph_level && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-500" />
                      <span className="text-gray-600">pH:</span>
                      <span className="font-medium">{pond.ph_level}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 lg:flex-col lg:w-24">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onEdit(pond)} 
                className="flex-1 lg:flex-none text-xs sm:text-sm hover:bg-blue-50"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDelete(pond.id)}
                className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Hapus
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200 group ${getStatusColor(pond.status)}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2 group-hover:text-blue-600 transition-colors">
            {pond.name}
          </h3>
          {getStatusBadge(pond.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-100/50 transition-colors">
            <Fish className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-blue-900">{pond.fish_count}</p>
            <p className="text-xs sm:text-sm text-blue-600">Ekor</p>
          </div>
          <div className="text-center p-3 bg-cyan-50/50 rounded-lg border border-cyan-100 hover:bg-cyan-100/50 transition-colors">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-cyan-900">{pond.fish_age_days}</p>
            <p className="text-xs sm:text-sm text-cyan-600">Hari</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              Ukuran:
            </span>
            <span className="font-medium">{pond.size_m2}m²</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Kedalaman:
            </span>
            <span className="font-medium">{pond.depth_m}m</span>
          </div>
          {pond.water_temperature && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                Suhu:
              </span>
              <span className="font-medium">{pond.water_temperature}°C</span>
            </div>
          )}
          {pond.ph_level && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">pH:</span>
              <span className="font-medium">{pond.ph_level}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(pond)} 
            className="flex-1 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDelete(pond.id)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 text-xs sm:text-sm transition-colors"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};