'use client'

import { useState, useEffect } from 'react'
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
  ArrowLeft,
  FileText
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
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [termsLocked, setTermsLocked] = useState(false)
  const [hasReadTerms, setHasReadTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showTermsContent, setShowTermsContent] = useState(false)

  // Check if terms were accepted from the terms page
  useEffect(() => {
    const termsAccepted = sessionStorage.getItem('termsAccepted')
    const termsLocked = sessionStorage.getItem('termsLocked')
    const hasReadTerms = sessionStorage.getItem('hasReadTerms')
    
    if (termsAccepted === 'true') {
      setAgreedToTerms(true)
      sessionStorage.removeItem('termsAccepted') // Clean up
    }
    
    if (termsLocked === 'true') {
      setAgreedToTerms(true)
      setTermsLocked(true)
      setHasReadTerms(true)
      sessionStorage.removeItem('termsLocked') // Clean up
    }

    // Only set hasReadTerms to true if terms were locked (meaning they completed reading)
    // Otherwise, reset it to false to allow the error message to work
    if (termsLocked === 'true') {
      setHasReadTerms(true)
    } else {
      setHasReadTerms(false)
      sessionStorage.removeItem('hasReadTerms') // Clear it so error message can show
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTermsCheckboxClick = () => {
    if (termsLocked) return // Don't allow changes if locked
    
    if (!hasReadTerms) {
      setErrors(prev => ({ ...prev, terms: 'Please read the Terms and Conditions first before agreeing' }))
      return
    }
    
    setAgreedToTerms(!agreedToTerms)
    // Clear any existing terms error
    if (errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }))
    }
  }

  const handleTermsCheckboxChange = () => {
    // This prevents the checkbox from being checked if terms haven't been read
    if (!hasReadTerms) {
      setErrors(prev => ({ ...prev, terms: 'Please read the Terms and Conditions first before agreeing' }))
      return
    }
    
    // Only allow checkbox to be checked if terms have been read
    if (termsLocked) return // Don't allow changes if locked
    
    setAgreedToTerms(!agreedToTerms)
    // Clear any existing terms error
    if (errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }))
    }
  }

  const handleTermsLinkClick = () => {
    setShowTermsContent(true)
    setHasReadTerms(true)
    sessionStorage.setItem('hasReadTerms', 'true')
    // Clear any existing terms error when they click to read terms
    if (errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }))
    }
  }

  const handleBackToSignup = () => {
    setShowTermsContent(false)
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

    try {
      // 1) Check if email already exists in our DB first
      const existsRes = await fetch(`/api/public/users/exists?email=${encodeURIComponent(formData.email)}`)
      if (existsRes.ok) {
        const { exists } = await existsRes.json()
        if (exists) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' })
          setIsLoading(false)
          return
        }
      }

      // 2) Proceed with Supabase registration
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`
        }
      )
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' })
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setErrors({ password: 'Password should be at least 6 characters long.' })
        } else {
          setErrors({ general: error.message })
        }
      } else if (data.user) {

        setShowVerifyDialog(true)

        // Successful registration
        console.log('Registration successful:', data.user.email)
        // Show verification modal
        setShowVerifyDialog(true)
        // Optionally keep a small info banner in the sign-up form as well

        setSuccessMessage('Account created! Please verify your email to continue.')
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
      password: '',
      confirmPassword: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAgreedToTerms(false)
    setHasReadTerms(false)
    setTermsLocked(false)
    setErrors({})
    setSuccessMessage('')
    setIsLoading(false)
    
    // Clear session storage
    sessionStorage.removeItem('hasReadTerms')
    sessionStorage.removeItem('termsAccepted')
    sessionStorage.removeItem('termsLocked')
    
    // Switch to login form
    if (onSwitchToLogin) {
      onSwitchToLogin()
    }
  }

  const handleContinueToLoginFromVerify = () => {
    setShowVerifyDialog(false)
    onOpenChange(false)
    if (onSwitchToLogin) onSwitchToLogin()
  }

  return (
    <>
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
                {showTermsContent ? (
                  <>
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                    Terms and Conditions
                  </>
                ) : (
                  <>
                    <UserPlus className="w-6 h-6 sm:w-8 sm:h-8" />
                    Join BPOC.IO
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm sm:text-base">
                {showTermsContent 
                  ? "Please read and understand our terms before joining"
                  : "Start your BPO career journey with our FREE platform"
                }
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

            {/* Back Button for Terms */}
            {showTermsContent && (
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToSignup}
                  className="text-gray-400 hover:text-white flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign Up
                </Button>
              </div>
            )}

            {/* Conditional Content */}
            {showTermsContent ? (
              <TermsContent />
            ) : (
              <>
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
                    onClick={handleTermsCheckboxChange}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black ${
                      agreedToTerms 
                        ? 'bg-cyan-500 border-cyan-500' 
                        : 'border-white/20 hover:border-cyan-500'
                    } ${errors.terms ? 'border-red-500' : ''} ${termsLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    disabled={isLoading || termsLocked}
                    aria-label="Agree to terms and conditions"
                  >
                    {agreedToTerms && <CheckCircle className="w-3 h-3 text-white" />}
                  </button>
                  <label className="text-sm text-gray-300 leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="text-cyan-400 hover:text-cyan-300 underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded"
                      onClick={handleTermsLinkClick}
                    >
                      Terms and Conditions
                    </button>
                    {termsLocked && (
                      <span className="ml-2 text-xs text-green-400 font-medium">
                        ✓ Terms reviewed and accepted
                      </span>
                    )}
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
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 h-12 font-medium transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                disabled={isLoading || !agreedToTerms}
                                 title={!agreedToTerms ? 'You must agree to the Terms and Conditions' : undefined}
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
              className="w-full h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSocialSignUp}
              disabled={isLoading || !agreedToTerms}
              title={!agreedToTerms ? 'You must agree to the Terms and Conditions first' : undefined}
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
              </>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Verification Modal */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="glass-card border-white/20 max-w-md w-full mx-4 sm:mx-auto">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl font-bold text-white">Verify your email</DialogTitle>
            <DialogDescription className="text-gray-300">
              We just sent a verification link to <span className="text-white font-medium">{formData.email}</span>. Please check your inbox and confirm your email to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center mt-2">
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 underline font-medium"
              onClick={handleContinueToLoginFromVerify}
            >
              Continue to login
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Terms Content Component
function TermsContent() {
  return (
    <div className="max-h-[60vh] overflow-y-auto space-y-6 text-sm">
      {/* Platform Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Platform Information</h3>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <div className="space-y-2 text-gray-300">
            <div><strong className="text-gray-300">Platform:</strong> <span className="text-gray-100">BPOC.IO</span></div>
            <div><strong className="text-gray-300">Operated By:</strong> <span className="text-gray-100">ShoreAgents Inc.</span></div>
            <div><strong className="text-gray-300">Registration:</strong> <span className="text-gray-100">SEC CS201918140 | TIN 010-425-223-00000</span></div>
            <div><strong className="text-gray-300">Phone:</strong> <span className="text-gray-100">+61 488 845 828</span></div>
            <div><strong className="text-gray-300">Email:</strong> <span className="text-gray-100">careers@shoreagents.com</span></div>
          </div>
        </div>
      </div>

      {/* About BPOC.IO */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">About BPOC.IO</h3>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-3">BPOC.IO is ShoreAgents Inc.'s recruitment and assessment platform designed to:</p>
          <ul className="space-y-1 text-gray-300">
            <li>• <strong className="text-white">Streamline hiring</strong> for positions within ShoreAgents organization</li>
            <li>• <strong className="text-white">Evaluate candidate qualifications</strong> through AI-powered assessments</li>
            <li>• <strong className="text-white">Match talent</strong> with appropriate roles in our company</li>
            <li>• <strong className="text-white">Provide career development</strong> insights and professional growth opportunities</li>
          </ul>
          <div className="mt-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <p className="text-gray-200 font-semibold">By using BPOC.IO, you are applying for potential employment with ShoreAgents Inc.</p>
          </div>
        </div>
      </div>

      {/* Acceptance of Terms */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Acceptance of Terms</h3>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-3">By accessing, registering for, or using BPOC.IO, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.</p>
          <div className="space-y-2 text-gray-300">
            <p><strong className="text-white">You represent and warrant that:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• You are <strong className="text-white">18 years of age or older</strong></li>
              <li>• You have the <strong className="text-white">legal capacity</strong> to enter into this agreement</li>
              <li>• You are <strong className="text-white">legally eligible for employment</strong> in the Philippines</li>
              <li>• All information you provide is <strong className="text-white">accurate and complete</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Acceptable Use Policy */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Acceptable Use Policy</h3>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <div className="mb-3">
            <p className="text-gray-300 mb-2"><strong className="text-white">Permitted Uses:</strong></p>
            <div className="bg-green-600/20 p-3 rounded-lg border border-green-500/30">
              <ul className="space-y-1 text-green-300 text-xs">
                <li>✅ Complete job applications for ShoreAgents positions</li>
                <li>✅ Take skills assessments and career evaluations honestly</li>
                <li>✅ Communicate with ShoreAgents recruitment team</li>
                <li>✅ Access your assessment results and feedback</li>
              </ul>
            </div>
          </div>
          <div>
            <p className="text-gray-300 mb-2"><strong className="text-white">Prohibited Activities:</strong></p>
            <div className="bg-red-600/20 p-3 rounded-lg border border-red-500/30">
              <ul className="space-y-1 text-red-300 text-xs">
                <li>❌ Provide false, misleading, or incomplete information</li>
                <li>❌ Create multiple accounts or impersonate others</li>
                <li>❌ Use automated tools, bots, or scripts for assessments</li>
                <li>❌ Attempt to hack, disrupt, or compromise platform security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Employment Relationship */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Employment Relationship</h3>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <ul className="space-y-2 text-gray-300">
            <li>• Platform use <strong className="text-white">does not guarantee</strong> job interviews or employment offers</li>
            <li>• All hiring decisions are <strong className="text-white">at ShoreAgents' sole discretion</strong></li>
            <li>• Employment offers are subject to <strong className="text-white">additional requirements</strong> (background checks, references, etc.)</li>
            <li>• Any employment relationship will be <strong className="text-white">at-will</strong>, meaning either party may terminate at any time</li>
          </ul>
        </div>
      </div>

      {/* Acknowledgment */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Acknowledgment & Agreement</h3>
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-3 font-semibold">By using BPOC.IO, you acknowledge that:</p>
          <ul className="space-y-1 text-gray-300 text-xs">
            <li>1. You have <strong className="text-white">read and understood</strong> these Terms of Use in their entirety</li>
            <li>2. You <strong className="text-white">agree to be bound</strong> by all terms and conditions stated herein</li>
            <li>3. You understand this is a <strong className="text-white">recruitment platform for ShoreAgents employment</strong></li>
            <li>4. You will <strong className="text-white">comply with all acceptable use policies</strong> and platform rules</li>
            <li>5. You meet all <strong className="text-white">age and legal eligibility requirements</strong></li>
            <li>6. You will provide <strong className="text-white">accurate and truthful information</strong> at all times</li>
            <li>7. You understand <strong className="text-white">platform use does not guarantee employment</strong></li>
          </ul>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-gray-300 font-semibold text-xs">Your continued use of BPOC.IO constitutes ongoing acceptance of these Terms of Use.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-gray-700">
        <p className="text-gray-400 italic text-xs mb-1">These Terms of Use are binding and enforceable. By using BPOC.IO, you accept all terms and conditions outlined above.</p>
        <p className="text-gray-500 font-semibold text-xs">© 2025 ShoreAgents Inc. All rights reserved.</p>
      </div>
    </div>
  )
} 