'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Building,
  Calendar,
  Star,
  X,
  MoreVertical,
  LogOut,
  ChevronDown,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface JobApplication {
  id: string;
  jobId: string;
  resumeId: string;
  resumeSlug: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  status: 'submitted' | 'qualified' | 'for verification' | 'verified' | 'initial interview' | 'final interview' | 'not qualified' | 'passed' | 'rejected' | 'withdrawn' | 'hired' | 'closed';
  appliedDate: string;
  lastUpdated: string;
  jobDescription?: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  workArrangement?: string;
  experienceLevel?: string;
  industry?: string;
  department?: string;
  applicationDeadline?: string;
}

const statusConfig = {
  submitted: { 
    label: 'Submitted', 
    description: 'Your application has been successfully submitted and is awaiting review',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', 
    icon: Clock 
  },
  qualified: { 
    label: 'Qualified', 
    description: 'Your application has passed initial screening and is under review',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
    icon: Eye 
  },
  'for verification': { 
    label: 'For Verification', 
    description: 'Your application is being verified for accuracy and completeness',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', 
    icon: AlertCircle 
  },
  verified: { 
    label: 'Verified', 
    description: 'Your application has been verified and is ready for next steps',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 
    icon: CheckCircle 
  },
  'initial interview': { 
    label: 'Initial Interview', 
    description: 'You have been selected for an initial interview with the company',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', 
    icon: CheckCircle 
  },
  'final interview': { 
    label: 'Final Interview', 
    description: 'You have advanced to the final interview round',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', 
    icon: CheckCircle 
  },
  'not qualified': { 
    label: 'Not Qualified', 
    description: 'Your application did not meet the requirements for this position',
    color: 'bg-red-500/20 text-red-400 border-red-500/30', 
    icon: XCircle 
  },
  passed: { 
    label: 'Passed', 
    description: 'Congratulations! You have successfully passed the evaluation',
    color: 'bg-green-500/20 text-green-400 border-green-500/30', 
    icon: Star 
  },
  rejected: { 
    label: 'Rejected', 
    description: 'Your application was not selected for this position',
    color: 'bg-red-500/20 text-red-400 border-red-500/30', 
    icon: XCircle 
  },
  withdrawn: { 
    label: 'Withdrawn', 
    description: 'You have withdrawn your application for this position',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', 
    icon: XCircle 
  },
  closed: {
    label: 'Closed',
    description: 'This application is closed because the job has been closed.',
    color: 'bg-gray-600/20 text-gray-300 border-gray-600/30',
    icon: XCircle
  },
  hired: { 
    label: 'Hired', 
    description: 'Congratulations! You have been hired for this position',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 
    icon: Star 
  }
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.dropdown-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log('🔄 Fetching applications for user:', user?.id);
        setLoading(true);
        
        const response = await fetch(`/api/applications?userId=${user?.id}`);
        console.log('📡 API response status:', response.status);
        console.log('📡 API response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📋 API response data:', data);
          console.log('🔍 Status values in applications:', data.applications?.map((app: JobApplication) => ({ id: app.id, status: app.status, jobTitle: app.jobTitle })));
          setApplications(data.applications || []);
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch applications:', response.status, errorText);
          setApplications([]);
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchApplications();
    } else {
      console.log('⚠️ No user ID available');
    }
  }, [user?.id]);

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      console.warn('⚠️ Unknown status:', status);
    }
    return config ? config.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      console.warn('⚠️ Unknown status:', status);
    }
    return config ? config.color : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusLabel = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      console.warn('⚠️ Unknown status:', status);
      return status; // Return the raw status if not found
    }
    return config.label;
  };

  const getStatusDescription = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) {
      console.warn('⚠️ Unknown status:', status);
      return 'Status information not available'; // Return default description if not found
    }
    return config.description;
  };

  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      if (response.ok) {
        // Update the local state to reflect the withdrawn status
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'withdrawn' as const }
            : app
        ));
        setOpenMenuId(null); // Close the menu
      } else {
        console.error('Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your applications</h2>
          <Button onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Briefcase className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">My Applications</h1>
                  <p className="text-gray-400">Track your job applications and their status</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto space-y-6">
            {/* Filter Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <label htmlFor="status-filter" className="text-white font-medium">
                  Filter by Status:
                </label>
              </div>
              <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/10 min-w-[200px] justify-between"
                  >
                    {selectedStatus === 'all' 
                      ? `All Applications (${applications.length})`
                      : `${getStatusLabel(selectedStatus)} (${applications.filter(app => app.status === selectedStatus).length})`
                    }
                    <ChevronDown className="w-3 h-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-white/10 text-white">
                  <DropdownMenuLabel>Application Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={selectedStatus === 'all' ? 'bg-white/20' : ''}
                    onClick={() => setSelectedStatus('all')}
                  >
                    All Applications ({applications.length})
                  </DropdownMenuItem>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const count = applications.filter(app => app.status === status).length;
                    if (count === 0) return null;
                    return (
                      <DropdownMenuItem
                        key={status}
                        className={selectedStatus === status ? 'bg-white/20' : ''}
                        onClick={() => setSelectedStatus(status)}
                      >
                        {config.label} ({count})
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Applications List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your applications...</p>
                </div>
              ) : filteredApplications.length === 0 ? (
                <Card className="glass-card border-white/10 text-center py-16">
                  <CardContent>
                    <Briefcase className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-white mb-3">No applications found</h3>
                    <p className="text-gray-400 mb-8 text-lg">
                      {selectedStatus === 'all' 
                        ? "You haven't applied to any jobs yet. Start your job search by browsing available positions!"
                        : `No applications with status "${getStatusLabel(selectedStatus)}" found.`
                      }
                    </p>
                    <Button 
                      onClick={() => router.push('/jobs/job-matching')} 
                      className="w-full max-w-md bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 text-lg py-4"
                    >
                      Browse Available Jobs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredApplications.map((application, index) => {
                  const StatusIcon = getStatusIcon(application.status);
                  return (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-semibold text-white">{application.jobTitle}</h3>
                                <Badge className={getStatusColor(application.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {getStatusLabel(application.status)}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* 3-Dots Menu */}
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpenMenuId(openMenuId === application.id ? null : application.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              
                              {/* Dropdown Menu */}
                              {openMenuId === application.id && (
                                <div className="dropdown-menu absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                                  <div className="py-1">
                                    {application.status !== 'withdrawn' && application.status !== 'hired' && application.status !== 'rejected' && (
                                      <button
                                        onClick={() => withdrawApplication(application.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                                      >
                                        <LogOut className="h-4 w-4" />
                                        Withdraw Application
                                      </button>
                                    )}
                                    {application.status === 'withdrawn' && (
                                      <div className="px-4 py-2 text-sm text-gray-500">
                                        Application Withdrawn
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Description */}
                          <div className="mb-3">
                            <p className="text-sm text-gray-300 italic">
                              {getStatusDescription(application.status)}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>{application.companyName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>ID: {application.id.slice(0, 8)}...</span>
                            </div>
                          </div>
                          
                          {application.jobDescription && (
                            <div className="mt-4">
                              <p className="text-gray-300 text-sm line-clamp-2">
                                {application.jobDescription}
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Description
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedApplication.jobTitle}</h2>
                <p className="text-gray-400">{selectedApplication.companyName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedApplication(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Job Description */}
                {selectedApplication.jobDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Job Description</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedApplication.jobDescription}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedApplication.requirements && selectedApplication.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Responsibilities</h3>
                    <ul className="space-y-2">
                      {selectedApplication.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Qualifications & Requirements */}
                {selectedApplication.requirements && selectedApplication.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Qualifications & Requirements</h3>
                    <ul className="space-y-2">
                      {selectedApplication.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Perks & Benefits */}
                {selectedApplication.benefits && selectedApplication.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Perks & Benefits</h3>
                    <ul className="space-y-2">
                      {selectedApplication.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  {selectedApplication.workArrangement && (
                    <div>
                      <span className="text-sm text-gray-400">Work Arrangement:</span>
                      <p className="text-white font-medium">{selectedApplication.workArrangement}</p>
                    </div>
                  )}
                  {selectedApplication.experienceLevel && (
                    <div>
                      <span className="text-sm text-gray-400">Experience Level:</span>
                      <p className="text-white font-medium">{selectedApplication.experienceLevel}</p>
                    </div>
                  )}
                  {selectedApplication.industry && (
                    <div>
                      <span className="text-sm text-gray-400">Industry:</span>
                      <p className="text-white font-medium">{selectedApplication.industry}</p>
                    </div>
                  )}
                  {selectedApplication.department && (
                    <div>
                      <span className="text-sm text-gray-400">Department:</span>
                      <p className="text-white font-medium">{selectedApplication.department}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
