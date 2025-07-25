'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  Chrome
} from 'lucide-react'

interface LoginFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp?: () => void
}

export default function LoginForm({ open, onOpenChange, onSwitchToSignUp }: LoginFormProps) {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Basic validation
    const newErrors: { email?: string; password?: string; general?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // Supabase authentication
    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        // Handle Supabase auth errors
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' })
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and confirm your account before signing in.' })
        } else {
          setErrors({ general: error.message })
        }
      } else if (data.user) {
        // Successful login
        console.log('Login successful:', data.user.email)
        
        // Close dialog and reset form
        onOpenChange(false)
        setEmail('')
        setPassword('')
        setShowPassword(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async () => {
    try {
      setIsLoading(true)
      const { error } = await signInWithGoogle()
      
      if (error) {
        console.error('Google login error:', error)
        setErrors({ general: 'Failed to sign in with Google. Please try again.' })
      }
      // Note: On success, the user will be redirected to the callback URL
    } catch (error) {
      console.error('Google login error:', error)
      setErrors({ general: 'An error occurred during Google sign in.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToSignUp = () => {
    // Reset form state
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setErrors({})
    setIsLoading(false)
    
    // Switch to sign up form
    if (onSwitchToSignUp) {
      onSwitchToSignUp()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-md w-full mx-4 sm:mx-auto max-h-[95vh] overflow-y-auto [&>div[data-slot=dialog-overlay]]:bg-black/80 [&>div[data-slot=dialog-overlay]]:backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] duration-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            duration: 0.3
          }}
          className="space-y-6"
        >
          {/* Header */}
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl sm:text-3xl font-bold gradient-text flex items-center justify-center gap-3">
              <LogIn className="w-6 h-6 sm:w-8 sm:h-8" />
              Welcome Back
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Sign in to your BPOC.AI account to continue your BPO career journey
            </DialogDescription>
          </DialogHeader>

          {/* General Error Display */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <p className="text-red-400 text-sm text-center">{errors.general}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-white block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium text-white block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors underline focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
                onClick={() => {
                  // TODO: Implement forgot password
                  console.log('Forgot password clicked')
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 h-12 font-medium transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator className="bg-white/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/5 backdrop-blur-sm px-3 text-sm text-gray-300 border border-white/10 rounded-md">Or continue with</span>
            </div>
          </div>

          {/* Social Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            onClick={handleSocialLogin}
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-300 pt-2">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors underline focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
              onClick={handleSwitchToSignUp}
            >
              Create one for FREE
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 