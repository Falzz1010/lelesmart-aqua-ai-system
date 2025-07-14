
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdminEmail = (email: string) => {
    return email === 'admin@gmail.com' || email === 'admin@lelesmart.com';
  };

  // Function to ensure admin user exists
  const ensureAdminUser = async () => {
    try {
      // Check if admin user exists
      const { data: existingAdmin, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'admin@gmail.com')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking admin user:', checkError);
        return;
      }

      if (!existingAdmin) {
        console.log('Admin user not found, creating...');
        
        // Try to sign up admin user with emailRedirectTo
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@gmail.com',
          password: 'admin123',
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: {
              full_name: 'Administrator',
              role: 'admin'
            }
          }
        });

        if (signUpError && !signUpError.message.includes('User already registered')) {
          console.error('Error creating admin user:', signUpError);
          return;
        }

        // If user already exists or was just created, ensure profile exists
        if (signUpData.user || signUpError?.message.includes('User already registered')) {
          const userId = signUpData.user?.id;
          if (userId) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                email: 'admin@gmail.com',
                full_name: 'Administrator',
                role: 'admin'
              }, { onConflict: 'id' });

            if (profileError) {
              console.error('Error creating/updating admin profile:', profileError);
            } else {
              console.log('Admin profile created/updated successfully');
            }
          }
        }
      } else {
        console.log('Admin user already exists');
      }
    } catch (error) {
      console.error('Error ensuring admin user:', error);
    }
  };

  // Ensure admin user exists on app start
  useEffect(() => {
    ensureAdminUser();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Determine role based on email
    const role = isAdminEmail(email) ? 'admin' : 'farmer';
    
    console.log('Signing up user:', email, 'with role:', role);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message.includes('User already registered')) {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Password harus minimal 6 karakter.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Format email tidak valid.';
      }
      
      toast({
        variant: "destructive",
        title: "Error Pendaftaran",
        description: errorMessage
      });
    } else {
      toast({
        title: "Berhasil!",
        description: "Akun berhasil dibuat. Silakan cek email untuk verifikasi."
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message === 'Invalid login credentials') {
        errorMessage = 'Email atau password salah. Periksa kembali data login Anda.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email belum diverifikasi. Silakan cek email Anda untuk konfirmasi.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
      }
      
      toast({
        variant: "destructive",
        title: "Error Login",
        description: errorMessage
      });
    } else if (data.user) {
      // Determine user type for welcome message
      const userType = isAdminEmail(email) ? 'Administrator' : 'Peternak';
      console.log('Login successful for:', email, 'as:', userType);
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${userType}!`
      });
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal logout"
      });
    } else {
      toast({
        title: "Berhasil Logout",
        description: "Sampai jumpa lagi!"
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
