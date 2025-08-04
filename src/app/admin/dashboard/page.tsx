'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdmin } from '@/contexts/AdminContext'
import { useAuth } from '@/contexts/AuthContext'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChartComponent, AreaChartComponent, BarChartComponent } from '@/components/ui/charts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  FileText,
  Gamepad2,
  ClipboardList,
  Filter,
  Calendar,
  Clock
} from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'

// Sample data for charts
const userEngagementData = [
  { name: 'Mon', users: 65 },
  { name: 'Tue', users: 72 },
  { name: 'Wed', users: 85 },
  { name: 'Thu', users: 78 },
  { name: 'Fri', users: 90 },
  { name: 'Sat', users: 95 },
  { name: 'Sun', users: 87 }
]

const revenueData = [
  { name: 'Jan', revenue: 28000 },
  { name: 'Feb', revenue: 32000 },
  { name: 'Mar', revenue: 35000 },
  { name: 'Apr', revenue: 42000 },
  { name: 'May', revenue: 38000 },
  { name: 'Jun', revenue: 45000 }
]

const platformUsageData = [
  { name: 'Resume Builder', usage: 45 },
  { name: 'Career Tools', usage: 30 },
  { name: 'Games', usage: 15 },
  { name: 'Assessments', usage: 10 }
]

const recentActivity = [
  { id: 1, user: 'Maria Santos', initials: 'MS', action: 'Completed Logic Grid Game', time: '2 minutes ago', type: 'game' },
  { id: 2, user: 'John Dela Cruz', initials: 'JDC', action: 'Updated Resume', time: '5 minutes ago', type: 'resume' },
  { id: 3, user: 'Ana Rodriguez', initials: 'AR', action: 'Took DISC Assessment', time: '12 minutes ago', type: 'assessment' },
  { id: 4, user: 'Carlos Garcia', initials: 'CG', action: 'Started Typing Test', time: '18 minutes ago', type: 'assessment' },
  { id: 5, user: 'Lisa Park', initials: 'LP', action: 'Completed Resume Builder', time: '25 minutes ago', type: 'resume' },
  { id: 6, user: 'David Brown', initials: 'DB', action: 'Played Inbox Zero', time: '32 minutes ago', type: 'game' },
  { id: 7, user: 'Emma Wilson', initials: 'EW', action: 'Finished Communication Test', time: '45 minutes ago', type: 'assessment' },
  { id: 8, user: 'Mike Chen', initials: 'MC', action: 'Updated Profile', time: '1 hour ago', type: 'profile' }
]

export default function DashboardPage() {
  const { adminUser } = useAdmin()
  const { user } = useAuth()

  const getTypeBadge = (type: string) => {
    const variants = {
      game: 'bg-green-500/20 text-green-400 border-green-500/30',
      resume: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      assessment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      profile: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    return variants[type as keyof typeof variants] || variants.profile
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">12,847</p>
                    <p className="text-xs text-green-400">+12.5% from last month</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Resumes</p>
                    <p className="text-2xl font-bold text-white">8,234</p>
                    <p className="text-xs text-green-400">+8.2% from last month</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Games Played</p>
                    <p className="text-2xl font-bold text-white">45,123</p>
                    <p className="text-xs text-green-400">+15.3% from last month</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Assessments</p>
                    <p className="text-2xl font-bold text-white">23,456</p>
                    <p className="text-xs text-green-400">+6.7% from last month</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-white" />
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <Filter className="w-3 h-3 mr-1" />
                      All
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <Clock className="w-3 h-3 mr-1" />
                      1h
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                            {activity.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.user}</p>
                          <p className="text-gray-400 text-sm">{activity.action}</p>
                        </div>
                        <Badge className={getTypeBadge(activity.type)}>
                          {activity.type}
                        </Badge>
                        <span className="text-gray-500 text-sm">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Engagement */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Weekly User Engagement</CardTitle>
                    <p className="text-sm text-gray-400">Daily user activity tracking</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-400 font-medium">87% Average</p>
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <Calendar className="w-3 h-3 mr-1" />
                      7 Days
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-white/5 rounded-lg p-4">
                  <LineChartComponent data={userEngagementData} dataKey="users" stroke="#06b6d4" />
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
                    <CardTitle className="text-white">Monthly Revenue</CardTitle>
                    <p className="text-sm text-gray-400">Revenue growth over time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-400 font-medium">$181,700 Total</p>
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <Calendar className="w-3 h-3 mr-1" />
                      6 Months
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-white/5 rounded-lg p-4">
                  <AreaChartComponent data={revenueData} dataKey="revenue" fill="#10b981" />
                </div>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Feature Usage</CardTitle>
                    <p className="text-sm text-gray-400">Platform feature adoption rates</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-400 font-medium">135% Total Usage</p>
                    <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                      <Filter className="w-3 h-3 mr-1" />
                      All Features
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-white/5 rounded-lg p-4">
                  <BarChartComponent data={platformUsageData} dataKey="usage" fill="#8b5cf6" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  )
} 