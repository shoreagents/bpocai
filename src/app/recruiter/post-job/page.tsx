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
  Banknote, 
  Clock, 
  Users, 
  FileText,
  ArrowLeft,
  Plus,
  Briefcase,
  User,
  TrendingUp,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RecruiterSignInModal from '@/components/auth/RecruiterSignInModal';
import RecruiterSignUpForm from '@/components/auth/RecruiterSignUpForm';
import RecruiterNavbar from '@/components/layout/RecruiterNavbar';

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

interface CreateJobForm {
  job_title: string;
  job_description: string;
  industry: string;
  department: string;
  work_type: string;
  work_arrangement: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  salary_type: string;
  application_deadline: string;
  priority: string;
  shift: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  company_id: string;
  company: string;
}

interface RequirementItem {
  id: string;
  text: string;
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
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [createJobForm, setCreateJobForm] = useState<CreateJobForm>({
    job_title: '',
    job_description: '',
    industry: '',
    department: '',
    work_type: 'full-time',
    work_arrangement: 'onsite',
    experience_level: 'entry-level',
    salary_min: 25000,
    salary_max: 35000,
    currency: 'PHP',
    salary_type: 'monthly',
    application_deadline: '',
    priority: 'medium',
    shift: 'day',
    requirements: [],
    responsibilities: [],
    benefits: [],
    skills: [],
    company_id: '',
    company: ''
  });

  const [requirementItems, setRequirementItems] = useState<RequirementItem[]>([]);
  const [responsibilityItems, setResponsibilityItems] = useState<RequirementItem[]>([]);
  const [benefitItems, setBenefitItems] = useState<RequirementItem[]>([]);
  const [skillItems, setSkillItems] = useState<RequirementItem[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recruiter/jobs', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-blue-500 text-white';
      case 'active': return 'bg-green-500 text-white';
      case 'inactive': return 'bg-orange-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
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
    return `P${min.toLocaleString()} - P${max.toLocaleString()}`;
  };

