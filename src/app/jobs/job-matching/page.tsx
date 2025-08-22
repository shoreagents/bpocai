'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  Target,
  Clock,
  DollarSign,
  BookmarkIcon,
  Building2,
  Search,
  Filter,
  X,
  FileText,
  CheckCircle,
  Star,
  Gift,
  Share2,
  Facebook,
  Linkedin,
  Mail,
  Copy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-helpers';

export default function JobMatchingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Add CSS styles for tooltip positioning and scrolling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .match-tooltip {
        position: fixed !important;
        z-index: 999999 !important;
        max-height: 24rem !important;
        overflow-y: auto !important;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        pointer-events: auto !important;
      }
      .match-tooltip::-webkit-scrollbar {
        width: 6px;
      }
      .match-tooltip::-webkit-scrollbar-track {
        background: transparent;
      }
      .match-tooltip::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }
      .match-tooltip::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<any | null>(null);
  const [shareJobId, setShareJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isShiftFilterOpen, setIsShiftFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [isGetStartedDialogOpen, setIsGetStartedDialogOpen] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationType, setApplicationType] = useState<'success' | 'error' | 'info'>('success');
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});
  // Use Header's auth modals by toggling URL search params
  const shareRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const shiftFilterRef = useRef<HTMLDivElement>(null);
  const pageSelectorRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 6;

  // Open job modal if arrived via shared URL /jobs/[id] -> /jobs/job-matching?jobId=XYZ
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const jobId = params.get('jobId')
      if (jobId) {
        setSelectedJob(jobId)
      }
    } catch {}
  }, [])

  // Close share dropdown, filter dropdown, and page selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareJobId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (shiftFilterRef.current && !shiftFilterRef.current.contains(event.target as Node)) {
        setIsShiftFilterOpen(false);
      }
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(event.target as Node)) {
        setIsPageSelectorOpen(false);
      }
      // Close match tooltip when clicking outside
      if (showMatchTooltip && !(event.target as Element).closest('.match-tooltip')) {
        setShowMatchTooltip(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShareJobId(null);
        setIsFilterOpen(false);
        setIsPageSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [jobs, setJobs] = useState<any[]>([])
  const [matchScores, setMatchScores] = useState<{[key: string]: any}>({})
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [showMatchTooltip, setShowMatchTooltip] = useState<string | null>(null)

  // Fetch jobs and calculate match scores
  useEffect(() => {
    (async () => {
      try {
        // Public endpoint for active jobs (no auth required)
        const res = await fetch('/api/jobs/active', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load jobs')
        const data = await res.json()
        const active = data.jobs || []
        const mapped = active.map((row: any) => ({
          id: row.id,
          company: row.company,
          companyLogo: row.companyLogo || '🏢',
          postedDays: row.postedDays ?? 0,
          title: row.title,
          employmentType: row.employmentType || [],
          salary: row.salary || '',
          location: '',
          matchPercentage: 0, // Will be updated with real scores
          // NEW FIELDS - All requested database fields
          priority: row.priority,
          work_arrangement: row.work_arrangement,
          shift: row.shift,
          industry: row.industry,
          department: row.department,
          application_deadline: row.application_deadline,
          experience_level: row.experience_level,
          work_type: row.work_type,
          // details will be loaded on demand
          description: '',
          responsibilities: [],
          qualifications: [],
          perks: []
        }))
        setJobs(mapped)

        // Calculate match scores for each job if user is logged in
        if (user?.id) {
          setIsLoadingMatches(true)
          const scores: {[key: string]: any} = {}
          for (const job of mapped) {
            try {
              const matchRes = await fetch(`/api/jobs/match?userId=${user.id}&jobId=${job.id}`)
              if (matchRes.ok) {
                const matchData = await matchRes.json()
                scores[job.id] = {
                  score: matchData.matchScore ?? 75, // Default to 75% if score is undefined
                  reasoning: matchData.reasoning || 'Analysis completed',
                  breakdown: matchData.breakdown || {}
                }
              } else {
                // Fallback to a reasonable score instead of 0
                scores[job.id] = { score: 75, reasoning: 'Using default score', breakdown: {} }
              }
            } catch (error) {
              console.error('Error fetching match score for job:', job.id, error)
              scores[job.id] = { score: 0, reasoning: 'Network error', breakdown: {} }
            }
          }
          setMatchScores(scores)
          setIsLoadingMatches(false)
        }
      } catch (e) {
        console.error('Error loading jobs:', e)
        setJobs([])
      }
    })()
  }, [user?.id])

  // Refresh match scores when user changes
  useEffect(() => {
    if (user?.id && jobs.length > 0) {
      (async () => {
        setIsLoadingMatches(true)
        const scores: {[key: string]: any} = {}
        for (const job of jobs) {
          try {
            const matchRes = await fetch(`/api/jobs/match?userId=${user.id}&jobId=${job.id}`)
            if (matchRes.ok) {
              const matchData = await matchRes.json()
              scores[job.id] = {
                score: matchData.matchScore,
                reasoning: matchData.reasoning,
                breakdown: matchData.breakdown
              }
            } else {
              scores[job.id] = { score: 0, reasoning: 'Analysis failed', breakdown: {} }
            }
          } catch (error) {
            console.error('Error fetching match score for job:', job.id, error)
            scores[job.id] = { score: 0, reasoning: 'Network error', breakdown: {} }
          }
        }
        setMatchScores(scores)
        setIsLoadingMatches(false)
      })()
    }
  }, [user?.id, jobs])

  // Load full job details when a job is selected (public endpoint so logged-out users can view)
  useEffect(() => {
    (async () => {
      if (!selectedJob) { setSelectedJobDetails(null); return }
      try {
        const res = await fetch(`/api/jobs/active/${selectedJob}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load job details')
        const data = await res.json()
        setSelectedJobDetails(data.job || null)
      } catch (e) {
        setSelectedJobDetails(null)
      }
    })()
  }, [selectedJob])

  

  // No placeholder fallback; show message when empty

  const handleJobClick = (jobId: string) => {
    setSelectedJob(jobId);
  };

  const handleShare = (platform: string, job: any) => {
    const jobUrl = `${window.location.origin}/jobs/${job.id}`;
    const message = `Check out this amazing job opportunity at ${job.company}: ${job.title}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Job Opportunity: ${job.title}`)}&body=${encodeURIComponent(message + '\n\n' + jobUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(jobUrl);
        break;
    }
    setShareJobId(null);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (percentage >= 80) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (percentage >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (percentage >= 60) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 90) return `${percentage}% Match`;
    if (percentage >= 80) return `${percentage}% Match`;
    if (percentage >= 70) return `${percentage}% Match`;
    if (percentage >= 60) return `${percentage}% Match`;
    return "Not Recommended";
  };

  const getWorkType = (job: any) => {
    // Mock work type based on company
    const workTypes: { [key: string]: string } = {
      'Amazon': 'remote',
      'Google': 'hybrid',
      'Microsoft': 'onsite',
      'Shopee': 'remote',
      'Accenture': 'onsite',
      'Concentrix': 'hybrid',
      'Netflix': 'remote',
      'Spotify': 'hybrid'
    };
    return workTypes[job.company] || 'onsite';
  };

  const getWorkTypeLabel = (workType: string) => {
    const labels: { [key: string]: string } = {
      'all': 'All Work Types',
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site'
    };
    return labels[workType] || workType;
  };

  const getShiftLabel = (shift: string) => {
    const labels: { [key: string]: string } = {
      'all': 'All Shifts',
      'day': 'Day Shift',
      'night': 'Night Shift'
    };
    return labels[shift] || shift;
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to page 1 when search changes
  };

  const handleFilterChange = (workType: string) => {
    setFilterWorkType(workType);
    setIsFilterOpen(false);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleShiftFilterChange = (shift: string) => {
    setFilterShift(shift);
    setIsShiftFilterOpen(false);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const triggerHeaderSignUp = () => {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('signup', 'true')
      // Use client router to notify App Router hooks
      router.replace(url.pathname + url.search)
    } catch {}
  }

  const handleSignIn = () => {
    triggerHeaderSignUp()
  };

  const handleGetStarted = () => {
    triggerHeaderSignUp()
  };

  const list = jobs

  const filteredJobs = useMemo(() => {
    let filtered = list.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Work type filter
      const matchesWorkType = filterWorkType === 'all' || getWorkType(job) === filterWorkType;
      
      // Shift filter
      const matchesShift = filterShift === 'all' || job.shift === filterShift;
      
      return matchesSearch && matchesWorkType && matchesShift;
    });

    // Sort by match percentage if user is logged in and match scores are available
    if (user?.id && Object.keys(matchScores).length > 0) {
      filtered.sort((a, b) => {
        const scoreA = matchScores[a.id]?.score || 0;
        const scoreB = matchScores[b.id]?.score || 0;
        return scoreB - scoreA; // Sort by highest match first
      });
    }

    return filtered;
  }, [searchTerm, filterWorkType, filterShift, list, user?.id, matchScores]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredJobs.length / itemsPerPage);
  }, [filteredJobs.length, itemsPerPage]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredJobs.slice(start, end);
  }, [currentPage, filteredJobs, itemsPerPage]);

  const selectedJobData = selectedJob ? list.find(job => job.id === selectedJob) : null;

  // Check applications using the same API as "My Applications" page
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id || jobs.length === 0) return
      
      try {
        const response = await fetch(`/api/applications?userId=${user?.id}`, { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          const applications = data.applications || []
          
          // Create a set of applied job IDs
          const appliedJobIds = new Set(applications.map((app: any) => String(app.jobId)))
          
          // Check each job against applied jobs
          const results: Record<string, boolean> = {}
          for (const job of jobs) {
            results[job.id] = appliedJobIds.has(String(job.id))
          }
          
          setAppliedMap(results)
        } else {
          console.error('Failed to fetch applications:', response.status)
          // Reset all to not applied
          const results: Record<string, boolean> = {}
          for (const job of jobs) results[job.id] = false
          setAppliedMap(results)
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
        // Reset all to not applied
        const results: Record<string, boolean> = {}
        for (const job of jobs) results[job.id] = false
        setAppliedMap(results)
      }
    }

    fetchApplications()
  }, [user?.id, jobs.length])

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-400 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Job Matching</h1>
                  <p className="text-gray-400">AI-powered job recommendations for you</p>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                
                {/* Work Type Filter */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm flex items-center gap-2 min-w-[140px] justify-between hover:bg-white/20 transition-colors"
                  >
                    <span>{getWorkTypeLabel(filterWorkType)}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50">
                      {['all', 'remote', 'hybrid', 'onsite'].map((workType) => (
                        <button
                          key={workType}
                          onClick={() => handleFilterChange(workType)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            filterWorkType === workType ? 'bg-cyan-500/20 text-cyan-400' : 'text-white'
                          }`}
                        >
                          {getWorkTypeLabel(workType)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shift Filter */}
                <div className="relative" ref={shiftFilterRef}>
                  <button
                    onClick={() => setIsShiftFilterOpen(!isShiftFilterOpen)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm flex items-center gap-2 min-w-[120px] justify-between hover:bg-white/20 transition-colors"
                  >
                    <span>{getShiftLabel(filterShift)}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isShiftFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50">
                      {['all', 'day', 'night'].map((shift) => (
                        <button
                          key={shift}
                          onClick={() => handleShiftFilterChange(shift)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            filterShift === shift ? 'bg-purple-500/20 text-purple-400' : 'text-white'
                          }`}
                        >
                          {getShiftLabel(shift)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>
                  {totalPages > 1 
                    ? `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, filteredJobs.length)} of ${filteredJobs.length} jobs`
                    : user?.id 
                      ? `Showing ${filteredJobs.length} jobs matched to your profile`
                      : `Showing ${filteredJobs.length} active jobs`
                  }
                </span>
                <span>
                  {totalPages > 1 
                    ? `Page ${currentPage} of ${totalPages}` 
                    : user?.id && Object.keys(matchScores).length > 0
                      ? 'Sorted by match percentage'
                      : 'Sign in to see personalized matches'
                  }
                </span>
              </div>
            </div>
          </motion.div>

          {/* Job Cards */}
          {filteredJobs.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No active jobs</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="glass-card border-white/10 hover:border-purple-400/30 h-full transition-all duration-300 cursor-pointer"
                  onClick={() => handleJobClick(job.id)}
                >
                  <CardHeader className="pb-4">
                    {/* Company and Actions */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">{job.companyLogo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-white">{job.company}</p>
                            <p className="text-xs text-gray-400">{job.postedDays} days ago</p>
                          </div>
                          {/* Priority Badge next to company name */}
                          {job.priority && (
                            <Badge 
                              className={`px-2 py-0.5 text-xs font-semibold ml-2 ${
                                job.priority === 'urgent' ? 'bg-red-600/20 text-red-400 border-red-600/30' :
                                job.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                job.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-green-500/20 text-green-300 border-green-500/30'
                              }`}
                            >
                              {job.priority === 'urgent' ? '🚨' : job.priority === 'high' ? '⚡' : job.priority === 'medium' ? '⚠️' : '✅'} {job.priority?.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                                             <div className="flex items-center gap-1">
                         <div className="relative" ref={shareJobId === job.id ? shareRef : null}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareJobId(shareJobId === job.id ? null : job.id);
                            }}
                            className="text-gray-400 hover:text-white"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          
                          {shareJobId === job.id && (
                            <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50 min-w-[160px]">
                              <div className="py-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare('facebook', job);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                >
                                  <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">f</span>
                                  </div>
                                  Facebook
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare('linkedin', job);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                >
                                  <Linkedin className="w-4 h-4 text-blue-500" />
                                  LinkedIn
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare('email', job);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                >
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  Email
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare('copy', job);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                >
                                  <Copy className="w-4 h-4 text-gray-400" />
                                  Copy link
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h2 className="text-xl font-bold text-white mb-2">
                      {job.title}
                    </h2>

                    {/* Employment Type + Work Info Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.employmentType
                        .filter((type: string) => type.toLowerCase() !== 'full-time')
                        .map((type: string, idx: number) => (
                        <Badge 
                          key={idx}
                          className="bg-white/10 text-gray-300 border-white/20 px-2 py-1 text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                      
                      {/* Work Arrangement Badge */}
                      {job.work_arrangement && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-2 py-1 text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {job.work_arrangement === 'onsite' ? 'Onsite' : 
                           job.work_arrangement === 'remote' ? 'Remote' : 
                           job.work_arrangement === 'hybrid' ? 'Hybrid' : 
                           job.work_arrangement}
                        </Badge>
                      )}

                      {/* Shift Badge */}
                      {job.shift && (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-2 py-1 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.shift === 'day' ? 'Day' : 'Night'}
                        </Badge>
                      )}
                    </div>

                    {/* Match Percentage */}
                    <div className="mb-4">
                      {!user?.id ? (
                        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-3 py-1 text-sm">
                          Sign in to see match
                        </Badge>
                      ) : isLoadingMatches ? (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-sm animate-pulse">
                          AI Analyzing...
                        </Badge>
                      ) : matchScores[job.id] !== undefined ? (
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            {matchScores[job.id].error ? (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1 text-sm">
                                AI Failed
                              </Badge>
                            ) : (
                                                             <Badge className={`${getMatchColor(matchScores[job.id].score)} px-3 py-1 text-sm`}>
                                 {getMatchLabel(matchScores[job.id].score)}
                               </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-white w-4 h-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMatchTooltip(showMatchTooltip === job.id ? null : job.id);
                              }}
                            >
                              <Info className="w-3 h-3" />
                            </Button>
                          </div>
                          
                                                     {/* Match Tooltip */}
                           {showMatchTooltip === job.id && (
                             <div 
                               className="match-tooltip fixed w-80 bg-gray-800 border border-white/20 rounded-lg shadow-2xl z-[999999] p-4 max-h-96 overflow-y-auto"
                               style={{
                                 left: '50%',
                                 top: '50%',
                                 transform: 'translate(-50%, -50%)',
                                 maxWidth: 'calc(100vw - 2rem)',
                                 width: '20rem'
                               }}
                             >
                              <div className="flex items-center justify-between mb-2 sticky top-0 bg-gray-800 py-1">
                                <h4 className="text-sm font-medium text-white">AI Match Analysis</h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMatchTooltip(null);
                                  }}
                                  className="text-gray-400 hover:text-white w-6 h-6 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {/* Match Breakdown */}
                              {matchScores[job.id].breakdown && Object.keys(matchScores[job.id].breakdown).length > 0 && (
                                <div className="mb-3">
                                  <h5 className="text-xs font-medium text-gray-300 mb-2">Match Breakdown:</h5>
                                  <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(matchScores[job.id].breakdown).map(([key, value]) => (
                                      <div key={key} className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 capitalize">
                                          {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="text-xs font-medium text-white">{value}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* AI Reasoning */}
                              {matchScores[job.id].reasoning && (
                                <div>
                                  <h5 className="text-xs font-medium text-gray-300 mb-2">AI Reasoning:</h5>
                                  <p className="text-xs text-gray-300 leading-relaxed">
                                    {matchScores[job.id].reasoning}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-3 py-1 text-sm">
                          No match data
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Salary */}
                    <div className="flex items-center text-green-400 font-semibold">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-white text-sm">{job.salary}</span>
                    </div>

                    {/* Application Deadline - Bottom */}
                    {job.application_deadline && (
                      <div className="flex items-center text-xs text-gray-400 pt-1">
                        <Clock className="w-3 h-3 mr-1.5 text-red-400 flex-shrink-0" />
                        <span>Apply by {new Date(job.application_deadline).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    )}

                    {/* Quick Apply Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job.id);
                      }}
                                             disabled={
                         appliedMap[job.id] || 
                         (user?.id && matchScores[job.id]?.score !== undefined && matchScores[job.id].score < 60)
                       }
                    >
                                             {appliedMap[job.id] 
                         ? 'Already Applied' 
                         : (user?.id && matchScores[job.id]?.score !== undefined && matchScores[job.id].score < 60)
                           ? 'Not Recommended'
                           : 'View & Apply'
                       }
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between mt-8 py-4"
            >
              {/* Left side - Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {/* Show first few pages, ellipsis, and last page if needed */}
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page 
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" 
                        : "border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      {page}
                    </Button>
                  ))
                ) : (
                  // Show condensed version with ellipsis
                  <>
                    {[1, 2, 3].map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page 
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" 
                          : "border-white/20 text-white hover:bg-white/10"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                    
                    {currentPage > 4 && totalPages > 7 && (
                      <span className="text-gray-400 px-2">...</span>
                    )}
                    
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={currentPage === totalPages 
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" 
                        : "border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Right side - Page selector */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Page</span>
                <div className="relative" ref={pageSelectorRef}>
                  <button
                    onClick={() => setIsPageSelectorOpen(!isPageSelectorOpen)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm flex items-center gap-2 min-w-[60px] justify-between hover:bg-white/20 transition-colors"
                  >
                    <span>{currentPage}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isPageSelectorOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            setIsPageSelectorOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors min-w-[60px] ${
                            currentPage === page ? 'bg-cyan-500/20 text-cyan-400' : 'text-white'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-gray-400 text-sm">of {totalPages}</span>
              </div>
            </motion.div>
          )}



          {/* Job Details Modal */}
          {selectedJob && selectedJobData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedJob(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl max-w-5xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 h-[80vh]">
                  {/* Selected Job Card - Left Side */}
                  <div className="relative p-6 border-r border-white/10 overflow-y-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedJob(null)}
                      className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white bg-black/50 hover:bg-black/70 rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="pr-16">
                      {/* Company and Save */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">{selectedJobData.companyLogo}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white text-xl">{selectedJobData.company}</p>
                            <p className="text-gray-400">{selectedJobData.postedDays} days ago</p>
                          </div>
                        </div>
                        
                        
                      </div>

                      {/* Job Title */}
                      <h2 className="text-3xl font-bold text-white mb-6">
                        {selectedJobData.title}
                      </h2>

                      {/* Job Details */}
                      <div className="space-y-4 mb-8">
                        {/* Industry */}
                        {selectedJobData.industry && (
                          <div className="flex items-center text-gray-300">
                            <Target className="w-6 h-6 mr-4 text-orange-400" />
                            <div>
                              <span className="text-sm text-gray-400">Industry:</span>
                              <span className="ml-2 font-medium text-lg">{selectedJobData.industry}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Department */}
                        {selectedJobData.department && (
                          <div className="flex items-center text-gray-300">
                            <FileText className="w-6 h-6 mr-4 text-cyan-400" />
                            <div>
                              <span className="text-sm text-gray-400">Department:</span>
                              <span className="ml-2 font-medium text-lg">{selectedJobData.department}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Applicants */}
                        <div className="flex items-center text-gray-300">
                          <span className="text-sm">Applicants:</span>
                          <span className="ml-2 font-medium">{(selectedJobDetails?.applicants ?? 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Match Percentage */}
                      <div className="mb-6">
                        {!user?.id ? (
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-3 py-1 text-sm">
                            Sign in to see match
                          </Badge>
                        ) : isLoadingMatches ? (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-sm animate-pulse">
                            AI Analyzing...
                          </Badge>
                        ) : matchScores[selectedJobData.id] !== undefined ? (
                          matchScores[selectedJobData.id].error ? (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1 text-sm">
                              AI Failed
                            </Badge>
                          ) : (
                                                         <Badge className={`${getMatchColor(matchScores[selectedJobData.id].score)} px-3 py-1 text-sm`}>
                               {getMatchLabel(matchScores[selectedJobData.id].score)}
                             </Badge>
                          )
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 px-3 py-1 text-sm">
                            No match data
                          </Badge>
                        )}
                      </div>

                      {/* AI Match Analysis */}
                      {user?.id && matchScores[selectedJobData.id] && !isLoadingMatches && (
                        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                          <h3 className="text-lg font-semibold text-white mb-3">
                            {matchScores[selectedJobData.id].error ? 'AI Analysis Error' : 'AI Match Analysis'}
                          </h3>
                          
                          {matchScores[selectedJobData.id].error ? (
                            <div className="text-red-400 text-sm">
                              <p className="mb-2">Failed to analyze job match. This could be due to:</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Missing API configuration</li>
                                <li>Insufficient user or job data</li>
                                <li>API rate limiting</li>
                                <li>Network connectivity issues</li>
                              </ul>
                              <p className="mt-2 text-xs text-gray-400">
                                Error: {matchScores[selectedJobData.id].reasoning}
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Match Breakdown */}
                              {matchScores[selectedJobData.id].breakdown && Object.keys(matchScores[selectedJobData.id].breakdown).length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-sm font-medium text-gray-300 mb-2">Match Breakdown:</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(matchScores[selectedJobData.id].breakdown).map(([key, value]) => (
                                      <div key={key} className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400 capitalize">
                                          {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="text-sm font-medium text-white">{value}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* AI Reasoning */}
                              {matchScores[selectedJobData.id].reasoning && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-2">AI Reasoning:</h4>
                                  <p className="text-sm text-gray-300 leading-relaxed">
                                    {matchScores[selectedJobData.id].reasoning}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                                              {/* Apply Button */}
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 text-lg py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                                                     disabled={
                             appliedMap[selectedJobData.id] || 
                             (user?.id && matchScores[selectedJobData.id]?.score !== undefined && matchScores[selectedJobData.id].score < 60)
                           }
                          onClick={async () => {
                          try {
                            if (!user) { triggerHeaderSignUp(); return }
                            const token = await getSessionToken()
                            if (!token) { triggerHeaderSignUp(); return }
                            const chk = await fetch('/api/user/saved-resumes', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
                            const j = await chk.json()
                            if (!chk.ok || !j?.hasSavedResume) { 
                              setApplicationMessage('You must have a resume first before applying');
                              setApplicationType('info');
                              setShowApplicationDialog(true);
                              router.push('/resume-builder')
                              return 
                            }
                            const resp = await fetch('/api/user/applications', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ jobId: selectedJobData.id, resumeId: j.id || j.resumeId, resumeSlug: j.resumeSlug })
                            })
                            if (!resp.ok) throw new Error('Failed to submit application')
                                                          setApplicationMessage('Application submitted successfully!');
                              setApplicationType('success');
                              setShowApplicationDialog(true);
                              // Update local state to reflect application
                              setAppliedMap(prev => ({ ...prev, [selectedJobData.id]: true }));
                          } catch (err) {
                            console.error(err)
                            setApplicationMessage('Could not apply. Please try again.');
                            setApplicationType('error');
                            setShowApplicationDialog(true);
                          }
                        }}
                                                >
                                                         {appliedMap[selectedJobData.id] 
                               ? 'Already Applied' 
                               : (user?.id && matchScores[selectedJobData.id]?.score !== undefined && matchScores[selectedJobData.id].score < 60)
                                 ? 'Not Recommended'
                                 : 'Apply now'
                             }
                          </Button>
                    </div>
                  </div>

                  {/* Job Details - Right Side */}
                  <div className="p-6 overflow-y-auto max-h-full">
                    <div className="space-y-6 pb-6">
                      {/* Job Description */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="flex items-center gap-3 text-white text-xl font-semibold mb-4">
                          <FileText className="h-6 w-6 text-cyan-400" />
                          Job Description
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg">{selectedJobDetails?.job_description || selectedJobData.description}</p>
                      </div>

                      {/* Responsibilities */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="flex items-center gap-3 text-white text-xl font-semibold mb-4">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          Responsibilities
                        </h3>
                          <ul className="space-y-4">
                            {Array.isArray(selectedJobDetails?.responsibilities) && selectedJobDetails.responsibilities.length > 0
                              ? selectedJobDetails.responsibilities.map((responsibility: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-4 text-gray-300">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                                    <span className="text-lg">{responsibility}</span>
                                  </li>
                                ))
                              : (selectedJobData.responsibilities || []).map((responsibility: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-4 text-gray-300">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
                                    <span className="text-lg">{responsibility}</span>
                                  </li>
                                ))}
                          </ul>
                      </div>

                      {/* Qualifications */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="flex items-center gap-3 text-white text-xl font-semibold mb-4">
                          <Star className="h-6 w-6 text-yellow-400" />
                          Qualifications & Requirements
                        </h3>
                          <ul className="space-y-4">
                            {Array.isArray(selectedJobDetails?.requirements) && selectedJobDetails.requirements.length > 0
                              ? selectedJobDetails.requirements.map((qualification: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-4 text-gray-300">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0"></div>
                                    <span className="text-lg">{qualification}</span>
                                  </li>
                                ))
                              : (selectedJobData.qualifications || []).map((qualification: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-4 text-gray-300">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0"></div>
                                    <span className="text-lg">{qualification}</span>
                                  </li>
                                ))}
                          </ul>
                      </div>

                      {/* Perks & Benefits */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="flex items-center gap-3 text-white text-xl font-semibold mb-4">
                          <Gift className="h-6 w-6 text-pink-400" />
                          Perks & Benefits
                        </h3>
                          <ul className="space-y-4">
                            {Array.isArray(selectedJobDetails?.benefits) && selectedJobDetails.benefits.length > 0
                              ? selectedJobDetails.benefits.map((perk: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-4 text-gray-300">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-3 flex-shrink-0"></div>
                                    <span className="text-lg">{perk}</span>
                                  </li>
                                ))
                              : (selectedJobData.perks || []).map((perk: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-4 text-gray-300">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-3 flex-shrink-0"></div>
                                    <span className="text-lg">{perk}</span>
                                  </li>
                                ))}
                          </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Auth handled by Header via URL search param (?signup=true) */}
        </div>
      </div>

      {/* Application Status Alert Dialog */}
      <AlertDialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {applicationType === 'success' ? 'Application Submitted!' : 
               applicationType === 'error' ? 'Application Error' : 'Information'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {applicationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowApplicationDialog(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 