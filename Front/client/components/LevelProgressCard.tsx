import ProfessionalismBadge from './ProfessionalismBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ProfessionalismLevel = 'novice' | 'intermediate' | 'expert' | 'master' | 'legend';

interface LevelProgressCardProps {
  currentLevel: ProfessionalismLevel;
  progressPercentage: number;
  completedProjects?: number;
  rating?: number;
}

const LEVELS_DATA: Record<ProfessionalismLevel, { nextLevel: string | null; pointsNeeded: number }> = {
  novice: { nextLevel: 'Intermediate', pointsNeeded: 100 },
  intermediate: { nextLevel: 'Expert', pointsNeeded: 250 },
  expert: { nextLevel: 'Master', pointsNeeded: 500 },
  master: { nextLevel: 'Legend', pointsNeeded: 1000 },
  legend: { nextLevel: null, pointsNeeded: 0 },
};

export default function LevelProgressCard({
  currentLevel,
  progressPercentage,
  completedProjects = 0,
  rating = 4.8,
}: LevelProgressCardProps) {
  const levelData = LEVELS_DATA[currentLevel];
  const chartData = [
    { name: 'Progress', value: progressPercentage },
    { name: 'Remaining', value: Math.max(0, 100 - progressPercentage) },
  ];

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card to-muted/30">
      <div className="space-y-6 p-6">
        {/* Header with Badge and Title */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="mb-3 text-lg font-bold text-foreground">Your Professional Journey</h3>
            <ProfessionalismBadge level={currentLevel} size="lg" />
          </div>
          <TrendingUp className="text-primary" size={24} />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {levelData.nextLevel ? `Progress to ${levelData.nextLevel}` : 'Maximum Level'}
            </span>
            <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/50 p-4 dark:bg-black/20">
            <p className="text-sm text-muted-foreground">Projects Completed</p>
            <p className="text-2xl font-bold text-foreground">{completedProjects}</p>
          </div>
          <div className="rounded-lg bg-white/50 p-4 dark:bg-black/20">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-primary">{rating}</p>
              <span className="text-sm text-yellow-500">★</span>
            </div>
          </div>
        </div>

        {/* Level Benefits */}
        <div className="rounded-lg border border-border bg-accent/10 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">This Level Unlocks</p>
          <ul className="space-y-1 text-sm text-foreground">
            {currentLevel === 'novice' && (
              <>
                <li>✓ Access to freelance marketplace</li>
                <li>✓ Build your portfolio</li>
              </>
            )}
            {currentLevel === 'intermediate' && (
              <>
                <li>✓ Priority in search results</li>
                <li>✓ Access to premium jobs</li>
                <li>✓ Skill verification badges</li>
              </>
            )}
            {currentLevel === 'expert' && (
              <>
                <li>✓ Featured profile badge</li>
                <li>✓ Direct client outreach</li>
                <li>✓ Custom rates</li>
              </>
            )}
            {currentLevel === 'master' && (
              <>
                <li>✓ VIP support</li>
                <li>✓ Exclusive high-value projects</li>
                <li>✓ White-label options</li>
              </>
            )}
            {currentLevel === 'legend' && (
              <>
                <li>✓ All premium features</li>
                <li>✓ Lifetime VIP status</li>
                <li>✓ Personal account manager</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}