  const handleJobClick = async (job: JobCard) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleViewApplicants = async (job: JobCard) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
    await fetchJobApplicants(job.originalId);
  };

  const fetchJobApplicants = async (jobId: string) => {
    if (!selectedJob) return;
    
    try {
      setLoadingApplicants(true);
      const response = await fetch(`/api/recruiter/applicants?jobId=${selectedJob.originalId}`, { 
        cache: 'no-store' 
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobApplicants(data.applicants || []);
        setTotalApplicants(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    if (!selectedJob) return;
    
    try {
      const response = await fetch(`/api/recruiter/jobs/${selectedJob.originalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the job in the local state
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.originalId === selectedJob.originalId 
              ? { ...job, status: newStatus as any }
              : job
          )
        );
        setShowJobModal(false);
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleCreateJob = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const formData = {
        ...createJobForm,
        requirements: requirementItems.map(item => item.text),
        responsibilities: responsibilityItems.map(item => item.text),
        benefits: benefitItems.map(item => item.text),
        skills: skillItems.map(item => item.text),
      };

      const response = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Reset form
          setCreateJobForm({
            job_title: '',
            job_description: '',
            industry: '',
            department: '',
            work_type: 'full-time',
            work_arrangement: 'onsite',
            experience_level: 'entry-level',
            salary_min: 25000,
            salary_max: 35000,
            currency: 'PHP',
            salary_type: 'monthly',
            application_deadline: '',
            priority: 'medium',
            shift: 'day',
            requirements: [],
            responsibilities: [],
            benefits: [],
            skills: [],
            company_id: '',
            company: ''
          });
          setRequirementItems([]);
          setResponsibilityItems([]);
          setBenefitItems([]);
          setSkillItems([]);
          setNewRequirement('');
          setNewResponsibility('');
          setNewBenefit('');
          setNewSkill('');
          setShowCreateJobModal(false);
          // Refresh jobs list
          fetchJobs();
        }
      } else {
        const errorData = await response.json();
        setFormErrors({ general: errorData.error || 'Failed to create job' });
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setFormErrors({ general: 'Failed to create job' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchToSignUp = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUpModal(false);
    setShowSignInModal(true);
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const newItem = { id: Date.now().toString(), text: newRequirement.trim() };
      setRequirementItems([...requirementItems, newItem]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (id: string) => {
    setRequirementItems(requirementItems.filter(item => item.id !== id));
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      const newItem = { id: Date.now().toString(), text: newResponsibility.trim() };
      setResponsibilityItems([...responsibilityItems, newItem]);
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (id: string) => {
    setResponsibilityItems(responsibilityItems.filter(item => item.id !== id));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      const newItem = { id: Date.now().toString(), text: newBenefit.trim() };
      setBenefitItems([...benefitItems, newItem]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (id: string) => {
    setBenefitItems(benefitItems.filter(item => item.id !== id));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const newItem = { id: Date.now().toString(), text: newSkill.trim() };
      setSkillItems([...skillItems, newItem]);
      setNewSkill('');
    }
  };

  const removeSkill = (id: string) => {
    setSkillItems(skillItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Recruiter Navbar */}
      <RecruiterNavbar 
        currentPage="post-job" 
        onSignInClick={() => setShowSignInModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Request</h1>
              <p className="text-gray-600">Create and track your job requests</p>
            </div>
            <Button 
              onClick={() => setShowCreateJobModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2 font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 rounded-full transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => {
              return (
                <Card 
                  key={job.id} 
                  className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200"
                  onClick={() => handleJobClick(job)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={`${getStatusColor(job.status)} text-xs font-medium`}>
                        {getStatusLabel(job.status)}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{job.title}</h3>
                      <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                        {job.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-3 text-gray-400" />
                        <span><span className="font-medium">Company:</span> {job.company}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                        <span><span className="font-medium">Industry:</span> {job.industry || 'Not Specified'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        <span><span className="font-medium">Department:</span> {job.department || 'Not Specified'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-3 text-gray-400" />
                        <span><span className="font-medium">Experience:</span> {job.experienceLevel}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Banknote className="h-4 w-4 mr-3 text-gray-400" />
                        <span><span className="font-medium">Salary Range:</span> {formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <Dialog open={showCreateJobModal} onOpenChange={setShowCreateJobModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Create New Job Request</DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new job posting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {formErrors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {formErrors.general}
              </div>
            )}
            
            {/* Job Title and Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={createJobForm.job_title}
                  onChange={(e) => setCreateJobForm({...createJobForm, job_title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Customer Service Representative"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                <select
                  value={createJobForm.company}
                  onChange={(e) => setCreateJobForm({...createJobForm, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a company</option>
                  <option value="ShoreAgents">ShoreAgents</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Industry and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={createJobForm.industry}
                  onChange={(e) => setCreateJobForm({...createJobForm, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., BPO, Healthcare, Finance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={createJobForm.department}
                  onChange={(e) => setCreateJobForm({...createJobForm, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Customer Support, Sales"
                />
              </div>
            </div>

            {/* Work Type and Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                <select
                  value={createJobForm.work_type}
                  onChange={(e) => setCreateJobForm({...createJobForm, work_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                <select
                  value={createJobForm.experience_level}
                  onChange={(e) => setCreateJobForm({...createJobForm, experience_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="entry-level">Entry Level</option>
                  <option value="mid-level">Mid Level</option>
                  <option value="senior-level">Senior Level</option>
                </select>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
              <textarea
                value={createJobForm.job_description}
                onChange={(e) => setCreateJobForm({...createJobForm, job_description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
              />
            </div>

            {/* Work Arrangement, Shift, and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Arrangement</label>
                <select
                  value={createJobForm.work_arrangement}
                  onChange={(e) => setCreateJobForm({...createJobForm, work_arrangement: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  value={createJobForm.shift}
                  onChange={(e) => setCreateJobForm({...createJobForm, shift: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="both">Both</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={createJobForm.priority}
                  onChange={(e) => setCreateJobForm({...createJobForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Salary Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                <input
                  type="number"
                  value={createJobForm.salary_min}
                  onChange={(e) => setCreateJobForm({...createJobForm, salary_min: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="25000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                <input
                  type="number"
                  value={createJobForm.salary_max}
                  onChange={(e) => setCreateJobForm({...createJobForm, salary_max: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="35000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={createJobForm.currency}
                  onChange={(e) => setCreateJobForm({...createJobForm, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="PHP">PHP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type</label>
                <select
                  value={createJobForm.salary_type}
                  onChange={(e) => setCreateJobForm({...createJobForm, salary_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
              <input
                type="date"
                value={createJobForm.application_deadline}
                onChange={(e) => setCreateJobForm({...createJobForm, application_deadline: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Dynamic Lists */}
            <div className="space-y-6">
              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add requirements..."
                  />
                  <Button type="button" onClick={addRequirement} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {requirementItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{item.text}</span>
                      <Button
                        type="button"
                        onClick={() => removeRequirement(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add responsibilities..."
                  />
                  <Button type="button" onClick={addResponsibility} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {responsibilityItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{item.text}</span>
                      <Button
                        type="button"
                        onClick={() => removeResponsibility(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add benefits..."
                  />
                  <Button type="button" onClick={addBenefit} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {benefitItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{item.text}</span>
                      <Button
                        type="button"
                        onClick={() => removeBenefit(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add skills..."
                  />
                  <Button type="button" onClick={addSkill} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {skillItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-sm">{item.text}</span>
                      <Button
                        type="button"
                        onClick={() => removeSkill(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateJobModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateJob}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Job Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign In Modal */}
      <RecruiterSignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      
      {/* Sign Up Modal */}
      <RecruiterSignUpForm
        open={showSignUpModal}
        onOpenChange={setShowSignUpModal}
        onSwitchToLogin={handleSwitchToSignIn}
      />
    </div>
  );
}