'use client'

import { useAdmin } from '@/contexts/AdminContext'
import { useAuth } from '@/contexts/AuthContext'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText,
  Gamepad2,
  ClipboardList,
  Search,
  Filter,
  Calendar,
  Clock,
  ChevronDown
} from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'

// Dummy data for charts
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

export default function AdminDashboardPage() {
  const { adminUser } = useAdmin()
  const { user } = useAuth()

  return (
    <AdminRouteGuard>
      <AdminLayout 
        title="Dashboard" 
        description="Platform overview and analytics"
        adminUser={adminUser}
      >
        {/* Stats Grid */}
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

        {/* Activity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Latest platform interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: 'Maria Santos', action: 'Completed Logic Grid Game', time: '2 minutes ago' },
                  { user: 'John Dela Cruz', action: 'Updated Resume', time: '5 minutes ago' },
                  { user: 'Ana Rodriguez', action: 'Took DISC Assessment', time: '12 minutes ago' },
                  { user: 'Carlos Garcia', action: 'Started Typing Test', time: '18 minutes ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.user}</p>
                      <p className="text-xs text-gray-400">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">System Charts</CardTitle>
              <CardDescription className="text-gray-400">Performance monitoring with charts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* System Health Chart */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">System Health Score</h4>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">99.5%</div>
                      <div className="text-xs text-green-400">Current Score</div>
                    </div>
                  </div>
                  <div className="h-48 bg-white/5 rounded-lg p-4">
                    <LineChartComponent 
                      data={systemHealthData} 
                      dataKey="health" 
                      stroke="#10b981"
                    />
                  </div>
                </div>

                {/* Service Distribution Chart */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">Service Load Distribution</h4>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">100%</div>
                      <div className="text-xs text-blue-400">Total Load</div>
                    </div>
                  </div>
                  <div className="h-48 bg-white/5 rounded-lg p-4">
                    <PieChartComponent 
                      data={serviceDistributionData}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  )
} 