import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';

interface EgovUser {
  id?: string;
  email?: string;
  phone?: string;
  iin?: string;
  fullName?: string;
  attributes?: Record<string, any>;
}

export default function EgovCallback() {
  const navigate = useNavigate();
  const { login, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [user, setUser] = useState<EgovUser | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        console.log('eGov callback received:', { code: code?.substring(0, 10), error, state });

        if (error) {
          throw new Error(`eGov authentication error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from eGov.kz');
        }

        // Send code to backend for secure token exchange
        const callbackUrl = `/api/auth/egov/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
        const response = await apiFetch(callbackUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        let userData: EgovUser;
        let accessToken: string | undefined;
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'eGov authentication failed');
        }

        const data = await response.json();
        console.log('Backend response:', data);
        
        if (data.success) {
          userData = {
            id: data.user.id,
            email: data.user.email,
            phone: data.user.phone,
            iin: data.user.iin,
            fullName: data.user.fullName,
          };
          accessToken = data.access_token;
        } else {
          throw new Error(data.error || 'eGov authentication failed');
        }

        console.log('User data to store:', userData);

        // Store eGov user data in session
        sessionStorage.setItem('egov_user', JSON.stringify(userData));
        sessionStorage.setItem('egov_auth_code', code);

        const userId = localStorage.getItem('user_id');
        if (!userId) {
          throw new Error('Please sign up or log in before verifying with eGov.kz');
        }

        const verifyResponse = await apiFetch('/api/auth/egov/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
          },
          body: JSON.stringify({
            email: userData.email,
            iin: userData.iin,
            phone: userData.phone,
            fullName: userData.fullName,
          }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || 'Verification failed');
        }

        const verifyData = await verifyResponse.json();

        setUser(userData);
        setStatus('success');

        // Login the user via AuthContext
        login({
          id: userId,
          email: userData.email,
          fullName: userData.fullName,
          phone: userData.phone,
          iin: userData.iin,
          role: verifyData.role,
          egov_auth: true,
        }, accessToken);
        localStorage.setItem('is_egov_auth', 'true');
        sessionStorage.removeItem('egov_flow');

        await refreshProfile();

        toast({
          title: "Authentication successful",
          description: `Welcome, ${userData.fullName}!`,
        });

        // Redirect to profile after verification
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 2000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        console.error('eGov callback error:', err);
        setErrorMessage(message);
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate, login, toast]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <section className="px-4 py-20">
        <div className="mx-auto max-w-md">
          <Card className="p-8">
            {status === 'loading' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <Loader2 className="text-primary animate-spin" size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Verifying with eGov.kz
                  </h2>
                  <p className="text-muted-foreground">
                    Please wait while we confirm your identity...
                  </p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-6">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={48} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Verification Successful
                  </h2>
                  <p className="text-muted-foreground">
                    {user?.fullName && `Thanks, ${user.fullName}!`}
                    {!user?.fullName && 'Your identity has been verified.'}
                  </p>
                  {user?.iin && (
                    <p className="text-sm text-muted-foreground mt-2">
                      IIN: {user.iin}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Redirecting to your profile...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-red-100 dark:bg-red-900 p-6">
                    <AlertCircle className="text-red-600 dark:text-red-400" size={48} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-sm text-destructive mb-4">
                    {errorMessage}
                  </p>
                  <p className="text-muted-foreground">
                    Please try again or return to your profile.
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/profile', { replace: true })}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Back to Profile
                  </button>
                  <button
                    onClick={() => navigate('/', { replace: true })}
                    className="w-full px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
