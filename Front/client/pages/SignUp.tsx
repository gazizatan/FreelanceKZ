import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, CheckCircle2, User, Mail, Lock, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { apiFetch, readErrorMessage, readJsonSafe } from '@/lib/api';

export default function SignUp() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: form, 2: success
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    iin: '',
    role: 'freelancer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (formData.iin && (!/^\d{12}$/.test(formData.iin))) {
      newErrors.iin = 'IIN must be 12 digits';
    }
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          fullName: formData.fullName,
          iin: formData.iin || undefined,
        }),
      });

      if (!response.ok) {
        const message = await readErrorMessage(response, 'Registration failed');
        throw new Error(message);
      }

      const data = await readJsonSafe<{ user_id: string; role?: string }>(response);
      if (!data?.user_id) {
        throw new Error('Registration failed: invalid response');
      }

      login({
        id: data.user_id,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        egov_auth: false,
        xp: 0,
        level: 'novice',
        professionalism: 0,
      });

      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully.',
      });

      setStep(2);
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Registration failed';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          {step === 1 && (
            <Card className="p-8 space-y-8">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-6">
                    <User className="text-blue-600 dark:text-blue-400" size={48} />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-muted-foreground">
                    Register with email and password
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="pl-9"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

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
                      placeholder="Create a password"
                      className="pl-9"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">IIN (optional)</label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="iin"
                      value={formData.iin}
                      onChange={handleChange}
                      placeholder="12-digit IIN"
                      className="pl-3"
                    />
                  </div>
                  {errors.iin && (
                    <p className="text-sm text-destructive">{errors.iin}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Stored encrypted for privacy.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">I'm here as a</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-white dark:bg-black text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="freelancer">Freelancer (I want to work)</option>
                      <option value="client">Client (I want to hire)</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role}</p>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Verification via eGov.kz
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    After registration you can verify your account from your profile.
                  </p>
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
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-8">
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <CheckCircle2 className="text-primary" size={48} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to FreelanceKZ!</h2>
                  <p className="text-muted-foreground">
                    Your account has been created successfully. You can verify your identity via eGov.kz in your profile.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                    onClick={() => window.location.href = '/profile'}
                  >
                    Go to Your Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => window.location.href = '/'}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
