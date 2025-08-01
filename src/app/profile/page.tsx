'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  User,
  Camera,

  Edit3,
  Trophy,
  Star,
  Award,
  Target,
  Zap,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Upload,
  Check,
  Crown,
  Medal,
  Shield,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePhoto, deleteProfilePhoto, optimizeImage } from '@/lib/storage'

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

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  
  // Fetch user profile from Railway
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          setProfileLoading(true);
          console.log('🔄 Profile page: Fetching user profile for:', user.id);
          const response = await fetch(`/api/user/profile?userId=${user.id}`)
          if (response.ok) {
            const data = await response.json()
            console.log('✅ Profile page: User profile loaded:', data.user);
            setUserProfile(data.user)
          } else {
            console.error('❌ Profile page: Failed to fetch user profile:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('❌ Profile page: Error fetching user profile:', error)
        } finally {
          setProfileLoading(false);
        }
      } else {
        console.log('⚠️ Profile page: No user ID available for profile fetch');
      }
    }

    fetchUserProfile()
  }, [user?.id])
  
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
    completedGames: 0,
    totalGames: 4,
    resumeScore: 87,
    jobMatches: 24
  };

  const [profileData, setProfileData] = useState({
    firstName: userProfile?.first_name || 'Aaron',
    lastName: userProfile?.last_name || 'Punzalan',
    email: userProfile?.email || 'apunzalan500@gmail.com',
    phone: userProfile?.phone || '+63 961 260 9123',
    location: userProfile?.location || 'Clark, Pampanga',
    jobTitle: userProfile?.position || 'Junior Developer',
    company: '', // Removed ShoreAgents
    bio: userProfile?.bio || 'Passionate junior developer with 2+ years of experience in web development and a strong background in customer service. Skilled in JavaScript, React, and Node.js with a keen interest in AI-powered applications. Previously worked as a customer service representative for 3 years, which gave me valuable insights into client needs and business processes. Always eager to learn new technologies and contribute to meaningful projects that make a difference.'
  });

  // Update profile data when Railway data loads
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.first_name || 'Aaron',
        lastName: userProfile.last_name || 'Punzalan',
        email: userProfile.email || 'apunzalan500@gmail.com',
        phone: userProfile.phone || '+63 961 260 9123',
        location: userProfile.location || 'Clark, Pampanga',
        jobTitle: userProfile.position || 'Junior Developer',
        company: '', // Removed ShoreAgents
        bio: userProfile.bio || 'Passionate junior developer with 2+ years of experience in web development and a strong background in customer service. Skilled in JavaScript, React, and Node.js with a keen interest in AI-powered applications. Previously worked as a customer service representative for 3 years, which gave me valuable insights into client needs and business processes. Always eager to learn new technologies and contribute to meaningful projects that make a difference.'
      });
    }
  }, [userProfile]);

  // Mock achievements data
  const achievements = [
    {
      id: '1',
      title: 'Resume Master',
      description: 'Built your first professional resume',
      icon: Trophy,
      earned: true,
      earnedDate: '2024-12-01',
      rarity: 'common',
      points: 100
    },
    {
      id: '2',
      title: 'Assessment Champion',
      description: 'Completed 5 skill assessments',
      icon: Target,
      earned: true,
      earnedDate: '2024-12-10',
      rarity: 'uncommon',
      points: 250
    },
    {
      id: '3',
      title: 'Interview Ready',
      description: 'Completed mock interview preparation',
      icon: Star,
      earned: true,
      earnedDate: '2024-12-15',
      rarity: 'rare',
      points: 500
    },
    {
      id: '4',
      title: 'BPO Expert',
      description: 'Achieved 90+ score on all BPO assessments',
      icon: Crown,
      earned: false,
      earnedDate: null,
      rarity: 'legendary',
      points: 1000
    },
    {
      id: '5',
      title: 'Career Builder',
      description: 'Complete your career profile to 100%',
      icon: Shield,
      earned: false,
      earnedDate: null,
      rarity: 'epic',
      points: 750
    },
    {
      id: '6',
      title: 'Speed Demon',
      description: 'Achieve 60+ WPM on typing test',
      icon: Zap,
      earned: true,
      earnedDate: '2024-12-20',
      rarity: 'uncommon',
      points: 300
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setPhotoUploading(true);
      setPhotoError('');
      
      console.log('📸 Starting photo upload from profile page...');
      
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


  const progressToNextLevel = ((userStats.experiencePoints % 1000) / 1000) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header />
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <User className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">My Profile</h1>
                  <p className="text-gray-400">Manage your account and track your progress</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photoUploading}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                      >
                        {photoUploading ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-white" />
                        )}
                      </button>
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
                          <p className="text-gray-400">{profileData.jobTitle || 'BPO Professional'}</p>
                        </div>
                        <Button
                          onClick={() => router.push('/settings')}
                          className="bg-cyan-500 hover:bg-cyan-600"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>

                      {/* Level & XP */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-medium">Level {userStats.level}</span>
                        </div>
                        <div className="flex-1 max-w-xs">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>{userStats.experiencePoints} XP</span>
                            <span>{userStats.nextLevelXP} XP</span>
                          </div>
                          <Progress value={progressToNextLevel} className="h-2" />
                        </div>
                      </div>

                      {/* Bio */}
                      {profileData.bio && (
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h4 className="text-white font-medium mb-2">About Me</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {profileData.bio}
                          </p>
                        </div>
                      )}

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-cyan-400">{userStats.resumeScore}%</div>
                          <div className="text-xs text-gray-400">Resume Score</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{userStats.completedAssessments}/{userStats.totalAssessments}</div>
                          <div className="text-xs text-gray-400">Assessments</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-orange-400">{userStats.completedGames}/{userStats.totalGames}</div>
                          <div className="text-xs text-gray-400">Games</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">{userStats.jobMatches}</div>
                          <div className="text-xs text-gray-400">Job Matches</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">{achievements.filter(a => a.earned).length}</div>
                          <div className="text-xs text-gray-400">Achievements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>



            {/* Achievements - Extended */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Your progress and milestones on BPOC.AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                            achievement.earned 
                              ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                              : 'border-gray-700/30 bg-gray-700/20 text-gray-500 opacity-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                                                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              achievement.earned ? 'bg-green-500/20' : 'bg-gray-700/20'
                            }`}>
                            <achievement.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-lg">{achievement.title}</h4>
                                {achievement.earned && (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    Earned
                                  </Badge>
                                )}
                              </div>
                            <p className="text-sm opacity-80 mb-3">{achievement.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm capitalize font-medium">{achievement.rarity}</span>
                              <span className="text-sm font-bold">+{achievement.points} XP</span>
                              </div>
                              {achievement.earned && achievement.earnedDate && (
                              <p className="text-xs opacity-60 mt-2">
                                  Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 