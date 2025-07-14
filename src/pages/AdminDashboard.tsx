import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Users, Database, Activity, LogOut, Fish, Heart, Calendar, TrendingUp, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePonds } from '@/hooks/usePonds';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { supabase } from '@/integrations/supabase/client';
import { PondMonitor } from '@/components/realtime/PondMonitor';
import { cn } from '@/lib/utils';

export const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile(user);
  const { ponds } = usePonds();
  const { feedingSchedules, healthRecords, isLoading: realtimeLoading } = useRealtimeData();
  
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalPonds: 0,
    activePonds: 0,
    totalFish: 0,
    pendingFeedings: 0,
    healthAlerts: 0,
    databaseStatus: 'checking',
    realtimeStatus: 'checking'
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/admin-auth" replace />;
  }

  // Redirect if not admin
  if (!loading && profile && profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  // Fetch system statistics
  const fetchSystemStats = async () => {
    try {
      // Check database status
      const { data: pondsData, error: pondsError } = await supabase
        .from('ponds')
        .select('*', { count: 'exact' });

      // Get user count
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (!pondsError && !usersError) {
        const totalPonds = pondsData?.length || 0;
        const activePonds = pondsData?.filter(p => p.status === 'active').length || 0;
        const totalFish = pondsData?.reduce((sum, pond) => sum + pond.fish_count, 0) || 0;
        const pendingFeedings = feedingSchedules.filter(f => f.status === 'pending').length;
        const healthAlerts = healthRecords.filter(h => h.health_status === 'sick' || h.health_status === 'critical').length;

        setSystemStats({
          totalUsers: usersData?.length || 0,
          totalPonds,
          activePonds,
          totalFish,
          pendingFeedings,
          healthAlerts,
          databaseStatus: 'connected',
          realtimeStatus: 'active'
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching system stats:', error);
      setSystemStats(prev => ({
        ...prev,
        databaseStatus: 'error',
        realtimeStatus: 'error'
      }));
    }
  };

  // Set up real-time updates
  useEffect(() => {
    fetchSystemStats();

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('admin-ponds').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ponds' }, 
        fetchSystemStats
      ),
      supabase.channel('admin-profiles').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        fetchSystemStats
      ),
      supabase.channel('admin-feeding').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feeding_schedules' }, 
        fetchSystemStats
      ),
      supabase.channel('admin-health').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'health_records' }, 
        fetchSystemStats
      )
    ];

    channels.forEach(channel => channel.subscribe());

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      clearInterval(interval);
    };
  }, [feedingSchedules.length, healthRecords.length]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">LeleSmart Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Selamat datang, {profile?.full_name || 'Administrator'}
          </h2>
          <p className="text-muted-foreground">
            Kelola sistem manajemen kolam ikan dari dashboard ini
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Update: {lastUpdate.toLocaleTimeString()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSystemStats}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {(systemStats.healthAlerts > 0 || systemStats.pendingFeedings > 5) && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              {systemStats.healthAlerts + systemStats.pendingFeedings} Alert
            </Badge>
          )}
        </div>

        {/* Real-time Statistics Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Pengguna terdaftar</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kolam</CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{systemStats.totalPonds}</div>
              <p className="text-xs text-muted-foreground">{systemStats.activePonds} aktif</p>
              <Progress value={(systemStats.activePonds / systemStats.totalPonds) * 100 || 0} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ikan</CardTitle>
              <Fish className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{systemStats.totalFish.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Di semua kolam</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "bg-gradient-to-r border-200/50",
            systemStats.healthAlerts > 0 
              ? "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200/50" 
              : "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200/50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              {systemStats.healthAlerts > 0 ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <Heart className="h-4 w-4 text-green-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                systemStats.healthAlerts > 0 ? "text-red-600" : "text-green-600"
              )}>
                {systemStats.healthAlerts > 0 ? `${systemStats.healthAlerts} Alert` : 'Sehat'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStats.healthAlerts > 0 ? 'Perlu perhatian' : 'Semua kolam sehat'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jadwal Pakan</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{systemStats.pendingFeedings}</div>
              <p className="text-xs text-muted-foreground">Menunggu eksekusi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                systemStats.databaseStatus === 'connected' ? "text-green-600" : "text-red-600"
              )}>
                {systemStats.databaseStatus === 'connected' ? 'Online' : 'Error'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStats.databaseStatus === 'connected' ? 'Koneksi aktif' : 'Koneksi bermasalah'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realtime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                systemStats.realtimeStatus === 'active' ? "text-green-600" : "text-red-600"
              )}>
                {systemStats.realtimeStatus === 'active' ? 'Aktif' : 'Error'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStats.realtimeStatus === 'active' ? 'Sinkronisasi real-time' : 'Koneksi bermasalah'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Monitoring Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <PondMonitor showAllPonds={false} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sistem Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Kesehatan Kolam</span>
                  <span className="text-sm font-medium">
                    {Math.round(((systemStats.totalPonds - systemStats.healthAlerts) / systemStats.totalPonds) * 100 || 100)}%
                  </span>
                </div>
                <Progress value={((systemStats.totalPonds - systemStats.healthAlerts) / systemStats.totalPonds) * 100 || 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Kolam Aktif</span>
                  <span className="text-sm font-medium">
                    {Math.round((systemStats.activePonds / systemStats.totalPonds) * 100 || 0)}%
                  </span>
                </div>
                <Progress value={(systemStats.activePonds / systemStats.totalPonds) * 100 || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Jadwal Terlaksana</span>
                  <span className="text-sm font-medium">
                    {Math.round(((feedingSchedules.length - systemStats.pendingFeedings) / feedingSchedules.length) * 100 || 100)}%
                  </span>
                </div>
                <Progress value={((feedingSchedules.length - systemStats.pendingFeedings) / feedingSchedules.length) * 100 || 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Sistem</CardTitle>
            <CardDescription>
              Detail administrator dan status sistem LeleSmart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="font-medium mb-3 text-foreground">Administrator</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Email:</span> {profile?.email}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Role:</span> {profile?.role}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Nama:</span> {profile?.full_name}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-foreground">Statistik Real-time</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Update terakhir:</span> {lastUpdate.toLocaleTimeString()}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Data kolam:</span> {systemStats.totalPonds} kolam
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Pengguna aktif:</span> {systemStats.totalUsers} user
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-foreground">Status Sistem</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      systemStats.databaseStatus === 'connected' ? "bg-green-500" : "bg-red-500"
                    )}></span>
                    <span className="font-medium text-foreground">Database:</span> 
                    {systemStats.databaseStatus === 'connected' ? 'Terhubung' : 'Error'}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      systemStats.realtimeStatus === 'active' ? "bg-green-500" : "bg-red-500"
                    )}></span>
                    <span className="font-medium text-foreground">Real-time:</span> 
                    {systemStats.realtimeStatus === 'active' ? 'Aktif' : 'Error'}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="font-medium text-foreground">Auth:</span> Berfungsi
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};