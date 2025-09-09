'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User,
  Briefcase,
  BarChart3,
  Gamepad2,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Trophy,
  Medal,
  Heart,
  Eye,
  CheckCircle,
  Building2,
  DollarSign,
  Clock,
  Home,
  Smile,
  Frown,
  Meh,
  Edit3,
  Save,
  X,
  CalendarDays,
  Target,
  FileText,
  TrendingUp,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Share
  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
  import LoadingScreen from '@/components/ui/loading-screen';
  import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  position?: string;
  avatar_url?: string;
  bio?: string;
  gender?: string;
  gender_custom?: string;
  birthday?: string;
  created_at: string;
  overall_score?: number;
  resume_score?: number;
  completed_games?: number;
  total_games?: number;
  key_strengths?: string[];
  strengths_analysis?: any;
  current_employer?: string;
  current_position?: string;
  current_salary?: string | number;
  notice_period_days?: number;
  current_mood?: string;
  work_status?: string;
  preferred_shift?: string;
  expected_salary?: string;
  work_setup?: string;
  ats_compatibility_score?: number;
  content_quality_score?: number;
  professional_presentation_score?: number;
  skills_alignment_score?: number;
  improvements?: string[];
  recommendations?: string[];
  improved_summary?: string;
  salary_analysis?: any;
  career_path?: any;
  section_analysis?: any;
  game_stats?: {
    bpoc_cultural_stats?: any;
    disc_personality_stats?: any;
    typing_hero_stats?: any;
    ultimate_stats?: any;
    bpoc_cultural_results?: any;
  };
}

