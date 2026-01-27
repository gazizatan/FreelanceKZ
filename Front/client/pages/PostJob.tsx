import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { ProfessionalismLevel, LEVEL_ORDER } from '@/lib/gamification';
import { useNavigate } from 'react-router-dom';

const CATEGORY_OPTIONS = [
  { id: 'design', label: 'Design' },
  { id: 'development', label: 'Development' },
  { id: 'writing', label: 'Writing' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'other', label: 'Other' },
];

export default function PostJob() {
  const { t } = useLocale();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'design',
    budget: '',
    timeframe: '',
    level: 'intermediate' as ProfessionalismLevel,
    skills: '',
  });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    const role = user?.role || 'guest';
    const canPostJob = role === 'client' || role === 'both' || role === 'admin';
    if (!canPostJob) {
      toast({
        title: 'Access denied',
        description: 'Only clients can post jobs.',
        variant: 'destructive',
      });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, user?.role, navigate, toast]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Title and description are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('user_id');
      const skills = form.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const response = await apiFetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || '',
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          budget: form.budget.trim(),
          timeframe: form.timeframe.trim(),
          level: form.level,
          skills,
          created_by: userId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to post job');
      }

      setForm({
        title: '',
        description: '',
        category: 'design',
        budget: '',
        timeframe: '',
        level: 'intermediate',
        skills: '',
      });

      toast({
        title: 'Job posted',
        description: 'Your project is now live for freelancers.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post the job. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <section className="px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl mb-4">
              {t('nav.postJob')}
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your project details and receive proposals from top freelancers.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Project title</label>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Build a landing page for SaaS"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe goals, deliverables, and requirements"
                  rows={6}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {CATEGORY_OPTIONS.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Required level</label>
                  <select
                    value={form.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {LEVEL_ORDER.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Budget</label>
                  <Input
                    value={form.budget}
                    onChange={(e) => handleChange('budget', e.target.value)}
                    placeholder="e.g. $2,000 - $3,500"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Timeframe</label>
                  <Input
                    value={form.timeframe}
                    onChange={(e) => handleChange('timeframe', e.target.value)}
                    placeholder="e.g. 4-6 weeks"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Skills (comma separated)</label>
                <Input
                  value={form.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  placeholder="React, TypeScript, UI/UX"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                >
                  {isSubmitting ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
