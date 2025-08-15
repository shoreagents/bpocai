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
  Star
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
  status: 'submitted' | 'screened' | 'for verification' | 'verified' | 'initial interview' | 'final interview' | 'failed' | 'passed' | 'rejected' | 'withdrawn' | 'hired';
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
  submitted: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  screened: { label: 'Screened', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Eye },
  'for verification': { label: 'For Verification', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertCircle },
  verified: { label: 'Verified', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: CheckCircle },
  'initial interview': { label: 'Initial Interview', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: CheckCircle },
  'final interview': { label: 'Final Interview', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  passed: { label: 'Passed', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Star },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
  hired: { label: 'Hired', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Star }
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

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
              <label htmlFor="status-filter" className="text-white font-medium">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              >
                <option value="all" className="bg-gray-800 text-white">All Applications ({applications.length})</option>
                {Object.entries(statusConfig).map(([status, config]) => {
                  const count = applications.filter(app => app.status === status).length;
                  if (count === 0) return null;
                  return (
                    <option key={status} value={status} className="bg-gray-800 text-white">
                      {config.label} ({count})
                    </option>
                  );
                })}
              </select>
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
                <Card className="glass-card border-white/10 text-center py-12">
                  <CardContent>
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
                    <p className="text-gray-400 mb-4">
                      {selectedStatus === 'all' 
                        ? "You haven't applied to any jobs yet. Start your job search by browsing available positions!"
                        : `No applications with status "${getStatusLabel(selectedStatus)}" found.`
                      }
                    </p>
                    <div className="space-y-3">
                      <Button onClick={() => router.push('/jobs/job-matching')} className="w-full">
                        Browse Available Jobs
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/jobs/active')} 
                        className="w-full"
                      >
                        View Active Job Postings
                      </Button>
                    </div>
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
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-semibold text-white">{application.jobTitle}</h3>
                                <Badge className={getStatusColor(application.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {getStatusLabel(application.status)}
                                </Badge>
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
                                      // Show full description in alert for now
                                      alert(application.jobDescription);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Full Description
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
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
    </div>
  );
}
