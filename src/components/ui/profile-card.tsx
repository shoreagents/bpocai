'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  Camera,
  Edit3,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePhoto, optimizeImage } from '@/lib/storage';

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  location: string
  avatar_url?: string
  phone?: string
  bio?: string
  position?: string
  created_at: string
  updated_at: string
}

interface ProfileCardProps {
  userId?: string;
  showEditButton?: boolean;
  className?: string;
}

export default function ProfileCard({ userId, showEditButton = true, className = '' }: ProfileCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [professionalSummary, setProfessionalSummary] = useState<string>('');
  const [aiAnalysisScore, setAiAnalysisScore] = useState<number | null>(null);
  const [completedGames, setCompletedGames] = useState<number>(0);
  const [jobMatchesCount, setJobMatchesCount] = useState<number>(0);
  const [jobMatchesLoading, setJobMatchesLoading] = useState<boolean>(false);
  
  // Use provided userId or fall back to current user
  const targetUserId = userId || user?.id;
  
  // Fetch user profile from Railway
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (targetUserId) {
        try {
          setProfileLoading(true);
          console.log('🔄 Profile card: Fetching user profile for:', targetUserId);
          const response = await fetch(`/api/user/profile?userId=${targetUserId}`)
          if (response.ok) {
            const data = await response.json()
            console.log('✅ Profile card: User profile loaded:', data.user);
            setUserProfile(data.user)
          } else {
            console.error('❌ Profile card: Failed to fetch user profile:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('❌ Profile card: Error fetching user profile:', error)
        } finally {
          setProfileLoading(false);
        }
      } else {
        console.log('⚠️ Profile card: No user ID available for profile fetch');
      }
    }

    fetchUserProfile()
  }, [targetUserId])

  // Fetch professional summary from saved resume data
  useEffect(() => {
    const fetchProfessionalSummary = async () => {
      if (targetUserId) {
        try {
          console.log('🔄 Profile card: Fetching professional summary from saved resume for:', targetUserId);
          const response = await fetch(`/api/user/saved-resume-data`, {
            headers: {
              'x-user-id': targetUserId
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.hasData && data.resumeData) {
              // Extract professional summary from saved resume data
              const summary = extractProfessionalSummary(data.resumeData);
              if (summary) {
                console.log('✅ Profile card: Professional summary loaded from saved resume:', summary);
                setProfessionalSummary(summary);
              }
            } else {
              console.log('⚠️ Profile card: No saved resume data found for user');
            }
          } else {
            console.log('⚠️ Profile card: Failed to fetch saved resume data');
          }
        } catch (error) {
          console.error('❌ Profile card: Error fetching professional summary from saved resume:', error);
        }
      }
    };

    fetchProfessionalSummary();
  }, [targetUserId]);

  // Fetch AI analysis score
  useEffect(() => {
    const fetchAiAnalysisScore = async () => {
      if (targetUserId) {
        try {
          console.log('🔄 Profile card: Fetching AI analysis score for:', targetUserId);
          const response = await fetch(`/api/user/ai-analysis-score`, {
            headers: {
              'x-user-id': targetUserId
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.hasData && data.overallScore !== undefined) {
              console.log('✅ Profile card: AI analysis score loaded:', data.overallScore);
              setAiAnalysisScore(data.overallScore);
            } else {
              console.log('⚠️ Profile card: No AI analysis score found for user');
            }
          } else {
            console.log('⚠️ Profile card: Failed to fetch AI analysis score');
          }
        } catch (error) {
          console.error('❌ Profile card: Error fetching AI analysis score:', error);
        }
      }
    };

    fetchAiAnalysisScore();
  }, [targetUserId]);

  // Helper function to extract professional summary from saved resume data
  const extractProfessionalSummary = (resumeData: any): string | null => {
    if (!resumeData) return null;
    
    // Check for various possible field names for professional summary
    const summaryFields = ['summary', 'professional_summary', 'profile', 'objective', 'about', 'overview', 'career_summary'];
    
    // First, check if the data is in the content field (common in saved resumes)
    if (resumeData.content && typeof resumeData.content === 'object') {
      for (const field of summaryFields) {
        if (resumeData.content[field] && typeof resumeData.content[field] === 'string') {
          return resumeData.content[field];
        }
      }
    }
    
    // Check for direct fields in the resume data
    for (const field of summaryFields) {
      if (resumeData[field] && typeof resumeData[field] === 'string') {
        return resumeData[field];
      }
    }
    
    // If no direct field found, check if it's nested in files array (for extracted resumes)
    if (resumeData.files && Array.isArray(resumeData.files)) {
      for (const file of resumeData.files) {
        if (file?.data) {
          for (const field of summaryFields) {
            if (file.data[field] && typeof file.data[field] === 'string') {
              return file.data[field];
            }
          }
        }
      }
    }
    
    // Check for sections array (common in saved resumes)
    if (resumeData.sections && Array.isArray(resumeData.sections)) {
      for (const section of resumeData.sections) {
        if (section.type === 'summary' || section.type === 'profile' || section.type === 'objective') {
          if (section.content && typeof section.content === 'string') {
            return section.content;
          }
        }
      }
    }
    
    return null;
  };
  
  // Extract user info from Railway data only
  const userDisplayName = profileLoading ? 'Loading...' : (userProfile?.full_name || 'User');
  const userInitials = profileLoading ? 'L' : (userProfile?.full_name 
    ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    : 'U');

  // Mock user data - in production this would come from your database
  const userStats = {
    level: 12,
    experiencePoints: 14400,
    nextLevelXP: 15000,
    completedAssessments: 8,
    totalAssessments: 12,
    resumeScore: 87,
    jobMatches: 0
  };

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: '',
    company: '',
    bio: ''
  });

  // Update profile data when Railway data loads
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        jobTitle: userProfile.position || '',
        company: '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setPhotoUploading(true);
      setPhotoError('');
      
      console.log('📸 Starting photo upload from profile card...');
      
      // Optimize image
      const optimizedFile = await optimizeImage(file);
      console.log('✅ Image optimized');
      
      // Upload to Supabase
      const { fileName, publicUrl } = await uploadProfilePhoto(optimizedFile, user.id);
      console.log('✅ Photo uploaded to Supabase:', publicUrl);
      
      // Update local state
      setProfilePicture(publicUrl);
      
      // Update Railway database
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          avatar_url: publicUrl
        })
      });
      
      if (response.ok) {
        console.log('✅ Profile photo updated in Railway');
        
        // Trigger header update
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        console.error('❌ Failed to update profile photo in Railway');
      }
      
    } catch (error) {
      console.error('❌ Photo upload failed:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Upload failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('error' in error) {
          errorMessage = String(error.error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else {
        errorMessage = String(error);
      }
      
      setPhotoError(errorMessage);
    } finally {
      setPhotoUploading(false);
    }
  };



  // Load Career Games count from database sessions
  useEffect(() => {
    (async () => {
      try {
        if (!targetUserId) return;
        
        console.log('🔄 Profile card: Fetching games count from database sessions for:', targetUserId);
        const response = await fetch(`/api/user/games-count`, {
          headers: {
            'x-user-id': targetUserId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.hasData && data.gamesCount !== undefined) {
            setCompletedGames(data.gamesCount);
            console.log('✅ Profile card: Games count loaded from database:', data.gamesCount, 'Breakdown:', data.breakdown);
          } else {
            console.log('⚠️ Profile card: No games count data found');
            setCompletedGames(0);
          }
        } else {
          console.log('⚠️ Profile card: Failed to fetch games count');
          setCompletedGames(0);
        }
        
      } catch (e) {
        console.error('❌ Profile card: Error loading games count:', e);
        setCompletedGames(0);
      }
    })();
  }, [targetUserId]);

  // Load Job Matches count based on active jobs analyzed
  useEffect(() => {
    (async () => {
      try {
        if (!targetUserId) return;
        setJobMatchesLoading(true)
        const response = await fetch(`/api/user/job-matches-count?threshold=70`, {
          headers: { 'x-user-id': targetUserId }
        })
        if (response.ok) {
          const data = await response.json()
          if (typeof data.matches === 'number') {
            setJobMatchesCount(data.matches)
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setJobMatchesLoading(false)
      }
    })()
  }, [targetUserId])



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={className}
    >
      <Card className="glass-card border-white/10">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-br from-cyan-400 to-purple-400 p-1">
                {photoUploading ? (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">
                      {userInitials}
                    </span>
                  </div>
                )}
              </div>
              {showEditButton && user?.id === targetUserId && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-500 disabled:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                >
                  {photoUploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">{userDisplayName}</h2>
                </div>
                {showEditButton && user?.id === targetUserId && (
                  <Button
                    onClick={() => router.push('/settings')}
                    className="bg-cyan-500"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Professional Summary or Bio */}
              {(professionalSummary || profileData.bio) && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-medium mb-2">
                    {professionalSummary ? 'Professional Summary' : 'About Me'}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {professionalSummary || profileData.bio}
                  </p>
                </div>
              )}

                             {/* Quick Stats */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="text-center p-3 bg-white/5 rounded-lg">
                   <div className="text-2xl font-bold text-cyan-400">
                     {aiAnalysisScore !== null ? aiAnalysisScore : userStats.resumeScore}
                   </div>
                   <div className="text-xs text-gray-400">Resume Score</div>
                 </div>
                 <div className="text-center p-3 bg-white/5 rounded-lg">
                   <div className="text-2xl font-bold text-orange-400">{completedGames}/4</div>
                   <div className="text-xs text-gray-400">Games</div>
                 </div>
                 <div className="text-center p-3 bg-white/5 rounded-lg">
                   <div className="text-2xl font-bold text-purple-400">
                     {jobMatchesLoading ? (
                       <span className="inline-flex items-center gap-2 text-purple-300">
                         <Loader2 className="w-5 h-5 animate-spin" />
                       </span>
                     ) : (
                       jobMatchesCount
                     )}
                   </div>
                   <div className="text-xs text-gray-400">Job Matches</div>
                 </div>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
