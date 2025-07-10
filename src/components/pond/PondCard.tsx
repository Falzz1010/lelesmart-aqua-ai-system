
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Fish, 
  Edit, 
  Trash2,
  Thermometer,
  Activity
} from "lucide-react";
import { Pond } from "@/hooks/usePonds";

interface PondCardProps {
  pond: Pond;
  onEdit: (pond: Pond) => void;
  onDelete: (id: string) => void;
}

export const PondCard = ({ pond, onEdit, onDelete }: PondCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktif</Badge>;
      case 'maintenance':
        return <Badge variant="secondary">Maintenance</Badge>;
      case 'inactive':
        return <Badge variant="outline">Non-aktif</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-blue-100/50 hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-2">{pond.name}</h3>
          {getStatusBadge(pond.status)}
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
            <Fish className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-blue-900">{pond.fish_count}</p>
            <p className="text-xs sm:text-sm text-blue-600">Ekor</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-cyan-50 rounded-lg">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-bold text-cyan-900">{pond.fish_age_days}</p>
            <p className="text-xs sm:text-sm text-cyan-600">Hari</p>
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

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(pond)} 
            className="flex-1 text-xs sm:text-sm"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDelete(pond.id)}
            className="flex-1 text-red-600 hover:text-red-700 text-xs sm:text-sm"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
