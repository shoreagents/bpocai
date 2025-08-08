'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Globe, Shield, Bell, Palette, Database, Key, Users, Mail, Lock, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import AdminLayout from '@/components/layout/AdminLayout'

interface GeneralSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportEmail: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  maxFileSize: string
  sessionTimeout: string
  timezone: string
  language: string
  theme: string
  analyticsEnabled: boolean
  backupEnabled: boolean
  securityLevel: string
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<GeneralSettings>({
    siteName: 'BPOC.AI',
    siteDescription: 'Career Development Platform',
    contactEmail: 'contact@bpoc.ai',
    supportEmail: 'support@bpoc.ai',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxFileSize: '10',
    sessionTimeout: '24',
    timezone: 'UTC',
    language: 'en',
    theme: 'dark',
    analyticsEnabled: true,
    backupEnabled: true,
    securityLevel: 'high'
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
  }

  const updateSetting = (key: keyof GeneralSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <AdminLayout
      title="General Settings"
      description="Manage platform-wide settings and configurations"
      titleContent={
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Site Information */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-400" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="siteName" className="text-gray-300 block text-sm font-medium mb-2">Site Name</label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label htmlFor="siteDescription" className="text-gray-300 block text-sm font-medium mb-2">Site Description</label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactEmail" className="text-gray-300 block text-sm font-medium mb-2">Contact Email</label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label htmlFor="supportEmail" className="text-gray-300 block text-sm font-medium mb-2">Support Email</label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-400" />
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 block text-sm font-medium mb-1">Maintenance Mode</label>
                  <p className="text-sm text-gray-400">Temporarily disable the platform</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 block text-sm font-medium mb-1">Registration Enabled</label>
                  <p className="text-sm text-gray-400">Allow new user registrations</p>
                </div>
                <Switch
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => updateSetting('registrationEnabled', checked)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 block text-sm font-medium mb-1">Email Notifications</label>
                  <p className="text-sm text-gray-400">Send email notifications</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 block text-sm font-medium mb-1">Analytics Enabled</label>
                  <p className="text-sm text-gray-400">Track user analytics</p>
                </div>
                <Switch
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Performance */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              Security & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="maxFileSize" className="text-gray-300 block text-sm font-medium mb-2">Max File Size (MB)</label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => updateSetting('maxFileSize', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label htmlFor="sessionTimeout" className="text-gray-300 block text-sm font-medium mb-2">Session Timeout (hours)</label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label htmlFor="securityLevel" className="text-gray-300 block text-sm font-medium mb-2">Security Level</label>
                <Select value={settings.securityLevel} onValueChange={(value) => updateSetting('securityLevel', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="maximum">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-gray-300 block text-sm font-medium mb-1">Backup Enabled</label>
                <p className="text-sm text-gray-400">Automated system backups</p>
              </div>
              <Switch
                checked={settings.backupEnabled}
                onCheckedChange={(checked) => updateSetting('backupEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Globe className="h-5 w-5 mr-2 text-cyan-400" />
              Localization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="timezone" className="text-gray-300 block text-sm font-medium mb-2">Timezone</label>
                <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="language" className="text-gray-300 block text-sm font-medium mb-2">Language</label>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label htmlFor="theme" className="text-gray-300 block text-sm font-medium mb-2">Default Theme</label>
              <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Database className="h-5 w-5 mr-2 text-orange-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">1.2s</div>
                <div className="text-sm text-gray-400">Avg Response</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">2.1K</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
