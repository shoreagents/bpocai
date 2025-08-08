'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Camera,
  Upload
} from 'lucide-react'
import { uploadProfilePhoto, deleteProfilePhoto, optimizeImage, testStorageConnection } from '@/lib/storage'
import { PacmanLoader } from 'react-spinners'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  location: string
  avatar_url?: string
  phone?: string
  bio?: string
  position?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateProfile, refreshUser } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    location: '',
    avatar_url: '',
    phone: '',
    bio: '',
    position: ''
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    jobAlerts: true,
    marketingEmails: false,
    smsNotifications: true,
    pushNotifications: true
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch(`/api/user/profile?userId=${user.id}`)
        console.log('🔍 Profile API response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          const userData = data.user
          console.log('📋 Loaded user data from Railway:', userData)
          setProfileData({
            id: userData.id || user.id,
            email: userData.email || user.email || '',
            first_name: userData.first_name || user.user_metadata?.first_name || '',
            last_name: userData.last_name || user.user_metadata?.last_name || '',
            location: userData.location || user.user_metadata?.location || '',
            avatar_url: userData.avatar_url || user.user_metadata?.avatar_url || '',
            phone: userData.phone || user.user_metadata?.phone || '',
            bio: userData.bio || user.user_metadata?.bio || '',
            position: userData.position || user.user_metadata?.position || ''
          })

          // Check if Supabase display name is out of sync
          const railwayFullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
          const supabaseFullName = user.user_metadata?.full_name || ''
          
          if (railwayFullName && railwayFullName !== supabaseFullName) {
            console.log('⚠️ Display name out of sync. Railway:', railwayFullName, 'Supabase:', supabaseFullName)
            console.log('🔄 Auto-fixing Supabase display name...')
            
            try {
              const { error } = await updateProfile({
                full_name: railwayFullName,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                location: userData.location || '',
                avatar_url: userData.avatar_url || '',
                phone: userData.phone || '',
                bio: userData.bio || '',
                position: userData.position || ''
              })
              
              if (error) {
                console.error('❌ Auto-fix failed:', error)
              } else {
                console.log('✅ Auto-fixed Supabase display name')
              }
            } catch (error) {
              console.error('❌ Failed to auto-fix display name:', error)
            }
          }
        } else {
          // Fallback to Supabase user metadata
          setProfileData({
            id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            location: user.user_metadata?.location || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            phone: user.user_metadata?.phone || '',
            bio: user.user_metadata?.bio || '',
            position: user.user_metadata?.position || ''
          })
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        // Fallback to Supabase user metadata
        setProfileData({
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          location: user.user_metadata?.location || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          phone: user.user_metadata?.phone || '',
          bio: user.user_metadata?.bio || '',
          position: user.user_metadata?.position || ''
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [user, updateProfile])

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setSaveStatus('saving')
      setErrorMessage('')

      console.log('💾 Starting profile save process...')
      console.log('📋 Profile data to save:', profileData)

      // Generate full name from first and last name
      const fullName = `${profileData.first_name} ${profileData.last_name}`.trim()

      // Update Supabase user metadata with explicit full_name
      const metadata = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: fullName, // Ensure this is always set
        location: profileData.location,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
        bio: profileData.bio,
        position: profileData.position
      }

      console.log('🔄 Calling updateProfile with metadata:', metadata)
      const { error: supabaseError } = await updateProfile(metadata)
      
      if (supabaseError) {
        console.error('❌ Supabase update failed:', supabaseError)
        // Continue with Railway update even if Supabase fails
        console.log('⚠️ Continuing with Railway update despite Supabase failure')
        setErrorMessage(`Railway updated successfully, but Supabase auth update failed: ${supabaseError.message}. This may be due to temporary Supabase infrastructure issues.`)
      } else {
        console.log('✅ Supabase update successful, updating Railway...')
        setErrorMessage('')
      }

      // Update Railway database
      console.log('🔄 Updating Railway database...')
      const railwayResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...profileData
        }),
      })

      if (railwayResponse.ok) {
        console.log('✅ Railway update successful')
        setSaveStatus('success')
        setErrorMessage('')
        
        // Refresh user data to ensure UI reflects latest changes
        try {
          await refreshUser()
          console.log('✅ User data refreshed after profile update')
        } catch (error) {
          console.error('❌ Failed to refresh user data:', error)
        }
        
        // Show success message
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
        
        // Refresh header by triggering a custom event
        window.dispatchEvent(new CustomEvent('profileUpdated'))
      } else {
        const railwayError = await railwayResponse.json()
        console.error('❌ Railway update failed:', railwayError)
        setSaveStatus('error')
        setErrorMessage(`Railway update failed: ${railwayError.error}`)
      }

      setShowSaveDialog(false)
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      setSaveStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save profile')
      setTimeout(() => setSaveStatus('idle'), 5000)
    }
  }

  const handleToggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const handleForceUpdateDisplayName = async () => {
    if (!user) return

    try {
      setSaveStatus('saving')
      setErrorMessage('')

      const fullName = `${profileData.first_name} ${profileData.last_name}`.trim()
      
      console.log('🔄 Force updating Supabase display name to:', fullName)
      
      const { error } = await updateProfile({
        full_name: fullName,
        first_name: profileData.first_name,
        last_name: profileData.last_name
      })

      if (error) {
        console.error('❌ Force update failed:', error)
        setErrorMessage(`Failed to update display name: ${error.message}`)
        setSaveStatus('error')
      } else {
        console.log('✅ Display name updated successfully')
        
        // Refresh user data to ensure UI reflects latest changes
        try {
          await refreshUser()
          console.log('✅ User data refreshed after force update')
        } catch (refreshError) {
          console.error('❌ Failed to refresh user data:', refreshError)
        }
        
        setSaveStatus('success')
        setErrorMessage('')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('❌ Error force updating display name:', error)
      setSaveStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update display name')
      setTimeout(() => setSaveStatus('idle'), 5000)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return
    
    try {
      setPhotoUploading(true)
      setPhotoError('')
      
      console.log('📸 Starting photo upload...')
      

      
      // Optimize image
      const optimizedFile = await optimizeImage(file)
      console.log('✅ Image optimized')
      
      // Upload to Supabase
      const { fileName, publicUrl } = await uploadProfilePhoto(optimizedFile, user.id)
      console.log('✅ Photo uploaded to Supabase:', publicUrl)
      
      // Update profile data
      setProfileData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }))
      
      // Update Railway database
      console.log('🔄 Updating Railway with avatar_url:', publicUrl)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...profileData,
          avatar_url: publicUrl
        })
      })
      
      console.log('📊 Railway update response status:', response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Profile photo updated in Railway:', responseData)
        
        // Refresh user data
        try {
          await refreshUser()
          console.log('✅ User data refreshed after photo upload')
        } catch (refreshError) {
          console.error('❌ Failed to refresh user data:', refreshError)
        }
        
        // Trigger header update
        window.dispatchEvent(new CustomEvent('profileUpdated'))
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to update profile photo in Railway:', response.status, errorData)
      }
      
    } catch (error) {
      console.error('❌ Photo upload failed:', error)
      
      // Extract meaningful error message
      let errorMessage = 'Upload failed'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
        if ('message' in error) {
          errorMessage = String(error.message)
        } else if ('error' in error) {
          errorMessage = String(error.error)
        } else {
          errorMessage = JSON.stringify(error)
        }
      } else {
        errorMessage = String(error)
      }
      
      setPhotoError(errorMessage)
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleTestStorage = async () => {
    try {
      console.log('🧪 Testing storage connection...')
      
      // Check environment variables first
      const envResponse = await fetch('/api/test-env')
      const envResult = await envResponse.json()
      console.log('Environment check result:', envResult)
      
      if (!envResult.success) {
        alert(`Environment check failed:\nMissing: ${envResult.missingVars.join(', ')}`)
        return
      }
      
      // Test client-side connection
      const clientResult = await testStorageConnection()
      console.log('Client-side test result:', clientResult)
      
      // Test server-side connection
      const serverResponse = await fetch('/api/test-storage')
      const serverResult = await serverResponse.json()
      console.log('Server-side test result:', serverResult)
      
      if (clientResult.success && serverResult.success) {
        console.log('✅ All tests successful')
        alert('Storage connection test successful! Check console for details.')
      } else {
        const errors = []
        if (!clientResult.success) errors.push(`Client: ${clientResult.error}`)
        if (!serverResult.success) errors.push(`Server: ${serverResult.error}`)
        console.error('❌ Storage test failed:', errors)
        alert(`Storage test failed:\n${errors.join('\n')}`)
      }
    } catch (error) {
      console.error('❌ Storage test error:', error)
      alert(`Storage test error: ${error}`)
    }
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
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="ml-2 text-gray-300">Loading profile...</span>
            </div>
          ) : (
            <>
              {/* Profile Photo Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Profile Photo</h3>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Current Photo */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-400 to-purple-400">
                      {profileData.avatar_url ? (
                        <img
                          src={profileData.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Upload Overlay */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={photoUploading}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                    >
                      {photoUploading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  
                  {/* Upload Info */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={photoUploading}
                          variant="outline"
                          size="sm"
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {photoUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Photo
                            </>
                          )}
                        </Button>
                        
                        {profileData.avatar_url && (
                          <Button
                            onClick={() => {
                              setProfileData(prev => ({ ...prev, avatar_url: '' }))
                              // TODO: Implement photo deletion
                            }}
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400">
                        JPG, PNG, GIF up to 5MB. Recommended size: 400x400px
                      </p>
                      
                      {photoError && (
                        <p className="text-xs text-red-400">{photoError}</p>
                      )}
                      
                      {/* Hidden Test Storage Button - functionality preserved */}
                      <Button
                        onClick={handleTestStorage}
                        variant="outline"
                        size="sm"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hidden"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Test Storage
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              
              <Separator className="bg-white/10" />
              
              {/* Personal Information Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">First Name</label>
                  <Input
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Last Name</label>
                  <Input
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                  <Input
                    value={profileData.email}
                    disabled
                    className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Phone</label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your location"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Position/Title</label>
                  <Input
                    value={profileData.position}
                    onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your job title or position"
                  />
                </div>
                {/* Hidden Avatar URL Field - functionality preserved */}
                <div className="hidden">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Avatar URL</label>
                  <Input
                    value={profileData.avatar_url}
                    onChange={(e) => setProfileData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your profile picture URL"
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
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              {/* Save Status */}
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Profile updated successfully!</span>
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">Error: {errorMessage}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                {/* Hidden Update Display Name Button - functionality preserved */}
                <div className="flex flex-col hidden">
                  <Button 
                    onClick={handleForceUpdateDisplayName}
                    disabled={saveStatus === 'saving'}
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Update Display Name
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">Force update Supabase display name</p>
                </div>
                
                <Button 
                  onClick={() => setShowSaveDialog(true)}
                  disabled={saveStatus === 'saving'}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
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

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Futuristic Space Background */}
        <div className="absolute inset-0">
          {/* Nebula Effect */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-cyan-900/20"></div>
          <div className="absolute inset-0 bg-gradient-radial from-blue-900/15 via-transparent to-pink-900/15"></div>
          
          {/* Starfield */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.3 + Math.random() * 0.7
                }}
              ></div>
            ))}
          </div>
          
          {/* Floating Space Debris */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-cyan-400/40 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-2 h-2 bg-purple-400/50 rounded-full animate-ping"></div>
          <div className="absolute top-60 left-1/4 w-2.5 h-2.5 bg-blue-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-80 right-1/3 w-1.5 h-1.5 bg-green-400/60 rounded-full animate-bounce"></div>
          <div className="absolute top-32 left-2/3 w-2 h-2 bg-pink-400/50 rounded-full animate-ping"></div>
          <div className="absolute top-72 right-1/6 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-pulse"></div>
          
          {/* Energy Orbs */}
          <div className="absolute top-1/4 left-1/6 w-6 h-6 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full animate-spin opacity-40"></div>
          <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-gradient-to-r from-purple-400/25 to-pink-400/25 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-2/3 left-1/3 w-5 h-5 bg-gradient-to-r from-green-400/35 to-cyan-400/35 rounded-full animate-bounce opacity-50"></div>
          <div className="absolute top-1/2 right-1/6 w-4 h-4 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full animate-spin opacity-40" style={{ animationDirection: 'reverse' }}></div>
          
          {/* Cosmic Grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/8 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/8 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent"></div>
          
          {/* Wormhole Effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-40 h-40 border border-cyan-400/15 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-purple-400/15 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-blue-400/15 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-pink-400/15 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>
          
          {/* Energy Waves */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-purple-500/10 via-transparent to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <Header />
        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center relative">
                {/* Pac-Man Loader */}
                <div className="relative mb-8">
                  <div className="flex justify-center">
                    <PacmanLoader 
                      color="#fbbf24" 
                      size={60}
                      margin={4}
                      speedMultiplier={1.2}
                    />
                  </div>
                  
                  {/* Floating energy particles */}
                  <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -top-4 -right-4 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                {/* Enhanced Text with Glow Effect */}
                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
                  Loading Settings
                </h2>
                <p className="text-gray-300 mb-6 text-lg">Preparing your personalized settings...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen cyber-grid overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        <Header />
        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center py-20">
                <span className="text-gray-300">Please sign in to access settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
      
      {/* Save Changes Alert Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Save Changes</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to save these changes to your profile? This will update your personal information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSaveProfile}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 