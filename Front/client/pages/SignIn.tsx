import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, LogIn, Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { apiFetch, readErrorMessage, readJsonSafe } from '@/lib/api';

export default function SignIn() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const message = await readErrorMessage(response, 'Login failed');
        throw new Error(message);
      }

      const data = await readJsonSafe<{ user_id: string; role?: string }>(response);
      if (!data?.user_id) {
        throw new Error('Login failed: invalid response');
      }

      const profileResponse = await apiFetch('/api/users/me', {
        headers: {
          'X-User-Id': data.user_id,
        },
      });

      let userData = {
        id: data.user_id,
        email: formData.email,
        role: data.role,
      } as { id: string; email?: string; fullName?: string; phone?: string; iin?: string; role?: string; egov_auth?: boolean };

      if (profileResponse.ok) {
        const profile = await readJsonSafe<any>(profileResponse);
        if (profile?.user) {
          userData = {
            id: profile.user._id,
            email: profile.user.email,
            fullName: profile.user.fullName,
            phone: profile.user.phone,
            iin: profile.user.iin,
            role: profile.user.role,
            egov_auth: profile.user.egov_auth,
            xp: profile.user.xp,
            level: profile.user.level,
            professionalism: profile.user.professionalism,
          };
        }
      }

      login(userData);

      toast({
        title: 'Welcome back!',
        description: 'You have signed in successfully.',
      });

      navigate('/profile', { replace: true });
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Login failed';
      if (err instanceof DOMException && err.name === 'AbortError') {
        message = 'API timeout. Check backend URL and server.';
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <section className="px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-md">
          <Card className="p-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-6">
                  <LogIn className="text-blue-600 dark:text-blue-400" size={48} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Sign In
                </h1>
                <p className="text-muted-foreground">
                  Log in to your FreelanceKZ account
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="pl-9"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    className="pl-9"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white h-12 text-base"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
