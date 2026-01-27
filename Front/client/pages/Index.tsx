import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocale } from '@/contexts/LocaleContext';
import Navbar from '@/components/Navbar';
import ProfessionalismBadge from '@/components/ProfessionalismBadge';
import LevelProgressCard from '@/components/LevelProgressCard';
import { ArrowRight, Zap, Shield, Globe, Users, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t('hero.title')}
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row justify-center items-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/30 w-full sm:w-auto"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                {t('hero.browse')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to succeed as a freelancer
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Gamification Feature */}
            <Card className="group relative overflow-hidden p-8 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                {t('features.gamification.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('features.gamification.description')}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} className="fill-primary text-primary" />
                  ))}
                </span>
              </div>
            </Card>

            {/* Verified Feature */}
            <Card className="group relative overflow-hidden p-8 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-primary">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                {t('features.verified.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('features.verified.description')}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary">
                  100% Verified
                </span>
              </div>
            </Card>

            {/* Secure Feature */}
            <Card className="group relative overflow-hidden p-8 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-yellow-500">
                <Zap className="text-foreground" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                {t('features.secure.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('features.secure.description')}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent-foreground">
                  Bank-level Security
                </span>
              </div>
            </Card>

            {/* Global Feature */}
            <Card className="group relative overflow-hidden p-8 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Globe className="text-white" size={24} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                {t('features.global.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('features.global.description')}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-600">
                  150+ Countries
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Professionalism Levels Showcase */}
      <section className="px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl mb-4">
              Gamified Professionalism
            </h2>
            <p className="text-lg text-muted-foreground">
              Progress through exclusive levels and unlock premium features
            </p>
          </div>

          {/* Level Showcase */}
          <div className="grid gap-4 mb-12">
            {(['novice', 'intermediate', 'expert', 'master', 'legend'] as const).map((level, idx) => (
              <div
                key={level}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="text-2xl font-bold text-muted-foreground w-12 text-center">
                  {idx + 1}
                </div>
                <ProfessionalismBadge level={level} size="lg" />
                <div className="ml-auto text-sm text-muted-foreground">
                  {level === 'novice' && 'Starting point'}
                  {level === 'intermediate' && '5+ completed projects'}
                  {level === 'expert' && '25+ completed projects'}
                  {level === 'master' && '100+ completed projects'}
                  {level === 'legend' && 'Elite status'}
                </div>
              </div>
            ))}
          </div>

          {/* Sample Progress Card */}
          <div className="max-w-2xl mx-auto">
            <LevelProgressCard
              currentLevel="expert"
              progressPercentage={68}
              completedProjects={28}
              rating={4.9}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20 sm:py-32 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Active Freelancers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">$100M+</div>
              <p className="text-muted-foreground">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">4.8★</div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 sm:p-16 text-center text-white">
            <h2 className="text-4xl font-bold mb-4 sm:text-5xl">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful freelancers building their professional profiles through our unique gamification system.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto"
                >
                  {t('cta.forFreelancers')}
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link to="/post-job">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  {t('cta.forClients')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition">About Us</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Blog</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">For Freelancers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition">How It Works</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Browse Jobs</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition">Post a Job</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Find Talent</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link to="/" className="hover:text-foreground transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 FreelanceKZ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
