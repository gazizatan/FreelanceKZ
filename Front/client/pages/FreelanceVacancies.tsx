import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import { useLocale } from '@/contexts/LocaleContext';
import { Search, MapPin, Clock, DollarSign, Star, Bookmark, MessageCircle } from 'lucide-react';
import ProfessionalismBadge from '@/components/ProfessionalismBadge';

export default function FreelanceVacancies() {
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const categories = [
    { id: 'all', label: 'All Jobs' },
    { id: 'design', label: 'Design' },
    { id: 'development', label: 'Development' },
    { id: 'writing', label: 'Writing' },
    { id: 'marketing', label: 'Marketing' },
  ];

  const jobs = [
    {
      id: 1,
      title: 'E-Commerce Mobile App Design',
      client: 'TechStartup Inc.',
      description: 'Design a modern mobile app for an e-commerce platform. Need UI/UX expertise.',
      budget: '$2,500 - $4,000',
      timeframe: '3-4 weeks',
      level: 'expert',
      category: 'design',
      skills: ['UI Design', 'Mobile Design', 'Figma'],
      proposals: 12,
      rating: 4.9,
      posted: '2 days ago',
      views: 342,
    },
    {
      id: 2,
      title: 'React & Node.js Full-Stack Developer',
      client: 'SaaS Company',
      description: 'Build a feature-rich dashboard using React and Node.js. Must have 5+ years experience.',
      budget: '$3,000 - $5,000',
      timeframe: '6-8 weeks',
      level: 'master',
      category: 'development',
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      proposals: 28,
      rating: 4.8,
      posted: '1 day ago',
      views: 567,
    },
    {
      id: 3,
      title: 'Brand Identity & Logo Design',
      client: 'Creative Agency',
      description: 'Create a complete brand identity system including logo, color palette, and guidelines.',
      budget: '$1,500 - $3,000',
      timeframe: '2-3 weeks',
      level: 'intermediate',
      category: 'design',
      skills: ['Brand Design', 'Logo Design', 'Adobe Suite'],
      proposals: 45,
      rating: 4.7,
      posted: '3 days ago',
      views: 892,
    },
    {
      id: 4,
      title: 'Content Writer for Tech Blog',
      client: 'TechNews Platform',
      description: 'Write 10 high-quality blog posts about emerging technologies. 2000+ words each.',
      budget: '$800 - $1,500',
      timeframe: '4 weeks',
      level: 'intermediate',
      category: 'writing',
      skills: ['Content Writing', 'SEO', 'Technology Knowledge'],
      proposals: 34,
      rating: 4.9,
      posted: '5 days ago',
      views: 612,
    },
    {
      id: 5,
      title: 'Social Media Marketing Campaign',
      client: 'Fashion Brand',
      description: 'Plan and execute a 2-month social media campaign for Instagram and TikTok.',
      budget: '$1,200 - $2,500',
      timeframe: '8 weeks',
      level: 'intermediate',
      category: 'marketing',
      skills: ['Social Media Marketing', 'Content Creation', 'Analytics'],
      proposals: 19,
      rating: 4.6,
      posted: '4 days ago',
      views: 445,
    },
    {
      id: 6,
      title: 'WordPress Website Development',
      client: 'Small Business',
      description: 'Build a responsive WordPress website with custom plugins and integrations.',
      budget: '$800 - $1,500',
      timeframe: '2-3 weeks',
      level: 'intermediate',
      category: 'development',
      skills: ['WordPress', 'PHP', 'HTML/CSS'],
      proposals: 52,
      rating: 4.8,
      posted: '6 days ago',
      views: 734,
    },
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSaveJob = (jobId: number) => {
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
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl mb-4">
              Freelance Opportunities
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse {jobs.length} active projects and find your next opportunity
            </p>
          </div>

          {/* Search & Filter Section */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
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

            {/* Category Filter */}
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

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
            <p className="text-sm text-muted-foreground">
              {savedJobs.length > 0 && `${savedJobs.length} saved`}
            </p>
          </div>

          {/* Job Listings */}
          {filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="p-6 sm:p-8">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{job.client}</p>
                        <p className="text-foreground text-sm mb-4">{job.description}</p>

                        {/* Skills Tags */}
                        <div className="mb-4 flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Job Details */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign size={16} />
                            {job.budget}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock size={16} />
                            {job.timeframe}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ProfessionalismBadge level={job.level as any} showLabel={false} size="sm" />
                            {job.level.charAt(0).toUpperCase() + job.level.slice(1)}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Stats & Actions */}
                      <div className="flex flex-col items-end gap-4">
                        <div className="rounded-lg bg-muted/50 p-4 text-right">
                          <p className="text-xs text-muted-foreground">Posted</p>
                          <p className="font-medium text-foreground">{job.posted}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleSaveJob(job.id)}
                            className={savedJobs.includes(job.id) ? 'border-primary bg-primary/10' : ''}
                          >
                            <Bookmark
                              size={16}
                              className={savedJobs.includes(job.id) ? 'fill-primary text-primary' : ''}
                            />
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-white">
                            <MessageCircle size={16} />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Stats */}
                    <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                          {job.rating} rating
                        </span>
                        <span>{job.proposals} proposals</span>
                        <span>{job.views} views</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
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
