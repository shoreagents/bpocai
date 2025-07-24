'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RedirectHandler() {
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // Check if we're on localhost with an access token (wrong redirect)
      if (window.location.hostname === 'localhost' && window.location.hash.includes('access_token')) {
        console.log('Detected OAuth redirect to wrong localhost URL, handling...')
        
        try {
          // Let Supabase handle the hash fragment automatically
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session from URL:', error)
            return
          }

          if (data.session) {
            console.log('Session established successfully')
            
            // Determine correct redirect URL
            const isLocalDev = window.location.port === '3000'
            const correctUrl = isLocalDev 
              ? 'http://localhost:3000'
              : process.env.NEXT_PUBLIC_SITE_URL || 'https://bpocai-production.up.railway.app'
            
            // Only redirect if we're not already on the correct URL
            if (window.location.origin !== correctUrl) {
              console.log(`Redirecting to correct URL: ${correctUrl}`)
              window.location.href = correctUrl
            }
          }
        } catch (err) {
          console.error('Error handling OAuth redirect:', err)
        }
      }
    }

    handleOAuthRedirect()
  }, [])

  return null // This component doesn't render anything
} 