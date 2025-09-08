'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader as GoogleMapsLoader } from '@googlemaps/js-api-loader'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PlacesAutocomplete from '@/components/ui/places-autocomplete'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  User, 
  MapPin, 
  Phone, 
  Briefcase, 
  FileText, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ProfileCompletionData {
  // Step 1: Profile Information
  gender: string
  genderCustom: string
  location: string
  // Structured location fields (optional)
  location_place_id?: string
  location_lat?: number | null
  location_lng?: number | null
  location_city?: string
  location_province?: string
  location_country?: string
  location_barangay?: string
  location_region?: string
  phone: string
  position: string
  bio: string
  birthday: string
  // Step 2: Work Status Information
  currentEmployer: string
  currentPosition: string
  currentSalary: string
  noticePeriod: string
  expectedSalary: string
  expectedSalaryMin: string
  expectedSalaryMax: string
  currentMood: string
  workStatus: string
  preferredShift: string
  workSetup: string
}

interface ProfileCompletionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

const steps = [
  { id: 1, title: 'Profile Info', icon: User },
  { id: 2, title: 'Work Status', icon: Briefcase },
  { id: 3, title: 'Confirmation', icon: CheckCircle }
]

export default function ProfileCompletionModal({ 
  open, 
  onOpenChange, 
  onComplete 
}: ProfileCompletionModalProps) {
  const { user, updateProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<ProfileCompletionData>({
    // Step 1: Profile Information
    gender: '',
    genderCustom: '',
    location: '',
    phone: '',
    position: '',
    bio: '',
    birthday: '',
    // Step 2: Work Status Information
    currentEmployer: '',
    currentPosition: '',
    currentSalary: '',
    noticePeriod: '',
    expectedSalary: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    currentMood: '',
    workStatus: '',
    preferredShift: '',
    workSetup: ''
  })

  const [age, setAge] = useState<number | null>(null)
  const locationInputRef = useRef<HTMLInputElement | null>(null)
  const placesAutocompleteRef = useRef<any>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // Initialize Google Places Autocomplete when modal opens and step 1 is visible
  useEffect(() => {
    const initPlaces = async () => {
      try {
        if (!open || currentStep !== 1) return
        if (placesAutocompleteRef.current) return // already initialized
        if (!locationInputRef.current) return

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.warn('Google Maps API key missing: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
          return
        }

        const loader = new GoogleMapsLoader({ apiKey, libraries: ['places'] })
        const google = await loader.load()
        if (!locationInputRef.current) return

        const autocomplete = new google.maps.places.Autocomplete(locationInputRef.current, {
          fields: ['place_id', 'formatted_address', 'address_components', 'geometry'],
          types: ['(regions)'],
          componentRestrictions: { country: 'ph' }
        })

        placesAutocompleteRef.current = autocomplete
        console.log('✅ Google Places Autocomplete attached to location input')

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (!place || !place.geometry || !place.address_components) return

          const get = (type: string) =>
            place.address_components?.find(c => c.types.includes(type))?.long_name || ''

          const province = get('administrative_area_level_2') || get('administrative_area_level_1')
          const city = get('locality') || get('administrative_area_level_3')
          const country = get('country')

          console.log('📍 Selected place', { placeId: place.place_id, province, city, country })

          handleInputChange('location', place.formatted_address || '')
          setFormData(prev => ({
            ...prev,
            location_place_id: place.place_id || '',
            location_lat: place.geometry!.location?.lat() ?? null,
            location_lng: place.geometry!.location?.lng() ?? null,
            location_city: city,
            location_province: province,
            location_country: country
          }))
        })
      } catch (e) {
        console.warn('Google Places init failed', e)
      }
    }
    // Defer to ensure the input is mounted inside the modal
    const t = setTimeout(initPlaces, 0)
    return () => clearTimeout(t)
  }, [open, currentStep])

  // Ensure Google suggestions dropdown is above modal
  useEffect(() => {
    if (typeof document === 'undefined') return
    const id = 'gm-places-zfix'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.innerHTML = `.pac-container{z-index:99999 !important;}`
    document.head.appendChild(style)
  }, [])

  // Calculate age when birthday changes
  useEffect(() => {
    if (formData.birthday) {
      const today = new Date()
      const birthDate = new Date(formData.birthday)
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      
      setAge(calculatedAge)
    } else {
      setAge(null)
    }
  }, [formData.birthday])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
         // Clear genderCustom when gender changes to something other than 'others'
     if (field === 'gender' && value !== 'others') {
       setFormData(prev => ({ ...prev, genderCustom: '' }))
       if (errors.genderCustom) {
         setErrors(prev => ({ ...prev, genderCustom: '' }))
       }
     }
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1: // Profile Information
        if (!formData.gender.trim()) {
          newErrors.gender = 'Gender is required'
                 } else if (formData.gender === 'others' && !formData.genderCustom.trim()) {
           newErrors.genderCustom = 'Please specify your gender'
         }
        if (!formData.location.trim()) {
          newErrors.location = 'Location is required'
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required'
        } else if (!/^[+]?[^\D]?[\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number'
        }
        if (!formData.position.trim()) {
          newErrors.position = 'Job position is required'
        }
        if (!formData.bio.trim()) {
          newErrors.bio = 'Bio is required'
        } else if (formData.bio.length < 10) {
          newErrors.bio = 'Bio must be at least 10 characters'
        }
        if (!formData.birthday) {
          newErrors.birthday = 'Birthday is required'
        } else {
          const birthDate = new Date(formData.birthday)
          const today = new Date()
          const minAge = 16
          const maxAge = 100
          
          if (birthDate > today) {
            newErrors.birthday = 'Birthday cannot be in the future'
          } else if (age !== null && (age < minAge || age > maxAge)) {
            newErrors.birthday = `Age must be between ${minAge} and ${maxAge} years`
          }
        }
        break
      
             case 2: // Work Status Information
         if (!formData.workStatus.trim()) {
           newErrors.workStatus = 'Work status is required'
         }
         if (!formData.currentMood.trim()) {
           newErrors.currentMood = 'Current mood is required'
         }
         if (!formData.currentEmployer.trim()) {
           newErrors.currentEmployer = 'Current employer is required'
         }
        // Removed currentPosition validation - it will use position from Step 1
         if (!formData.currentSalary.trim()) {
           newErrors.currentSalary = 'Current salary is required'
         }
                            if (!formData.expectedSalaryMin.trim() || !formData.expectedSalaryMax.trim()) {
           newErrors.expectedSalary = 'Both minimum and maximum salary are required'
         } else {
           // Combine min and max into expectedSalary for saving
           const minSalary = formData.expectedSalaryMin.trim()
           const maxSalary = formData.expectedSalaryMax.trim()
           formData.expectedSalary = `${minSalary} - ${maxSalary}`
         }
         if (!formData.noticePeriod.trim()) {
           newErrors.noticePeriod = 'Notice period is required'
         }
         if (!formData.preferredShift.trim()) {
           newErrors.preferredShift = 'Preferred shift is required'
         }
         if (!formData.workSetup.trim()) {
           newErrors.workSetup = 'Work setup is required'
         }
         break
    }

    return newErrors
  }

  const handleNext = () => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      setErrors({})
      
      // Scroll to top of the content area when transitioning to next step
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      }, 100) // Small delay to ensure the new step content is rendered
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
      
      // Scroll to top of the content area when transitioning to previous step
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      }, 100) // Small delay to ensure the new step content is rendered
    }
  }

  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    setIsLoading(true)

    try {
      // Update user profile with the additional information
      const profileUpdateData = {
        userId: user?.id,
        gender: formData.gender,
                 gender_custom: formData.gender === 'others' ? formData.genderCustom : null,
        location: formData.location,
        location_place_id: formData.location_place_id,
        location_lat: formData.location_lat,
        location_lng: formData.location_lng,
        location_city: formData.location_city,
        location_province: formData.location_province,
        location_country: formData.location_country,
        location_barangay: formData.location_barangay,
        location_region: formData.location_region,
        phone: formData.phone,
        position: formData.position,
        bio: formData.bio,
        birthday: formData.birthday,
        completed_data: true
      }

      // Update profile in Railway database
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileUpdateData),
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || 'Failed to update profile'
        throw new Error(`Failed to update profile: ${profileResponse.status} ${errorMessage}`)
      }

             // Update work status in Railway database
               const workStatusData = {
          userId: user?.id,
          currentEmployer: formData.currentEmployer,
          currentPosition: formData.position,  // Use position from Step 1
          currentSalary: formData.currentSalary,
          noticePeriod: formData.noticePeriod ? parseInt(formData.noticePeriod) : null,
          expectedSalary: formData.expectedSalary,
          currentMood: formData.currentMood,
          workStatus: formData.workStatus,
          preferredShift: formData.preferredShift,
          workSetup: formData.workSetup,
          completed_data: true
        }

      const workStatusResponse = await fetch('/api/user/work-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workStatusData),
      })

      if (!workStatusResponse.ok) {
        const errorData = await workStatusResponse.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || 'Failed to update work status'
        throw new Error(`Failed to update work status: ${workStatusResponse.status} ${errorMessage}`)
      }

      // Update Supabase metadata
      await updateProfile(profileUpdateData)

      onComplete()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ general: 'Failed to update profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

           // Work status options
    const WORK_STATUS_OPTIONS = [
      { value: 'employed', label: 'Employed', icon: '💼' },
      { value: 'unemployed-looking-for-work', label: 'Unemployed Looking for Work', icon: '🔍' },
      { value: 'freelancer', label: 'Freelancer', icon: '🆓' },
      { value: 'part-time', label: 'Part-time', icon: '⏰' },
      { value: 'on-leave', label: 'On Leave', icon: '🏖️' },
      { value: 'retired', label: 'Retired', icon: '🎯' },
      { value: 'student', label: 'Student', icon: '🎓' },
      { value: 'career-break', label: 'Career Break', icon: '⏸️' },
      { value: 'transitioning', label: 'Transitioning', icon: '🔄' },
      { value: 'remote-worker', label: 'Remote Worker', icon: '🏠' },
    ]

     const MOOD_OPTIONS = [
     { value: 'happy', label: 'Happy', icon: '😊' },
     { value: 'satisfied', label: 'Satisfied', icon: '😌' },
     { value: 'sad', label: 'Sad', icon: '😔' },
     { value: 'undecided', label: 'Undecided', icon: '🤔' }
   ]

           const SHIFT_OPTIONS = [
      { value: 'day', label: 'Day' },
      { value: 'night', label: 'Night' },
      { value: 'both', label: 'Both' }
    ]

  const WORK_SETUP_OPTIONS = [
    { value: 'Work From Office', label: 'Work From Office' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Work From Home', label: 'Work From Home' },
    { value: 'Any', label: 'Any' }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
                  case 1: // Profile Information
              return (
                <div className="space-y-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  Gender <span className="text-red-400">*</span>
                </label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/20 text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    <SelectItem value="male" className="text-white hover:bg-white/10">Male</SelectItem>
                    <SelectItem value="female" className="text-white hover:bg-white/10">Female</SelectItem>
                                         <SelectItem value="others" className="text-white hover:bg-white/10">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-400 text-xs">{errors.gender}</p>}
                
                                 {/* Custom gender input field */}
                 {formData.gender === 'others' && (
                  <div className="mt-2">
                                         <Input
                       type="text"
                       placeholder="Please specify your gender"
                       value={formData.genderCustom}
                       onChange={(e) => handleInputChange('genderCustom', e.target.value)}
                       className="h-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                     />
                    {errors.genderCustom && <p className="text-red-400 text-xs mt-1">{errors.genderCustom}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <PlacesAutocomplete
                    value={formData.location}
                    placeholder="Type city, province, municipality, or barangay"
                    onChange={(val) => handleInputChange('location', val)}
                    onSelect={(p) => {
                      handleInputChange('location', p.description)
                      setFormData(prev => ({
                        ...prev,
                        location_place_id: p.place_id,
                        location_lat: p.lat,
                        location_lng: p.lng,
                        location_city: p.city,
                        location_province: p.province,
                        location_country: p.country,
                        location_barangay: p.barangay,
                        location_region: p.region,
                      }))
                    }}
                  />
                </div>
                {errors.location && <p className="text-red-400 text-xs">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                     <Input
                     type="tel"
                     placeholder="e.g., +63 912 345 6789"
                     value={formData.phone}
                     onChange={(e) => handleInputChange('phone', e.target.value)}
                     className="pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                   />
                </div>
                {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                     <Input
                     type="text"
                     placeholder="e.g., Customer Service Representative"
                     value={formData.position}
                     onChange={(e) => handleInputChange('position', e.target.value)}
                     className="pl-10 h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                   />
                </div>
                {errors.position && <p className="text-red-400 text-xs">{errors.position}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  Birthday <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                     <Input
                     type="date"
                     value={formData.birthday}
                     onChange={(e) => handleInputChange('birthday', e.target.value)}
                     className="pl-10 h-11 bg-white/5 border-white/20 text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                   />
                </div>
                {errors.birthday && <p className="text-red-400 text-xs">{errors.birthday}</p>}
                {age !== null && <p className="text-cyan-400 text-sm">Age: {age} years old</p>}
              </div>
            </div>
            
            {/* Bio field - full width */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">
                Bio <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                 <Textarea
                   placeholder="Tell us about yourself, your experience, and career goals..."
                   value={formData.bio}
                   onChange={(e) => handleInputChange('bio', e.target.value)}
                   className="pl-10 min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none resize-none"
                 />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  {formData.bio.length}/500 characters (minimum 10 required)
                </span>
                {formData.bio.length < 10 && formData.bio.length > 0 && (
                  <span className="text-red-400">
                    At least 10 characters required
                  </span>
                )}
              </div>
              {errors.bio && <p className="text-red-400 text-xs">{errors.bio}</p>}
            </div>
          </div>
        )

                  case 2: // Work Status Information
              return (
                <div className="space-y-4 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  Work Status <span className="text-red-400">*</span>
                </label>
                                 <Select value={formData.workStatus} onValueChange={(value) => handleInputChange('workStatus', value)}>
                   <SelectTrigger className="h-11 bg-white/5 border-white/20 text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                     <SelectValue placeholder="Select your work status" />
                   </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    {WORK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.workStatus && <p className="text-red-400 text-xs">{errors.workStatus}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  Current Mood <span className="text-red-400">*</span>
                </label>
                                 <Select value={formData.currentMood} onValueChange={(value) => handleInputChange('currentMood', value)}>
                   <SelectTrigger className="h-11 bg-white/5 border-white/20 text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                     <SelectValue placeholder="How are you feeling?" />
                   </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    {MOOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currentMood && <p className="text-red-400 text-xs">{errors.currentMood}</p>}
              </div>

                             <div className="space-y-2">
                 <label className="text-sm font-medium text-white block">
                   Current Employer <span className="text-red-400">*</span>
                 </label>
                                   <Input
                    type="text"
                    placeholder="e.g., ABC Company"
                    value={formData.currentEmployer}
                    onChange={(e) => handleInputChange('currentEmployer', e.target.value)}
                    className="h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                  />
                 {errors.currentEmployer && <p className="text-red-400 text-xs">{errors.currentEmployer}</p>}
               </div>

                             <div className="space-y-2">
                 <label className="text-sm font-medium text-white block">
                   Job Title <span className="text-red-400">*</span>
                 </label>
                                   <Input
                    type="text"
                    placeholder="e.g., Senior Developer"
                    value={formData.position}  // Use position from Step 1
                    disabled={true}  // Disable the input
                    className="h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none opacity-60 cursor-not-allowed"
                  />
                 {errors.currentPosition && <p className="text-red-400 text-xs">{errors.currentPosition}</p>}
               </div>

                             <div className="space-y-2">
                 <label className="text-sm font-medium text-white block">
                   Current Salary <span className="text-red-400">*</span>
                 </label>
                                   <Input
                    type="text"
                    placeholder="e.g., ₱50,000"
                    value={formData.currentSalary}
                    onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                    className="h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                  />
                 {errors.currentSalary && <p className="text-red-400 text-xs">{errors.currentSalary}</p>}
               </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">
                    Expected Salary Range <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                                             <Input
                         type="text"
                         placeholder="₱60,000"
                         value={formData.expectedSalaryMin}
                         onChange={(e) => handleInputChange('expectedSalaryMin', e.target.value)}
                         className="h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                       />
                    </div>
                    <span className="text-white font-medium">-</span>
                    <div className="flex-1">
                                             <Input
                         type="text"
                         placeholder="₱80,000"
                         value={formData.expectedSalaryMax}
                         onChange={(e) => handleInputChange('expectedSalaryMax', e.target.value)}
                         className="h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                       />
                    </div>
                  </div>
                  {errors.expectedSalary && <p className="text-red-400 text-xs">{errors.expectedSalary}</p>}
                </div>

                             <div className="space-y-2">
                 <label className="text-sm font-medium text-white block">
                   Notice Period (Days) <span className="text-red-400">*</span>
                 </label>
                                   <Input
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.noticePeriod}
                    onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                    className="h-11 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                  />
                 {errors.noticePeriod && <p className="text-red-400 text-xs">{errors.noticePeriod}</p>}
               </div>

                                                           <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">
                    Preferred Shift <span className="text-red-400">*</span>
                  </label>
                                     <Select value={formData.preferredShift} onValueChange={(value) => handleInputChange('preferredShift', value)}>
                     <SelectTrigger className="h-11 bg-white/5 border-white/20 text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                       <SelectValue placeholder="Select preferred shift" />
                     </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      {SHIFT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.preferredShift && <p className="text-red-400 text-xs">{errors.preferredShift}</p>}
                </div>

                               <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">
                    Work Setup <span className="text-red-400">*</span>
                  </label>
                                     <Select value={formData.workSetup} onValueChange={(value) => handleInputChange('workSetup', value)}>
                     <SelectTrigger className="h-11 bg-white/5 border-white/20 text-white focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none">
                       <SelectValue placeholder="Select work setup preference" />
                     </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      {WORK_SETUP_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workSetup && <p className="text-red-400 text-xs">{errors.workSetup}</p>}
                </div>
             </div>
           </div>
         )

      case 3: // Confirmation
        return (
          <div className="space-y-6 pb-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-cyan-400" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Gender:</span>
                  <span className="text-white ml-2">{formData.gender || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white ml-2">{formData.location || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white ml-2">{formData.phone || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Job Title:</span>
                  <span className="text-white ml-2">{formData.position || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Birthday:</span>
                  <span className="text-white ml-2">{formData.birthday || 'Not specified'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-400">Bio:</span>
                  <p className="text-white mt-1">{formData.bio || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-cyan-400" />
                Work Status Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Work Status:</span>
                  <span className="text-white ml-2">{formData.workStatus || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Current Mood:</span>
                  <span className="text-white ml-2">{formData.currentMood || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Current Employer:</span>
                  <span className="text-white ml-2">{formData.currentEmployer || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Job Title:</span>
                  <span className="text-white ml-2">{formData.position || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Current Salary:</span>
                  <span className="text-white ml-2">{formData.currentSalary || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Expected Salary:</span>
                  <span className="text-white ml-2">{formData.expectedSalary || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Notice Period:</span>
                  <span className="text-white ml-2">{formData.noticePeriod ? `${formData.noticePeriod} days` : 'Not specified'}</span>
                </div>
                                 <div>
                   <span className="text-gray-400">Preferred Shift:</span>
                   <span className="text-white ml-2">{formData.preferredShift || 'Not specified'}</span>
                 </div>
                 <div>
                   <span className="text-gray-400">Work Setup:</span>
                   <span className="text-white ml-2">{formData.workSetup || 'Not specified'}</span>
                 </div>
               </div>
             </div>
           </div>
         )

      default:
        return null
    }
  }

  return (
         <Dialog open={open} onOpenChange={() => {}}>
       <DialogContent className="glass-card border-white/20 !max-w-[60vw] w-full mx-4 sm:mx-auto h-[700px] overflow-hidden flex flex-col" showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="text-center space-y-3 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold gradient-text">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Help us personalize your experience by providing some additional information
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 flex-shrink-0">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                      ? 'bg-cyan-500 border-cyan-500 text-white' 
                      : 'border-white/20 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 transition-all duration-200 ${
                    isActive ? 'text-cyan-400 font-medium' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 mt-6 transition-all duration-200 ${
                    isCompleted ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 flex flex-col px-6 overflow-y-auto profile-modal-scroll">
          {/* Step Description */}
          <div className="text-center mb-6 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white mb-2">
              {currentStep === 1 
                ? 'Additional Personal Information' 
                : currentStep === 2 
                ? 'Work Status Information'
                : 'Confirm Your Information'
              }
            </h3>
            <p className="text-sm text-gray-400">
              {currentStep === 1 
                ? 'Please provide your basic personal details to complete your profile'
                : currentStep === 2
                ? 'Share your current work situation and preferences'
                : 'Please review and confirm all your information before submitting'
              }
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex-shrink-0 px-6 pt-4 border-t border-white/10">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm text-center">{errors.general}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-400">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep === steps.length ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit & Complete
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
