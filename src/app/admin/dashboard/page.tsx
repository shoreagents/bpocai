'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAdmin } from '@/contexts/AdminContext'
import { useAuth } from '@/contexts/AuthContext'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChartComponent, AreaChartComponent, BarChartComponent } from '@/components/ui/charts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Users, 
  FileText,
  Gamepad2,
  ClipboardList,
  Filter,
  Calendar,
  Clock,
  Briefcase,
  ChevronDown
} from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'

export default function DashboardPage() {
  const { adminUser } = useAdmin()
  const { user } = useAuth()
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalResumes, setTotalResumes] = useState<number>(0)
  const [totalApplicants, setTotalApplicants] = useState<number>(0)
  const [activeJobs, setActiveJobs] = useState<number>(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activityFilter, setActivityFilter] = useState<'all' | 'game' | 'resume' | 'profile' | 'applicants'>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | '1h' | '24h' | '7d'>('all')
  
  // New chart data states
  const [gamePerformance, setGamePerformance] = useState<any[]>([])
  const [applicationTrends, setApplicationTrends] = useState<any[]>([])
  const [userRegistrationTrends, setUserRegistrationTrends] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch total users
        const usersResponse = await fetch('/api/admin/total-users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setTotalUsers(usersData.total_users)
        } else {
          console.error('Failed to fetch total users')
        }
        
        // Fetch total resumes
        const resumesResponse = await fetch('/api/admin/total-resumes')
        if (resumesResponse.ok) {
          const resumesData = await resumesResponse.json()
          setTotalResumes(resumesData.total_resumes)
        } else {
          console.error('Failed to fetch total resumes')
        }

        // Fetch total applicants
        const applicantsResponse = await fetch('/api/admin/total-applicants')
        if (applicantsResponse.ok) {
          const applicantsData = await applicantsResponse.json()
          setTotalApplicants(applicantsData.total_applicants)
        } else {
          console.error('Failed to fetch total applicants')
        }

        // Fetch active jobs
        const jobsResponse = await fetch('/api/admin/active-jobs')
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          setActiveJobs(jobsData.active_jobs)
        } else {
          console.error('Failed to fetch active jobs')
        }

        // Fetch recent activity
        const activityResponse = await fetch('/api/admin/recent-activity')
        console.log('🔍 Activity API response status:', activityResponse.status)
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          console.log('✅ Activity data received:', activityData)
          console.log('📊 Activity data structure:', {
            hasRecentActivity: !!activityData.recent_activity,
            recentActivityLength: activityData.recent_activity?.length,
            recentActivityType: typeof activityData.recent_activity,
            fullResponse: activityData
          })
          setRecentActivity(activityData.recent_activity || [])
        } else {
          console.error('❌ Failed to fetch recent activity:', activityResponse.status)
          const errorText = await activityResponse.text()
          console.error('❌ Error details:', errorText)
        }

        // Fetch game performance data
        const gamePerformanceResponse = await fetch('/api/admin/game-performance')
        console.log('🔍 Game Performance API response status:', gamePerformanceResponse.status)
        
        if (gamePerformanceResponse.ok) {
          const gamePerformanceData = await gamePerformanceResponse.json()
          console.log('✅ Game Performance data received:', gamePerformanceData)
          console.log('📊 Game Performance data structure:', {
            hasGamePerformance: !!gamePerformanceData.game_performance,
            gamePerformanceLength: gamePerformanceData.game_performance?.length,
            gamePerformanceType: typeof gamePerformanceData.game_performance,
            fullResponse: gamePerformanceData
          })
          setGamePerformance(gamePerformanceData.game_performance || [])
        } else {
          console.error('❌ Failed to fetch game performance data:', gamePerformanceResponse.status)
          const errorText = await gamePerformanceResponse.text()
          console.error('❌ Error details:', errorText)
        }

        // Fetch application trends data
        const applicationTrendsResponse = await fetch('/api/admin/application-trends')
        if (applicationTrendsResponse.ok) {
          const applicationTrendsData = await applicationTrendsResponse.json()
          setApplicationTrends(applicationTrendsData.application_trends)
        } else {
          console.error('Failed to fetch application trends data')
        }

        // Fetch user registration trends data
        const userRegistrationTrendsResponse = await fetch('/api/admin/user-registration-trends')
        if (userRegistrationTrendsResponse.ok) {
          const userRegistrationTrendsData = await userRegistrationTrendsResponse.json()
          setUserRegistrationTrends(userRegistrationTrendsData.user_registration_trends)
        } else {
          console.error('Failed to fetch user registration trends data')
        }

        // Test game data to see what exists
        const testGameDataResponse = await fetch('/api/admin/test-game-data')
        if (testGameDataResponse.ok) {
          const testGameData = await testGameDataResponse.json()
          console.log('🎮 Test game data:', testGameData)
        } else {
          console.error('Failed to fetch test game data')
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getTypeBadge = (type: string) => {
    const variants = {
      game: 'bg-green-500/20 text-green-400 border-green-500/30',
      resume: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      assessment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      profile: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      applicants: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return variants[type as keyof typeof variants] || variants.profile
  }

  // Filter activity data based on current filters
  const getFilteredActivity = () => {
    console.log('🔍 Filtering activity data:', {
      recentActivity,
      activityFilter,
      timeFilter,
      recentActivityLength: recentActivity?.length
    })
    
    let filtered = recentActivity || []

    // Filter by type
    if (activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityFilter)
      console.log('📊 After type filter:', filtered.length, 'activities')
    }

    // Filter by time
    if (timeFilter !== 'all') {
      const now = new Date()
      const timeThreshold = new Date()
      
      switch (timeFilter) {
        case '1h':
          timeThreshold.setHours(now.getHours() - 1)
          break
        case '24h':
          timeThreshold.setDate(now.getDate() - 1)
          break
        case '7d':
          timeThreshold.setDate(now.getDate() - 7)
          break
      }
      
      filtered = filtered.filter(activity => 
        new Date(activity.activity_time) >= timeThreshold
      )
      console.log('📊 After time filter:', filtered.length, 'activities')
    }

    console.log('🎯 Final filtered result:', filtered.length, 'activities')
    return filtered
  }

  return (
    <AdminRouteGuard>
      <AdminLayout 
        title="Admin Dashboard" 
        description="Manage BPOC.AI platform and user data"
        adminUser={adminUser}
      >
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">
                      {loading ? (
                        <span className="inline-block w-8 h-6 bg-gray-600 animate-pulse rounded"></span>
                      ) : (
                        totalUsers.toLocaleString()
                      )}
                    </p>
                    <p className="text-xs text-green-400">Real-time data from database</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Active Resumes</p>
                    <p className="text-2xl font-bold text-white">
                      {loading ? (
                        <span className="inline-block w-8 h-6 bg-gray-600 animate-pulse rounded"></span>
                      ) : (
                        totalResumes.toLocaleString()
                      )}
                    </p>
                    <p className="text-xs text-green-400">Real-time data from database</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Applicants</p>
                    <p className="text-2xl font-bold text-white">
                      {loading ? (
                        <span className="inline-block w-8 h-6 bg-gray-600 animate-pulse rounded"></span>
                      ) : (
                        totalApplicants.toLocaleString()
                      )}
                    </p>
                    <p className="text-xs text-green-400">Real-time data from database</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Active Jobs</p>
                    <p className="text-2xl font-bold text-white">
                      {loading ? (
                        <span className="inline-block w-8 h-6 bg-gray-600 animate-pulse rounded"></span>
                      ) : (
                        activeJobs.toLocaleString()
                      )}
                    </p>
                    <p className="text-xs text-green-400">Real-time data from database</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Section - Recent Activity and Weekly Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Recent User Activity</CardTitle>
                    <p className="text-sm text-gray-400">Latest platform interactions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Activity Type Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/10 text-white hover:bg-white/10"
                        >
                          <Filter className="w-3 h-3 mr-2" />
                          {activityFilter === 'all' ? 'All Types' : 
                           activityFilter === 'game' ? 'Games' : 
                           activityFilter === 'resume' ? 'Resumes' : 
                           activityFilter === 'profile' ? 'Profiles' : 
                           activityFilter === 'applicants' ? 'Applicants' : 'All Types'}
                          <ChevronDown className="w-3 h-3 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-white/10 text-white">
                        <DropdownMenuLabel>Activity Type</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className={activityFilter === 'all' ? 'bg-white/20' : ''}
                          onClick={() => setActivityFilter('all')}
                        >
                          <Filter className="w-3 h-3 mr-2" />
                          All Types
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={activityFilter === 'game' ? 'bg-white/20' : ''}
                          onClick={() => setActivityFilter('game')}
                        >
                          <Gamepad2 className="w-3 h-3 mr-2" />
                          Games Only
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={activityFilter === 'resume' ? 'bg-white/20' : ''}
                          onClick={() => setActivityFilter('resume')}
                        >
                          <FileText className="w-3 h-3 mr-2" />
                          Resumes Only
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={activityFilter === 'profile' ? 'bg-white/20' : ''}
                          onClick={() => setActivityFilter('profile')}
                        >
                          <Users className="w-3 h-3 mr-2" />
                          Profiles Only
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={activityFilter === 'applicants' ? 'bg-white/20' : ''}
                          onClick={() => setActivityFilter('applicants')}
                        >
                          <ClipboardList className="w-3 h-3 mr-2" />
                          Applicants Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Time Range Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/10 text-white hover:bg-white/10"
                        >
                          <Clock className="w-3 h-3 mr-2" />
                          {timeFilter === 'all' ? 'All Time' : 
                           timeFilter === '1h' ? 'Last Hour' : 
                           timeFilter === '24h' ? 'Last 24h' : 
                           timeFilter === '7d' ? 'Last 7d' : 'All Time'}
                          <ChevronDown className="w-3 h-3 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-white/10 text-white">
                        <DropdownMenuLabel>Time Range</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className={timeFilter === 'all' ? 'bg-white/20' : ''}
                          onClick={() => setTimeFilter('all')}
                        >
                          <Clock className="w-3 h-3 mr-2" />
                          All Time
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={timeFilter === '1h' ? 'bg-white/20' : ''}
                          onClick={() => setTimeFilter('1h')}
                        >
                          <Clock className="w-3 h-3 mr-2" />
                          Last Hour
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={timeFilter === '24h' ? 'bg-white/20' : ''}
                          onClick={() => setTimeFilter('24h')}
                        >
                          <Clock className="w-3 h-3 mr-2" />
                          Last 24 Hours
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={timeFilter === '7d' ? 'bg-white/20' : ''}
                          onClick={() => setTimeFilter('7d')}
                        >
                          <Clock className="w-3 h-3 mr-2" />
                          Last 7 Days
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {/* Filter Summary */}
                {(activityFilter !== 'all' || timeFilter !== 'all') && (
                  <div className="px-6 pb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Showing:</span>
                      {activityFilter !== 'all' && (
                        <Badge variant="outline" className="text-xs">
                          {activityFilter === 'game' ? 'Games' : 
                           activityFilter === 'resume' ? 'Resumes' : 
                           activityFilter === 'profile' ? 'Profiles' : 
                           activityFilter === 'applicants' ? 'Applicants' : 'All Types'}
                        </Badge>
                      )}
                      {timeFilter !== 'all' && (
                        <Badge variant="outline" className="text-xs">
                          Last {timeFilter === '1h' ? '1 hour' : 
                                 timeFilter === '24h' ? '24 hours' : 
                                 timeFilter === '7d' ? '7 days' : 'All time'}
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-gray-500 hover:text-white"
                        onClick={() => {
                          setActivityFilter('all')
                          setTimeFilter('all')
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <div className="space-y-3">
                    {getFilteredActivity().length > 0 ? (
                      getFilteredActivity().map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                                {activity.user_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                              </AvatarFallback>
                              {activity.user_avatar && (
                                <AvatarImage src={activity.user_avatar} alt={activity.user_name} />
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-white font-medium">{activity.user_name || 'Unknown User'}</p>
                              <p className="text-sm text-gray-400">
                                {activity.action}
                                {activity.score && ` - ${activity.score}`}
                              </p>
                            </div>
                            <Badge className={getTypeBadge(activity.type)}>
                              {activity.type === 'typing_hero' ? 'Game' : 
                               activity.type === 'disc_personality' ? 'Assessment' : 
                               activity.type === 'resume' ? 'Resume' : 
                               activity.type === 'profile' ? 'Profile' : 
                               activity.type === 'applicants' ? 'Applicants' : 'Activity'}
                            </Badge>
                            <span className="text-gray-500 text-sm">
                              {activity.activity_time ? new Date(activity.activity_time).toLocaleTimeString() : 'Unknown'}
                            </span>
                          </motion.div>
                      ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p>No recent activity</p>
                          <p className="text-sm">Activity will appear here as users interact with the platform</p>
                        </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Engagement */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Recent Game Performance</CardTitle>
                    <p className="text-sm text-gray-400">Latest game scores and achievements</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-400 font-medium">Live Data</p>
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      Real-time
                    </Button>
                  </div>
                </div>
              </CardHeader>
                                             <CardContent>
                  <div className="h-64 bg-white/5 rounded-lg p-4">
                    {gamePerformance.length > 0 ? (
                      <BarChartComponent 
                        data={gamePerformance.slice(0, 8).map((game, index) => ({
                          name: game.userName,
                          score: game.score || 0,
                          gameType: game.gameType,
                          displayText: game.displayText
                        }))}
                        dataKey="score"
                        fill="#10b981"
                      />
                                         ) : (
                       <div className="flex items-center justify-center h-full text-gray-400">
                         <p>No recent game data</p>
                       </div>
                     )}
                  </div>
                </CardContent>
            </Card>
          </div>

          {/* Bottom Section - Monthly Revenue and Feature Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Job Application Trends</CardTitle>
                    <p className="text-sm text-gray-400">Daily job application activity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-400 font-medium">Live Data</p>
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <ClipboardList className="w-3 h-3 mr-1" />
                      Real-time
                    </Button>
                  </div>
                </div>
              </CardHeader>
                             <CardContent>
                 <div className="h-64 bg-white/5 rounded-lg p-4">
                   {applicationTrends.length > 0 ? (
                     <LineChartComponent 
                       data={applicationTrends.map((trend, index) => ({
                         name: trend.displayDate,
                         applications: trend.count
                       }))}
                       dataKey="applications"
                       stroke="#3b82f6"
                     />
                   ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                       <p>No application data available</p>
                     </div>
                   )}
                 </div>
               </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">User Registration Trends</CardTitle>
                    <p className="text-sm text-gray-400">Daily new user signups</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-400 font-medium">Live Data</p>
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <Users className="w-3 h-3 mr-1" />
                      Real-time
                    </Button>
                  </div>
                </div>
              </CardHeader>
                             <CardContent>
                 <div className="h-64 bg-white/5 rounded-lg p-4">
                   {userRegistrationTrends.length > 0 ? (
                     <AreaChartComponent 
                       data={userRegistrationTrends.map((trend, index) => ({
                         name: trend.displayDate,
                         registrations: trend.count
                       }))}
                       dataKey="registrations"
                       fill="#10b981"
                     />
                   ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                       <p>No registration data available</p>
                     </div>
                   )}
                 </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  )
}