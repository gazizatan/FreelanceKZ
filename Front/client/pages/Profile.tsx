import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import ProfessionalismBadge from '@/components/ProfessionalismBadge';
import LevelProgressCard from '@/components/LevelProgressCard';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Edit2, MapPin, Clock, Star, Award, Briefcase, Users, MessageCircle, Plus, Trash2, Building, GraduationCap, Briefcase as WorkIcon, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getDefaultEgovAuth } from '@/services/egovAuth';
import { apiFetch } from '@/lib/api';

export default function Profile() {
  const { t } = useLocale();
  const { isAuthenticated, user, freelancer, isLoading, logout, updateFreelancer, addEducation, deleteEducation, addExperience, deleteExperience, addSkill, removeSkill, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    bio: '',
    location: '',
    hourly_rate: 0,
    languages: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [experienceForm, setExperienceForm] = useState({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    skills_used: '',
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddingXp, setIsAddingXp] = useState(false);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Initialize edit data when freelancer loads
  useEffect(() => {
    if (freelancer) {
      setEditData({
        title: freelancer.title || '',
        bio: freelancer.bio || '',
        location: freelancer.location || '',
        hourly_rate: freelancer.hourly_rate || 0,
        languages: freelancer.languages || [],
      });
    }
  }, [freelancer]);

  // Don't render profile if not authenticated or still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleSaveProfile = async () => {
    try {
      await updateFreelancer(editData);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestComplete = async () => {
    setIsAddingXp(true);
    try {
      const userId = localStorage.getItem('user_id');
      const response = await apiFetch('/api/gamification/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId || '',
        },
        body: JSON.stringify({ amount: 1 }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add XP');
      }
      await refreshProfile();
      toast({
        title: 'XP gained!',
        description: 'Test completed. +1 XP',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add XP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingXp(false);
    }
  };

  const handleEgovVerify = () => {
    sessionStorage.setItem('egov_flow', 'verify');
    setIsVerifying(true);
    const egovAuth = getDefaultEgovAuth();
    egovAuth.redirectToLogin('verify');
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await addSkill(newSkill.trim());
      setNewSkill('');
      toast({
        title: "Skill added",
        description: `${newSkill} has been added to your profile.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    try {
      await removeSkill(skill);
      toast({
        title: "Skill removed",
        description: `${skill} has been removed from your profile.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddEducation = async () => {
    try {
      await addEducation(educationForm);
      setEducationForm({
        institution: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: '',
        description: '',
      });
      setShowAddEducation(false);
      toast({
        title: "Education added",
        description: "Your education has been added to your profile.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add education. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      await deleteEducation(id);
      toast({
        title: "Education removed",
        description: "Education has been removed from your profile.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove education. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddExperience = async () => {
    try {
      await addExperience({
        ...experienceForm,
        skills_used: experienceForm.skills_used.split(',').map(s => s.trim()).filter(Boolean),
      });
      setExperienceForm({
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: '',
        skills_used: '',
      });
      setShowAddExperience(false);
      toast({
        title: "Experience added",
        description: "Your work experience has been added to your profile.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add experience. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await deleteExperience(id);
      toast({
        title: "Experience removed",
        description: "Work experience has been removed from your profile.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove experience. Please try again.",
        variant: "destructive",
      });
    }
  };

  const freelancerData = freelancer || {
    title: '',
    bio: '',
    skills: [],
    hourly_rate: 0,
    location: '',
    languages: [],
    education: [],
    experience: [],
    certifications: [],
    completed_projects: 0,
    rating: 0,
    professionalism: 0,
    level: 'novice',
  };

  const gamificationLevel = (user.level || freelancerData.level || 'novice') as 'novice' | 'intermediate' | 'expert' | 'master' | 'legend';
  const gamificationProgress = typeof user.professionalism === 'number'
    ? user.professionalism
    : (freelancerData.professionalism || 0);
  const gamificationXp = typeof user.xp === 'number' ? user.xp : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <div className="px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Profile Header */}
          <div className="mb-12">
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-8 sm:p-12">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-6">
                  <div className="text-6xl">👤</div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-start gap-3">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">{user.fullName || 'User'}</h1>
                        {isEditing ? (
                          <Input
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            placeholder="Your title (e.g., UI/UX Designer)"
                            className="mt-2"
                          />
                        ) : (
                          <p className="text-lg text-muted-foreground">{freelancerData.title || 'No title set'}</p>
                        )}
                      </div>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {isEditing ? (
                          <Input
                            value={editData.location}
                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                            placeholder="Location"
                            className="w-40 h-8"
                          />
                        ) : (
                          freelancerData.location || 'No location set'
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-500 text-yellow-500" />
                        {freelancerData.rating} ({freelancerData.completed_projects} projects)
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        Hourly: {isEditing ? (
                          <Input
                            type="number"
                            value={editData.hourly_rate}
                            onChange={(e) => setEditData({ ...editData, hourly_rate: parseFloat(e.target.value) || 0 })}
                            className="w-24 h-8"
                          />
                        ) : (
                          `$${freelancerData.hourly_rate || 0}`
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="mb-2"
                      />
                    ) : (
                      <p className="text-foreground">{freelancerData.bio || 'No bio set. Tell us about yourself!'}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:w-auto">
                  {isEditing ? (
                    <>
                      <Button
                        className="bg-gradient-to-r from-primary to-secondary text-white"
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="bg-gradient-to-r from-primary to-secondary text-white"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 size={16} className="mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" onClick={handleLogout}>
                        <MessageCircle size={16} className="mr-2" />
                        Sign Out
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Professionalism Badge */}
              <div className="mt-8 border-t border-border pt-8">
                <ProfessionalismBadge level={freelancerData.level || 'novice'} size="lg" />
              </div>
            </div>
          </div>

          {/* Gamification Card */}
          <div className="mb-12">
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-3 ${user.egov_auth ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <Shield className={`${user.egov_auth ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.egov_auth ? 'eGov.kz verified' : 'Verify your identity with eGov.kz'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.egov_auth ? 'Your account is verified.' : 'Verification increases trust and profile visibility.'}
                    </p>
                  </div>
                </div>
                <div>
                  {user.egov_auth ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Verified
                    </span>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                      onClick={handleEgovVerify}
                      disabled={isVerifying}
                    >
                      {isVerifying ? 'Redirecting...' : 'Verify with eGov.kz'}
                    </Button>
                  )}
                </div>
              </div>
              {(user.iin || user.phone || user.email) && (
                <div className="mt-4 text-xs text-muted-foreground">
                  {user.email && <span className="mr-3">Email: {user.email}</span>}
                  {user.phone && <span className="mr-3">Phone: {user.phone}</span>}
                  {user.iin && <span>IIN: {user.iin}</span>}
                </div>
              )}
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="mb-12 grid gap-6 md:grid-cols-4">
            <Card className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Projects Completed</p>
                <Briefcase className="text-primary" size={20} />
              </div>
              <p className="text-3xl font-bold text-foreground">{freelancerData.completed_projects || 0}</p>
            </Card>

            <Card className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <Star className="fill-yellow-500 text-yellow-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-foreground">{freelancerData.rating || 0}</p>
            </Card>

            <Card className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Professionalism</p>
                <Award className="text-secondary" size={20} />
              </div>
              <p className="text-3xl font-bold text-foreground">{freelancerData.professionalism || 0}%</p>
            </Card>

            <Card className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <Users className="text-accent" size={20} />
              </div>
              <p className="text-3xl font-bold text-foreground">98%</p>
            </Card>

            <Card className="p-6 md:col-span-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">XP</p>
                  <p className="text-3xl font-bold text-foreground">{gamificationXp}</p>
                  <p className="text-xs text-muted-foreground">Complete tests to earn +1 XP</p>
                </div>
                <Button variant="outline" onClick={handleTestComplete} disabled={isAddingXp}>
                  {isAddingXp ? 'Adding XP...' : 'Complete Test (+1 XP)'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Left Column - Progress Card */}
            <div className="lg:col-span-1">
              <LevelProgressCard
                currentLevel={gamificationLevel}
                progressPercentage={gamificationProgress}
                completedProjects={freelancerData.completed_projects || 0}
                rating={freelancerData.rating || 0}
              />
            </div>

            {/* Right Column - Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                {/* Skills Tab */}
                <TabsContent value="skills" className="mt-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">Skills</h3>
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                          className="w-40"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                        />
                        <Button size="sm" onClick={handleAddSkill}>
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="mb-8 flex flex-wrap gap-2">
                      {freelancerData.skills?.map((skill) => (
                        <div
                          key={skill}
                          className="group flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {(!freelancerData.skills || freelancerData.skills.length === 0) && (
                        <p className="text-muted-foreground text-sm">No skills added yet. Add your first skill above!</p>
                      )}
                    </div>

                    <h3 className="mb-4 text-lg font-bold text-foreground">Languages</h3>
                    <div className="mb-8 space-y-2">
                      {freelancerData.languages?.map((lang) => (
                        <div key={lang} className="text-foreground">
                          {lang}
                        </div>
                      ))}
                      {(!freelancerData.languages || freelancerData.languages.length === 0) && (
                        <p className="text-muted-foreground text-sm">No languages added yet.</p>
                      )}
                    </div>

                    <h3 className="mb-4 text-lg font-bold text-foreground">Certifications</h3>
                    <div className="space-y-2">
                      {freelancerData.certifications?.map((cert) => (
                        <div
                          key={cert}
                          className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3"
                        >
                          <Award size={18} className="text-accent" />
                          <span className="text-foreground">{cert}</span>
                        </div>
                      ))}
                      {(!freelancerData.certifications || freelancerData.certifications.length === 0) && (
                        <p className="text-muted-foreground text-sm">No certifications added yet.</p>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="mt-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">Education</h3>
                      <Button size="sm" onClick={() => setShowAddEducation(!showAddEducation)}>
                        <Plus size={16} className="mr-2" />
                        Add Education
                      </Button>
                    </div>

                    {/* Add Education Form */}
                    {showAddEducation && (
                      <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                        <h4 className="font-medium">Add New Education</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            placeholder="Institution"
                            value={educationForm.institution}
                            onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
                          />
                          <Input
                            placeholder="Degree"
                            value={educationForm.degree}
                            onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                          />
                          <Input
                            placeholder="Field of Study"
                            value={educationForm.field}
                            onChange={(e) => setEducationForm({ ...educationForm, field: e.target.value })}
                          />
                          <Input
                            type="date"
                            placeholder="Start Date"
                            value={educationForm.start_date}
                            onChange={(e) => setEducationForm({ ...educationForm, start_date: e.target.value })}
                          />
                          <Input
                            type="date"
                            placeholder="End Date"
                            value={educationForm.end_date}
                            onChange={(e) => setEducationForm({ ...educationForm, end_date: e.target.value })}
                          />
                        </div>
                        <Textarea
                          placeholder="Description (optional)"
                          value={educationForm.description}
                          onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleAddEducation}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setShowAddEducation(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* Education List */}
                    <div className="space-y-4">
                      {freelancerData.education?.map((edu) => (
                        <div
                          key={edu._id}
                          className="flex items-start justify-between rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="flex gap-3">
                            <GraduationCap size={20} className="text-primary mt-1" />
                            <div>
                              <p className="font-medium text-foreground">{edu.institution}</p>
                              <p className="text-sm text-muted-foreground">{edu.degree} in {edu.field}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {edu.start_date} - {edu.end_date || 'Present'}
                              </p>
                              {edu.description && (
                                <p className="text-sm mt-2">{edu.description}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => edu._id && handleDeleteEducation(edu._id)}
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {(!freelancerData.education || freelancerData.education.length === 0) && (
                        <p className="text-muted-foreground text-sm text-center py-8">No education added yet.</p>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="mt-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">Work Experience</h3>
                      <Button size="sm" onClick={() => setShowAddExperience(!showAddExperience)}>
                        <Plus size={16} className="mr-2" />
                        Add Experience
                      </Button>
                    </div>

                    {/* Add Experience Form */}
                    {showAddExperience && (
                      <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                        <h4 className="font-medium">Add Work Experience</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            placeholder="Company"
                            value={experienceForm.company}
                            onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                          />
                          <Input
                            placeholder="Position"
                            value={experienceForm.position}
                            onChange={(e) => setExperienceForm({ ...experienceForm, position: e.target.value })}
                          />
                          <Input
                            type="date"
                            placeholder="Start Date"
                            value={experienceForm.start_date}
                            onChange={(e) => setExperienceForm({ ...experienceForm, start_date: e.target.value })}
                          />
                          <Input
                            type="date"
                            placeholder="End Date"
                            value={experienceForm.end_date}
                            onChange={(e) => setExperienceForm({ ...experienceForm, end_date: e.target.value })}
                          />
                        </div>
                        <Input
                          placeholder="Skills used (comma separated)"
                          value={experienceForm.skills_used}
                          onChange={(e) => setExperienceForm({ ...experienceForm, skills_used: e.target.value })}
                        />
                        <Textarea
                          placeholder="Description"
                          value={experienceForm.description}
                          onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleAddExperience}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setShowAddExperience(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* Experience List */}
                    <div className="space-y-4">
                      {freelancerData.experience?.map((exp) => (
                        <div
                          key={exp._id}
                          className="flex items-start justify-between rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="flex gap-3">
                            <WorkIcon size={20} className="text-secondary mt-1" />
                            <div>
                              <p className="font-medium text-foreground">{exp.position}</p>
                              <p className="text-sm text-muted-foreground">{exp.company}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {exp.start_date} - {exp.end_date || 'Present'}
                              </p>
                              {exp.description && (
                                <p className="text-sm mt-2">{exp.description}</p>
                              )}
                              {exp.skills_used && exp.skills_used.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exp.skills_used.map((skill) => (
                                    <span
                                      key={skill}
                                      className="text-xs rounded-full bg-primary/10 px-2 py-1 text-primary"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exp._id && handleDeleteExperience(exp._id)}
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {(!freelancerData.experience || freelancerData.experience.length === 0) && (
                        <p className="text-muted-foreground text-sm text-center py-8">No work experience added yet.</p>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="mt-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Projects</h3>
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center py-8">No projects yet. Complete your first project to add it here!</p>
                    </div>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Reviews</h3>
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-center py-8">No reviews yet. Complete projects to receive reviews!</p>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
