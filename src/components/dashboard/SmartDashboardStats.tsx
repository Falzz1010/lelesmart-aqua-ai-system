import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Fish, 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  Thermometer,
  Activity,
  Calendar,
  Target,
  Brain,
  Zap,
  RefreshCw,
  BarChart3,
  Waves,
  Clock
} from "lucide-react";
import { usePonds } from "@/hooks/usePonds";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { PondMonitor } from "@/components/realtime/PondMonitor";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: 'good' | 'warning' | 'danger';
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  status = 'good',
  className 
}: StatCardProps) => {
  const statusStyles = {
    good: 'border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    warning: 'border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    danger: 'border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      statusStyles[status],
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-background/60 backdrop-blur-sm rounded-full border border-border/50">
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
            </div>
          </div>
          
          {trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "secondary"}
              className={cn(
                "text-xs",
                trend.isPositive 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SmartDashboardStats = () => {
  const { ponds, isLoading } = usePonds();
  const { analyzePondData, isAnalyzing } = useAIAssistant();
  const { feedingSchedules, healthRecords } = useRealtimeData();
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [healthScore, setHealthScore] = useState(85);
  const [productivityScore, setProductivityScore] = useState(78);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [realtimeData, setRealtimeData] = useState({
    activeFeedingSchedules: 0,
    recentHealthRecords: 0,
    waterQualityAlerts: 0
  });

  // Calculate dashboard metrics
  const totalPonds = ponds.length;
  const activePonds = ponds.filter(pond => pond.status === 'active').length;
  const totalFish = ponds.reduce((sum, pond) => sum + pond.fish_count, 0);
  const avgFishAge = ponds.length > 0 
    ? Math.round(ponds.reduce((sum, pond) => sum + pond.fish_age_days, 0) / ponds.length)
    : 0;

  // Calculate water quality metrics
  const pondsWithTemp = ponds.filter(p => p.water_temperature !== null);
  const avgTemperature = pondsWithTemp.length > 0
    ? (pondsWithTemp.reduce((sum, p) => sum + (p.water_temperature || 0), 0) / pondsWithTemp.length).toFixed(1)
    : 'N/A';

  const pondsWithPH = ponds.filter(p => p.ph_level !== null);
  const avgPH = pondsWithPH.length > 0
    ? (pondsWithPH.reduce((sum, p) => sum + (p.ph_level || 0), 0) / pondsWithPH.length).toFixed(1)
    : 'N/A';

  // Health status assessment
  const getHealthStatus = () => {
    if (healthScore >= 80) return 'good';
    if (healthScore >= 60) return 'warning';
    return 'danger';
  };

  const handleAIAnalysis = async () => {
    if (ponds.length === 0) return;

    const pondData = ponds.map(pond => ({
      pondId: pond.id,
      pondName: pond.name,
      waterTemperature: pond.water_temperature,
      phLevel: pond.ph_level,
      fishCount: pond.fish_count,
      fishAge: pond.fish_age_days,
      size: pond.size_m2,
      depth: pond.depth_m,
      status: pond.status
    }));

    await analyzePondData(pondData);
    setShowAIAssistant(true);
  };

  // Update real-time data
  const updateRealtimeData = () => {
    const activeFeedingSchedules = feedingSchedules.filter(f => f.status === 'pending').length;
    const recentHealthRecords = healthRecords.filter(h => {
      const recordDate = new Date(h.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return recordDate > oneDayAgo;
    }).length;
    
    const waterQualityAlerts = ponds.filter(p => {
      const tempAlert = p.water_temperature && (p.water_temperature < 26 || p.water_temperature > 30);
      const phAlert = p.ph_level && (p.ph_level < 6.5 || p.ph_level > 8.5);
      return tempAlert || phAlert;
    }).length;

    setRealtimeData({
      activeFeedingSchedules,
      recentHealthRecords,
      waterQualityAlerts
    });
    setLastUpdate(new Date());
  };

  // Set up real-time updates and subscriptions
  useEffect(() => {
    updateRealtimeData();

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('user-feeding').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feeding_schedules' }, 
        updateRealtimeData
      ),
      supabase.channel('user-health').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'health_records' }, 
        updateRealtimeData
      ),
      supabase.channel('user-ponds').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ponds' }, 
        updateRealtimeData
      )
    ];

    channels.forEach(channel => channel.subscribe());

    // Simulate real-time score updates
    const scoreInterval = setInterval(() => {
      setHealthScore(prev => {
        const change = (Math.random() - 0.5) * 1.5;
        return Math.max(0, Math.min(100, prev + change));
      });
      
      setProductivityScore(prev => {
        const change = (Math.random() - 0.5) * 1;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 15000);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      clearInterval(scoreInterval);
    };
  }, [feedingSchedules.length, healthRecords.length, ponds.length]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Real-time Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Cerdas</h2>
          <p className="text-muted-foreground">Monitoring real-time dengan bantuan AI</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Update: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={updateRealtimeData}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || ponds.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Menganalisis...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analisis AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Stats Grid - Enhanced with Real-time */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <StatCard
          title="Total Kolam"
          value={totalPonds}
          description={`${activePonds} aktif`}
          icon={<Droplets className="h-4 w-4 text-blue-600" />}
          trend={{ value: 12, isPositive: true }}
          className="col-span-1"
        />
        
        <StatCard
          title="Total Ikan"
          value={totalFish.toLocaleString()}
          description={`Umur ${avgFishAge} hari`}
          icon={<Fish className="h-4 w-4 text-green-600" />}
          trend={{ value: 8, isPositive: true }}
          className="col-span-1"
        />
        
        <StatCard
          title="Suhu"
          value={`${avgTemperature}°C`}
          description="Rata-rata"
          icon={<Thermometer className="h-4 w-4 text-orange-600" />}
          status={avgTemperature !== 'N/A' && parseFloat(avgTemperature) >= 26 && parseFloat(avgTemperature) <= 30 ? 'good' : 'warning'}
          className="col-span-1"
        />
        
        <StatCard
          title="pH Level"
          value={avgPH}
          description="Keasaman"
          icon={<Activity className="h-4 w-4 text-purple-600" />}
          status={avgPH !== 'N/A' && parseFloat(avgPH) >= 6.5 && parseFloat(avgPH) <= 8.5 ? 'good' : 'warning'}
          className="col-span-1"
        />

        <StatCard
          title="Jadwal Pakan"
          value={realtimeData.activeFeedingSchedules}
          description="Pending"
          icon={<Calendar className="h-4 w-4 text-amber-600" />}
          status={realtimeData.activeFeedingSchedules > 5 ? 'warning' : 'good'}
          className="col-span-1"
        />

        <StatCard
          title="Alert Kualitas"
          value={realtimeData.waterQualityAlerts}
          description="Perlu perhatian"
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          status={realtimeData.waterQualityAlerts > 0 ? 'danger' : 'good'}
          className="col-span-1"
        />
      </div>

      {/* Health & Productivity Scores */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Skor Kesehatan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-foreground">
                  {Math.round(healthScore)}%
                </span>
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getHealthStatus() === 'good' && "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400",
                    getHealthStatus() === 'warning' && "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
                    getHealthStatus() === 'danger' && "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
                  )}
                >
                  {getHealthStatus() === 'good' && 'Excellent'}
                  {getHealthStatus() === 'warning' && 'Good'}
                  {getHealthStatus() === 'danger' && 'Needs Attention'}
                </Badge>
              </div>
              <Progress value={healthScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Berdasarkan kualitas air, kondisi ikan, dan parameter kolam
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Skor Produktivitas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-foreground">
                  {Math.round(productivityScore)}%
                </span>
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400">
                  {productivityScore >= 80 ? 'Optimal' : productivityScore >= 60 ? 'Good' : 'Improving'}
                </Badge>
              </div>
              <Progress value={productivityScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Efisiensi pakan, pertumbuhan ikan, dan manajemen kolam
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Monitoring & Analytics */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PondMonitor showAllPonds={false} />
        </div>
        
        <Card className="bg-gradient-to-b from-muted/30 to-muted/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Real-time Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Health Records (24h)</span>
                <Badge variant="outline" className="text-xs">
                  {realtimeData.recentHealthRecords}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Feedings</span>
                <Badge variant={realtimeData.activeFeedingSchedules > 5 ? "destructive" : "default"} className="text-xs">
                  {realtimeData.activeFeedingSchedules}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Water Alerts</span>
                <Badge variant={realtimeData.waterQualityAlerts > 0 ? "destructive" : "default"} className="text-xs">
                  {realtimeData.waterQualityAlerts}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">System Performance</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Kolam Aktif</span>
                    <span>{Math.round((activePonds / totalPonds) * 100 || 0)}%</span>
                  </div>
                  <Progress value={(activePonds / totalPonds) * 100 || 0} className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Efisiensi Pakan</span>
                    <span>{Math.round(((feedingSchedules.length - realtimeData.activeFeedingSchedules) / feedingSchedules.length) * 100 || 100)}%</span>
                  </div>
                  <Progress value={((feedingSchedules.length - realtimeData.activeFeedingSchedules) / feedingSchedules.length) * 100 || 100} className="h-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-primary/5"
                onClick={() => setShowAIAssistant(true)}
              >
                <Brain className="h-4 w-4" />
                <span className="text-xs">AI Konsultasi</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-primary/5"
              >
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Jadwal Pakan</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-primary/5"
              >
                <Target className="h-4 w-4" />
                <span className="text-xs">Prediksi</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-primary/5"
              >
                <Waves className="h-4 w-4" />
                <span className="text-xs">Kualitas Air</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Status Real-time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Monitoring Aktif</span>
                </div>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    realtimeData.waterQualityAlerts === 0 ? "bg-green-500" : "bg-red-500 animate-pulse"
                  )}></div>
                  <span className="text-sm font-medium">Kualitas Air</span>
                </div>
                <Badge variant={realtimeData.waterQualityAlerts === 0 ? "default" : "destructive"} className="text-xs">
                  {realtimeData.waterQualityAlerts === 0 ? 'Normal' : `${realtimeData.waterQualityAlerts} Alert`}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    realtimeData.activeFeedingSchedules <= 5 ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                  )}></div>
                  <span className="text-sm font-medium">Jadwal Pakan</span>
                </div>
                <Badge variant={realtimeData.activeFeedingSchedules <= 5 ? "default" : "secondary"} className="text-xs">
                  {realtimeData.activeFeedingSchedules} Pending
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Modal/Sidebar */}
      {showAIAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:text-white hover:bg-white/20"
              onClick={() => setShowAIAssistant(false)}
            >
              Tutup
            </Button>
            <AIAssistant 
              onAnalysisRequest={handleAIAnalysis}
              className="w-full h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};