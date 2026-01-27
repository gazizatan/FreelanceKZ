import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  iin?: string;
  role?: string;
  egov_auth?: boolean;
  xp?: number;
  level?: string;
  professionalism?: number;
}

interface FreelancerProfile {
  user_id: string;
  title?: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  location?: string;
  languages?: string[];
  education?: Education[];
  experience?: WorkExperience[];
  certifications?: string[];
  completed_projects?: number;
  rating?: number;
  professionalism?: number;
  level?: string;
}

interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface WorkExperience {
  _id?: string;
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  skills_used?: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  freelancer: FreelancerProfile | null;
  isLoading: boolean;
  login: (userData: User, accessToken?: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  updateFreelancer: (data: Partial<FreelancerProfile>) => Promise<void>;
  addEducation: (education: Omit<Education, '_id'>) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  addExperience: (experience: Omit<WorkExperience, '_id'>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skill: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = accessToken || localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    return headers;
  }, [accessToken]);

  // Check auth state on initialization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('access_token');
        
        if (userId) {
          setAccessToken(token);
          
          // Fetch user profile from backend
          const response = await apiFetch('/api/users/me', {
            headers: {
              'X-User-Id': userId,
              'Authorization': `Bearer ${token || ''}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
              setUser({
                id: data.user._id,
                email: data.user.email,
                fullName: data.user.fullName,
                phone: data.user.phone,
                iin: data.user.iin,
                role: data.user.role,
                egov_auth: data.user.egov_auth,
                xp: data.user.xp,
                level: data.user.level,
                professionalism: data.user.professionalism,
              });
            if (data.freelancer) {
              setFreelancer(data.freelancer);
            }
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_role');
            localStorage.removeItem('access_token');
            localStorage.removeItem('is_egov_auth');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // On error, assume not authenticated
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('access_token');
      
      const response = await apiFetch('/api/users/me', {
        headers: {
          'X-User-Id': userId || '',
          'Authorization': `Bearer ${token || ''}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.user._id,
          email: data.user.email,
          fullName: data.user.fullName,
          phone: data.user.phone,
          iin: data.user.iin,
          role: data.user.role,
          egov_auth: data.user.egov_auth,
          xp: data.user.xp,
          level: data.user.level,
          professionalism: data.user.professionalism,
        });
        if (data.freelancer) {
          setFreelancer(data.freelancer);
        }
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [isAuthenticated]);

  const login = useCallback((userData: User, token?: string) => {
    setUser(userData);
    setAccessToken(token || null);
    setIsAuthenticated(true);
    
    localStorage.setItem('user_id', userData.id);
    if (userData.role) {
      localStorage.setItem('user_role', userData.role);
    }
    if (token) {
      localStorage.setItem('access_token', token);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('access_token');
    localStorage.removeItem('is_egov_auth');
    
    sessionStorage.removeItem('egov_access_token');
    sessionStorage.removeItem('egov_id_token');
    sessionStorage.removeItem('egov_refresh_token');
    sessionStorage.removeItem('egov_user');
    sessionStorage.removeItem('egov_auth_code');
    
    setUser(null);
    setFreelancer(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    
    const response = await apiFetch('/api/users/me', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updated = await response.json();
      setUser(prev => prev ? { ...prev, ...updated.user } : null);
    } else {
      throw new Error('Failed to update user');
    }
  }, [user, getAuthHeaders]);

  const updateFreelancer = useCallback(async (data: Partial<FreelancerProfile>) => {
    if (!user) return;
    
    const response = await apiFetch('/api/users/me', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (response.ok) {
      await refreshProfile();
    } else {
      throw new Error('Failed to update freelancer profile');
    }
  }, [user, getAuthHeaders, refreshProfile]);

  const addEducation = useCallback(async (education: Omit<Education, '_id'>) => {
    const response = await apiFetch('/api/profile/education', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(education),
    });

    if (response.ok) {
      await refreshProfile();
    } else {
      throw new Error('Failed to add education');
    }
  }, [getAuthHeaders, refreshProfile]);

  const deleteEducation = useCallback(async (id: string) => {
    const response = await apiFetch(`/api/profile/education/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      await refreshProfile();
    } else {
      throw new Error('Failed to delete education');
    }
  }, [getAuthHeaders, refreshProfile]);

  const addExperience = useCallback(async (experience: Omit<WorkExperience, '_id'>) => {
    const response = await apiFetch('/api/profile/experience', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(experience),
    });

    if (response.ok) {
      await refreshProfile();
    } else {
      throw new Error('Failed to add experience');
    }
  }, [getAuthHeaders, refreshProfile]);

  const deleteExperience = useCallback(async (id: string) => {
    const response = await apiFetch(`/api/profile/experience/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      await refreshProfile();
    } else {
      throw new Error('Failed to delete experience');
    }
  }, [getAuthHeaders, refreshProfile]);

  const addSkill = useCallback(async (skill: string) => {
    const response = await apiFetch('/api/profile/skills', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill }),
    });

    if (response.ok) {
      await refreshProfile();
    } else {
      throw new Error('Failed to add skill');
    }
  }, [getAuthHeaders, refreshProfile]);

  const removeSkill = useCallback(async (skill: string) => {
    const response = await apiFetch('/api/profile/skills', {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill }),
    });

    if (response.ok) {
      await refreshProfile();
    } else {
      throw new Error('Failed to remove skill');
    }
  }, [getAuthHeaders, refreshProfile]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      freelancer,
      isLoading,
      login,
      logout,
      updateUser,
      updateFreelancer,
      addEducation,
      deleteEducation,
      addExperience,
      deleteExperience,
      addSkill,
      removeSkill,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