export default function ProfilePage() {
const params = useParams();
 const router = useRouter();
  const searchParams = useSearchParams();
 const slug = params.slug as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isOwner, setIsOwner] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
 const [overallScore, setOverallScore] = useState<number>(0);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState<boolean>(false);
  const [editedPersonalInfo, setEditedPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    location: '',
    position: '',
    gender: '',
    gender_custom: '',
    birthday: ''
  });
  const [isEditingWorkStatus, setIsEditingWorkStatus] = useState<boolean>(false);
  const [editedWorkStatus, setEditedWorkStatus] = useState({
    current_employer: '',
    current_salary: '',
    notice_period_days: '',
    current_mood: '',
    work_status: '',
    preferred_shift: '',
    expected_salary: '',
    expected_salary_min: '',
    expected_salary_max: '',
    work_setup: ''
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

 // Function to determine rank based on overall score
 const getRank = (score: number) => {
 if (score >= 85 && score <= 100) return { rank: 'GOLD', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' }
 if (score >= 65 && score <= 84) return { rank: 'SILVER', color: 'text-gray-300', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' }
 if (score >= 50 && score <= 64) return { rank: 'BRONZE', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' }
 return { rank: 'None', color: 'text-gray-500', bgColor: 'bg-gray-600/20', borderColor: 'border-gray-600/30' }
}

  // Function to start editing personal information
  const startEditingPersonalInfo = () => {
    if (userProfile) {
      setEditedPersonalInfo({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        location: userProfile.location || '',
        position: userProfile.position || '',
        gender: userProfile.gender || '',
        gender_custom: userProfile.gender_custom || '',
        birthday: userProfile.birthday || ''
      });
      setIsEditingPersonalInfo(true);
    }
  };

  // Function to cancel editing
  const cancelEditingPersonalInfo = () => {
    setIsEditingPersonalInfo(false);
    setEditedPersonalInfo({
      first_name: '',
      last_name: '',
      location: '',
      position: '',
      gender: '',
      gender_custom: '',
      birthday: ''
    });
  };

  // Function to save personal information changes
  const savePersonalInfo = async () => {
    if (!userProfile) return;
    
    setIsSaving(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No session found');
        return;
      }

      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: userProfile.id,
          ...editedPersonalInfo
        }),
      });

      if (response.ok) {
        // Update the local state
        setUserProfile(prev => prev ? {
          ...prev,
          ...editedPersonalInfo
        } : null);
        setIsEditingPersonalInfo(false);
} else {
        console.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Work Status Edit Functions
  const startEditingWorkStatus = () => {
    if (userProfile) {
      // Parse existing salary range if it exists
      let expectedSalaryMin = '';
      let expectedSalaryMax = '';
      
      if (userProfile.expected_salary) {
        const salaryStr = String(userProfile.expected_salary);
        if (salaryStr.includes('-')) {
          const parts = salaryStr.replace(/P+/g, '').split('-');
          expectedSalaryMin = parts[0] || '';
          expectedSalaryMax = parts[1] || '';
        } else {
          expectedSalaryMin = salaryStr.replace(/P+/g, '');
        }
      }

      setEditedWorkStatus({
        current_employer: userProfile.current_employer || '',
        current_salary: String(userProfile.current_salary || ''),
        notice_period_days: String(userProfile.notice_period_days || ''),
        current_mood: userProfile.current_mood || '',
        work_status: userProfile.work_status || '',
        preferred_shift: userProfile.preferred_shift || '',
        expected_salary: userProfile.expected_salary || '',
        expected_salary_min: expectedSalaryMin,
        expected_salary_max: expectedSalaryMax,
        work_setup: userProfile.work_setup || ''
      });
    }
    setIsEditingWorkStatus(true);
  };

  const cancelEditingWorkStatus = () => {
    setIsEditingWorkStatus(false);
    setEditedWorkStatus({
      current_employer: '',
      current_salary: '',
      notice_period_days: '',
      current_mood: '',
      work_status: '',
      preferred_shift: '',
      expected_salary: '',
      expected_salary_min: '',
      expected_salary_max: '',
      work_setup: ''
    });
  };

  const saveWorkStatus = async () => {
    if (!userProfile) return;
    
    setIsSaving(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No session found');
        return;
      }

      const response = await fetch('/api/user/update-work-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: userProfile.id,
          ...editedWorkStatus
        }),
      });

      if (response.ok) {
        // Update the local state
        setUserProfile(prev => prev ? {
          ...prev,
          current_employer: editedWorkStatus.current_employer,
          current_salary: editedWorkStatus.current_salary as string | number,
          notice_period_days: parseInt(editedWorkStatus.notice_period_days) || 0,
          current_mood: editedWorkStatus.current_mood,
          work_status: editedWorkStatus.work_status,
          preferred_shift: editedWorkStatus.preferred_shift,
          expected_salary: editedWorkStatus.expected_salary,
          work_setup: editedWorkStatus.work_setup
        } : null);
        setIsEditingWorkStatus(false);
} else {
        console.error('Failed to save work status changes');
      }
    } catch (error) {
      console.error('Error saving work status changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if this is resume mode and redirect
 const modeParam = searchParams?.get('mode');
 const slugLower = (slug || '').toLowerCase();
 const inferredMode = slugLower.endsWith('-resume') ? 'resume' : 'profile';
 const initialMode = (modeParam === 'resume' || modeParam === 'profile') ? modeParam : inferredMode;
 const isProfileMode = initialMode === 'profile';

 // Redirect resume mode to separate resume page
 useEffect(() => {
 if (!isProfileMode) {
 router.replace(`/resume/${slug}`);
}
}, [isProfileMode, router, slug]);

 // Don't render anything if we're redirecting
 if (!isProfileMode) {
 return null;
}

  // Fetch user profile data
useEffect(() => {
    const fetchUserProfile = async () => {
 try {
 setLoading(true);
        const res = await fetch(`/api/public/user-by-slug?slug=${encodeURIComponent(slug)}`, { 
          cache: 'no-store' 
        });
        
        if (!res.ok) {
          setError('Profile not found');
          setLoading(false);
          return;
        }
        
 const data = await res.json();
        const user = data.user || {};
        setUserProfile(user);
        
        // Fetch overall score from leaderboard
        if (user.id) {
          try {
            const scoreResponse = await fetch(`/api/leaderboards/user/${user.id}`);
 if (scoreResponse.ok) {
 const scoreData = await scoreResponse.json();
              setOverallScore(scoreData.overall?.overall_score || 0);
}
} catch (error) {
            console.log('Failed to fetch overall score:', error);
            setOverallScore(0);
}
}
 
        // Check if current user is the owner
        // If public=true query parameter is present, always show public view
        const isPublicView = searchParams.get('public') === 'true';
        
        if (isPublicView) {
          setIsOwner(false);
        } else {
          try {
            const { data: authData } = await supabase.auth.getUser();
            const currentUserId = authData?.user?.id;
            setIsOwner(!!currentUserId && String(currentUserId) === String(user.id || ''));
          } catch {
            setIsOwner(false);
          }
        }
        
 setError(null);
} catch (e) {
 setError('Failed to load profile');
} finally {
 setLoading(false);
}
};

if (slug) {
      fetchUserProfile();
}
}, [slug]);

  if (loading) {
    return <LoadingScreen 
      title="Loading Profile"
      subtitle="Fetching your profile information..."
      progressValue={75}
      showProgress={true}
      showStatusIndicators={true}
    />;
  }

  if (error || !userProfile) {
return (
      <div className="min-h-screen bg-black text-white">
<Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Profile Not Found</h1>
            <p className="text-gray-400 mb-8">{error || 'The requested profile could not be found.'}</p>
            <Button onClick={() => router.push('/home')} variant="outline">
              Go Home
            </Button>
</div>
</div>
</div>
    );
  }

  const rank = getRank(overallScore);

return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      <Header />

{/* Background Effects */}
<div className="absolute inset-0">
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
</div>

      <div className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        {/* Single Wide Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
            {/* Profile Header */}
            <div className="relative overflow-hidden">
              {/* Static Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10">
                <div className="absolute top-4 left-4 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl"></div>
                <div className="absolute top-8 right-8 w-16 h-16 bg-purple-400/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-1/3 w-12 h-12 bg-pink-400/20 rounded-full blur-xl"></div>
</div>
              {/* Action Icons and Buttons */}
              <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
                {/* Action Buttons - Left of Icons */}
                <div className="flex flex-col gap-3 relative z-50">
                  {/* View Resume Button - Only show for non-owners */}
                  {!isOwner && (
                    <Button 
                      onClick={() => {
                        // Remove the ID suffix (e.g., -ccf9) from the slug
                        const namePart = slug.split('-').slice(0, -1).join('-');
                        router.push(`/resume/${namePart}-resume`);
                      }}
                      className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-300 hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Resume
                    </Button>
                  )}

                  {/* Share Button - Only show for owners */}
                  {isOwner && (
                    <Button 
                      onClick={() => {
                        // Create a clean public-only version of the profile URL with ?public=true
                        const currentUrl = new URL(window.location.href);
                        const baseUrl = currentUrl.origin;
                        const currentPath = currentUrl.pathname;
                        
                        // Create a clean public URL by adding ?public=true query parameter
                        const publicProfileUrl = `${baseUrl}${currentPath}?public=true`;
                        
                        navigator.clipboard.writeText(publicProfileUrl).then(() => {
                          alert('Public profile link copied to clipboard!');
                        }).catch(() => {
                          alert('Failed to copy link. Please copy manually: ' + publicProfileUrl);
                        });
                      }}
                      className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 relative z-50 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                  )}
                </div>

                {/* Heart and Eye Icons */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <button className="p-3 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-110">
                      <Heart className="w-5 h-5 text-red-400" />
                    </button>
                    <span className="text-xs text-red-400 font-medium">127</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button className="p-3 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-110">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </button>
                    <span className="text-xs text-blue-400 font-medium">2.4k</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  {/* Avatar Section */}
 <div className="relative">
                    {/* Glowing Ring */}
                    <div className={`absolute -inset-2 rounded-full opacity-75 blur-sm ${
                      overallScore > 0 
                        ? rank.rank === 'GOLD' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          rank.rank === 'SILVER' ? 'bg-gradient-to-r from-slate-300 to-slate-500' :
                          rank.rank === 'BRONZE' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-gray-500 to-gray-700'
                        : 'bg-gradient-to-r from-cyan-400 to-purple-600'
                    }`}></div>
                    
                    {/* Avatar */}
                    <div className={`relative w-36 h-36 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 ${
                      overallScore > 0 ? 
                        rank.rank === 'GOLD' ? 'border-yellow-500/50' :
                        rank.rank === 'SILVER' ? 'border-slate-400/60' :
                        rank.rank === 'BRONZE' ? 'border-orange-500/50' :
                        'border-gray-500/50'
                      : 'border-cyan-500/50'
                    } ${
                      overallScore > 0 
                        ? rank.rank === 'GOLD' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                          rank.rank === 'SILVER' ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                          rank.rank === 'BRONZE' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                          'bg-gradient-to-br from-gray-600 to-gray-700'
                        : 'bg-gradient-to-br from-cyan-500 to-purple-600'
                    }`}>
                      {userProfile.avatar_url ? (
                        <img 
                          src={userProfile.avatar_url} 
                          alt={userProfile.full_name}
                          className="w-full h-full rounded-full object-cover"
 />
 ) : (
                        userProfile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
 )}
</div>
</div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4">
                    {/* Name and Verified Badge */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                          {userProfile.full_name}
                        </h1>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-sm">
                          <CheckCircle className="w-5 h-5 text-blue-400" />
                          <span className="text-sm font-bold text-blue-400">Verified</span>
</div>
</div>

                      <p className="text-2xl text-cyan-300 font-medium">
                        {userProfile.position || "No position data found"}
                      </p>
</div>

                    {/* Location and Rank */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-3 text-lg text-gray-300">
                        <div className="p-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                          <MapPin className="w-5 h-5 text-cyan-400" />
</div>
                        <span>{userProfile.location || "No location data found"}</span>
</div>

                      {overallScore > 0 && (
                        <div className={`px-4 py-2 rounded-full border-2 ${rank.bgColor} ${rank.borderColor} backdrop-blur-sm`}>
                          <div className={`text-sm font-bold ${rank.color} flex items-center gap-2`}>
                            <Star className="w-4 h-4" />
                            {rank.rank} RANK
</div>
 </div>
 )}
 </div>


                    {/* Bio */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      {userProfile.bio ? (
                        <p className="text-gray-200 leading-relaxed text-lg">{userProfile.bio}</p>
                      ) : (
                        <p className="text-gray-400 italic">No bio data found</p>
 )}
 </div>
 </div>
 </div>
              </div>
 </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-800">
              <nav className="flex space-x-0">
                {[
                  { id: 'overview', label: 'Overview', icon: User, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', activeBgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-400' },
                  { id: 'work-status', label: 'Work Status', icon: Briefcase, color: 'text-green-400', bgColor: 'bg-green-500/10', activeBgColor: 'bg-green-500/20', borderColor: 'border-green-400' },
                  { id: 'analysis', label: 'AI Analysis', icon: BarChart3, color: 'text-purple-400', bgColor: 'bg-purple-500/10', activeBgColor: 'bg-purple-500/20', borderColor: 'border-purple-400' },
                  { id: 'game-results', label: 'Game Results', icon: Gamepad2, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', activeBgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-400' },
                ].map((item) => {
 const Icon = item.icon;
 const isActive = activeSection === item.id;

return (
                    <div key={item.id} className="relative">
 <button
 onClick={() => setActiveSection(item.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-all duration-200 border-b-2 ${
 isActive 
                            ? `text-white ${item.borderColor} ${item.activeBgColor}`
                            : `${item.color} border-transparent hover:text-white hover:${item.bgColor}`
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                        {item.label}
 </button>

 </div>
 );
})}
 </nav>
 </div>

            {/* Tab Content */}
            <div className="p-8">
 <motion.div
key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
              >
                {activeSection === 'overview' && (
                  <div className="space-y-8">
                    {/* Personal Information Section */}
<div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-cyan-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg">
                              <User className="w-6 h-6 text-white" />
 </div>
                            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                              Personal Information
                            </span>
                          </h3>
{isOwner && (
                            <div className="flex items-center gap-2">
                              {!isEditingPersonalInfo ? (
<Button 
                                  onClick={startEditingPersonalInfo}
variant="outline" 
size="sm"
                                  className="bg-cyan-500/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit
</Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={savePersonalInfo}
                                    disabled={isSaving}
                                    size="sm"
                                    className="bg-green-500/10 border-green-400/30 text-green-300 hover:bg-green-500/20 hover:border-green-400/50"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Save'}
</Button>
<Button
                                    onClick={cancelEditingPersonalInfo}
                                    variant="outline"
size="sm"
                                    className="bg-red-500/10 border-red-400/30 text-red-300 hover:bg-red-500/20 hover:border-red-400/50"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
</Button>
</div>
)}
</div>
                          )}
</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Gender - Always visible */}
                          <div className="group bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-pink-300 mb-2 block">Gender</label>
                            {isEditingPersonalInfo ? (
                              <div className="space-y-2">
                                <select
                                  value={editedPersonalInfo.gender}
                                  onChange={(e) => setEditedPersonalInfo(prev => ({ 
                                    ...prev, 
                                    gender: e.target.value,
                                    gender_custom: e.target.value === 'other' ? prev.gender_custom : ''
                                  }))}
                                  className="w-full bg-gray-700/50 text-white text-lg font-semibold border-2 border-pink-400/50 rounded-lg px-3 py-2 outline-none focus:border-pink-400 focus:bg-gray-700/70 transition-all duration-200"
                                >
                                  <option value="">Select gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                                {editedPersonalInfo.gender === 'other' && (
<input 
type="text" 
                                    value={editedPersonalInfo.gender_custom}
                                    onChange={(e) => setEditedPersonalInfo(prev => ({ ...prev, gender_custom: e.target.value }))}
                                    className="w-full bg-gray-700/50 text-white text-base font-medium border-2 border-pink-400/50 rounded-lg px-3 py-2 outline-none focus:border-pink-400 focus:bg-gray-700/70 transition-all duration-200"
                                    placeholder="Please specify your gender"
                                  />
                                )}
</div>
                            ) : (
                              <p className="text-white text-lg font-semibold capitalize">
                                {userProfile.gender_custom || userProfile.gender || "No gender data found"}
                              </p>
                            )}
 </div>


                          {/* Age - Always visible */}
                          <div className="group bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl p-4 border border-teal-400/30 hover:border-teal-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-teal-300 mb-2 block">Age</label>
                            <p className="text-white text-lg font-semibold">
                              {userProfile.birthday ? 
                                Math.floor((new Date().getTime() - new Date(userProfile.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) + " years old" 
                                : "No age data found"}
                            </p>
 </div>

                          {/* Member Since - Always visible */}
                          <div className="group bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-4 border border-violet-400/30 hover:border-violet-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-violet-300 mb-2 block">Member Since</label>
                            <p className="text-white text-lg font-semibold">
                              {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
 </div>

                          {/* Owner-only fields */}
{isOwner && (
                            <>
                              <div className="group bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-cyan-300 mb-2 block">First Name</label>
                                {isEditingPersonalInfo ? (
                                  <input
                                    type="text"
                                    value={editedPersonalInfo.first_name}
                                    onChange={(e) => setEditedPersonalInfo(prev => ({ ...prev, first_name: e.target.value }))}
                                    className="w-full bg-gray-700/50 text-white text-lg font-semibold border-2 border-cyan-400/50 rounded-lg px-3 py-2 outline-none focus:border-cyan-400 focus:bg-gray-700/70 transition-all duration-200"
                                    placeholder="Enter first name"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.first_name || "No first name data found"}
                                  </p>
                                )}
</div>
                              <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-purple-300 mb-2 block">Last Name</label>
                                {isEditingPersonalInfo ? (
<input 
type="text" 
                                    value={editedPersonalInfo.last_name}
                                    onChange={(e) => setEditedPersonalInfo(prev => ({ ...prev, last_name: e.target.value }))}
                                    className="w-full bg-gray-700/50 text-white text-lg font-semibold border-2 border-purple-400/50 rounded-lg px-3 py-2 outline-none focus:border-purple-400 focus:bg-gray-700/70 transition-all duration-200"
                                    placeholder="Enter last name"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.last_name || "No last name data found"}
                                  </p>
                                )}
</div>
                              <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-green-300 mb-2 block">Location</label>
                                {isEditingPersonalInfo ? (
<input 
type="text" 
                                    value={editedPersonalInfo.location}
                                    onChange={(e) => setEditedPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full bg-gray-700/50 text-white text-lg font-semibold border-2 border-green-400/50 rounded-lg px-3 py-2 outline-none focus:border-green-400 focus:bg-gray-700/70 transition-all duration-200"
                                    placeholder="Enter location"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.location || "No location data found"}
                                  </p>
                                )}
</div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Job Title</label>
                                {isEditingPersonalInfo ? (
<input 
type="text" 
                                    value={editedPersonalInfo.position}
                                    onChange={(e) => setEditedPersonalInfo(prev => ({ ...prev, position: e.target.value }))}
                                    className="w-full bg-gray-700/50 text-white text-lg font-semibold border-2 border-blue-400/50 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:bg-gray-700/70 transition-all duration-200"
                                    placeholder="Enter job title"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.position || "No job title data found"}
                                  </p>
                                )}
</div>
                              <div className="group bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl p-4 border border-indigo-400/30 hover:border-indigo-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Birthday</label>
                                {isEditingPersonalInfo ? (
<input 
                                    type="date"
                                    value={editedPersonalInfo.birthday}
                                    onChange={(e) => setEditedPersonalInfo(prev => ({ ...prev, birthday: e.target.value }))}
                                    className="w-full bg-gray-700/50 text-white text-lg font-semibold border-2 border-indigo-400/50 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:bg-gray-700/70 transition-all duration-200"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    }) : "No birthday data found"}
                                  </p>
                                )}
</div>
                            </>
)}
</div>
</div>
</div>

                    {/* Resume Score Section */}
<div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-white" />
</div>
                          <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                            Resume Score
                          </span>
                        </h3>
                        {userProfile.resume_score ? (
                          <div className="flex items-center gap-6">
 <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-lg opacity-50"></div>
                              <div className="relative text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                {userProfile.resume_score}
 </div>
 </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold text-xl mb-2">Overall Resume Quality</p>
                              <p className="text-gray-300 text-base">Based on AI analysis of your resume</p>
                              <div className="mt-4 w-full bg-gray-700 rounded-full h-3">
                                <div 
                                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${userProfile.resume_score}%` }}
                                ></div>
 </div>
 </div>
 </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BarChart3 className="w-8 h-8 text-gray-500" />
</div>
                            <p className="text-gray-400 text-lg">No resume analysis data found</p>
</div>
)}
</div>
</div>

                    {/* Games Completed Section */}
 <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-yellow-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                            <Gamepad2 className="w-6 h-6 text-white" />
</div>
                          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                            Games Completed
                          </span>
</h3>
                        {userProfile.completed_games !== undefined ? (
                          <div className="flex items-center gap-6">
 <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-50"></div>
                              <div className="relative text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                {userProfile.completed_games}/{userProfile.total_games}
 </div>
 </div>
                            <div className="flex-1">
                              <p className="text-white font-semibold text-xl mb-2">Career Games Completed</p>
                              <p className="text-gray-300 text-base mb-4">
                                {userProfile.completed_games === userProfile.total_games 
                                  ? "All games completed! 🎉" 
                                  : `${(userProfile.total_games || 4) - (userProfile.completed_games || 0)} games remaining`}
                              </p>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <div 
                                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${((userProfile.completed_games || 0) / (userProfile.total_games || 4)) * 100}%` }}
                                ></div>
 </div>
 </div>
</div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Gamepad2 className="w-8 h-8 text-gray-500" />
</div>
                            <p className="text-gray-400 text-lg">No game data found</p>
</div>
)}
</div>
</div>

                    {/* Key Strengths Section */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg">
                            <Star className="w-6 h-6 text-white" />
 </div>
                          <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                            Key Strengths
</span>
</h3>
                        {userProfile.key_strengths && userProfile.key_strengths.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.key_strengths.map((strength, index) => (
                              <div key={index} className="group bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0 animate-pulse"></div>
                                  <span className="text-white font-semibold text-lg">{strength}</span>
</div>
</div>
                            ))}
</div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Star className="w-8 h-8 text-gray-500" />
</div>
                            <p className="text-gray-400 text-lg">No key strengths data found</p>
</div>
)}
</div>
</div>

</div>
 )}

                {activeSection === 'work-status' && (
                  <div className="space-y-8">
                    {/* Work Status Information */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg">
                              <Briefcase className="w-6 h-6 text-white" />
 </div>
                            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                              Work Status Information
                            </span>
                          </h3>
                          {isOwner && (
                            <div className="flex gap-2">
                              {!isEditingWorkStatus ? (
 <Button
                                  onClick={startEditingWorkStatus}
 variant="outline"
                                  size="sm"
                                  className="bg-green-500/10 border-green-400/30 text-green-400 hover:bg-green-500/20 hover:border-green-400/50"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit
 </Button>
                              ) : (
                                <>
 <Button
                                    onClick={saveWorkStatus}
                                    disabled={isSaving}
                                    size="sm"
                                    className="bg-green-500/20 border-green-400/50 text-green-400 hover:bg-green-500/30"
                                  >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Save'}
 </Button>
 <Button
                                    onClick={cancelEditingWorkStatus}
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20 hover:border-red-400/50"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
 </Button>
                                </>
                              )}
 </div>
                          )}
 </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Job Title - Always visible */}
                          <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-purple-300 mb-2 block">Job Title</label>
                            <p className="text-white text-lg font-semibold">
                              {userProfile.position || "No job title data found"}
                            </p>
 </div>

                          {/* Mood at Current Employer - Always visible */}
                          <div className="group bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl p-4 border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-pink-300 mb-2 block">Mood at Current Employer</label>
                            {isEditingWorkStatus ? (
                              <select
                                value={editedWorkStatus.current_mood}
                                onChange={(e) => setEditedWorkStatus(prev => ({ ...prev, current_mood: e.target.value }))}
                                className="w-full bg-gray-700/50 border-2 border-pink-400/50 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:border-pink-400 focus:bg-gray-700/70 focus:outline-none"
                              >
                                <option value="">Select mood</option>
                                <option value="very_satisfied">Very Satisfied</option>
                                <option value="satisfied">Satisfied</option>
                                <option value="neutral">Neutral</option>
                                <option value="dissatisfied">Dissatisfied</option>
                                <option value="very_dissatisfied">Very Dissatisfied</option>
                              </select>
                            ) : (
                              <p className="text-white text-lg font-semibold">
                                {userProfile.current_mood || "No mood data found"}
                              </p>
                            )}
</div>

                          {/* Work Status - Always visible */}
                          <div className="group bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-emerald-300 mb-2 block">Work Status</label>
                            {isEditingWorkStatus ? (
                              <select
                                value={editedWorkStatus.work_status}
                                onChange={(e) => setEditedWorkStatus(prev => ({ ...prev, work_status: e.target.value }))}
                                className="w-full bg-gray-700/50 border-2 border-emerald-400/50 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:border-emerald-400 focus:bg-gray-700/70 focus:outline-none"
                              >
                                <option value="">Select work status</option>
                                <option value="actively_looking">Actively Looking</option>
                                <option value="open_to_opportunities">Open to Opportunities</option>
                                <option value="not_looking">Not Looking</option>
                                <option value="employed">Employed</option>
                                <option value="unemployed">Unemployed</option>
                                <option value="freelancing">Freelancing</option>
                                <option value="contract">Contract</option>
                              </select>
                            ) : (
                              <p className="text-white text-lg font-semibold capitalize">
                                {userProfile.work_status ? userProfile.work_status.replace(/-/g, ' ') : "No work status data found"}
                              </p>
                            )}
</div>

                          {/* Preferred Shift - Always visible */}
                          <div className="group bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl p-4 border border-teal-400/30 hover:border-teal-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-teal-300 mb-2 block">Preferred Shift</label>
                            {isEditingWorkStatus ? (
                              <select
                                value={editedWorkStatus.preferred_shift}
                                onChange={(e) => setEditedWorkStatus(prev => ({ ...prev, preferred_shift: e.target.value }))}
                                className="w-full bg-gray-700/50 border-2 border-teal-400/50 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:border-teal-400 focus:bg-gray-700/70 focus:outline-none"
                              >
                                <option value="">Select preferred shift</option>
                                <option value="day_shift">Day Shift</option>
                                <option value="night_shift">Night Shift</option>
                                <option value="graveyard_shift">Graveyard Shift</option>
                                <option value="flexible">Flexible</option>
                                <option value="both">Both</option>
                              </select>
                            ) : (
                              <p className="text-white text-lg font-semibold capitalize">
                                {userProfile.preferred_shift ? userProfile.preferred_shift.replace(/-/g, ' ') : "No shift preference data found"}
                              </p>
                            )}
</div>

                          {/* Expected Salary Range - Always visible */}
                          <div className="group bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-4 border border-violet-400/30 hover:border-violet-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-violet-300 mb-2 block">Expected Salary Range (in pesos)</label>
                            {isEditingWorkStatus ? (
                              <div className="space-y-2">
                                <div className="flex gap-1 items-center">
                                  <input
                                    type="number"
                                    value={editedWorkStatus.expected_salary_min || ''}
                                    onChange={(e) => setEditedWorkStatus(prev => ({ 
                                      ...prev, 
                                      expected_salary_min: e.target.value,
                                      expected_salary: e.target.value && editedWorkStatus.expected_salary_max 
                                        ? `P${e.target.value}-P${editedWorkStatus.expected_salary_max}`
                                        : e.target.value ? `P${e.target.value}` : ''
                                    }))}
                                    className="flex-1 bg-gray-700/50 border-2 border-violet-400/50 rounded-lg px-2 py-1.5 text-white text-sm font-semibold focus:border-violet-400 focus:bg-gray-700/70 focus:outline-none"
                                    placeholder="Min"
                                  />
                                  <span className="text-violet-300 text-sm font-semibold px-0.5">to</span>
                                  <input
                                    type="number"
                                    value={editedWorkStatus.expected_salary_max || ''}
                                    onChange={(e) => setEditedWorkStatus(prev => ({ 
                                      ...prev, 
                                      expected_salary_max: e.target.value,
                                      expected_salary: editedWorkStatus.expected_salary_min && e.target.value 
                                        ? `P${editedWorkStatus.expected_salary_min}-P${e.target.value}`
                                        : e.target.value ? `P${e.target.value}` : ''
                                    }))}
                                    className="flex-1 bg-gray-700/50 border-2 border-violet-400/50 rounded-lg px-2 py-1.5 text-white text-sm font-semibold focus:border-violet-400 focus:bg-gray-700/70 focus:outline-none"
                                    placeholder="Max"
                                  />
</div>
</div>
                            ) : (
                              <p className="text-white text-lg font-semibold">
                                {userProfile.expected_salary ? (
                                  typeof userProfile.expected_salary === 'string' && (userProfile.expected_salary.includes('-') || userProfile.expected_salary.includes('P'))
                                    ? userProfile.expected_salary.replace(/P+/g, '₱').split('-').map(part => 
                                        part.replace(/(\d+)/g, (match) => parseInt(match).toLocaleString())
                                      ).join('-')
                                    : `₱${userProfile.expected_salary.toLocaleString()}`
                                ) : "No expected salary data found"}
                              </p>
                            )}
</div>

                          {/* Preferred Work Setup - Always visible */}
                          <div className="group bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl p-4 border border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-amber-300 mb-2 block">Preferred Work Setup</label>
                            {isEditingWorkStatus ? (
                              <select
                                value={editedWorkStatus.work_setup}
                                onChange={(e) => setEditedWorkStatus(prev => ({ ...prev, work_setup: e.target.value }))}
                                className="w-full bg-gray-700/50 border-2 border-amber-400/50 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:border-amber-400 focus:bg-gray-700/70 focus:outline-none"
                              >
                                <option value="">Select work setup</option>
                                <option value="remote">Remote</option>
                                <option value="on_site">On Site</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="flexible">Flexible</option>
                              </select>
                            ) : (
                              <p className="text-white text-lg font-semibold capitalize">
                                {userProfile.work_setup ? userProfile.work_setup.replace(/-/g, ' ') : "No work setup data found"}
                              </p>
                            )}
</div>

                          {/* Owner-only fields */}
                          {isOwner && (
                            <>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Current Employer</label>
                                {isEditingWorkStatus ? (
                                  <input
                                    type="text"
                                    value={editedWorkStatus.current_employer}
                                    onChange={(e) => setEditedWorkStatus(prev => ({ ...prev, current_employer: e.target.value }))}
                                    className="w-full bg-gray-700/50 border-2 border-blue-400/50 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:border-blue-400 focus:bg-gray-700/70 focus:outline-none"
                                    placeholder="Enter current employer"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.current_employer || "No employer data found"}
                                  </p>
                                )}
</div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Current Salary (in pesos)</label>
                                {isEditingWorkStatus ? (
                                  <input
                                    type="text"
                                    value={editedWorkStatus.current_salary}
                                    onChange={(e) => setEditedWorkStatus(prev => ({ ...prev, current_salary: e.target.value }))}
                                    className="w-full bg-gray-700/50 border-2 border-blue-400/50 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:border-blue-400 focus:bg-gray-700/70 focus:outline-none"
                                    placeholder="e.g., 25000 or P20000-P25000"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.current_salary ? (
                                      typeof userProfile.current_salary === 'string' && (userProfile.current_salary.includes('-') || userProfile.current_salary.includes('P'))
                                        ? userProfile.current_salary.replace(/P+/g, '₱').split('-').map((part: string) => 
                                            part.replace(/(\d+)/g, (match: string) => parseInt(match).toLocaleString())
                                          ).join('-')
                                        : `₱${Number(userProfile.current_salary).toLocaleString()}`
                                    ) : "No current salary data found"}
                                  </p>
                                )}
</div>
                              <div className="group bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl p-4 border border-indigo-400/30 hover:border-indigo-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-indigo-300 mb-2 block">Notice Period (in days)</label>
                                {isEditingWorkStatus ? (
                                  <input
                                    type="number"
                                    value={editedWorkStatus.notice_period_days}
                                    onChange={(e) => setEditedWorkStatus(prev => ({ ...prev, notice_period_days: e.target.value }))}
                                    className="w-full bg-gray-700/50 border-2 border-indigo-400/50 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:border-indigo-400 focus:bg-gray-700/70 focus:outline-none"
                                    placeholder="Enter notice period in days"
                                  />
                                ) : (
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.notice_period_days ? `${userProfile.notice_period_days} days` : "No notice period data found"}
                                  </p>
                                )}
</div>
                            </>
)}
</div>
</div>
</div>
</div>
                )}

                {activeSection === 'analysis' && (
                  <div className="space-y-8">
                    {/* Detailed Scores */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg">
                            <Target className="w-6 h-6 text-white" />
</div>
                          <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                            Detailed Analysis Scores
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-blue-300 mb-2 block">ATS Compatibility</label>
                            <div className="flex items-center gap-3">
                              <div className="text-3xl font-bold text-blue-400">
                                {userProfile.ats_compatibility_score || "—"}
</div>
 <div className="flex-1">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${userProfile.ats_compatibility_score || 0}%` }}
                                  ></div>
</div>
</div>
</div>
</div>
                          <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-green-300 mb-2 block">Content Quality</label>
                            <div className="flex items-center gap-3">
                              <div className="text-3xl font-bold text-green-400">
                                {userProfile.content_quality_score || "—"}
</div>
                              <div className="flex-1">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${userProfile.content_quality_score || 0}%` }}
                                  ></div>
</div>
</div>
</div>
</div>
                          <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-purple-300 mb-2 block">Professional Presentation</label>
                            <div className="flex items-center gap-3">
                              <div className="text-3xl font-bold text-purple-400">
                                {userProfile.professional_presentation_score || "—"}
</div>
                              <div className="flex-1">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${userProfile.professional_presentation_score || 0}%` }}
                                  ></div>
</div>
</div>
</div>
</div>
                          <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                            <label className="text-sm font-medium text-blue-300 mb-2 block">Skills Alignment</label>
                            <div className="flex items-center gap-3">
                              <div className="text-3xl font-bold text-yellow-400">
                                {userProfile.skills_alignment_score || "—"}
</div>
                              <div className="flex-1">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${userProfile.skills_alignment_score || 0}%` }}
                                  ></div>
