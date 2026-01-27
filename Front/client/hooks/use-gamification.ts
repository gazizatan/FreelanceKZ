import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ProfessionalismLevel,
  getLevelForXp,
  getProgressForXp,
} from '@/lib/gamification';

export function useGamification() {
  const { user, freelancer, isAuthenticated, isLoading } = useAuth();

  return useMemo(() => {
    const xp = typeof user?.xp === 'number' ? user.xp : 0;
    const level = (user?.level || freelancer?.level || (xp ? getLevelForXp(xp) : 'novice')) as ProfessionalismLevel;
    const progress = typeof user?.professionalism === 'number'
      ? user.professionalism
      : typeof freelancer?.professionalism === 'number'
        ? freelancer.professionalism
        : getProgressForXp(xp, level);

    return {
      level,
      progress,
      xp,
      completedProjects: freelancer?.completed_projects || 0,
      rating: freelancer?.rating || 0,
      isAuthenticated,
      isLoading,
    };
  }, [user, freelancer, isAuthenticated, isLoading]);
}
