'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Menu, 
  X, 
  User, 
  Trophy, 
  Sparkles,
  Settings,
  LogOut,
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { cn } from '@/lib/utils'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'
import EditProfile from '@/components/auth/EditProfile'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  className?: string
}

export default function Header({}: HeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  
  const isAuthenticated = !!user
  
  // Extract user info from Supabase user object
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userInitials = user?.user_metadata?.full_name 
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U'
  
  // Mock level and XP for now - these would come from your app's database
  const userLevel = 12 // This would be fetched from your user profile table
  const userExperiencePoints = 14400 // This would be fetched from your user profile table

  const navigationItems = [
    { title: 'Home', href: '/' },
    { title: 'Resume Builder', href: '/resume-builder' },
    { title: 'Career Tools', href: '/career-tools' },
    { title: 'Jobs', href: '/jobs' },
    { title: 'About', href: '/about' }
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMobileMenuOpen(false) // Close mobile menu if open
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleOpenEditProfile = () => {
    setIsEditProfileOpen(true)
    setIsMobileMenuOpen(false) // Close mobile menu if open
  }

  const userMenuItems = [
    { label: 'Profile', href: null, icon: User, action: handleOpenEditProfile },
    { label: 'Settings', href: '/settings', icon: Settings, action: null },
    { label: 'Sign Out', href: null, icon: LogOut, action: handleSignOut }
  ]

  // Form switching handlers
  const handleSwitchToSignUp = () => {
    setIsLoginDialogOpen(false)
    setTimeout(() => setIsSignUpDialogOpen(true), 100) // Small delay for smooth transition
  }

  const handleSwitchToLogin = () => {
    setIsSignUpDialogOpen(false)
    setTimeout(() => setIsLoginDialogOpen(true), 100) // Small delay for smooth transition
  }

  const handleOpenLogin = () => {
    setIsSignUpDialogOpen(false)
    setIsLoginDialogOpen(true)
    setIsMobileMenuOpen(false)
  }

  const handleOpenSignUp = () => {
    setIsLoginDialogOpen(false)
    setIsSignUpDialogOpen(true)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-8 h-8 glass-card flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold gradient-text">BPOC.AI</span>
              <span className="text-xs text-gray-400 -mt-1">Where BPO Careers Begin</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-white hover:text-cyan-400 transition-colors font-medium"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center space-x-4">
                {/* User Level & XP */}
                <div className="flex items-center space-x-2 glass-card px-3 py-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">Level {userLevel}</span>
                  <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${(userExperiencePoints % 1000) / 10}%` }}
                    />
                  </div>
                </div>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 glass-button px-3 py-2 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">
                        {userInitials}
                      </span>
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{userDisplayName}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {userMenuItems.map((item) => (
                      item.href ? (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          key={item.label}
                          onClick={item.action || (() => {})}
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-white/10 transition-colors w-full text-left"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-cyan-400 hover:bg-white/10 transition-all duration-200"
                  onClick={handleOpenLogin}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 transition-all duration-200"
                  onClick={handleOpenSignUp}
                >
                  Get Started Free
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[300px] glass-card border-white/10">
                  <div className="flex flex-col space-y-6 mt-6">
                    {/* Mobile User Info */}
                    {isAuthenticated && user && (
                      <div className="glass-card p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-black">
                              {userInitials}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{userDisplayName}</p>
                            <p className="text-sm text-gray-400">Level {userLevel}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Navigation */}
                    <nav className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </nav>

                    {/* Mobile Auth Buttons */}
                    {!isAuthenticated && (
                      <div className="space-y-3 pt-6 border-t border-white/10">
                        <Button 
                          variant="outline" 
                          className="w-full border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                          onClick={handleOpenLogin}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                        <Button 
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 transition-all duration-200"
                          onClick={handleOpenSignUp}
                        >
                          Get Started Free
                        </Button>
                      </div>
                    )}

                    {/* Mobile User Menu */}
                    {isAuthenticated && (
                      <div className="space-y-2 pt-6 border-t border-white/10">
                        {userMenuItems.map((item) => (
                          item.href ? (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </Link>
                          ) : (
                            <button
                              key={item.label}
                              onClick={item.action || (() => {})}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors w-full text-left"
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Dialog */}
      <LoginForm 
        open={isLoginDialogOpen} 
        onOpenChange={setIsLoginDialogOpen}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      
      {/* Sign Up Dialog */}
      <SignUpForm 
        open={isSignUpDialogOpen} 
        onOpenChange={setIsSignUpDialogOpen}
        onSwitchToLogin={handleSwitchToLogin}
      />
      
      {/* Edit Profile Dialog */}
      <EditProfile 
        open={isEditProfileOpen} 
        onOpenChange={setIsEditProfileOpen}
      />
    </header>
  )
} 