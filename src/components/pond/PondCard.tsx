
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Fish, Calendar, Thermometer, Trash2, Edit, Waves } from "lucide-react";
import type { Pond } from "@/types/database";

interface PondCardProps {
  pond: Pond;
  onEdit?: (pond: Pond) => void;
  onDelete?: (id: string) => void;
}

export const PondCard = ({ pond, onEdit, onDelete }: PondCardProps) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      active: { 
        label: 'Aktif', 
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
        cardBorder: 'border-emerald-200/50 dark:border-emerald-800/30',
        gradient: 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
      },
      maintenance: { 
        label: 'Maintenance', 
        className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
        cardBorder: 'border-amber-200/50 dark:border-amber-800/30',
        gradient: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
      },
      inactive: { 
        label: 'Tidak Aktif', 
        className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
        cardBorder: 'border-red-200/50 dark:border-red-800/30',
        gradient: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
      },
    };
    
    return configs[status as keyof typeof configs] || configs.active;
  };

  const statusConfig = getStatusConfig(pond.status);

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 border ${statusConfig.cardBorder} bg-white dark:bg-card shadow-sm`}>
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 ${statusConfig.gradient} opacity-50`} />
      
      <CardHeader className="relative pb-3 space-y-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-foreground truncate group-hover:text-primary transition-colors">
              {pond.name}
            </CardTitle>
            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Dibuat {new Date(pond.created_at).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
          <Badge className={`${statusConfig.className} font-medium text-xs`}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Main stats in a modern grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/95 dark:bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium">Luas Kolam</p>
                <p className="text-lg font-bold text-gray-900 dark:text-foreground">{pond.size_m2}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">m²</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full shadow-sm">
                <Waves className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium">Kedalaman</p>
                <p className="text-lg font-bold text-gray-900 dark:text-foreground">{pond.depth_m}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">meter</p>
              </div>
              <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-full shadow-sm">
                <Droplets className="h-4 w-4 text-cyan-700 dark:text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium">Jumlah Ikan</p>
                <p className="text-lg font-bold text-gray-900 dark:text-foreground">{pond.fish_count}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">ekor</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full shadow-sm">
                <Fish className="h-4 w-4 text-green-700 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium">Umur Ikan</p>
                <p className="text-lg font-bold text-gray-900 dark:text-foreground">{pond.fish_age_days}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">hari</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full shadow-sm">
                <Calendar className="h-4 w-4 text-purple-700 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Water quality indicators */}
        {(pond.water_temperature || pond.ph_level) && (
          <div className="bg-white/90 dark:bg-background/40 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-border/50 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3 flex items-center">
              <Thermometer className="h-4 w-4 mr-2 text-blue-700 dark:text-blue-600" />
              Kualitas Air
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {pond.water_temperature && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-muted-foreground">Suhu Air</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-foreground">{pond.water_temperature}°C</p>
                </div>
              )}
              {pond.ph_level && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-muted-foreground">pH Level</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-foreground">{pond.ph_level}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(pond)}
              className="flex-1 h-9 bg-white/90 dark:bg-background/80 hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-gray-300 dark:border-border text-gray-700 dark:text-foreground"
            >
              <Edit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(pond.id)}
              className="flex-1 h-9 bg-white/90 dark:bg-background/80 text-red-700 dark:text-destructive border-red-300 dark:border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Hapus</span>
              <span className="sm:hidden">Del</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