</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

                    {/* Improved Summary */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-indigo-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
</div>
                          <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                            AI-Improved Professional Summary
                          </span>
                        </h3>
                        {userProfile.improved_summary ? (
                          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/30">
                            <p className="text-gray-200 leading-relaxed text-lg">{userProfile.improved_summary}</p>
</div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-gray-500" />
</div>
                            <p className="text-gray-400 text-lg">No improved summary data found</p>
</div>
)}
</div>
</div>

                    {/* Strengths Analysis */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-emerald-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg">
                            <Star className="w-6 h-6 text-white" />
</div>
                          <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                            Strengths Analysis
                          </span>
                        </h3>
                        <div 
                          className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-6 border border-emerald-400/30 max-h-96 overflow-y-auto"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#4ade80 #22c55e20'
                          }}
                        >
                        {userProfile.strengths_analysis ? (
                          <div className="text-gray-200 leading-relaxed text-base">
                            {typeof userProfile.strengths_analysis === 'object' && userProfile.strengths_analysis !== null ? (
                              <div className="space-y-4">
                                {Object.entries(userProfile.strengths_analysis).map(([key, value]) => (
                                  <div key={key} className="border-l-4 border-emerald-400 pl-4 bg-emerald-500/5 rounded-r-lg p-3">
                                    <h4 className="font-semibold text-emerald-300 capitalize mb-2">
                                      {key.replace(/_/g, ' ')}
                                    </h4>
                                    <div className="text-gray-300">
                                      {Array.isArray(value) ? (
                                        <ul className="list-disc list-inside space-y-1">
                                          {value.map((item, index) => (
                                            <li key={index}>
                                              {typeof item === 'object' ? (
                                                <div className="ml-4 space-y-1">
                                                  {typeof item === 'object' && item !== null ? Object.entries(item).map(([itemKey, itemValue]) => (
                                                    <div key={itemKey}>
                                                      <span className="font-medium text-emerald-200">
                                                        {itemKey.replace(/_/g, ' ')}:
                                                      </span>
                                                      <span className="ml-2">
                                                        {Array.isArray(itemValue) ? itemValue.join(', ') : 
                                                         typeof itemValue === 'object' && itemValue !== null ? JSON.stringify(itemValue) : 
                                                         String(itemValue || '')}
                                                      </span>
</div>
                                                  )) : null}
</div>
                                              ) : (
                                                item
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : typeof value === 'object' ? (
<div className="space-y-2">
                                          {typeof value === 'object' && value !== null ? Object.entries(value).map(([subKey, subValue]) => (
                                            <div key={subKey}>
                                              <span className="font-medium text-emerald-200">
                                                {subKey.replace(/_/g, ' ')}:
                                              </span>
                                              <span className="ml-2">
                                                {Array.isArray(subValue) ? subValue.join(', ') : 
                                                 typeof subValue === 'object' && subValue !== null ? JSON.stringify(subValue) : 
                                                 String(subValue || '')}
                                              </span>
</div>
                                          )) : null}
</div>
                                      ) : (
                                        <p>{String(value || '')}</p>
                                      )}
</div>
</div>
))}
</div>
                            ) : (
                              <p>{userProfile.strengths_analysis}</p>
                            )}
</div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Star className="w-8 h-8 text-gray-500" />
</div>
                            <p className="text-gray-400 text-lg">No strengths analysis data found</p>
</div>
                        )}
</div>
</div>
</div>

                    {/* Improvements - Owner Only */}
                    {isOwner && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-blue-500/20 backdrop-blur-sm">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg">
                              <TrendingUp className="w-6 h-6 text-white" />
</div>
                            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                              Improvement Suggestions
                            </span>
                          </h3>
                          {userProfile.improvements && userProfile.improvements.length > 0 ? (
                            <div className="space-y-4">
                              {userProfile.improvements.map((improvement, index) => (
                                <div key={index} className="group bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                  <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                                    <span className="text-white font-semibold text-lg">{improvement}</span>
</div>
</div>
                              ))}
</div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-gray-500" />
</div>
                              <p className="text-gray-400 text-lg">No improvement suggestions found</p>
                            </div>
                          )}
</div>
</div>
                    )}

                    {/* Recommendations - Owner Only */}
                    {isOwner && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-yellow-500/20 backdrop-blur-sm">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                              <Lightbulb className="w-6 h-6 text-white" />
</div>
                            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                              Actionable Recommendations
                            </span>
                          </h3>
                          {userProfile.recommendations && userProfile.recommendations.length > 0 ? (
                            <div className="space-y-4">
                              {userProfile.recommendations.map((recommendation, index) => (
                                <div key={index} className="group bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                  <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                                    <span className="text-white font-semibold text-lg">{recommendation}</span>
</div>
</div>
                              ))}
</div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lightbulb className="w-8 h-8 text-gray-500" />
</div>
                              <p className="text-gray-400 text-lg">No recommendations found</p>
</div>
                          )}
</div>
</div>
                    )}

                    {/* Salary Analysis - Owner Only */}
                    {isOwner && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg">
                              <DollarSign className="w-6 h-6 text-white" />
</div>
                            <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                              Salary Analysis
                            </span>
                          </h3>
                          <div 
                            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-400/30 max-h-96 overflow-y-auto"
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#4ade80 #22c55e20'
                            }}
                          >
                          {userProfile.salary_analysis ? (
                            <div className="text-gray-200 leading-relaxed text-base">
                              {typeof userProfile.salary_analysis === 'object' && userProfile.salary_analysis !== null ? (
                                <div className="space-y-4">
                                  {Object.entries(userProfile.salary_analysis).map(([key, value]) => (
                                    <div key={key} className="border-l-4 border-green-400 pl-4 bg-green-500/5 rounded-r-lg p-3">
                                      <h4 className="font-semibold text-green-300 capitalize mb-2">
                                        {key.replace(/_/g, ' ')}
                                      </h4>
                                      <div className="text-gray-300">
                                        {Array.isArray(value) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {value.map((item, index) => (
                                              <li key={index}>
                                                {typeof item === 'object' ? (
                                                  <div className="ml-4 space-y-1">
                                                    {typeof item === 'object' && item !== null ? Object.entries(item).map(([itemKey, itemValue]) => (
                                                      <div key={itemKey}>
                                                        <span className="font-medium text-emerald-200">
                                                          {itemKey.replace(/_/g, ' ')}:
                                                        </span>
                                                        <span className="ml-2">
                                                          {Array.isArray(itemValue) ? itemValue.join(', ') : 
                                                           typeof itemValue === 'object' && itemValue !== null ? JSON.stringify(itemValue) : 
                                                           String(itemValue || '')}
                                                        </span>
</div>
                                                    )) : null}
</div>
                                                ) : (
                                                  item
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : typeof value === 'object' ? (
                                          <div className="space-y-2">
                                            {typeof value === 'object' && value !== null ? Object.entries(value).map(([subKey, subValue]) => (
                                              <div key={subKey}>
                                                <span className="font-medium text-emerald-200">
                                                  {subKey.replace(/_/g, ' ')}:
                                                </span>
                                                <span className="ml-2">
                                                  {Array.isArray(subValue) ? subValue.join(', ') : 
                                                   typeof subValue === 'object' && subValue !== null ? JSON.stringify(subValue) : 
                                                   String(subValue || '')}
                                                </span>
</div>
                                            )) : null}
</div>
                                        ) : (
                                          <p>{String(value || '')}</p>
                                        )}
</div>
                                    </div>
))}
</div>
                              ) : (
                                <p>{userProfile.salary_analysis}</p>
                              )}
</div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="w-8 h-8 text-gray-500" />
</div>
                              <p className="text-gray-400 text-lg">No salary analysis data found</p>
</div>
                          )}
</div>
</div>
</div>
                    )}

                    {/* Career Path - Owner Only */}
                    {isOwner && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg">
                              <TrendingUp className="w-6 h-6 text-white" />
</div>
                            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                              Career Path Analysis
                            </span>
                          </h3>
                          <div 
                            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/30 max-h-96 overflow-y-auto"
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#a855f7 #8b5cf620'
                            }}
                          >
                          {userProfile.career_path ? (
                            <div className="text-gray-200 leading-relaxed text-base">
                              {typeof userProfile.career_path === 'object' && userProfile.career_path !== null ? (
                                <div className="space-y-4">
                                  {Object.entries(userProfile.career_path).map(([key, value]) => (
                                    <div key={key} className="border-l-4 border-purple-400 pl-4 bg-purple-500/5 rounded-r-lg p-3">
                                      <h4 className="font-semibold text-purple-300 capitalize mb-2">
                                        {key.replace(/_/g, ' ')}
                                      </h4>
                                      <div className="text-gray-300">
                                        {Array.isArray(value) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {value.map((item, index) => (
                                              <li key={index}>
                                                {typeof item === 'object' ? (
                                                  <div className="ml-4 space-y-1">
                                                    {typeof item === 'object' && item !== null ? Object.entries(item).map(([itemKey, itemValue]) => (
                                                      <div key={itemKey}>
                                                        <span className="font-medium text-emerald-200">
                                                          {itemKey.replace(/_/g, ' ')}:
                                                        </span>
                                                        <span className="ml-2">
                                                          {Array.isArray(itemValue) ? itemValue.join(', ') : 
                                                           typeof itemValue === 'object' && itemValue !== null ? JSON.stringify(itemValue) : 
                                                           String(itemValue || '')}
                                                        </span>
</div>
                                                    )) : null}
</div>
                                                ) : (
                                                  item
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : typeof value === 'object' ? (
                                          <div className="space-y-2">
                                            {typeof value === 'object' && value !== null ? Object.entries(value).map(([subKey, subValue]) => (
                                              <div key={subKey}>
                                                <span className="font-medium text-emerald-200">
                                                  {subKey.replace(/_/g, ' ')}:
                                                </span>
                                                <span className="ml-2">
                                                  {Array.isArray(subValue) ? subValue.join(', ') : 
                                                   typeof subValue === 'object' && subValue !== null ? JSON.stringify(subValue) : 
                                                   String(subValue || '')}
                                                </span>
</div>
                                            )) : null}
</div>
                                        ) : (
                                          <p>{String(value || '')}</p>
                                        )}
</div>
</div>
                                  ))}
</div>
                              ) : (
                                <p>{userProfile.career_path}</p>
                              )}
</div>
                          ) : (
<div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-gray-500" />
 </div>
                              <p className="text-gray-400 text-lg">No career path data found</p>
                            </div>
                          )}
 </div>
 </div>
 </div>
                    )}

                    {/* Section Analysis - Owner Only */}
                    {isOwner && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-indigo-500/20 backdrop-blur-sm">
                          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg">
                              <FileText className="w-6 h-6 text-white" />
 </div>
                            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                              Section-by-Section Analysis
                            </span>
                          </h3>
                          <div 
                            className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-400/30 max-h-96 overflow-y-auto"
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#6366f1 #4f46e520'
                            }}
                          >
                          {userProfile.section_analysis ? (
                            <div className="text-gray-200 leading-relaxed text-base">
                              {typeof userProfile.section_analysis === 'object' && userProfile.section_analysis !== null ? (
<div className="space-y-4">
                                  {Object.entries(userProfile.section_analysis).map(([key, value]) => (
                                    <div key={key} className="border-l-4 border-indigo-400 pl-4 bg-indigo-500/5 rounded-r-lg p-3">
                                      <h4 className="font-semibold text-indigo-300 capitalize mb-2">
                                        {key.replace(/_/g, ' ')}
                                      </h4>
                                      <div className="text-gray-300">
                                        {Array.isArray(value) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {value.map((item, index) => (
                                              <li key={index}>
                                                {typeof item === 'object' ? (
                                                  <div className="ml-4 space-y-1">
                                                    {typeof item === 'object' && item !== null ? Object.entries(item).map(([itemKey, itemValue]) => (
                                                      <div key={itemKey}>
                                                        <span className="font-medium text-emerald-200">
                                                          {itemKey.replace(/_/g, ' ')}:
                                                        </span>
                                                        <span className="ml-2">
                                                          {Array.isArray(itemValue) ? itemValue.join(', ') : 
                                                           typeof itemValue === 'object' && itemValue !== null ? JSON.stringify(itemValue) : 
                                                           String(itemValue || '')}
                                                        </span>
 </div>
                                                    )) : null}
 </div>
                                                ) : (
                                                  item
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : typeof value === 'object' ? (
 <div className="space-y-2">
                                            {typeof value === 'object' && value !== null ? Object.entries(value).map(([subKey, subValue]) => (
                                              <div key={subKey}>
                                                <span className="font-medium text-emerald-200">
                                                  {subKey.replace(/_/g, ' ')}:
                                                </span>
                                                <span className="ml-2">
                                                  {Array.isArray(subValue) ? subValue.join(', ') : 
                                                   typeof subValue === 'object' && subValue !== null ? JSON.stringify(subValue) : 
                                                   String(subValue || '')}
                                                </span>
 </div>
                                            )) : null}
 </div>
                                        ) : (
                                          <p>{String(value || '')}</p>
                                        )}
 </div>
 </div>
                                  ))}
 </div>
                              ) : (
                                <p>{userProfile.section_analysis}</p>
 )}
 </div>
) : (
<div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-500" />
 </div>
                              <p className="text-gray-400 text-lg">No section analysis data found</p>
 </div>
                          )}
 </div>
 </div>
 </div>
                    )}

 </div>
 )}

                {activeSection === 'game-results' && (
                  <div className="space-y-8">
                    {/* BPOC Cultural Game Stats */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-yellow-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                            <Gamepad2 className="w-6 h-6 text-white" />
 </div>
                          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                            BPOC Cultural
                          </span>
                        </h3>
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-400/30">
                        {userProfile.game_stats?.bpoc_cultural_stats ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-yellow-300 mb-2 block">Current Tier</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.bpoc_cultural_stats.current_tier || "No tier data"}
                                </p>
 </div>

                              {/* Session data - Owner only */}
                              {isOwner && (
                                <>
                                  <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                    <label className="text-sm font-medium text-yellow-300 mb-2 block">Total Sessions</label>
                                    <p className="text-white text-lg font-semibold">
                                      {userProfile.game_stats.bpoc_cultural_stats.total_sessions || 0}
                                    </p>
 </div>
                                  <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                    <label className="text-sm font-medium text-yellow-300 mb-2 block">Completed Sessions</label>
                                    <p className="text-white text-lg font-semibold">
                                      {userProfile.game_stats.bpoc_cultural_stats.completed_sessions || 0}
                                    </p>
 </div>
                                </>
                              )}
</div>

                            {/* Hire Recommendation and Writing Score */}
                            {userProfile.game_stats?.bpoc_cultural_results && (
                              <div className="mt-6 pt-6 border-t border-gray-600">
                                <h4 className="text-lg font-semibold mb-4 text-yellow-300">Analysis Results</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                    <label className="text-sm font-medium text-yellow-300 mb-2 block">Hire Recommendation</label>
                                    <p className="text-white text-lg font-semibold capitalize">
                                      {userProfile.game_stats.bpoc_cultural_results.hire_recommendation ? 
                                        userProfile.game_stats.bpoc_cultural_results.hire_recommendation.replace(/_/g, ' ') : 
                                        "No recommendation data"}
                                    </p>
</div>
                                  <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                    <label className="text-sm font-medium text-yellow-300 mb-2 block">Writing Score</label>
                                    <p className="text-white text-lg font-semibold">
                                      {userProfile.game_stats.bpoc_cultural_results.writing?.score || "No score data"}
                                    </p>
</div>
                                  {userProfile.game_stats.bpoc_cultural_results.writing?.style && (
                                    <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                      <label className="text-sm font-medium text-yellow-300 mb-2 block">Writing Style</label>
                                      <p className="text-white mt-1 text-sm font-medium">
                                        {userProfile.game_stats.bpoc_cultural_results.writing.style}
                                      </p>
</div>
                                  )}
                                  {userProfile.game_stats.bpoc_cultural_results.writing?.tone && (
                                    <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:scale-105">
                                      <label className="text-sm font-medium text-yellow-300 mb-2 block">Writing Tone</label>
                                      <p className="text-white mt-1 text-sm font-medium">
                                        {userProfile.game_stats.bpoc_cultural_results.writing.tone}
                                      </p>
</div>
                                  )}
 </div>
 </div>
 )}
 </div>
) : (
<div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Gamepad2 className="w-8 h-8 text-gray-500" />
 </div>
                            <p className="text-gray-400 text-lg">No BPOC Cultural game data found</p>
 </div>
                        )}
 </div>
 </div>
 </div>

                    {/* DISC Personality Game Stats */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-blue-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg">
                            <Gamepad2 className="w-6 h-6 text-white" />
 </div>
                          <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                            BPOC DISC
                          </span>
                        </h3>
                        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/30">
                        {userProfile.game_stats?.disc_personality_stats ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Dominance (D)</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.disc_personality_stats.d || 0}
                                </p>
 </div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Influence (I)</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.disc_personality_stats.i || 0}
                                </p>
 </div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Steadiness (S)</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.disc_personality_stats.s || 0}
                                </p>
 </div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Conscientiousness (C)</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.disc_personality_stats.c || 0}
                                </p>
 </div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Primary Style</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.disc_personality_stats.primary_style || "No data"}
                                </p>
 </div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Secondary Style</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.disc_personality_stats.secondary_style || "No data"}
                                </p>
 </div>
                              <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                <label className="text-sm font-medium text-blue-300 mb-2 block">Consistency Index</label>
                                <p className="text-white text-lg font-semibold">
                                  {userProfile.game_stats.disc_personality_stats.consistency_index || "No data"}
                                </p>
 </div>
                              {/* Last Taken - Owner only */}
                              {isOwner && (
                                <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-blue-300 mb-2 block">Last Taken</label>
                                  <p className="text-white mt-1 text-sm font-medium">
                                    {userProfile.game_stats.disc_personality_stats.last_taken_at ? 
                                      new Date(userProfile.game_stats.disc_personality_stats.last_taken_at).toLocaleDateString() : 
                                      "Never taken"}
                                  </p>
 </div>
 )}
 </div>
 </div>
                        ) : (
                          <p className="text-gray-400 italic text-base">No DISC Personality game data found</p>
                        )}
 </div>
 </div>
 </div>

                    {/* Typing Hero Game Stats */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg">
                            <Gamepad2 className="w-6 h-6 text-white" />
 </div>
                          <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                            Typing Hero Game
                          </span>
                        </h3>
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-400/30">
                          {userProfile.game_stats?.typing_hero_stats ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-green-300 mb-2 block">Best WPM</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.typing_hero_stats.best_wpm || 0} WPM
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-green-300 mb-2 block">Best Accuracy</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.typing_hero_stats.best_accuracy ? `${userProfile.game_stats.typing_hero_stats.best_accuracy}%` : "0%"}
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-green-300 mb-2 block">Median WPM</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.typing_hero_stats.median_wpm || 0} WPM
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-green-300 mb-2 block">Recent WPM</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.typing_hero_stats.recent_wpm || 0} WPM
                                  </p>
 </div>
                                {/* Session data - Owner only */}
                                {isOwner && (
                                  <>
                                    <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                      <label className="text-sm font-medium text-green-300 mb-2 block">Highest Difficulty</label>
                                      <p className="text-white text-lg font-semibold">
                                        {userProfile.game_stats.typing_hero_stats.highest_difficulty || "No data"}
                                      </p>
 </div>
                                    <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                      <label className="text-sm font-medium text-green-300 mb-2 block">Consistency Index</label>
                                      <p className="text-white text-lg font-semibold">
                                        {userProfile.game_stats.typing_hero_stats.consistency_index || "No data"}
                                      </p>
 </div>
                                    <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                      <label className="text-sm font-medium text-green-300 mb-2 block">Total Sessions</label>
                                      <p className="text-white text-lg font-semibold">
                                        {userProfile.game_stats.typing_hero_stats.total_sessions || 0}
                                      </p>
 </div>
                                    <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105">
                                      <label className="text-sm font-medium text-green-300 mb-2 block">Last Played</label>
                                      <p className="text-white mt-1 text-sm font-medium">
                                        {userProfile.game_stats.typing_hero_stats.last_played_at ? 
                                          new Date(userProfile.game_stats.typing_hero_stats.last_played_at).toLocaleDateString() : 
                                          "Never played"}
                                      </p>
 </div>
                                  </>
                                )}
 </div>
 </div>
                          ) : (
                            <p className="text-gray-400 italic text-base">No Typing Hero game data found</p>
                          )}
 </div>
 </div>
 </div>

                    {/* Ultimate Game Stats */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg">
                            <Gamepad2 className="w-6 h-6 text-white" />
</div>
                          <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                            BPOC Ultimate
 </span>
                        </h3>
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/30">
                          {userProfile.game_stats?.ultimate_stats ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-purple-300 mb-2 block">Smart Score</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.ultimate_stats.smart || 0}
                                  </p>
</div>
                                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-purple-300 mb-2 block">Motivated Score</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.ultimate_stats.motivated || 0}
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-purple-300 mb-2 block">Integrity Score</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.ultimate_stats.integrity || 0}
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-purple-300 mb-2 block">Business Score</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.ultimate_stats.business || 0}
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-purple-300 mb-2 block">Platinum Choices</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.ultimate_stats.platinum_choices || 0}
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-purple-300 mb-2 block">Gold Choices</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.ultimate_stats.gold_choices || 0}
                                  </p>
 </div>
                                <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                  <label className="text-sm font-medium text-purple-300 mb-2 block">Last Tier</label>
                                  <p className="text-white text-lg font-semibold">
                                    {userProfile.game_stats.ultimate_stats.last_tier || "No tier data"}
                                  </p>
 </div>
                                {/* Last Taken - Owner only */}
                                {isOwner && (
                                  <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105">
                                    <label className="text-sm font-medium text-purple-300 mb-2 block">Last Taken</label>
                                    <p className="text-white mt-1 text-sm font-medium">
                                      {userProfile.game_stats.ultimate_stats.last_taken_at ? 
                                        new Date(userProfile.game_stats.ultimate_stats.last_taken_at).toLocaleDateString() : 
                                        "Never taken"}
                                    </p>
 </div>
                                )}
 </div>
 </div>
                          ) : (
                            <p className="text-gray-400 italic text-base">No Ultimate game data found</p>
                          )}
 </div>
 </div>
 </div>

 </div>
 )}

 </motion.div>
 </div>
</Card>
</motion.div>
 </div>
 </div>
 );
}
