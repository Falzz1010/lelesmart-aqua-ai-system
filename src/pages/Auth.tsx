
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Navigate } from 'react-router-dom';
import { Fish, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading, user } = useAuth();
  const { profile } = useProfile(user);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Prevent admin emails from using user login
    const isAdminEmail = email === 'admin@gmail.com' || email === 'admin@lelesmart.com';
    if (isAdminEmail) {
      setError('Akun admin harus masuk melalui halaman admin. Klik link "Masuk sebagai Admin" di bawah.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      if (isSignUp) {
        const result = await signUp(email, password, fullName || 'User');
        if (result.error) {
          setError(result.error.message);
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error.message);
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Fish className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">LeleSmart</h1>
            <p className="text-muted-foreground">
              Sistem Manajemen Kolam Ikan Cerdas
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isSignUp ? 'Daftar Petani' : 'Masuk Petani'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp ? 'Buat akun petani baru' : 'Masuk dengan akun petani'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                      className="w-full"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : (isSignUp ? 'Daftar' : 'Masuk')}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-primary hover:underline"
                  >
                    {isSignUp 
                      ? 'Sudah punya akun? Masuk di sini' 
                      : 'Belum punya akun? Daftar di sini'
                    }
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <a href="/admin-auth" className="block text-primary hover:underline font-medium">
              Masuk sebagai Admin →
            </a>
            <p className="text-xs text-muted-foreground">
              Khusus untuk administrator sistem
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Untuk akun petani, gunakan email dan password pribadi Anda</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
