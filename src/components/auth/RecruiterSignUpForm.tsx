'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Building2
} from 'lucide-react'

interface RecruiterSignUpFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToLogin?: () => void
}

export default function RecruiterSignUpForm({ open, onOpenChange, onSwitchToLogin }: RecruiterSignUpFormProps) {
  const { signInWithGoogle, signUp } = useAuth()
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
    console.log('Form submitted with data:', formData)
    setErrors({})
    setSuccessMessage('')
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors)
      setErrors(validationErrors)
      return
    }

    console.log('Starting signup process...')
    setIsLoading(true)
    
    // Set flag to indicate this is a recruiter sign-up flow
    sessionStorage.setItem('recruiterSignupFlow', 'true')

    try {
      // 1) Check if email already exists in user_recruiter table
      const existsRes = await fetch(`/api/recruiter/signup?email=${encodeURIComponent(formData.email)}`)
      if (existsRes.ok) {
        const { exists } = await existsRes.json()
        if (exists) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' })
          setIsLoading(false)
          return
        }
      }

      // 2) Proceed with Supabase registration using AuthContext
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          admin_level: 'recruiter'
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
        // 3) Create recruiter in users table with admin_level = 'recruiter'
        try {
          console.log('🔄 Creating recruiter in database with data:', {
            id: data.user.id,
            email: data.user.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            location: 'Not specified',
            completed_data: false
          })

          const recruiterResponse = await fetch('/api/recruiter/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              full_name: `${formData.firstName} ${formData.lastName}`,
              location: 'Not specified',
              completed_data: false
            })
          })

          const recruiterResult = await recruiterResponse.json()
          console.log('📋 Recruiter API response:', recruiterResult)

          if (!recruiterResponse.ok) {
            console.error('❌ Failed to create recruiter in database:', recruiterResult)
            const errorMessage = recruiterResult.details || recruiterResult.error || 'Unknown error'
            setErrors({ general: `Failed to create recruiter account: ${errorMessage}` })
            setIsLoading(false)
            return
          }

          console.log('✅ Recruiter created successfully in database')
          
          // Add a small delay to ensure the database operation completes
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (recruiterError) {
          console.error('❌ Error creating recruiter:', recruiterError)
          setErrors({ general: 'Failed to create recruiter account. Please try again.' })
          setIsLoading(false)
          return
        }

        setSuccessMessage('Recruiter account created successfully! Please sign in to continue.')
        
        // Close the sign up modal and show sign in modal
        setTimeout(() => {
          onOpenChange(false)
          if (onSwitchToLogin) {
            onSwitchToLogin()
          }
        }, 2000) // Give user time to read the success message
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
      
      // For sign-up flow, redirect to Google OAuth with a signup flag
      console.log('🔄 Starting Google OAuth sign-up flow')
      
      // Set a flag in sessionStorage to indicate this is a sign-up flow
      sessionStorage.setItem('googleOAuthFlow', 'signup')
      
      // Close the sign-up modal
      onOpenChange(false)
      
      // Start Google OAuth flow
      const { error } = await signInWithGoogle()
      
      if (error) {
        console.error('Google sign up error:', error)
        setErrors({ general: 'Failed to sign up with Google. Please try again.' })
        // Clear the flag on error
        sessionStorage.removeItem('googleOAuthFlow')
      }
      // Note: On success, user will be redirected to callback URL
      
    } catch (error) {
      console.error('Google sign up error:', error)
      setErrors({ general: 'An error occurred during Google sign up.' })
      // Clear the flag on error
      sessionStorage.removeItem('googleOAuthFlow')
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
    setErrors({})
    setSuccessMessage('')
    setIsLoading(false)
    
    // Switch to login form
    if (onSwitchToLogin) {
      onSwitchToLogin()
    }
  }


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl" data-recruiter-modal="true">
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
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Create Recruiter Account
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Join our platform and start finding the best talent
              </DialogDescription>
            </DialogHeader>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm text-center">{successMessage}</p>
              </div>
            )}

            {/* General Error Display */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm text-center">{errors.general}</p>
              </div>
            )}

            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500  ${
                        errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      disabled={isLoading}
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500  ${
                        errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      disabled={isLoading}
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="john.smith@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500  ${
                      errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>



                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500  ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500  ${
                        errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <span className="text-gray-500 cursor-not-allowed underline">
                      Terms and Conditions
                    </span>{' '}
                    and{' '}
                    <span className="text-gray-500 cursor-not-allowed underline">
                      Privacy Policy
                    </span>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
                )}

                {/* Sign In Link */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    onClick={handleSwitchToLogin}
                  >
                    Already have an account? Sign in
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

    </>
  )
}
