'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Eye,
  Palette,
  Key,
  Download,
  Trash2,
  Save,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Lock,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Zap,
  Database,
  FileText,
  AlertTriangle,
  Sparkles,
  ArrowLeft
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [profileData, setProfileData] = useState({
    fullName: 'Juan Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '+63 917 123 4567',
    location: 'Manila, Philippines',
    bio: 'Experienced BPO professional with 5+ years in customer service and team leadership.'
  })
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    jobAlerts: true,
    marketingEmails: false,
    smsNotifications: true,
    pushNotifications: true
  })

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      description: 'Manage your personal information'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      description: 'Configure your notification preferences'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      description: 'Control your privacy and security settings'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      description: 'Customize your interface preferences'
    },
    {
      id: 'data',
      title: 'Data & Storage',
      icon: Database,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      description: 'Manage your data and storage settings'
    }
  ]

  const handleSaveProfile = () => {
    // Save profile logic would go here
    console.log('Profile saved:', profileData)
  }

  const handleToggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const renderProfileSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Full Name</label>
              <Input
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Phone</label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Location</label>
              <Input
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderNotificationSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about updates and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'emailUpdates', label: 'Email Updates', description: 'Receive platform updates via email', icon: Mail },
            { key: 'jobAlerts', label: 'Job Alerts', description: 'Get notified about new job matches', icon: Zap },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional content and tips', icon: Sparkles },
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Important alerts via text message', icon: Smartphone },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser notifications', icon: Monitor }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-white font-medium">{item.label}</div>
                  <div className="text-sm text-gray-400">{item.description}</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleNotification(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications] ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderPrivacySettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your privacy settings and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Account Security</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Change Password</div>
                    <div className="text-sm text-gray-400">Update your account password</div>
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-400">Add an extra layer of security</div>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Enabled
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Privacy Controls</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium">Profile Visibility</div>
                    <div className="text-sm text-gray-400">Control who can see your profile</div>
                  </div>
                </div>
                <select className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white text-sm">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="contacts">Contacts Only</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderAppearanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            Appearance Settings
          </CardTitle>
          <CardDescription>
            Customize how the interface looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme (Current)', active: true },
                { id: 'light', label: 'Light', icon: Sun, description: 'Light theme (Coming Soon)', active: false },
                { id: 'auto', label: 'Auto', icon: Monitor, description: 'System preference (Coming Soon)', active: false }
              ].map((theme) => (
                <div
                  key={theme.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    theme.active 
                      ? 'border-purple-500/50 bg-purple-500/10' 
                      : 'border-white/10 hover:border-white/20'
                  } ${!theme.active ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <theme.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">{theme.label}</span>
                  </div>
                  <p className="text-sm text-gray-400">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Display Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Animations</div>
                  <div className="text-sm text-gray-400">Enable smooth animations and transitions</div>
                </div>
                <button className="relative w-12 h-6 rounded-full bg-cyan-500">
                  <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 translate-x-6 transition-transform" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Reduced Motion</div>
                  <div className="text-sm text-gray-400">Minimize animations for accessibility</div>
                </div>
                <button className="relative w-12 h-6 rounded-full bg-gray-600">
                  <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderDataSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            Data & Storage
          </CardTitle>
          <CardDescription>
            Manage your data, downloads, and account deletion options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Data Export</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Download Profile Data</div>
                    <div className="text-sm text-gray-400">Export all your profile information</div>
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Download
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium">Download Resume Data</div>
                    <div className="text-sm text-gray-400">Export all your resume analyses and versions</div>
                  </div>
                </div>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Download
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Storage Usage</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Resume Files</span>
                <span className="text-white">2.4 MB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Profile Data</span>
                <span className="text-white">0.8 MB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
            <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-white font-medium mb-2">Delete Account</div>
                  <div className="text-sm text-gray-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </div>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'privacy':
        return renderPrivacySettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'data':
        return renderDataSettings()
      default:
        return renderProfileSettings()
    }
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
                <Settings className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Settings</h1>
                  <p className="text-gray-400">Customize your BPOC.AI experience and manage your account preferences</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="glass-card border-white/10 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white">Settings Menu</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-2">
                    {settingsSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-8 h-8 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                          <section.icon className={`w-4 h-4 ${section.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium">{section.title}</div>
                          <div className="text-xs text-gray-400 truncate">{section.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 