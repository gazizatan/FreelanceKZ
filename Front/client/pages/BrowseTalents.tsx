import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, readErrorMessage } from '@/lib/api';

type Freelancer = {
  _id: string;
  user_id?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number | null;
  location?: string;
  level?: string;
  professionalism?: number;
  rating?: number;
  completed_projects?: number;
};

export default function BrowseTalents() {
  const { t } = useLocale();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [talents, setTalents] = useState<Freelancer[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    const role = user?.role || 'guest';
    const canBrowseTalents = role === 'client' || role === 'both' || role === 'admin';
    if (!canBrowseTalents) {
      toast({
        title: 'Access denied',
        description: 'Only clients can browse talents.',
        variant: 'destructive',
      });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, user?.role, navigate, toast]);

  const loadTalents = async () => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await apiFetch('/api/freelancers', { timeoutMs: 10000 });
      if (!response.ok) {
        const message = await readErrorMessage(response, t('browseTalents.errorTitle'));
        throw new Error(message);
      }
      const data = (await response.json()) as Freelancer[];
      setTalents(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('browseTalents.errorTitle');
      setError(message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadTalents();
  }, []);

  const filteredTalents = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return talents;
    return talents.filter((talent) => {
      const haystack = [
        talent.title,
        talent.bio,
        talent.location,
        ...(talent.skills || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [talents, query]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
            <span className="text-xs font-semibold uppercase tracking-wide">{t('browseTalents.badge')}</span>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground sm:text-6xl mb-6">
            {t('nav.browse')}
          </h1>
          
          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto mb-12">
            {t('browseTalents.subtitle')}
          </p>

          <div className="rounded-2xl border border-border bg-muted/40 p-10 sm:p-12">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {t('browseTalents.requestTitle')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('browseTalents.requestHint')}
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-white"
              onClick={() => {
                window.location.hash = '#request-feature';
              }}
            >
              {t('browseTalents.requestCta')}
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">{t('browseTalents.includeTitle')}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border p-6 text-left transition-shadow hover:shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">{t('browseTalents.includeSearchTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('browseTalents.includeSearchDesc')}</p>
              </div>
              <div className="rounded-lg border border-border p-6 text-left transition-shadow hover:shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">{t('browseTalents.includeBadgesTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('browseTalents.includeBadgesDesc')}</p>
              </div>
              <div className="rounded-lg border border-border p-6 text-left transition-shadow hover:shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">{t('browseTalents.includeProfilesTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('browseTalents.includeProfilesDesc')}</p>
              </div>
              <div className="rounded-lg border border-border p-6 text-left transition-shadow hover:shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">{t('browseTalents.includeContactTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('browseTalents.includeContactDesc')}</p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="mb-8 text-left">
              <h2 className="text-2xl font-bold text-foreground">{t('browseTalents.liveTitle')}</h2>
              <p className="text-sm text-muted-foreground mt-2">{t('browseTalents.liveSubtitle')}</p>
            </div>
            <div className="mb-6">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('browseTalents.searchPlaceholder')}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-black"
              />
            </div>

            {isFetching ? (
              <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                {t('browseTalents.loading')}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
                <p className="text-sm font-medium text-foreground mb-4">{t('browseTalents.errorTitle')}</p>
                <p className="text-sm text-muted-foreground mb-6">{error}</p>
                <Button onClick={loadTalents}>{t('browseTalents.retry')}</Button>
              </div>
            ) : filteredTalents.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
                <p className="text-sm font-medium text-foreground mb-2">{t('browseTalents.emptyTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('browseTalents.emptyDesc')}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {filteredTalents.map((talent) => (
                  <div key={talent._id} className="rounded-2xl border border-border bg-white/80 p-6 text-left shadow-sm dark:bg-black/40">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10" />
                      <div>
                        <p className="font-semibold text-foreground">{talent.title || 'Freelancer'}</p>
                        <p className="text-sm text-muted-foreground">{talent.location || 'Kazakhstan'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><span className="text-foreground">{t('browseTalents.labelRate')}:</span> {talent.hourly_rate ? `$${talent.hourly_rate}/hr` : '—'}</p>
                      <p><span className="text-foreground">{t('browseTalents.labelLevel')}:</span> {talent.level || '—'}</p>
                      <p><span className="text-foreground">{t('browseTalents.labelRating')}:</span> {typeof talent.rating === 'number' ? talent.rating.toFixed(1) : '—'}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{t('browseTalents.labelSkills')}</p>
                      <div className="flex flex-wrap gap-2">
                        {(talent.skills && talent.skills.length > 0 ? talent.skills : ['Portfolio', 'Communication']).slice(0, 4).map((skill) => (
                          <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
