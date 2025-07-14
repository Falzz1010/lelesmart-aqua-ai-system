import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Navigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading, user } = useAuth();
  const { profile } = useProfile(user);
  const [error, setError] = useState('');

  // Redirect if already logged in as admin
  if (user && profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Redirect if logged in as non-admin
  if (user && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate admin email
    const isAdminEmail = email === 'admin@gmail.com' || email === 'admin@lelesmart.com';
    if (!isAdminEmail) {
      setError('Email ini bukan akun admin yang valid. Gunakan admin@gmail.com atau admin@lelesmart.com');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    try {
      if (isSignUp) {
        const result = await signUp(email, password, 'Administrator');
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
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-muted-foreground">
              Masuk ke dashboard administrator LeleSmart
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-center text-foreground">
                {isSignUp ? 'Daftar Admin' : 'Masuk Admin'}
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                {isSignUp ? 'Buat akun administrator baru' : 'Masuk dengan akun administrator'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Admin</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com atau admin@lelesmart.com"
                    required
                    className="w-full bg-background text-foreground border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full bg-background text-foreground border-border"
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

          <div className="text-center">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Kembali ke halaman utama
            </a>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p><strong>Akun Admin Default:</strong></p>
            <p>Email: admin@gmail.com atau admin@lelesmart.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};