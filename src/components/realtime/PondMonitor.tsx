import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePonds } from '@/hooks/usePonds';
import { calculateWaterQualityIndex, calculatePHStatus, calculateTemperatureStatus } from '@/utils/calculations';
import { formatTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface WaterQualityData {
  id: string;
  pond_id: string;
  temperature: number | null;
  ph_level: number | null;
  dissolved_oxygen: number | null;
  ammonia_level: number | null;
  recorded_at: string;
}

interface PondMonitorProps {
  pondId?: string;
  showAllPonds?: boolean;
  className?: string;
}

export const PondMonitor = ({ 
  pondId, 
  showAllPonds = false,
  className 
}: PondMonitorProps) => {
  const { ponds } = usePonds();
  const [waterQualityData, setWaterQualityData] = useState<WaterQualityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Filter ponds based on props
  const monitoredPonds = showAllPonds 
    ? ponds 
    : pondId 
    ? ponds.filter(p => p.id === pondId)
    : ponds.slice(0, 3); // Show first 3 ponds by default

  // Fetch water quality data
  const fetchWaterQualityData = async () => {
    try {
      const pondIds = monitoredPonds.map(p => p.id);
      if (pondIds.length === 0) return;

      const { data, error } = await supabase
        .from('water_quality_logs')
        .select('*')
        .in('pond_id', pondIds)
        .order('recorded_at', { ascending: false })
        .limit(pondIds.length); // Get latest for each pond

      if (error) throw error;

      setWaterQualityData(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching water quality data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchWaterQualityData();

    const channel = supabase
      .channel('water-quality-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'water_quality_logs'
        },
        () => {
          fetchWaterQualityData();
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchWaterQualityData, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [monitoredPonds.length]);

  const getWaterQualityForPond = (pondId: string) => {
    return waterQualityData.find(data => data.pond_id === pondId);
  };

  const getTrendIcon = (value: number, optimal: [number, number]) => {
    if (value >= optimal[0] && value <= optimal[1]) {
      return <Minus className="h-3 w-3 text-green-600" />;
    } else if (value < optimal[0]) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    } else {
      return <TrendingUp className="h-3 w-3 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'optimal' | 'warning' | 'danger') => {
    switch (status) {
      case 'optimal':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring Real-time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring Real-time
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Update: {formatTime(lastUpdate)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchWaterQualityData}
              disabled={isLoading}
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isLoading && "animate-spin"
              )} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {monitoredPonds.map((pond) => {
          const qualityData = getWaterQualityForPond(pond.id);
          const waterQualityIndex = qualityData 
            ? calculateWaterQualityIndex({
                temperature: qualityData.temperature || undefined,
                phLevel: qualityData.ph_level || undefined,
                dissolvedOxygen: qualityData.dissolved_oxygen || undefined,
                ammonia: qualityData.ammonia_level || undefined,
              })
            : 0;

          return (
            <div
              key={pond.id}
              className="p-4 border border-border rounded-lg bg-gradient-to-r from-background to-muted/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{pond.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        waterQualityIndex >= 80 && "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400",
                        waterQualityIndex >= 60 && waterQualityIndex < 80 && "border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400",
                        waterQualityIndex < 60 && "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
                      )}
                    >
                      Kualitas Air: {waterQualityIndex}%
                    </Badge>
                  </div>
                </div>
                
                {waterQualityIndex < 60 && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <Progress 
                value={waterQualityIndex} 
                className="h-2 mb-4"
              />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                {/* Temperature */}
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Suhu</p>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "font-medium",
                        qualityData?.temperature 
                          ? getStatusColor(calculateTemperatureStatus(qualityData.temperature))
                          : "text-muted-foreground"
                      )}>
                        {qualityData?.temperature ? `${qualityData.temperature}°C` : 'N/A'}
                      </span>
                      {qualityData?.temperature && getTrendIcon(qualityData.temperature, [26, 30])}
                    </div>
                  </div>
                </div>

                {/* pH Level */}
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">pH</p>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "font-medium",
                        qualityData?.ph_level 
                          ? getStatusColor(calculatePHStatus(qualityData.ph_level))
                          : "text-muted-foreground"
                      )}>
                        {qualityData?.ph_level || 'N/A'}
                      </span>
                      {qualityData?.ph_level && getTrendIcon(qualityData.ph_level, [6.5, 8.5])}
                    </div>
                  </div>
                </div>

                {/* Dissolved Oxygen */}
                {qualityData?.dissolved_oxygen && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">DO</p>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">
                          {qualityData.dissolved_oxygen} ppm
                        </span>
                        {getTrendIcon(qualityData.dissolved_oxygen, [4, 6])}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ammonia */}
                {qualityData?.ammonia_level && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">NH₃</p>
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "font-medium",
                          qualityData.ammonia_level <= 0.5 ? "text-green-600" : "text-red-600"
                        )}>
                          {qualityData.ammonia_level} ppm
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {qualityData && (
                <p className="text-xs text-muted-foreground mt-3">
                  Terakhir diperbarui: {formatTime(new Date(qualityData.recorded_at))}
                </p>
              )}
            </div>
          );
        })}

        {monitoredPonds.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada kolam untuk dimonitor</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};