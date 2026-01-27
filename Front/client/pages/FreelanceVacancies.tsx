import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { Search, Clock, DollarSign, Star, Bookmark, MessageCircle } from 'lucide-react';
import ProfessionalismBadge from '@/components/ProfessionalismBadge';
import { apiFetch } from '@/lib/api';
import { ProfessionalismLevel } from '@/lib/gamification';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface JobRecord {
  _id: string;
  title: string;
  description: string;
  category?: string;
  budget?: string;
  timeframe?: string;
  level?: ProfessionalismLevel;
  skills?: string[];
  created_at?: string;
  client?: string;
  client_name?: string;
  rating?: number;
  proposals?: number;
  views?: number;
}

const categories = [
  { id: 'all', label: 'All Jobs' },
  { id: 'design', label: 'Design' },
  { id: 'development', label: 'Development' },
  { id: 'writing', label: 'Writing' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'other', label: 'Other' },
];

const formatPosted = (value?: string) => {
  if (!value) return 'Just now';
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return 'Just now';
  const diffMs = Date.now() - created.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

export default function FreelanceVacancies() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    const role = user?.role || 'guest';
    const canFindJobs = role === 'freelancer' || role === 'both' || role === 'admin';
    if (!canFindJobs) {
      toast({
        title: 'Access denied',
        description: 'Only freelancers can browse jobs.',
        variant: 'destructive',
      });
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, user?.role, navigate, toast]);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setIsJobsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        const path = params.toString() ? `/api/jobs?${params.toString()}` : '/api/jobs';
        const response = await apiFetch(path);
        if (!response.ok) throw new Error('Failed to load jobs');
        const data = await response.json();
        if (!cancelled) {
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setJobs([]);
        }
      } finally {
        if (!cancelled) setIsJobsLoading(false);
      }
    };

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCategory]);

  const filteredJobs = useMemo(() => jobs, [jobs]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <div className="px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl mb-4">
              Freelance Opportunities
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse {jobs.length} active projects and find your next opportunity
            </p>
          </div>

          <div className="mb-12 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search by job title, skills, or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-4 py-2 transition-all font-medium ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'border border-border bg-white dark:bg-black text-foreground hover:border-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
            <p className="text-sm text-muted-foreground">
              {savedJobs.length > 0 && `${savedJobs.length} saved`}
            </p>
          </div>

          {isJobsLoading ? (
            <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((job) => {
                const level = job.level || 'intermediate';
                const skills = job.skills && job.skills.length > 0 ? job.skills : ['General'];
                const clientName = job.client_name || job.client || 'Client';
                return (
                  <Card key={job._id} className="overflow-hidden transition-all hover:shadow-lg">
                    <div className="p-6 sm:p-8">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">{job.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{clientName}</p>
                          <p className="text-foreground text-sm mb-4">{job.description}</p>

                          <div className="mb-4 flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign size={16} />
                              {job.budget || 'Budget TBD'}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock size={16} />
                              {job.timeframe || 'Flexible'}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ProfessionalismBadge level={level} showLabel={false} size="sm" />
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          <div className="rounded-lg bg-muted/50 p-4 text-right">
                            <p className="text-xs text-muted-foreground">Posted</p>
                            <p className="font-medium text-foreground">{formatPosted(job.created_at)}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleSaveJob(job._id)}
                              className={savedJobs.includes(job._id) ? 'border-primary bg-primary/10' : ''}
                            >
                              <Bookmark
                                size={16}
                                className={savedJobs.includes(job._id) ? 'fill-primary text-primary' : ''}
                              />
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-white">
                              <MessageCircle size={16} />
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-500 text-yellow-500" />
                            {job.rating ?? 0} rating
                          </span>
                          <span>{job.proposals ?? 0} proposals</span>
                          <span>{job.views ?? 0} views</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
              <p className="text-muted-foreground mb-4">No jobs found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
