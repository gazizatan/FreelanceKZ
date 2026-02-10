import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';
import { useNavigate } from 'react-router-dom';

const TESTS = [
  {
    id: 'frontend',
    title: 'Frontend Fundamentals',
    level: 'Beginner',
    duration: '25 min',
    questions: 20,
    tags: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    id: 'react',
    title: 'React Proficiency',
    level: 'Intermediate',
    duration: '35 min',
    questions: 25,
    tags: ['React', 'Hooks', 'State'],
  },
  {
    id: 'backend',
    title: 'Backend Essentials',
    level: 'Intermediate',
    duration: '30 min',
    questions: 22,
    tags: ['APIs', 'Databases', 'Auth'],
  },
  {
    id: 'design',
    title: 'UI/UX Design',
    level: 'Beginner',
    duration: '20 min',
    questions: 18,
    tags: ['Design', 'UX', 'Figma'],
  },
  {
    id: 'marketing',
    title: 'Growth & Marketing',
    level: 'Advanced',
    duration: '40 min',
    questions: 28,
    tags: ['Acquisition', 'SEO', 'Analytics'],
  },
  {
    id: 'data',
    title: 'Data Analysis',
    level: 'Advanced',
    duration: '45 min',
    questions: 30,
    tags: ['SQL', 'Python', 'Dashboards'],
  },
];

export default function Tests() {
  const { t } = useLocale();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Skill Tests</p>
            <h1 className="mt-3 text-4xl font-bold text-foreground sm:text-5xl">
              Prove your skills and rank higher
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Complete assessments to earn credibility, unlock higher rates, and stand out in search results.
            </p>
          </div>

          <div className="mb-10 grid gap-4 rounded-2xl border border-border bg-muted/30 p-6 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Steps</p>
              <p className="mt-2 text-sm text-foreground">Pick a test, finish it in one sitting, and get your badge.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Rewards</p>
              <p className="mt-2 text-sm text-foreground">Top scores highlight your profile and boost client trust.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Attempts</p>
              <p className="mt-2 text-sm text-foreground">Retake any test after 7 days to improve your score.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTS.map((test) => (
              <div key={test.id} className="rounded-2xl border border-border bg-white/80 p-6 shadow-sm transition hover:shadow-md dark:bg-black/40">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{test.title}</h3>
                    <p className="text-sm text-muted-foreground">{test.level}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {test.duration}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {test.questions} questions · Timed assessment
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {test.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button
                  className="mt-6 w-full bg-gradient-to-r from-primary to-secondary text-white"
                  onClick={() => {
                    if (test.id === 'react') {
                      navigate('/tests/react');
                    }
                  }}
                >
                  Start Test
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Coming soon: verified certificates</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We are working on shareable certificates and client verification links.
            </p>
            <Button className="mt-6" variant="outline">
              Notify me
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
