'use client'

import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    console.log('AdminRouteGuard state:', { isAdmin, loading })
    // Only redirect if we're not loading and we're definitely not an admin
    // Add a small delay to prevent race conditions during page reload
    if (!loading && !isAdmin) {
      console.log('Redirecting to home page - not an admin')
      const timer = setTimeout(() => {
        router.push('/')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-2 text-gray-300">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 