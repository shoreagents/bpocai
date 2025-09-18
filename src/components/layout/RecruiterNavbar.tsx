'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface RecruiterNavbarProps {
  currentPage?: string;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

export default function RecruiterNavbar({ 
  currentPage = '', 
  onSignInClick,
  onSignUpClick 
}: RecruiterNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/recruiter' && pathname === '/recruiter') return true;
    if (path !== '/recruiter' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                BPOC Recruiter
              </span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/recruiter" className={`font-medium transition-colors duration-200 relative group ${
                isActive('/recruiter') 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-gray-700 hover:text-emerald-600'
              }`}>
                Home
                {isActive('/recruiter') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                )}
              </Link>
              <Link href="/recruiter/dashboard" className={`font-medium transition-colors duration-200 relative group ${
                isActive('/recruiter/dashboard') 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-gray-700 hover:text-emerald-600'
              }`}>
                Dashboard
                {isActive('/recruiter/dashboard') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                )}
              </Link>
              <Link href="/recruiter/post-job" className={`font-medium transition-colors duration-200 relative group ${
                isActive('/recruiter/post-job') 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-gray-700 hover:text-emerald-600'
              }`}>
                Jobs
                {isActive('/recruiter/post-job') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                )}
                {!isActive('/recruiter/post-job') && (
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-200 group-hover:w-full"></span>
                )}
              </Link>
              <Link href="/recruiter/applications" className={`font-medium transition-colors duration-200 relative group ${
                isActive('/recruiter/applications') 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-gray-700 hover:text-emerald-600'
              }`}>
                Applications
                {isActive('/recruiter/applications') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                )}
              </Link>
              <Link href="/recruiter/candidates" className={`font-medium transition-colors duration-200 relative group ${
                isActive('/recruiter/candidates') 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-gray-700 hover:text-emerald-600'
              }`}>
                Applicants
                {isActive('/recruiter/candidates') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                )}
              </Link>
              <Link href="/recruiter/analytics" className={`font-medium transition-colors duration-200 relative group ${
                isActive('/recruiter/analytics') 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-gray-700 hover:text-emerald-600'
              }`}>
                Analysis
                {isActive('/recruiter/analytics') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                )}
              </Link>
              <Link href="/recruiter/leaderboard" className={`font-medium transition-colors duration-200 relative group ${
                isActive('/recruiter/leaderboard') 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-gray-700 hover:text-emerald-600'
              }`}>
                Leaderboard
                {isActive('/recruiter/leaderboard') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                )}
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 px-4 py-2 font-medium transition-all duration-200 rounded-full"
              onClick={onSignInClick}
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 font-medium transition-all duration-200 shadow-sm rounded-full"
              onClick={onSignUpClick}
            >
              Sign Up
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 rounded-full transform hover:scale-105"
              onClick={() => router.push('/recruiter/post-job')}
            >
              🎯 Post Job
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
