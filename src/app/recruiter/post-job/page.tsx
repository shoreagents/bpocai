'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  FileText,
  ArrowLeft,
  Plus,
  Briefcase,
  User,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface JobCard {
  id: string;
  originalId: string;
  title: string;
  description: string;
  industry: string;
  department: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  status: 'processed' | 'inactive' | 'active' | 'closed';
  company: string;
  created_at: string;
  source_table: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [createJobForm, setCreateJobForm] = useState({
    job_title: '',
    job_description: '',
    industry: '',
    department: '',
    work_type: 'full-time',
    work_arrangement: 'onsite',
    experience_level: 'entry-level',
    salary_min: '',
    salary_max: '',
    currency: 'PHP',
    salary_type: 'monthly',
    application_deadline: '',
    priority: 'medium',
    shift: 'day',
    company_id: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    benefits: [] as string[],
    skills: [] as string[]
  });
  const [editJobForm, setEditJobForm] = useState({
    job_title: '',
    job_description: '',
    industry: '',
    department: '',
    work_type: 'full-time',
    work_arrangement: 'onsite',
    experience_level: 'entry-level',
    salary_min: '',
    salary_max: '',
    currency: 'PHP',
    salary_type: 'monthly',
    application_deadline: '',
    priority: 'medium',
    shift: 'day',
    company_id: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    benefits: [] as string[],
    skills: [] as string[]
  });
  const [companies, setCompanies] = useState<Array<{company_id: string, company: string}>>([]);

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  // Debug: Log companies state changes
  useEffect(() => {
    console.log('Companies state updated:', companies);
  }, [companies]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/recruiter/companies');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched companies:', data.companies);
        setCompanies(data.companies || []);
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recruiter/jobs');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched jobs:', data.jobs);
        setJobs(data.jobs || []);
      } else {
        console.error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    // Debug logging
    if (searchTerm) {
      console.log('Search term:', searchTerm);
      console.log('Job title:', job.title);
      console.log('Job company:', job.company);
      console.log('Matches search:', matchesSearch);
      console.log('Matches status:', matchesStatus);
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processed': return 'Processed';
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  const formatSalary = (min: number, max: number) => {
    return `₱${min.toLocaleString()} - ₱${max.toLocaleString()}`;
  };

  const handleJobClick = (job: JobCard) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  const handleCreateJob = async () => {
    try {
      const response = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createJobForm,
          salary_min: parseInt(createJobForm.salary_min) || 0,
          salary_max: parseInt(createJobForm.salary_max) || 0,
          application_deadline: createJobForm.application_deadline || null,
        }),
      });

      if (response.ok) {
        setShowCreateJobModal(false);
        setCreateJobForm({
          job_title: '',
          job_description: '',
          industry: '',
          department: '',
          work_type: 'full-time',
          work_arrangement: 'onsite',
          experience_level: 'entry-level',
          salary_min: '',
          salary_max: '',
          currency: 'PHP',
          salary_type: 'monthly',
          application_deadline: '',
          priority: 'medium',
          shift: 'day',
          company_id: '',
          requirements: [],
          responsibilities: [],
          benefits: [],
          skills: []
        });
        fetchJobs(); // Refresh the jobs list
      } else {
        console.error('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const addArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits' | 'skills', value: string) => {
    if (value.trim()) {
      setCreateJobForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits' | 'skills', index: number) => {
    setCreateJobForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleEditJob = () => {
    if (selectedJob) {
      // Populate edit form with selected job data
      setEditJobForm({
        job_title: selectedJob.title,
        job_description: selectedJob.description,
        industry: selectedJob.industry || '',
        department: selectedJob.department || '',
        work_type: 'full-time', // Default since not in JobCard interface
        work_arrangement: selectedJob.experienceLevel === 'mid-level' ? 'onsite' : 'remote', // Infer from experience
        experience_level: selectedJob.experienceLevel,
        salary_min: selectedJob.salaryMin.toString(),
        salary_max: selectedJob.salaryMax.toString(),
        currency: 'PHP', // Default
        salary_type: 'monthly', // Default
        application_deadline: '',
        priority: 'medium', // Default
        shift: 'day', // Default
        company_id: '', // Default
        requirements: [], // Default empty arrays
        responsibilities: [],
        benefits: [],
        skills: []
      });
      setShowJobModal(false);
      setShowEditJobModal(true);
    }
  };

  const handleUpdateJob = async () => {
    if (!selectedJob) return;
    
    try {
      const response = await fetch(`/api/recruiter/jobs/${selectedJob.originalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editJobForm,
          salary_min: parseInt(editJobForm.salary_min) || 0,
          salary_max: parseInt(editJobForm.salary_max) || 0,
          application_deadline: editJobForm.application_deadline || null,
        }),
      });

      if (response.ok) {
        setShowEditJobModal(false);
        fetchJobs(); // Refresh the jobs list
      } else {
        console.error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const addEditArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits' | 'skills', value: string) => {
    if (value.trim()) {
      setEditJobForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeEditArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits' | 'skills', index: number) => {
    setEditJobForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

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
                <Link href="/recruiter/post-job" className="text-emerald-600 font-medium border-b-2 border-emerald-600">Jobs</Link>
                <Link href="/recruiter/applications" className="text-gray-700 hover:text-emerald-600 font-medium">Applications</Link>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Request</h1>
              <p className="text-gray-600">Create and track your job requests</p>
            </div>
                 <div className="flex space-x-3">
                   <Button 
                     className="bg-emerald-600 hover:bg-emerald-700 text-white"
                     onClick={() => setShowCreateJobModal(true)}
                   >
                     <Plus className="h-4 w-4 mr-2" />
                     New Request
                   </Button>
                 </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex-1 relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                   <Input
                     placeholder="Search jobs..."
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
                <option value="processed">Processed</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card 
                key={job.id} 
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <CardContent className="p-6">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <Badge className={`text-xs px-2 py-1 ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  {/* Job Details */}
                  <div className="space-y-3">
                    {/* Company */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Company:</span>
                      <span className="ml-1">{job.company || 'Not Specified'}</span>
                    </div>

                    {/* Industry */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Industry:</span>
                      <span className="ml-1">{job.industry || 'Not Specified'}</span>
                    </div>

                    {/* Department */}
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Department:</span>
                      <span className="ml-1">{job.department || 'Not Specified'}</span>
                    </div>

                    {/* Experience Level */}
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Experience:</span>
                      <span className="ml-1 capitalize">{job.experienceLevel.replace('-', ' ')}</span>
                    </div>

                    {/* Salary Range */}
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">Salary Range:</span>
                      <span className="ml-1">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No jobs found</div>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Sign In Modal */}
      <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Recruiter Sign In
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Access your recruiter dashboard and manage your talent pipeline
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Simple Sign In Form */}
            <form className="space-y-4">
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                />
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
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => {
                    setShowSignInModal(false);
                    setShowSignUpModal(true);
                  }}
                >
                  Don't have an account? Create one
                </button>
              </div>
            </form>
          </div>

          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowSignInModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
              onClick={() => {
                setShowSignInModal(false);
                // Mock successful login - redirect to recruiter dashboard
                router.push('/recruiter/dashboard');
              }}
            >
              Sign In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Create Recruiter Account
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Join our platform and start finding the best talent
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Sign Up Form */}
            <form className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signupFirstName" className="block text-sm font-medium text-gray-900 mb-1">
                    First Name
                  </label>
                  <input
                    id="signupFirstName"
                    type="text"
                    required
                    placeholder="John"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="signupLastName" className="block text-sm font-medium text-gray-900 mb-1">
                    Last Name
                  </label>
                  <input
                    id="signupLastName"
                    type="text"
                    required
                    placeholder="Smith"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address
                </label>
                <input
                  id="signupEmail"
                  type="email"
                  required
                  placeholder="john.smith@company.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Company Field */}
              <div>
                <label htmlFor="signupCompany" className="block text-sm font-medium text-gray-900 mb-1">
                  Company
                </label>
                <input
                  id="signupCompany"
                  type="text"
                  required
                  placeholder="TechCorp Solutions"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Position Field */}
              <div>
                <label htmlFor="signupPosition" className="block text-sm font-medium text-gray-900 mb-1">
                  Position/Title
                </label>
                <input
                  id="signupPosition"
                  type="text"
                  required
                  placeholder="Senior Talent Acquisition Manager"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <input
                  id="signupPassword"
                  type="password"
                  required
                  placeholder="Create a password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => {
                    setShowSignUpModal(false);
                    setShowSignInModal(true);
                  }}
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          </div>

          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowSignUpModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
              onClick={() => {
                setShowSignUpModal(false);
                // Mock successful signup - redirect to recruiter dashboard
                router.push('/recruiter/dashboard');
              }}
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Details Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="!max-w-[75vw] sm:!max-w-[75vw] bg-white border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div></div>
                  <Badge className={`text-sm px-3 py-1 ${getStatusColor(selectedJob.status)}`}>
                    Status: {getStatusLabel(selectedJob.status)}
                  </Badge>
                </div>
                <DialogTitle className="text-3xl font-bold text-gray-900 mt-4">
                  {selectedJob.title}
                </DialogTitle>
              </DialogHeader>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-blue-800">Total Applicants</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-800">Interviews Scheduled</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-800">Offers Made</div>
                  </CardContent>
                </Card>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Left Column: Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Company:</span>
                        <span className="ml-2 text-gray-900">{selectedJob.company}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Work Type:</span>
                        <span className="ml-2 text-gray-900">Full-time</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Work Arrangement:</span>
                        <span className="ml-2 text-gray-900 capitalize">
                          {selectedJob.experienceLevel === 'mid-level' ? 'Onsite' : 'Remote'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Experience & Salary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Salary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Experience Level:</span>
                        <span className="ml-2 text-gray-900 capitalize">
                          {selectedJob.experienceLevel.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Salary Range:</span>
                        <span className="ml-2 text-gray-900">
                          {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Currency:</span>
                        <span className="ml-2 text-gray-900">PHP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="text-sm font-medium text-gray-600">Salary Type:</span>
                        <span className="ml-2 text-gray-900">Monthly</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-1">•</span>
                      <span>Bachelor's degree in Accounting, Finance, or related field</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-1">•</span>
                      <span>Minimum 2 years of bookkeeping experience, real estate industry preferred</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-1">•</span>
                      <span>Proficiency in accounting software (QuickBooks, Xero)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-1">•</span>
                      <span>Strong knowledge of Philippine accounting standards and tax regulations</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={closeJobModal}>
                  Close
                </Button>
                     <Button 
                       className="bg-emerald-600 hover:bg-emerald-700"
                       onClick={handleEditJob}
                     >
                       Edit Job
                     </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Applicants
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Recruiter Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  BPOC Recruiter
                </span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                The leading platform for BPO talent acquisition. Connect with 15,000+ pre-screened professionals and find your perfect hire in minutes.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-emerald-400">For Recruiters</h3>
              <ul className="space-y-3">
                <li><Link href="/recruiter/dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/recruiter/post-job" className="text-gray-300 hover:text-emerald-400 transition-colors">Post a Job</Link></li>
                <li><Link href="/recruiter/candidates" className="text-gray-300 hover:text-emerald-400 transition-colors">Browse Candidates</Link></li>
                <li><Link href="/recruiter/analytics" className="text-gray-300 hover:text-emerald-400 transition-colors">Analytics</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-emerald-400">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/recruiter/help" className="text-gray-300 hover:text-emerald-400 transition-colors">Help Center</Link></li>
                <li><Link href="/recruiter/contact" className="text-gray-300 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/recruiter/faq" className="text-gray-300 hover:text-emerald-400 transition-colors">FAQ</Link></li>
                <li><Link href="/recruiter/tutorials" className="text-gray-300 hover:text-emerald-400 transition-colors">Tutorials</Link></li>
                <li><Link href="/recruiter/api" className="text-gray-300 hover:text-emerald-400 transition-colors">API Docs</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <div className="text-sm text-gray-400">
              © 2025 BPOC Recruiter. All rights reserved.
            </div>
          </div>
        </div>
           </footer>

           {/* Create Job Modal */}
           <Dialog open={showCreateJobModal} onOpenChange={setShowCreateJobModal}>
             <DialogContent className="!max-w-[75vw] sm:!max-w-[75vw] bg-white border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle className="text-2xl font-bold text-gray-900">Create New Job Request</DialogTitle>
                 <DialogDescription className="text-gray-600">
                   Fill out the details below to create a new job posting
                 </DialogDescription>
               </DialogHeader>

               <div className="space-y-6">
                 {/* Basic Information */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Job Title *</label>
                     <input
                       type="text"
                       value={createJobForm.job_title}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, job_title: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                       placeholder="e.g., Customer Service Representative"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Company *</label>
                     <select
                       value={createJobForm.company_id}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, company_id: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       required
                       style={{ zIndex: 50 }}
                     >
                       <option value="" className="text-gray-900">Select a company</option>
                       {companies.map((company) => (
                         <option key={company.company_id} value={company.company_id} className="text-gray-900 bg-white">
                           {company.company}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Industry</label>
                     <input
                       type="text"
                       value={createJobForm.industry}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, industry: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                       placeholder="e.g., BPO, Healthcare, Finance"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Department</label>
                     <input
                       type="text"
                       value={createJobForm.department}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, department: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                       placeholder="e.g., Customer Support, Sales"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Work Type</label>
                     <select
                       value={createJobForm.work_type}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, work_type: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="full-time" className="text-gray-900 bg-white">Full-time</option>
                       <option value="part-time" className="text-gray-900 bg-white">Part-time</option>
                       <option value="contract" className="text-gray-900 bg-white">Contract</option>
                       <option value="temporary" className="text-gray-900 bg-white">Temporary</option>
                     </select>
                   </div>
                 </div>

                 {/* Job Description */}
                 <div>
                   <label className="block text-sm font-medium text-gray-900 mb-2">Job Description *</label>
                   <textarea
                     value={createJobForm.job_description}
                     onChange={(e) => setCreateJobForm(prev => ({ ...prev, job_description: e.target.value }))}
                     rows={4}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                     placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                   />
                 </div>

                 {/* Work Details */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Work Arrangement</label>
                     <select
                       value={createJobForm.work_arrangement}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, work_arrangement: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="onsite" className="text-gray-900 bg-white">Onsite</option>
                       <option value="remote" className="text-gray-900 bg-white">Remote</option>
                       <option value="hybrid" className="text-gray-900 bg-white">Hybrid</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Experience Level</label>
                     <select
                       value={createJobForm.experience_level}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, experience_level: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="entry-level" className="text-gray-900 bg-white">Entry Level</option>
                       <option value="mid-level" className="text-gray-900 bg-white">Mid Level</option>
                       <option value="senior-level" className="text-gray-900 bg-white">Senior Level</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Shift</label>
                     <select
                       value={createJobForm.shift}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, shift: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="day" className="text-gray-900 bg-white">Day Shift</option>
                       <option value="night" className="text-gray-900 bg-white">Night Shift</option>
                       <option value="both" className="text-gray-900 bg-white">Both Shifts</option>
                     </select>
                   </div>
                 </div>

                 {/* Salary Information */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Min Salary</label>
                     <input
                       type="number"
                       value={createJobForm.salary_min}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, salary_min: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                       placeholder="25000"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Max Salary</label>
                     <input
                       type="number"
                       value={createJobForm.salary_max}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, salary_max: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                       placeholder="35000"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                     <select
                       value={createJobForm.currency}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, currency: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="PHP" className="text-gray-900 bg-white">PHP</option>
                       <option value="USD" className="text-gray-900 bg-white">USD</option>
                       <option value="EUR" className="text-gray-900 bg-white">EUR</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Salary Type</label>
                     <select
                       value={createJobForm.salary_type}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, salary_type: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="monthly" className="text-gray-900 bg-white">Monthly</option>
                       <option value="hourly" className="text-gray-900 bg-white">Hourly</option>
                       <option value="annual" className="text-gray-900 bg-white">Annual</option>
                     </select>
                   </div>
                 </div>

                 {/* Additional Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Application Deadline</label>
                     <input
                       type="date"
                       value={createJobForm.application_deadline}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, application_deadline: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Priority</label>
                     <select
                       value={createJobForm.priority}
                       onChange={(e) => setCreateJobForm(prev => ({ ...prev, priority: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="low" className="text-gray-900 bg-white">Low</option>
                       <option value="medium" className="text-gray-900 bg-white">Medium</option>
                       <option value="high" className="text-gray-900 bg-white">High</option>
                       <option value="urgent" className="text-gray-900 bg-white">Urgent</option>
                     </select>
                   </div>
                 </div>

                 {/* Array Fields */}
                 {(['requirements', 'responsibilities', 'benefits', 'skills'] as const).map((field) => (
                   <div key={field}>
                     <label className="block text-sm font-medium text-gray-900 mb-2 capitalize">
                       {field.replace('_', ' ')}
                     </label>
                     <div className="space-y-2">
                       {createJobForm[field].map((item, index) => (
                         <div key={index} className="flex items-center gap-2">
                           <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                             {item}
                           </span>
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => removeArrayItem(field, index)}
                             className="text-red-600 hover:text-red-700"
                           >
                             Remove
                           </Button>
                         </div>
                       ))}
                       <div className="flex gap-2">
                         <input
                           type="text"
                           placeholder={`Add ${field.replace('_', ' ')}...`}
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                           onKeyPress={(e) => {
                             if (e.key === 'Enter') {
                               addArrayItem(field, e.currentTarget.value);
                               e.currentTarget.value = '';
                             }
                           }}
                         />
                         <Button
                           type="button"
                           variant="outline"
                           onClick={(e) => {
                             const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                             addArrayItem(field, input.value);
                             input.value = '';
                           }}
                         >
                           Add
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               <DialogFooter className="flex gap-3 pt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => setShowCreateJobModal(false)}
                 >
                   Cancel
                 </Button>
                 <Button 
                   className="bg-emerald-600 hover:bg-emerald-700"
                   onClick={handleCreateJob}
                   disabled={!createJobForm.job_title || !createJobForm.job_description || !createJobForm.company_id}
                 >
                   Create Job Request
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>

           {/* Edit Job Modal */}
           <Dialog open={showEditJobModal} onOpenChange={setShowEditJobModal}>
             <DialogContent className="!max-w-[75vw] sm:!max-w-[75vw] bg-white border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle className="text-2xl font-bold text-gray-900">Edit Job Request</DialogTitle>
                 <DialogDescription className="text-gray-600">
                   Update the job details below
                 </DialogDescription>
               </DialogHeader>

               <div className="space-y-6">
                 {/* Basic Information */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Job Title *</label>
                     <input
                       type="text"
                       value={editJobForm.job_title}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, job_title: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                       placeholder="e.g., Customer Service Representative"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Company *</label>
                     <select
                       value={editJobForm.company_id}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, company_id: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       required
                       style={{ zIndex: 50 }}
                     >
                       <option value="" className="text-gray-900">Select a company</option>
                       {companies.map((company) => (
                         <option key={company.company_id} value={company.company_id} className="text-gray-900 bg-white">
                           {company.company}
                         </option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Industry</label>
                     <input
                       type="text"
                       value={editJobForm.industry}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, industry: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                       placeholder="e.g., BPO, Healthcare, Finance"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Department</label>
                     <input
                       type="text"
                       value={editJobForm.department}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, department: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                       placeholder="e.g., Customer Support, Sales"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Work Type</label>
                     <select
                       value={editJobForm.work_type}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, work_type: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="full-time" className="text-gray-900 bg-white">Full-time</option>
                       <option value="part-time" className="text-gray-900 bg-white">Part-time</option>
                       <option value="contract" className="text-gray-900 bg-white">Contract</option>
                       <option value="temporary" className="text-gray-900 bg-white">Temporary</option>
                     </select>
                   </div>
                 </div>

                 {/* Job Description */}
                 <div>
                   <label className="block text-sm font-medium text-gray-900 mb-2">Job Description *</label>
                   <textarea
                     value={editJobForm.job_description}
                     onChange={(e) => setEditJobForm(prev => ({ ...prev, job_description: e.target.value }))}
                     rows={4}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                     placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                   />
                 </div>

                 {/* Work Details */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Work Arrangement</label>
                     <select
                       value={editJobForm.work_arrangement}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, work_arrangement: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="onsite" className="text-gray-900 bg-white">Onsite</option>
                       <option value="remote" className="text-gray-900 bg-white">Remote</option>
                       <option value="hybrid" className="text-gray-900 bg-white">Hybrid</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Experience Level</label>
                     <select
                       value={editJobForm.experience_level}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, experience_level: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="entry-level" className="text-gray-900 bg-white">Entry Level</option>
                       <option value="mid-level" className="text-gray-900 bg-white">Mid Level</option>
                       <option value="senior-level" className="text-gray-900 bg-white">Senior Level</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Shift</label>
                     <select
                       value={editJobForm.shift}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, shift: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="day" className="text-gray-900 bg-white">Day Shift</option>
                       <option value="night" className="text-gray-900 bg-white">Night Shift</option>
                       <option value="both" className="text-gray-900 bg-white">Both Shifts</option>
                     </select>
                   </div>
                 </div>

                 {/* Salary Information */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Min Salary</label>
                     <input
                       type="number"
                       value={editJobForm.salary_min}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, salary_min: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                       placeholder="25000"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Max Salary</label>
                     <input
                       type="number"
                       value={editJobForm.salary_max}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, salary_max: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                       placeholder="35000"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Currency</label>
                     <select
                       value={editJobForm.currency}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, currency: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="PHP" className="text-gray-900 bg-white">PHP</option>
                       <option value="USD" className="text-gray-900 bg-white">USD</option>
                       <option value="EUR" className="text-gray-900 bg-white">EUR</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Salary Type</label>
                     <select
                       value={editJobForm.salary_type}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, salary_type: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="monthly" className="text-gray-900 bg-white">Monthly</option>
                       <option value="hourly" className="text-gray-900 bg-white">Hourly</option>
                       <option value="annual" className="text-gray-900 bg-white">Annual</option>
                     </select>
                   </div>
                 </div>

                 {/* Additional Details */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Application Deadline</label>
                     <input
                       type="date"
                       value={editJobForm.application_deadline}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, application_deadline: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-900 mb-2">Priority</label>
                     <select
                       value={editJobForm.priority}
                       onChange={(e) => setEditJobForm(prev => ({ ...prev, priority: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 z-50"
                       style={{ zIndex: 50 }}
                     >
                       <option value="low" className="text-gray-900 bg-white">Low</option>
                       <option value="medium" className="text-gray-900 bg-white">Medium</option>
                       <option value="high" className="text-gray-900 bg-white">High</option>
                       <option value="urgent" className="text-gray-900 bg-white">Urgent</option>
                     </select>
                   </div>
                 </div>

                 {/* Array Fields */}
                 {(['requirements', 'responsibilities', 'benefits', 'skills'] as const).map((field) => (
                   <div key={field}>
                     <label className="block text-sm font-medium text-gray-900 mb-2 capitalize">
                       {field.replace('_', ' ')}
                     </label>
                     <div className="space-y-2">
                       {editJobForm[field].map((item, index) => (
                         <div key={index} className="flex items-center gap-2">
                           <span className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                             {item}
                           </span>
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => removeEditArrayItem(field, index)}
                             className="text-red-600 hover:text-red-700"
                           >
                             Remove
                           </Button>
                         </div>
                       ))}
                       <div className="flex gap-2">
                         <input
                           type="text"
                           placeholder={`Add ${field.replace('_', ' ')}...`}
                           className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500"
                           onKeyPress={(e) => {
                             if (e.key === 'Enter') {
                               addEditArrayItem(field, e.currentTarget.value);
                               e.currentTarget.value = '';
                             }
                           }}
                         />
                         <Button
                           type="button"
                           variant="outline"
                           onClick={(e) => {
                             const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                             addEditArrayItem(field, input.value);
                             input.value = '';
                           }}
                         >
                           Add
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               <DialogFooter className="flex gap-3 pt-6">
                 <Button 
                   variant="outline" 
                   onClick={() => setShowEditJobModal(false)}
                 >
                   Cancel
                 </Button>
                 <Button 
                   className="bg-emerald-600 hover:bg-emerald-700"
                   onClick={handleUpdateJob}
                   disabled={!editJobForm.job_title || !editJobForm.job_description || !editJobForm.company_id}
                 >
                   Update Job Request
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
         </div>
       );
     }
