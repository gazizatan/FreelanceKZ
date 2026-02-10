import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { ProfessionalismLevel, getLevelLabel } from '@/lib/gamification';

interface ProfessionalismlevelBadgeProps {
  level: ProfessionalismLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LEVELS = {
  novice: {
    label: 'Novice',
    colors: 'from-gray-400 to-gray-500',
    starCount: 1,
    bgColor: 'bg-gray-50 dark:bg-gray-900/60',
  },
  intermediate: {
    label: 'Intermediate',
    colors: 'from-emerald-400 to-emerald-500',
    starCount: 2,
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
  },
  expert: {
    label: 'Expert',
    colors: 'from-blue-400 to-blue-600',
    starCount: 3,
    bgColor: 'bg-blue-50 dark:bg-blue-950/60',
  },
  master: {
    label: 'Master',
    colors: 'from-purple-500 to-purple-700',
    starCount: 4,
    bgColor: 'bg-purple-50 dark:bg-purple-950/60',
  },
  legend: {
    label: 'Legend',
    colors: 'from-yellow-400 to-red-500',
    starCount: 5,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/60',
  },
};

export default function ProfessionalismBadge({
  level,
  showLabel = true,
  size = 'md',
}: ProfessionalismlevelBadgeProps) {
  const { t } = useLocale();
  const config = LEVELS[level];
  const starSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ring-1 ring-border/60',
        config.bgColor,
        size === 'lg' && 'px-4 py-2'
      )}
    >
      <div className={`flex gap-0.5`}>
        {Array.from({ length: config.starCount }).map((_, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${config.colors} rounded-full p-0.5`}
          >
            <Star
              size={starSize}
              className="fill-white text-white"
            />
          </div>
        ))}
      </div>
      {showLabel && (
        <span
          className={cn(
            'font-semibold text-foreground',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {getLevelLabel(level, t) || config.label}
        </span>
      )}
    </div>
  );
}
