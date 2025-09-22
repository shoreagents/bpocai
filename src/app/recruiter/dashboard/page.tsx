'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RecruiterSignInModal from '@/components/auth/RecruiterSignInModal';
import RecruiterSignUpForm from '@/components/auth/RecruiterSignUpForm';
import RecruiterNavbar from '@/components/layout/RecruiterNavbar';
import RecruiterProfileCompletionModal from '@/components/auth/RecruiterProfileCompletionModal';
import { useAuth } from '@/contexts/AuthContext';

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Modal handler functions
  const handleSwitchToSignUp = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUpModal(false);
    setShowSignInModal(true);
  };

  // Fetch user profile from Railway
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          setProfileLoading(true);
          console.log('🔄 Fetching user profile for:', user.id);
          const response = await fetch(`/api/user/profile?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ User profile loaded:', data.user);
            setUserProfile(data.user);
            
            // Check if profile completion is needed
            // Don't show modal if user was just created (within last 5 minutes) - they just signed up
            const userCreatedAt = new Date(data.user.created_at);
            const now = new Date();
            const timeDiff = now.getTime() - userCreatedAt.getTime();
            const minutesSinceCreation = timeDiff / (1000 * 60);
            
            if (data.user && !data.user.completed_data && minutesSinceCreation > 5) {
              console.log('📝 Profile completion needed, showing modal');
              console.log('📊 User completed_data value:', data.user.completed_data);
              console.log('📊 Minutes since user creation:', minutesSinceCreation);
              setShowProfileModal(true);
            } else if (data.user && !data.user.completed_data && minutesSinceCreation <= 5) {
              console.log('⏭️ User recently created (within 5 minutes), not showing modal yet');
              console.log('📊 Minutes since user creation:', minutesSinceCreation);
            } else {
              console.log('✅ Profile already completed, not showing modal');
              console.log('📊 User completed_data value:', data.user?.completed_data);
            }
          } else {
            console.error('❌ Failed to fetch user profile:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
        } finally {
          setProfileLoading(false);
        }
      } else {
        console.log('⚠️ No user ID available for profile fetch');
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const handleProfileComplete = async () => {
    setShowProfileModal(false);
    // Refetch profile data instead of reloading the page
    if (user?.id) {
      try {
        const response = await fetch(`/api/user/profile?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error('Error refetching profile after completion:', error);
        // Fallback to page reload if refetch fails
        window.location.reload();
      }
    }
  };
  
  // Dashboard data states
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalApplicants, setTotalApplicants] = useState<number>(0);
  const [activeJobs, setActiveJobs] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [applicationTrends, setApplicationTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch total users
        try {
          const usersResponse = await fetch('/api/admin/total-users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setTotalUsers(usersData.total_users);
          }
        } catch (error) {
          console.error('Error fetching total users:', error);
        }
        
        // Fetch total applicants
        try {
          const applicantsResponse = await fetch('/api/admin/total-applicants');
          if (applicantsResponse.ok) {
            const applicantsData = await applicantsResponse.json();
            setTotalApplicants(applicantsData.total_applicants);
          }
        } catch (error) {
          console.error('Error fetching total applicants:', error);
        }

        // Fetch active jobs
        try {
          const jobsResponse = await fetch('/api/admin/active-jobs');
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            setActiveJobs(jobsData.active_jobs);
          }
        } catch (error) {
          console.error('Error fetching active jobs:', error);
        }

        // Fetch recent activity
        try {
          const activityResponse = await fetch('/api/admin/recent-activity');
          if (activityResponse.ok) {
            const activityData = await activityResponse.json();
            setRecentActivity(activityData.recent_activity || []);
          }
        } catch (error) {
          console.error('Error fetching recent activity:', error);
        }

        // Fetch application trends
        try {
          const trendsResponse = await fetch('/api/admin/application-trends?range=7d');
          if (trendsResponse.ok) {
            const trendsData = await trendsResponse.json();
            setApplicationTrends(trendsData.application_trends || []);
          }
        } catch (error) {
          console.error('Error fetching application trends:', error);
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Recruiter Navbar */}
      <RecruiterNavbar 
        onSignInClick={() => setShowSignInModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Recruiter Dashboard
              </h1>
              <p className="text-lg text-gray-600">Manage your job postings and find the best candidates</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Users</p>
                  <div className="text-3xl font-bold text-blue-900">
                    {loading ? (
                      <span className="inline-block w-12 h-8 bg-blue-300 animate-pulse rounded"></span>
                    ) : (
                      totalUsers.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-blue-700 mt-2">Registered candidates</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Total Applications</p>
                  <div className="text-3xl font-bold text-emerald-900">
                    {loading ? (
                      <span className="inline-block w-12 h-8 bg-emerald-300 animate-pulse rounded"></span>
                    ) : (
                      totalApplicants.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-emerald-700 mt-2">Job applications received</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Active Jobs</p>
                  <div className="text-3xl font-bold text-purple-900">
                    {loading ? (
                      <span className="inline-block w-12 h-8 bg-purple-300 animate-pulse rounded"></span>
                    ) : (
                      activeJobs.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-purple-700 mt-2">Currently open positions</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="space-y-8">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 gap-6">
              {/* Applications Chart */}
              <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Applications Overview</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Application trends over the last 7 days</CardDescription>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl border border-emerald-200">
                    {loading ? (
                      <div className="text-center">
                        <div className="h-16 w-16 bg-gray-300 rounded animate-pulse mx-auto mb-4"></div>
                        <div className="h-6 bg-gray-300 rounded animate-pulse w-48 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mx-auto"></div>
                      </div>
                    ) : applicationTrends.length > 0 ? (
                      <div className="w-full h-full p-6">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Application Trends (Last 7 Days)</h3>
                          <p className="text-sm text-gray-600">Daily application counts</p>
                        </div>
                        <div className="grid grid-cols-7 gap-4 h-56">
                          {applicationTrends.map((trend, index) => (
                            <div key={index} className="flex flex-col justify-end group">
                              <div 
                                className="bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:from-emerald-700 group-hover:to-emerald-500"
                                style={{ 
                                  height: `${Math.max(20, (trend.count / Math.max(...applicationTrends.map(t => t.count), 1)) * 100)}%` 
                                }}
                              ></div>
                              <div className="text-xs text-gray-700 mt-3 text-center font-medium">
                                {trend.displayDate}
                              </div>
                              <div className="text-xs text-emerald-600 text-center font-semibold">
                                {trend.count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <TrendingUp className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Application Trends</h3>
                        <p className="text-sm text-gray-600">No application data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 gap-6">

              {/* Recent Activity */}
              <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Recent Jobs Activity</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">Latest job applications and updates</CardDescription>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="max-h-80 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  >
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="text-white text-sm font-bold">
                                {activity.user_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{activity.user_name?.split(' ')[0] || 'Unknown User'}</p>
                              <p className="text-sm text-gray-700 mt-1">{activity.action}</p>
                              <p className="text-xs text-gray-500 mt-2 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {activity.activity_time ? new Date(activity.activity_time).toLocaleString() : 'Unknown time'}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No recent activity</p>
                          <p className="text-sm">Activity will appear here as users interact with the platform</p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <RecruiterSignInModal 
        open={showSignInModal} 
        onOpenChange={setShowSignInModal}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      
      {/* Sign Up Modal */}
      <RecruiterSignUpForm
        open={showSignUpModal}
        onOpenChange={setShowSignUpModal}
        onSwitchToLogin={handleSwitchToSignIn}
      />

      {/* Profile Completion Modal */}
      <RecruiterProfileCompletionModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onComplete={handleProfileComplete}
      />

      {/* Recruiter Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  BPOC Recruiter
                </span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                The leading platform for BPO talent acquisition. Connect with 15,000+ pre-screened professionals and find your perfect hire in minutes.
              </p>
            </div>

            {/* For Recruiters */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-emerald-400">For Recruiters</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <ul className="space-y-3">
                  <li><Link href="/recruiter/dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                  <li><Link href="/recruiter/post-job" className="text-gray-300 hover:text-emerald-400 transition-colors">Post a Job</Link></li>
                  <li><Link href="/recruiter/applications" className="text-gray-300 hover:text-emerald-400 transition-colors">Applications</Link></li>
                </ul>
                <ul className="space-y-3">
                  <li><Link href="/recruiter/candidates" className="text-gray-300 hover:text-emerald-400 transition-colors">Browse Candidates</Link></li>
                  <li><Link href="/recruiter/analytics" className="text-gray-300 hover:text-emerald-400 transition-colors">Analytics</Link></li>
                  <li><Link href="/recruiter/leaderboard" className="text-gray-300 hover:text-emerald-400 transition-colors">Leaderboard</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <div className="text-sm text-gray-400">
              © 2025 BPOC Recruiter. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
