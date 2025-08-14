'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  User,
  Camera,
  Edit3,
  Trophy,
  Loader2,
  Guitar,
  Brain,
  Crown,
  Globe
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
  const [typingStats, setTypingStats] = useState<any | null>(null);
  const [typingLatest, setTypingLatest] = useState<any | null>(null);
  const [discStats, setDiscStats] = useState<any | null>(null);
  const [discLatest, setDiscLatest] = useState<any | null>(null);
  
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

  // achievements removed

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

  // Load Typing Hero public stats for this user
  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`/api/games/typing-hero/public/${user.id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setTypingStats(data.stats || null);
          setTypingLatest(data.latestSession || null);
        }
        const discRes = await fetch(`/api/games/disc-personality/public/${user.id}`, { cache: 'no-store' });
        if (discRes.ok) {
          const d = await discRes.json();
          setDiscStats(d.stats || null);
          setDiscLatest(d.latestSession || null);
        }
      } catch (e) {
        setTypingStats(null);
        setTypingLatest(null);
        setDiscStats(null);
        setDiscLatest(null);
      }
    })();
  }, [user?.id]);

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
                          {profileData.jobTitle && (
                            <p className="text-gray-400">{profileData.jobTitle}</p>
                          )}
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        {/* Achievements tile removed */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Career Games Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Career Games</CardTitle>
                  <CardDescription className="text-gray-300">Your game stats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Typing Hero */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Guitar className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-white">Typing Hero</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300 space-y-2">
                        {typingStats ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>Best WPM: <span className="text-white font-semibold">{typingStats.best_wpm ?? '—'}</span></div>
                            <div>Best Accuracy: <span className="text-white font-semibold">{typingStats.best_accuracy ?? '—'}{typingStats.best_accuracy != null ? '%' : ''}</span></div>
                            <div>Median WPM: <span className="text-white font-semibold">{typingStats.median_wpm ?? '—'}</span></div>
                            <div>Recent WPM: <span className="text-white font-semibold">{typingStats.recent_wpm ?? '—'}</span></div>
                            <div>Highest Difficulty: <span className="text-white font-semibold capitalize">{typingStats.highest_difficulty ?? '—'}</span></div>
                            <div>Consistency Index: <span className="text-white font-semibold">{typingStats.consistency_index ?? '—'}</span></div>
                            <div>Total Sessions: <span className="text-white font-semibold">{typingStats.total_sessions ?? 0}</span></div>
                            <div>Percentile: <span className="text-white font-semibold">{typingStats.percentile != null ? `${typingStats.percentile}%` : '—'}</span></div>
                          </div>
                        ) : (
                          <div>No Typing Hero stats yet.</div>
                        )}
                        <Separator className="my-3 bg-white/10" />
                        <div className="text-gray-400">Latest Session</div>
                        {typingLatest ? (
                          <div className="grid grid-cols-3 gap-3 text-gray-300">
                            <div>Date: <span className="text-white font-semibold">{new Date(typingLatest.started_at).toLocaleString()}</span></div>
                            <div>WPM: <span className="text-white font-semibold">{typingLatest.wpm ?? '—'}</span></div>
                            <div>Accuracy: <span className="text-white font-semibold">{typingLatest.accuracy != null ? `${typingLatest.accuracy}%` : '—'}</span></div>
                          </div>
                        ) : (
                          <div>No recent session found.</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* BPOC DISC */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-amber-400" />
                        <CardTitle className="text-white">BPOC DISC</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300 space-y-2">
                        {discStats ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>D: <span className="text-white font-semibold">{discStats.d ?? '—'}%</span></div>
                            <div>I: <span className="text-white font-semibold">{discStats.i ?? '—'}%</span></div>
                            <div>S: <span className="text-white font-semibold">{discStats.s ?? '—'}%</span></div>
                            <div>C: <span className="text-white font-semibold">{discStats.c ?? '—'}%</span></div>
                            <div>Primary: <span className="text-white font-semibold">{discStats.primary_style ?? '—'}</span></div>
                            <div>Secondary: <span className="text-white font-semibold">{discStats.secondary_style ?? '—'}</span></div>
                            <div>Consistency: <span className="text-white font-semibold">{discStats.consistency_index ?? '—'}</span></div>
                            {discStats.percentile != null && (
                              <div>Percentile: <span className="text-white font-semibold">{discStats.percentile}%</span></div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">No data yet.</div>
                        )}
                        {discLatest && (
                          <div className="mt-3 text-gray-400">
                            <div className="text-xs">Latest Session</div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>Date: <span className="text-white">{new Date(discLatest.started_at).toLocaleString()}</span></div>
                              <div>Primary: <span className="text-white">{discLatest.primary_style}</span></div>
                              <div>D/I/S/C: <span className="text-white">{discLatest.d}% / {discLatest.i}% / {discLatest.s}% / {discLatest.c}%</span></div>
                              <div>Consistency: <span className="text-white">{discLatest.consistency_index ?? '—'}</span></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* BPOC Ultimate */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-red-400" />
                        <CardTitle className="text-white">BPOC Ultimate</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300">
                        <div className="text-gray-400">No data yet.</div>
                      </CardContent>
                    </Card>

                    {/* BPOC Cultural */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <CardTitle className="text-white">BPOC Cultural</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300">
                        <div className="text-gray-400">No data yet.</div>
                      </CardContent>
                    </Card>
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