
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fish, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, signIn, signUp } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password length
    if (password.length < 6) {
      return;
    }

    setLoading(true);

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, fullName);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-sm sm:max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-blue-100/50 dark:border-gray-700/50 shadow-xl">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Fish className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent font-bold">
            LeleSmart
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  placeholder="Masukkan nama lengkap"
                  className="h-10 sm:h-11"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Masukkan email Anda"
                className="h-10 sm:h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  minLength={6}
                  className="h-10 sm:h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-red-500">Password minimal 6 karakter</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || password.length < 6}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium h-10 sm:h-11 text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </div>
              ) : (
                isLogin ? 'Masuk' : 'Daftar'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400 transition-colors"
            >
              {isLogin 
                ? 'Belum punya akun? Daftar di sini' 
                : 'Sudah punya akun? Masuk di sini'
              }
            </button>
          </div>

          {/* Login Instructions */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-3 rounded-lg border border-red-100 dark:border-red-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Admin Login</h4>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                Email: admin@gmail.com atau admin@lelesmart.com<br />
                Password: admin123
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Fish className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Peternak Login</h4>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Gunakan email dan password yang telah didaftarkan<br />
                atau buat akun baru dengan klik "Daftar di sini"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
