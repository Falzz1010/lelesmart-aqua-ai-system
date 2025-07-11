
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Fish, Calendar, Thermometer, Trash2, Edit } from "lucide-react";
import type { Pond } from "@/types/database";

interface PondCardProps {
  pond: Pond;
  onEdit?: (pond: Pond) => void;
  onDelete?: (id: string) => void;
}

export const PondCard = ({ pond, onEdit, onDelete }: PondCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktif', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      maintenance: { label: 'Maintenance', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: 'Tidak Aktif', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  };

  const status = getStatusBadge(pond.status);

  return (
    <Card className="h-full hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold truncate">
            {pond.name}
          </CardTitle>
          <Badge className={`text-xs w-fit ${status.className}`}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Luas</p>
              <p className="font-medium truncate">{pond.size_m2} m²</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Fish className="h-4 w-4 text-teal-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Kedalaman</p>
              <p className="font-medium truncate">{pond.depth_m} m</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Fish className="h-4 w-4 text-green-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Jumlah Ikan</p>
              <p className="font-medium truncate">{pond.fish_count.toLocaleString()} ekor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Umur Ikan</p>
              <p className="font-medium truncate">{pond.fish_age_days} hari</p>
            </div>
          </div>
        </div>

        {(pond.water_temperature || pond.ph_level) && (
          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
            {pond.water_temperature && (
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Suhu</p>
                  <p className="font-medium truncate">{pond.water_temperature}°C</p>
                </div>
              </div>
            )}
            
            {pond.ph_level && (
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">pH</p>
                  <p className="font-medium truncate">{pond.ph_level}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(pond)}
              className="flex-1 h-8 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(pond.id)}
              className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Hapus
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
