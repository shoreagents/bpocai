'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Eye, 
  MessageCircle, 
  Download, 
  Calendar, 
  User,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Clock3,
  TrendingUp,
  Users,
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft,
  DollarSign,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ApplicantsPage() {
  const router = useRouter();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState('jobs'); // 'jobs' or 'applicants'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  
  // Status editing states
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch real job data from database
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch active jobs with applicants
        const response = await fetch('/api/jobs/active', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load jobs');
        
        const data = await response.json();
        const jobsWithApplicants = (data.jobs || [])
          .filter((job: any) => (job.applicants ?? 0) > 0)
          .map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location || 'Remote',
            type: job.employmentType?.[0] || 'Full-time',
            salary: job.salary || 'Not specified',
            postedDate: new Date(job.created_at || Date.now()).toISOString().split('T')[0],
            applicationsCount: job.applicants || 0,
            status: job.status || 'active',
            description: job.description || 'No description available',
            requirements: job.requirements || [],
            priority: job.priority || 'medium',
            application_deadline: job.application_deadline,
            experience_level: job.experience_level,
            work_arrangement: job.work_arrangement,
            industry: job.industry,
            department: job.department,
            // Mock applicants data for now - you can replace this with real API call later
            applicants: generateMockApplicants(job.applicants || 0)
          }));
        
        setJobs(jobsWithApplicants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Generate mock applicants data based on job applicants count
  const generateMockApplicants = (count: number) => {
    const mockApplicants = [
      {
        id: 1,
        candidateName: 'Sarah Johnson',
        appliedDate: '2024-01-15',
        status: 'pending',
        experience: '5 years',
        skills: ['Customer Service', 'CRM', 'Communication', 'Problem Solving'],
        rating: 4.8,
        coverLetter: 'I am excited to apply for this position...',
        lastActivity: '2 hours ago'
      },
      {
        id: 2,
        candidateName: 'John Smith',
        appliedDate: '2024-01-14',
        status: 'reviewed',
        experience: '4 years',
        skills: ['Customer Service', 'Sales', 'Communication'],
        rating: 4.5,
        coverLetter: 'I have extensive experience in this field...',
        lastActivity: '1 day ago'
      },
      {
        id: 3,
        candidateName: 'Emily Davis',
        appliedDate: '2024-01-13',
        status: 'interviewed',
        experience: '6 years',
        skills: ['Customer Service', 'CRM', 'Team Leadership'],
        rating: 4.7,
        coverLetter: 'With my leadership experience...',
        lastActivity: '3 hours ago'
      },
      {
        id: 4,
        candidateName: 'Michael Chen',
        appliedDate: '2024-01-12',
        status: 'pending',
        experience: '3 years',
        skills: ['Technical Support', 'JavaScript', 'Customer Service'],
        rating: 4.6,
        coverLetter: 'I have a strong background in technical support...',
        lastActivity: '4 hours ago'
      },
      {
        id: 5,
        candidateName: 'Lisa Rodriguez',
        appliedDate: '2024-01-11',
        status: 'reviewed',
        experience: '2 years',
        skills: ['Technical Support', 'Python', 'Communication'],
        rating: 4.4,
        coverLetter: 'I am passionate about helping customers...',
        lastActivity: '2 days ago'
      }
    ];

    // Return a subset based on the actual applicant count
    return mockApplicants.slice(0, Math.min(count, mockApplicants.length));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock3 className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'interviewed': return <MessageCircle className="h-4 w-4" />;
      case 'hired': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleJobClick = async (job: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real applicants for this job
      const response = await fetch(`/api/recruiter/applicants?jobId=${job.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load applicants');
      
      const data = await response.json();
      const realApplicants = (data.applications || []).map((app: any) => ({
        id: app.id,
        candidateName: app.user?.full_name || app.user?.email || 'Applicant',
        appliedDate: new Date(app.created_at).toISOString().split('T')[0],
        status: app.status || 'submitted',
        experience: 'Not specified', // This would need to be fetched from user profile
        skills: [], // This would need to be fetched from user profile
        rating: 4.5, // This would need to be calculated or fetched
        coverLetter: 'Cover letter not available', // This would need to be fetched
        lastActivity: new Date(app.created_at).toLocaleDateString(),
        email: app.user?.email,
        position: app.user?.position,
        location: app.user?.location,
        avatar_url: app.user?.avatar_url,
        resume_slug: app.resume_slug,
        resume_title: app.resume_title
      }));
      
      // Update the job with real applicants
      const updatedJob = {
        ...job,
        applicants: realApplicants
      };
      
      setSelectedJob(updatedJob);
      setViewMode('applicants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToJobs = () => {
    setViewMode('jobs');
    setSelectedJob(null);
  };

  // Status editing functions
  const handleStatusEdit = (applicationId: string, currentStatus: string) => {
    setEditingStatus(applicationId);
    setTempStatus(currentStatus);
  };

  const handleStatusSave = async (applicationId: string) => {
    try {
      setUpdatingStatus(applicationId);
      
      const response = await fetch('/api/recruiter/applicants', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId,
          status: tempStatus
        })
      });

      if (response.ok) {
        // Update local state
        if (selectedJob) {
          const updatedJob = {
            ...selectedJob,
            applicants: selectedJob.applicants.map((app: any) => 
              app.id === applicationId 
                ? { ...app, status: tempStatus }
                : app
            )
          };
          setSelectedJob(updatedJob);
        }
        
        setEditingStatus(null);
        setTempStatus('');
        // You could add a toast notification here
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStatusCancel = () => {
    setEditingStatus(null);
    setTempStatus('');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredApplicants = selectedJob ? selectedJob.applicants.filter(app => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Calculate stats from real data
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicationsCount, 0);
  const pendingApplicants = jobs.reduce((sum, job) => 
    sum + job.applicants.filter((app: any) => app.status === 'pending').length, 0
  );
  const interviewedApplicants = jobs.reduce((sum, job) => 
    sum + job.applicants.filter((app: any) => app.status === 'interviewed').length, 0
  );
  const hiredApplicants = jobs.reduce((sum, job) => 
    sum + job.applicants.filter((app: any) => app.status === 'hired').length, 0
  );

  const stats = [
    { label: 'Total Applicants', value: totalApplicants.toLocaleString(), change: '+12%', changeType: 'positive' },
    { label: 'Pending Review', value: pendingApplicants.toString(), change: '-5%', changeType: 'negative' },
    { label: 'Interviewed', value: interviewedApplicants.toString(), change: '+8%', changeType: 'positive' },
    { label: 'Hired This Month', value: hiredApplicants.toString(), change: '+15%', changeType: 'positive' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-red-600 text-lg font-medium">Error loading applicants</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Recruiter Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
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
                <Link href="/recruiter" className="text-gray-700 hover:text-emerald-600 font-medium">Home</Link>
                <Link href="/recruiter/dashboard" className="text-gray-700 hover:text-emerald-600 font-medium">Dashboard</Link>
                <Link href="/recruiter/post-job" className="text-gray-700 hover:text-emerald-600 font-medium">Jobs</Link>
                <Link href="/recruiter/applications" className="text-emerald-600 font-medium border-b-2 border-emerald-600">Applicants</Link>
                <Link href="/recruiter/candidates" className="text-gray-700 hover:text-emerald-600 font-medium">Applicants</Link>
                <Link href="/recruiter/analytics" className="text-gray-700 hover:text-emerald-600 font-medium">Analysis</Link>
                <Link href="/recruiter/leaderboard" className="text-gray-700 hover:text-emerald-600 font-medium">Leaderboard</Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 px-4 py-2 font-medium transition-all duration-200 rounded-full"
                onClick={() => setShowSignInModal(true)}
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 font-medium transition-all duration-200 shadow-sm rounded-full"
                onClick={() => setShowSignUpModal(true)}
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              {viewMode === 'jobs' ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-900">Job Applicants</h1>
                  <p className="mt-1 text-sm text-gray-600">Select a job to view its applicants</p>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBackToJobs}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Applicants</span>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedJob?.title}</h1>
                    <p className="mt-1 text-sm text-gray-600">{selectedJob?.company} • {selectedJob?.applicationsCount} applicants</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex items-center text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                <Input
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 !bg-white border-2 border-emerald-200 text-gray-900 placeholder-black focus:border-emerald-500 focus:ring-emerald-500/50 focus:ring-[3px] focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50 focus-visible:ring-[3px] shadow-md hover:border-emerald-300 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-gray-400 transition-colors min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-gray-400 transition-colors min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on view mode */}
        {viewMode === 'jobs' ? (
          /* Jobs List */
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleJobClick(job)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {job.type}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 text-xs border-green-200">
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">{job.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {job.postedDate}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">{job.applicationsCount}</div>
                      <div className="text-sm text-gray-600 mb-3">Applicants</div>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        View Applicants
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Applicants List */
          <div className="space-y-4">
            {filteredApplicants.map((application) => (
              <Card key={application.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {application.avatar_url ? (
                          <img 
                            src={application.avatar_url} 
                            alt={application.candidateName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          application.candidateName.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{application.candidateName}</h3>
                          <div className="flex items-center space-x-2">
                            {editingStatus === application.id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={tempStatus}
                                  onChange={(e) => setTempStatus(e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                  <option value="submitted">Submitted</option>
                                  <option value="qualified">Qualified</option>
                                  <option value="for verification">For Verification</option>
                                  <option value="verified">Verified</option>
                                  <option value="initial interview">Initial Interview</option>
                                  <option value="final interview">Final Interview</option>
                                  <option value="not qualified">Not Qualified</option>
                                  <option value="passed">Passed</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="withdrawn">Withdrawn</option>
                                  <option value="hired">Hired</option>
                                  <option value="closed">Closed</option>
                                </select>
                                <button
                                  onClick={() => handleStatusSave(application.id)}
                                  disabled={updatingStatus === application.id}
                                  className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                                >
                                  {updatingStatus === application.id ? (
                                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  onClick={handleStatusCancel}
                                  className="p-1 text-gray-600 hover:text-gray-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                                  {getStatusIcon(application.status)}
                                  <span className="capitalize">{application.status}</span>
                                </Badge>
                                <button
                                  onClick={() => handleStatusEdit(application.id, application.status)}
                                  className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          {application.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{application.email}</span>
                            </div>
                          )}
                          {application.position && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{application.position}</span>
                            </div>
                          )}
                          {application.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{application.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied {application.appliedDate}</span>
                          </div>
                        </div>
                        {application.resume_title && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                            <FileText className="h-4 w-4" />
                            <span>{application.resume_title}</span>
                          </div>
                        )}
                        {application.skills && application.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {application.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Placeholder for resume functionality
                          console.log('Resume clicked for:', application.candidateName);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Placeholder for profile functionality
                          console.log('Profile clicked for:', application.candidateName);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Placeholder for message functionality
                          console.log('Message clicked for:', application.candidateName);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((viewMode === 'jobs' && filteredJobs.length === 0) || (viewMode === 'applicants' && filteredApplicants.length === 0)) && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {viewMode === 'jobs' ? 'No jobs found' : 'No applicants found'}
              </h3>
              <p className="text-gray-600">
                {viewMode === 'jobs' ? 'Try adjusting your search criteria.' : 'Try adjusting your search criteria or filters.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Detail Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review candidate information and applicant details
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {selectedApplication.candidateName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedApplication.candidateName}</h3>
                  <p className="text-lg text-gray-700">{selectedApplication.position}</p>
                  <p className="text-gray-600">{selectedApplication.company}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedApplication.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedApplication.rating}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(selectedApplication.status)} flex items-center space-x-1`}>
                  {getStatusIcon(selectedApplication.status)}
                  <span className="capitalize">{selectedApplication.status}</span>
                </Badge>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{selectedApplication.candidateName.toLowerCase().replace(' ', '.')}@email.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+63 912 345 6789</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedApplication.coverLetter}</p>
                </div>
              </div>

              {/* Application Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Application Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                      <p className="text-xs text-gray-500">{selectedApplication.appliedDate}</p>
                    </div>
                  </div>
                  {selectedApplication.status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Application Reviewed</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  )}
                  {selectedApplication.status === 'interviewed' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interview Scheduled</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
              Close
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Candidate
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign In Modal */}
      <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Enter your credentials to access your recruiter account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input type="email" placeholder="Enter your email" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input type="password" placeholder="Enter your password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignInModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSignInModal(false)}>
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up</DialogTitle>
            <DialogDescription>
              Create your recruiter account to get started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <Input placeholder="Enter your company name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input type="email" placeholder="Enter your email" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input type="password" placeholder="Create a password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignUpModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSignUpModal(false)}>
              Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
