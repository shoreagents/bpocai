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
  X,
  DollarSign,
  Calendar,
  Mail,
  Eye,
  MessageCircle
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

interface Company {
  id: string;
  company: string;
  company_id: string;
  created_at: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
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
    fetchCompanies();
  }, []);

  // Debug effect to monitor jobApplicants changes
  useEffect(() => {
    console.log('🔄 jobApplicants state changed:', jobApplicants);
    console.log('🔄 totalApplicants state changed:', totalApplicants);
  }, [jobApplicants, totalApplicants]);

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

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/recruiter/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
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
      case 'processed': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'active': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      case 'inactive': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'closed': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getCardBackgroundColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200';
      case 'active': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 hover:from-emerald-100 hover:to-emerald-200';
      case 'inactive': return 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:from-orange-100 hover:to-orange-200';
      case 'closed': return 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:from-gray-100 hover:to-gray-200';
      default: return 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:from-gray-100 hover:to-gray-200';
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-blue-600';
      case 'active': return 'text-emerald-600';
      case 'inactive': return 'text-orange-600';
      case 'closed': return 'text-gray-600';
      default: return 'text-gray-600';
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
    // Clear previous applicants data
    setJobApplicants([]);
    setTotalApplicants(0);
    // Fetch new applicants data first
    await fetchJobApplicants(job.originalId);
    // Then open the modal
    setShowApplicantsModal(true);
  };

  const fetchJobApplicants = async (jobId: string) => {
    try {
      setLoadingApplicants(true);
      console.log('🔍 Fetching applicants for jobId:', jobId);
      
      const response = await fetch(`/api/recruiter/applicants?jobId=${jobId}`, { 
        cache: 'no-store' 
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response data:', data);
        console.log('📋 Applications array:', data.applications);
        
        const applications = data.applications || [];
        setJobApplicants(applications);
        setTotalApplicants(applications.length);
        
        console.log('✅ Set jobApplicants to:', applications);
        console.log('✅ Set totalApplicants to:', applications.length);
        console.log('✅ Applications type:', typeof applications, 'isArray:', Array.isArray(applications));
      } else {
        console.error('❌ Response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching applicants:', error);
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  type="text"
                     placeholder="Search jobs..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 placeholder-gray-500 text-sm font-medium"
                   />
                 </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 text-sm font-medium"
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
                  className={`${getCardBackgroundColor(job.status)} shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
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
                      <div className="flex items-center text-sm text-gray-700">
                        <Building2 className={`h-4 w-4 mr-3 ${getIconColor(job.status)}`} />
                        <span><span className="font-medium">Company:</span> {job.company}</span>
                    </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Briefcase className={`h-4 w-4 mr-3 ${getIconColor(job.status)}`} />
                        <span><span className="font-medium">Industry:</span> {job.industry || 'Not Specified'}</span>
                    </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <User className={`h-4 w-4 mr-3 ${getIconColor(job.status)}`} />
                        <span><span className="font-medium">Department:</span> {job.department || 'Not Specified'}</span>
                    </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <TrendingUp className={`h-4 w-4 mr-3 ${getIconColor(job.status)}`} />
                        <span><span className="font-medium">Experience:</span> {job.experienceLevel}</span>
                    </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Banknote className={`h-4 w-4 mr-3 ${getIconColor(job.status)}`} />
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
        <DialogContent className="!max-w-none !w-[80vw] h-[85vh] max-h-[85vh] bg-white border-gray-300 text-gray-900 overflow-y-auto">
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
                  onChange={(e) => {
                    const selectedCompany = companies.find(c => c.company === e.target.value);
                    setCreateJobForm({
                      ...createJobForm, 
                      company: e.target.value,
                      company_id: selectedCompany?.company_id || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a company</option>
                       {companies.map((company) => (
                    <option key={company.id} value={company.company}>
                           {company.company}
                         </option>
                       ))}
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

      {/* Job Detail Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="!max-w-none !w-[80vw] h-[85vh] max-h-[85vh] bg-white border-gray-300 text-gray-900 overflow-y-auto [&>button]:hidden">
          {selectedJob && (
            <>
              <DialogHeader className="space-y-4">
                <div className="flex items-center justify-end">
                  <Badge className={`${getStatusColor(selectedJob.status)} text-xs font-medium`}>
                    {getStatusLabel(selectedJob.status)}
                  </Badge>
                   </div>
                <DialogTitle className="text-3xl font-bold text-gray-900">
                  {selectedJob.title}
                </DialogTitle>
              </DialogHeader>

              {/* Key Metrics Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600 mr-3" />
                  Key Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
                    <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                    <div className="text-blue-700 font-medium">Total Applicants</div>
                   </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 text-center hover:from-orange-100 hover:to-orange-200 transition-all duration-300">
                    <div className="text-4xl font-bold text-orange-600 mb-2">0</div>
                    <div className="text-orange-700 font-medium">Interviews Scheduled</div>
                   </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 text-center hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">0</div>
                    <div className="text-emerald-700 font-medium">Offers Made</div>
                   </div>
                   </div>
                 </div>

              {/* Job Description Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
                  <FileText className="h-6 w-6 text-emerald-600 mr-3" />
                  Job Description
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed text-base">
                    {selectedJob.description}
                  </p>
                </div>
                 </div>

              {/* Job Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    Basic Information
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Work Type</span>
                   </div>
                      <span className="text-gray-900 font-medium text-sm">Full-time</span>
                   </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Work Arrangement</span>
                      </div>
                      <span className="text-gray-900 font-medium text-sm">Onsite</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Industry</span>
                      </div>
                      <span className="text-gray-900 font-medium text-sm">{selectedJob.industry || 'Not Specified'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Department</span>
                      </div>
                      <span className="text-gray-900 font-medium text-sm">{selectedJob.department || 'Not Specified'}</span>
                    </div>
                   </div>
                 </div>

                {/* Experience & Salary */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Banknote className="h-5 w-5 text-emerald-600 mr-2" />
                    Experience & Salary
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Experience Level</span>
                   </div>
                      <span className="text-gray-900 font-medium text-sm capitalize">{selectedJob.experienceLevel}</span>
                   </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Banknote className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Salary Range</span>
                   </div>
                      <span className="text-gray-900 font-medium text-sm">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Currency</span>
                      </div>
                      <span className="text-gray-900 font-medium text-sm">PHP</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Salary Type</span>
                      </div>
                      <span className="text-gray-900 font-medium text-sm">Monthly</span>
                    </div>
                   </div>
                 </div>

                 {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 text-purple-600 mr-2" />
                    Additional Details
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Application Deadline</span>
                   </div>
                      <span className="text-gray-900 font-medium text-sm">Dec 31, 2024</span>
                   </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Priority</span>
                 </div>
                      <span className="text-gray-900 font-medium text-sm capitalize">High</span>
                         </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Shift</span>
                       </div>
                      <span className="text-gray-900 font-medium text-sm capitalize">Day</span>
                     </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">Created At</span>
                   </div>
                      <span className="text-gray-900 font-medium text-sm">{new Date(selectedJob.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
               </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Requirements & Responsibilities */}
                <div className="space-y-6">
                  {/* Requirements */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 text-emerald-600 mr-2" />
                      Requirements
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-emerald-600 text-xs font-bold">1</span>
                   </div>
                          <span className="text-gray-700 text-sm">Bachelor's degree in Accounting, Finance, or related field</span>
                   </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-emerald-600 text-xs font-bold">2</span>
                          </div>
                          <span className="text-gray-700 text-sm">Minimum 2 years of bookkeeping experience, real estate industry preferred</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-emerald-600 text-xs font-bold">3</span>
                          </div>
                          <span className="text-gray-700 text-sm">Proficiency in accounting software (QuickBooks, Xero)</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-emerald-600 text-xs font-bold">4</span>
                          </div>
                          <span className="text-gray-700 text-sm">Strong knowledge of Philippine accounting standards and tax regulations</span>
                        </div>
                      </div>
                    </div>
                     </div>
                     
                  {/* Responsibilities */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                      Responsibilities
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">1</span>
                               </div>
                          <span className="text-gray-700 text-sm">Record day to day financial transactions and complete the posting process</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">2</span>
                          </div>
                          <span className="text-gray-700 text-sm">Verify that transactions are recorded in the correct day book, suppliers ledger, customer ledger and general ledger</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">3</span>
                          </div>
                          <span className="text-gray-700 text-sm">Bring the books to the trial balance stage</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">4</span>
                          </div>
                          <span className="text-gray-700 text-sm">Perform partial checks of the posting process</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">5</span>
                          </div>
                          <span className="text-gray-700 text-sm">Complete tax forms</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">6</span>
                          </div>
                          <span className="text-gray-700 text-sm">Enter data, maintain records and financial statements</span>
                        </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">7</span>
                          </div>
                          <span className="text-gray-700 text-sm">Process accounts receivable/payable in a timely manner</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits & Skills */}
                <div className="space-y-6">
                  {/* Benefits */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                      Benefits
                                   </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-orange-600 text-xs font-bold">1</span>
                                 </div>
                          <span className="text-gray-700 text-sm">Health Insurance</span>
                                     </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-orange-600 text-xs font-bold">2</span>
                                     </div>
                          <span className="text-gray-700 text-sm">Paid Time Off</span>
                                     </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-orange-600 text-xs font-bold">3</span>
                                   </div>
                          <span className="text-gray-700 text-sm">13th Month Pay</span>
                                 </div>
                        <div className="flex items-start space-x-3 p-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-orange-600 text-xs font-bold">4</span>
                                   </div>
                          <span className="text-gray-700 text-sm">Professional Development Opportunities</span>
                               </div>
                             </div>
                             </div>
                           </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <User className="h-5 w-5 text-purple-600 mr-2" />
                      Skills
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          QuickBooks
                        </span>
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          Xero
                        </span>
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          Microsoft Excel
                        </span>
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          Financial Reporting
                        </span>
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          Bank Reconciliation
                        </span>
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                          Tax Preparation
                        </span>
                   </div>
                    </div>
                  </div>
                </div>
               </div>
               
              <DialogFooter className="flex gap-3 mt-6">
                 <Button 
                   variant="outline" 
                  onClick={() => setShowJobModal(false)}
                  className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                 >
                   Close
                 </Button>
                <Button
                  onClick={() => handleViewApplicants(selectedJob)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  View Applicants
                 </Button>
               </DialogFooter>
            </>
          )}
             </DialogContent>
           </Dialog>

           {/* Applicants Modal */}
           <Dialog open={showApplicantsModal} onOpenChange={setShowApplicantsModal}>
             <DialogContent key={`applicants-${selectedJob?.id}-${jobApplicants.length}`} className="!max-w-none !w-[80vw] h-[85vh] max-h-[85vh] bg-white border-gray-300 text-gray-900 overflow-y-auto">
               {selectedJob && (
                 <>
                   {console.log('🔍 Modal rendering - jobApplicants:', jobApplicants, 'totalApplicants:', totalApplicants)}
                   <DialogHeader className="space-y-4">
                     <DialogTitle className="text-3xl font-bold text-gray-900">
                       Applicants for {selectedJob.title}
                     </DialogTitle>
                     <div className="flex items-center justify-between">
                       <p className="text-gray-600">
                         {totalApplicants} {totalApplicants === 1 ? 'applicant' : 'applicants'} found
                       </p>
                     </div>
                   </DialogHeader>

                   {loadingApplicants ? (
                     <div className="flex justify-center items-center py-12">
                       <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                       <span className="ml-3 text-gray-600">Loading applicants...</span>
                       <div className="text-xs text-gray-500 mt-2">Debug: loadingApplicants = {loadingApplicants.toString()}</div>
                     </div>
                   ) : jobApplicants.length === 0 ? (
                     <div className="text-center py-12">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Users className="w-8 h-8 text-gray-400" />
                       </div>
                       <p className="text-gray-600 mb-2">No applicants found</p>
                       <p className="text-gray-500 text-sm">
                         No one has applied for this job yet.
                       </p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                       {jobApplicants.map((applicant, index) => {
                         const colorVariations = [
                           'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200',
                           'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200',
                           'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200',
                           'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200',
                           'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:from-pink-100 hover:to-pink-200',
                           'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:from-cyan-100 hover:to-cyan-200',
                           'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200',
                           'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:from-teal-100 hover:to-teal-200'
                         ];
                         
                         const cardColor = colorVariations[index % colorVariations.length];
                         
                         return (
                           <Card key={applicant.id} className={`${cardColor} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                             <CardContent className="p-6">
                               <div className="flex items-start justify-between">
                                 <div className="flex items-start space-x-4">
                                   <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                                     {applicant.user?.avatar_url ? (
                                       <img 
                                         src={applicant.user.avatar_url} 
                                         alt={applicant.user.full_name}
                                         className="w-12 h-12 rounded-full object-cover"
                                       />
                                     ) : (
                                       applicant.user?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'A'
                                     )}
                                   </div>
                                   <div className="flex-1">
                                     <div className="flex items-center space-x-2 mb-1">
                                       <h3 className="text-lg font-semibold text-gray-900">
                                         {applicant.user?.full_name || 'Unknown Applicant'}
                                       </h3>
                                       <Badge className={`${getStatusColor(applicant.status)} flex items-center space-x-1`}>
                                         <span className="capitalize">{applicant.status}</span>
                                       </Badge>
                                     </div>
                                     <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                       {applicant.user?.email && (
                                         <div className="flex items-center space-x-1">
                                           <Mail className="h-4 w-4" />
                                           <span>{applicant.user.email}</span>
                                         </div>
                                       )}
                                       {applicant.user?.position && (
                                         <div className="flex items-center space-x-1">
                                           <User className="h-4 w-4" />
                                           <span>{applicant.user.position}</span>
                                         </div>
                                       )}
                                       {applicant.user?.location && (
                                         <div className="flex items-center space-x-1">
                                           <MapPin className="h-4 w-4" />
                                           <span>{applicant.user.location}</span>
                                         </div>
                                       )}
                                       <div className="flex items-center space-x-1">
                                         <Calendar className="h-4 w-4" />
                                         <span>Applied {new Date(applicant.created_at).toLocaleDateString()}</span>
                                       </div>
                                     </div>
                                     {applicant.resume_title && (
                                       <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                         <FileText className="h-4 w-4" />
                                         <span>{applicant.resume_title}</span>
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
                                       console.log('Resume clicked for:', applicant.user?.full_name);
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
                                       console.log('Profile clicked for:', applicant.user?.full_name);
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
                                       console.log('Message clicked for:', applicant.user?.full_name);
                                     }}
                                   >
                                     <MessageCircle className="h-4 w-4 mr-2" />
                                     Message
                                   </Button>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         );
                       })}
                     </div>
                   )}
                 </>
               )}
             </DialogContent>
           </Dialog>
         </div>
       );
     }