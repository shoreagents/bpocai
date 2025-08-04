'use client'

import { useAdmin } from '@/contexts/AdminContext'
import AdminRouteGuard from '@/components/admin/AdminRouteGuard'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Trophy, FileText } from 'lucide-react'

export default function AdminPage() {
  const { isAdmin, adminUser, logAdminAction } = useAdmin()

  const handleAdminAction = async (action: string) => {
    await logAdminAction(action, `Admin action: ${action}`)
    console.log(`Admin action logged: ${action}`)
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-black">
        <Header />
        
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Admin Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-red-400 mr-3" />
                  <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
                </div>
                <p className="text-gray-400">
                  Welcome back, {adminUser?.full_name || 'Admin'}
                </p>
              </div>

              {/* Admin Status */}
              <Card className="glass-card mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-400" />
                    Admin Status
                  </CardTitle>
                  <CardDescription>
                    Your current admin privileges and access level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-lg">
                      <h3 className="font-semibold text-cyan-400">Admin Level</h3>
                      <p className="text-sm text-gray-400">
                        {adminUser?.admin_level === 'admin' ? 'Admin' : 'User'}
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-lg">
                      <h3 className="font-semibold text-cyan-400">Status</h3>
                      <p className="text-sm text-gray-400">
                        {adminUser?.is_admin ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-lg">
                      <h3 className="font-semibold text-cyan-400">Email</h3>
                      <p className="text-sm text-gray-400">{adminUser?.email}</p>
                    </div>
                    <div className="glass-card p-4 rounded-lg">
                      <h3 className="font-semibold text-cyan-400">User ID</h3>
                      <p className="text-sm text-gray-400">{adminUser?.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card mb-8">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common admin tasks and functions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleAdminAction('view_users')}
                      className="glass-card p-4 rounded-lg hover:bg-white/10 transition-all duration-200 text-left"
                    >
                      <Users className="w-6 h-6 text-cyan-400 mb-2" />
                      <h3 className="font-semibold">View Users</h3>
                      <p className="text-sm text-gray-400">Manage user accounts</p>
                    </button>
                    
                    <button
                      onClick={() => handleAdminAction('view_resumes')}
                      className="glass-card p-4 rounded-lg hover:bg-white/10 transition-all duration-200 text-left"
                    >
                      <FileText className="w-6 h-6 text-cyan-400 mb-2" />
                      <h3 className="font-semibold">View Resumes</h3>
                      <p className="text-sm text-gray-400">Access resume database</p>
                    </button>
                    
                    <button
                      onClick={() => handleAdminAction('view_analytics')}
                      className="glass-card p-4 rounded-lg hover:bg-white/10 transition-all duration-200 text-left"
                    >
                      <Trophy className="w-6 h-6 text-cyan-400 mb-2" />
                      <h3 className="font-semibold">View Analytics</h3>
                      <p className="text-sm text-gray-400">System statistics</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Info */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Admin Information</CardTitle>
                  <CardDescription>
                    Your admin account details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-cyan-400">Full Name</h3>
                      <p className="text-gray-400">{adminUser?.full_name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-cyan-400">Email</h3>
                      <p className="text-gray-400">{adminUser?.email}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-cyan-400">Admin Level</h3>
                      <p className="text-gray-400">
                        {adminUser?.admin_level === 'admin' ? 'Admin' : 'User'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-cyan-400">Admin Status</h3>
                      <p className="text-gray-400">
                        {adminUser?.is_admin ? 'Active Admin' : 'Not Admin'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AdminRouteGuard>
  )
} 