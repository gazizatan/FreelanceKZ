export type ProfessionalismLevel = 'novice' | 'intermediate' | 'expert' | 'master' | 'legend';

export const LEVEL_ORDER: ProfessionalismLevel[] = [
  'novice',
  'intermediate',
  'expert',
  'master',
  'legend',
];

export const LEVEL_THRESHOLDS: Record<ProfessionalismLevel, number> = {
  novice: 0,
  intermediate: 100,
  expert: 250,
  master: 500,
  legend: 1000,
};

export const LEVEL_LABELS_EN: Record<ProfessionalismLevel, string> = {
  novice: 'Novice',
  intermediate: 'Intermediate',
  expert: 'Expert',
  master: 'Master',
  legend: 'Legend',
};

export const getNextLevel = (level: ProfessionalismLevel): ProfessionalismLevel | null => {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx === -1 || idx + 1 >= LEVEL_ORDER.length) return null;
  return LEVEL_ORDER[idx + 1];
};

export const getLevelForXp = (xp: number): ProfessionalismLevel => {
  const safeXp = Math.max(0, Math.floor(xp));
  let current: ProfessionalismLevel = 'novice';
  for (const level of LEVEL_ORDER) {
    if (safeXp >= LEVEL_THRESHOLDS[level]) {
      current = level;
    }
  }
  return current;
};

export const getProgressForXp = (xp: number, level?: ProfessionalismLevel): number => {
  const safeXp = Math.max(0, Math.floor(xp));
  const currentLevel = level || getLevelForXp(safeXp);
  const nextLevel = getNextLevel(currentLevel);
  if (!nextLevel) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  if (nextThreshold <= currentThreshold) return 100;
  const progress = ((safeXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
};

export const getLevelLabel = (
  level: ProfessionalismLevel,
  t?: (key: string) => string
): string => {
  if (t) {
    const translated = t(`professionalism.${level}`);
    if (translated && translated !== `professionalism.${level}`) {
      return translated;
    }
  }
  return LEVEL_LABELS_EN[level];
};
