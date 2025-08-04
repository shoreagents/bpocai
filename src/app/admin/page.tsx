'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  Gamepad2, 
  ClipboardList,
  TrendingUp,
  Activity,
  Filter,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { LineChartComponent, BarChartComponent, AreaChartComponent } from '@/components/ui/charts'

// Sample data for platform analytics
const userEngagementData = [
  { name: 'Mon', engagement: 78 },
  { name: 'Tue', engagement: 85 },
  { name: 'Wed', engagement: 92 },
  { name: 'Thu', engagement: 88 },
  { name: 'Fri', engagement: 95 },
  { name: 'Sat', engagement: 82 },
  { name: 'Sun', engagement: 89 }
]

const revenueData = [
  { name: 'Jan', revenue: 12500 },
  { name: 'Feb', revenue: 15800 },
  { name: 'Mar', revenue: 14200 },
  { name: 'Apr', revenue: 18900 },
  { name: 'May', revenue: 22100 },
  { name: 'Jun', revenue: 25600 }
]

const platformUsageData = [
  { name: 'Resume Builder', usage: 45 },
  { name: 'Games', usage: 32 },
  { name: 'Assessments', usage: 28 },
  { name: 'Job Matching', usage: 18 },
  { name: 'Salary Calculator', usage: 12 }
]

// Sample recent user activity data
const recentActivityData = [
  { user: 'Maria Santos', action: 'Completed Logic Grid Game', time: '2 minutes ago', type: 'game' },
  { user: 'John Dela Cruz', action: 'Updated Resume', time: '5 minutes ago', type: 'resume' },
  { user: 'Ana Rodriguez', action: 'Took DISC Assessment', time: '12 minutes ago', type: 'assessment' },
  { user: 'Carlos Garcia', action: 'Started Typing Test', time: '18 minutes ago', type: 'assessment' },
  { user: 'Sofia Martinez', action: 'Played Broken Briefs', time: '25 minutes ago', type: 'game' },
  { user: 'Luis Hernandez', action: 'Created New Resume', time: '32 minutes ago', type: 'resume' },
  { user: 'Elena Torres', action: 'Completed Communication Test', time: '45 minutes ago', type: 'assessment' },
  { user: 'Miguel Lopez', action: 'Finished Task Juggler', time: '1 hour ago', type: 'game' }
]

export default function AdminPage() {
  const [engagementFilter, setEngagementFilter] = useState('7d')
  const [revenueFilter, setRevenueFilter] = useState('6m')
  const [usageFilter, setUsageFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('1h')

  const getFilteredActivity = () => {
    let filtered = recentActivityData

    // Filter by activity type
    if (activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityFilter)
    }

    // Filter by time (simplified logic)
    if (timeFilter === '30m') {
      filtered = filtered.slice(0, 4)
    } else if (timeFilter === '1h') {
      filtered = filtered.slice(0, 6)
    } else if (timeFilter === '24h') {
      filtered = filtered
    }

    return filtered
  }

  return (
    <AdminLayout title="Admin Dashboard" description="Manage BPOC.AI platform and user data">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12,847</div>
            <p className="text-xs text-green-400 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Active Resumes</CardTitle>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">8,234</div>
            <p className="text-xs text-green-400 mt-1">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Games Played</CardTitle>
              <Gamepad2 className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">45,123</div>
            <p className="text-xs text-green-400 mt-1">+15.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Assessments</CardTitle>
              <ClipboardList className="w-4 h-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">23,456</div>
            <p className="text-xs text-green-400 mt-1">+6.7% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity with Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent User Activity</CardTitle>
                <CardDescription className="text-gray-400">Latest platform interactions</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setActivityFilter(activityFilter === 'all' ? 'game' : activityFilter === 'game' ? 'resume' : activityFilter === 'resume' ? 'assessment' : 'all')}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {activityFilter === 'all' ? 'All' : activityFilter === 'game' ? 'Games' : activityFilter === 'resume' ? 'Resumes' : 'Assessments'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setTimeFilter(timeFilter === '30m' ? '1h' : timeFilter === '1h' ? '24h' : '30m')}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  {timeFilter === '30m' ? '30m' : timeFilter === '1h' ? '1h' : '24h'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {getFilteredActivity().map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.user}</p>
                    <p className="text-xs text-gray-400">{activity.action}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      activity.type === 'game' ? 'border-green-400 text-green-400' :
                      activity.type === 'resume' ? 'border-purple-400 text-purple-400' :
                      'border-yellow-400 text-yellow-400'
                    }`}
                  >
                    {activity.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Weekly User Engagement</CardTitle>
                <CardDescription className="text-gray-400">Daily user activity tracking</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setEngagementFilter(engagementFilter === '7d' ? '30d' : engagementFilter === '30d' ? '90d' : '7d')}
              >
                <Calendar className="w-4 h-4 mr-1" />
                {engagementFilter === '7d' ? '7 Days' : engagementFilter === '30d' ? '30 Days' : '90 Days'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">87%</div>
                <div className="text-xs text-blue-400">Average</div>
              </div>
            </div>
            <div className="h-64 bg-white/5 rounded-lg p-4">
              <LineChartComponent 
                data={userEngagementData} 
                dataKey="engagement" 
                stroke="#3b82f6"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts with Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Monthly Revenue</CardTitle>
                <CardDescription className="text-gray-400">Revenue growth over time</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setRevenueFilter(revenueFilter === '6m' ? '12m' : revenueFilter === '12m' ? '24m' : '6m')}
              >
                <Calendar className="w-4 h-4 mr-1" />
                {revenueFilter === '6m' ? '6 Months' : revenueFilter === '12m' ? '12 Months' : '24 Months'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">$181,700</div>
                <div className="text-xs text-green-400">Total</div>
              </div>
            </div>
            <div className="h-64 bg-white/5 rounded-lg p-4">
              <AreaChartComponent 
                data={revenueData} 
                dataKey="revenue" 
                fill="#10b981"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Feature Usage</CardTitle>
                <CardDescription className="text-gray-400">Platform feature adoption rates</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setUsageFilter(usageFilter === 'all' ? 'top' : usageFilter === 'top' ? 'recent' : 'all')}
              >
                <Filter className="w-4 h-4 mr-1" />
                {usageFilter === 'all' ? 'All Features' : usageFilter === 'top' ? 'Top 3' : 'Recent'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">135%</div>
                <div className="text-xs text-purple-400">Total Usage</div>
              </div>
            </div>
            <div className="h-64 bg-white/5 rounded-lg p-4">
              <BarChartComponent 
                data={platformUsageData} 
                dataKey="usage" 
                fill="#8b5cf6"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
} 