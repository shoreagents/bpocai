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
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  Chrome,
  User,
  CheckCircle,
  MapPin,
  Phone
} from 'lucide-react'

interface SignUpFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin?: () => void
}

export default function SignUpForm({ open, onOpenChange, onSwitchToLogin }: SignUpFormProps) {
  const { signUp, signInWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    location: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    // Supabase registration
    try {
      const { data, error } = await signUp(
        formData.email, 
        formData.password, 
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          position: formData.position,
          location: formData.location,
          full_name: `${formData.firstName} ${formData.lastName}`
        }
      )
      
      if (error) {
        // Handle Supabase auth errors
        if (error.message.includes('User already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' })
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setErrors({ password: 'Password should be at least 6 characters long.' })
        } else {
          setErrors({ general: error.message })
        }
      } else if (data.user) {
        // Successful registration
        console.log('Registration successful:', data.user.email)
        
        setSuccessMessage('Account created successfully! Please check your email to verify your account.')
        
        // Reset form after success
        setTimeout(() => {
          onOpenChange(false)
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            position: '',
            location: '',
            password: '',
            confirmPassword: ''
          })
          setAgreedToTerms(false)
          setShowPassword(false)
          setShowConfirmPassword(false)
          setSuccessMessage('')
        }, 3000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = async () => {
    try {
      setIsLoading(true)
      const { error } = await signInWithGoogle()
      
      if (error) {
        console.error('Google sign up error:', error)
        setErrors({ general: 'Failed to sign up with Google. Please try again.' })
      }
      // Note: On success, the user will be redirected to the callback URL
    } catch (error) {
      console.error('Google sign up error:', error)
      setErrors({ general: 'An error occurred during Google sign up.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToLogin = () => {
    // Reset form state
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      location: '',
      password: '',
      confirmPassword: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAgreedToTerms(false)
    setErrors({})
    setSuccessMessage('')
    setIsLoading(false)
    
    // Switch to login form
    if (onSwitchToLogin) {
      onSwitchToLogin()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/20 max-w-lg w-full mx-4 sm:mx-auto max-h-[95vh] overflow-y-auto [&>div[data-slot=dialog-overlay]]:bg-black/80 [&>div[data-slot=dialog-overlay]]:backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] duration-200">
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
              <UserPlus className="w-6 h-6 sm:w-8 sm:h-8" />
              Join BPOC.AI
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Start your BPO career journey with our FREE platform
            </DialogDescription>
          </DialogHeader>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
            >
              <p className="text-green-400 text-sm text-center">{successMessage}</p>
            </motion.div>
          )}

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

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-white block">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                      errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    disabled={isLoading}
                    autoComplete="given-name"
                  />
                </div>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs"
                  >
                    {errors.firstName}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-white block">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                      errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    disabled={isLoading}
                    autoComplete="family-name"
                  />
                </div>
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs"
                  >
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-medium text-white block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-white block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +63 912 345 6789"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                    errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs"
                >
                  {errors.phone}
                </motion.p>
              )}
            </div>

            {/* Position Field */}
            <div className="space-y-2">
              <label htmlFor="position" className="text-sm font-medium text-white block">
                Position
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="position"
                  type="text"
                  placeholder="e.g., Customer Service, Sales"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={`pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                    errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              {errors.position && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs"
                >
                  {errors.position}
                </motion.p>
              )}
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-white block">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Clark, Pampanga"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                    errors.location ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                  }`}
                  disabled={isLoading}
                  autoComplete="address-level2"
                />
              </div>
              {errors.location && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs"
                >
                  {errors.location}
                </motion.p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium text-white block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    disabled={isLoading}
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
                    }`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black ${
                    agreedToTerms 
                      ? 'bg-cyan-500 border-cyan-500' 
                      : 'border-white/20 hover:border-cyan-500'
                  } ${errors.terms ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  aria-label="Agree to terms and conditions"
                >
                  {agreedToTerms && <CheckCircle className="w-3 h-3 text-white" />}
                </button>
                <label className="text-sm text-gray-300 leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-cyan-400 hover:text-cyan-300 underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
                    onClick={() => {
                      // TODO: Open terms modal or navigate to terms page
                      console.log('Terms clicked')
                    }}
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    className="text-cyan-400 hover:text-cyan-300 underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
                    onClick={() => {
                      // TODO: Open privacy modal or navigate to privacy page
                      console.log('Privacy policy clicked')
                    }}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs"
                >
                  {errors.terms}
                </motion.p>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 h-12 font-medium transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Free Account
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

          {/* Social Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            onClick={handleSocialSignUp}
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Sign up with Google
          </Button>

          {/* Sign In Link */}
          <div className="text-center text-sm text-gray-300 pt-2">
            Already have an account?{' '}
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors underline focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
              onClick={handleSwitchToLogin}
            >
              Sign in
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 