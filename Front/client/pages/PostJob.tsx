import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';
import { ArrowRight } from 'lucide-react';

export default function PostJob() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <section className="px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-block rounded-full bg-secondary/10 px-4 py-2">
            <span className="text-sm font-semibold text-secondary">Coming Soon</span>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground sm:text-6xl mb-6">
            {t('nav.postJob')}
          </h1>
          
          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto mb-12">
            Post your project and find the perfect freelancer. Our matching algorithm will connect you with the best talent for your needs.
          </p>

          <div className="rounded-xl border border-border bg-muted/30 p-12">
            <p className="text-muted-foreground mb-8">
              🎯 Want to see this page fully implemented? Just ask in the chat and we'll build it out for you!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-white"
              onClick={() => {
                window.location.hash = '#request-feature';
              }}
            >
              Request Feature Implementation
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">What This Page Will Include:</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border p-6 text-left">
                <h3 className="font-semibold text-foreground mb-2">📝 Job Details Form</h3>
                <p className="text-sm text-muted-foreground">Describe your project, budget, timeline, and requirements</p>
              </div>
              <div className="rounded-lg border border-border p-6 text-left">
                <h3 className="font-semibold text-foreground mb-2">⭐ Skill Matching</h3>
                <p className="text-sm text-muted-foreground">Specify required skills and professionalism levels</p>
              </div>
              <div className="rounded-lg border border-border p-6 text-left">
                <h3 className="font-semibold text-foreground mb-2">💰 Budget Planning</h3>
                <p className="text-sm text-muted-foreground">Set fixed price, hourly rate, or use our suggested pricing</p>
              </div>
              <div className="rounded-lg border border-border p-6 text-left">
                <h3 className="font-semibold text-foreground mb-2">🎯 AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">Get smart suggestions for timeline and budget</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
