'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Target,
  MapPin,
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
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JobMatchingPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [shareJobId, setShareJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkType, setFilterWorkType] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const pageSelectorRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 6;

  // Close share dropdown, filter dropdown, and page selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareJobId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(event.target as Node)) {
        setIsPageSelectorOpen(false);
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

  // Mock job data with detailed information
  const jobs = [
    {
      id: '1',
      company: 'Amazon',
      companyLogo: '🛒',
      postedDays: 5,
      title: 'Senior Customer Service Rep',
      employmentType: ['Full-time', 'Senior level'],
      salary: '$35/hr',
      location: 'Clark, Pampanga',
      matchPercentage: 95,
      description: 'Join Amazon\'s customer service team and help millions of customers worldwide. As a Senior Customer Service Representative, you\'ll handle complex customer inquiries and provide exceptional support.',
      responsibilities: [
        'Handle escalated customer inquiries via chat, email, and phone',
        'Provide product recommendations and technical support',
        'Mentor junior team members and assist with training',
        'Maintain customer satisfaction metrics above 95%',
        'Collaborate with cross-functional teams to resolve issues'
      ],
      qualifications: [
        'Bachelor\'s degree preferred',
        '3+ years customer service experience',
        'Excellent English communication skills',
        'Experience with CRM systems',
        'Strong problem-solving abilities'
      ],
      perks: [
        'Health insurance coverage',
        'Flexible work arrangements',
        'Performance bonuses',
        'Career advancement opportunities',
        'Free lunch and snacks',
        'Training and development programs'
      ]
    },
    {
      id: '2',
      company: 'Google',
      companyLogo: '🔍',
      postedDays: 30,
      title: 'Technical Support Specialist',
      employmentType: ['Full-time', 'Flexible schedule'],
      salary: '$28-40k',
      location: 'Angeles City, Pampanga',
      matchPercentage: 88,
      description: 'Support Google\'s global user base by providing technical assistance for various Google products. Help users troubleshoot and optimize their experience with Google services.',
      responsibilities: [
        'Troubleshoot technical issues for Google products',
        'Provide step-by-step guidance to users',
        'Document common issues and solutions',
        'Escalate complex problems to engineering teams',
        'Contribute to knowledge base articles'
      ],
      qualifications: [
        'Strong technical background',
        '2+ years technical support experience',
        'Fluent in English and Filipino',
        'Knowledge of Google Workspace',
        'Problem-solving mindset'
      ],
      perks: [
        'Comprehensive health benefits',
        'Work from home options',
        'Google product discounts',
        'Learning and development budget',
        'Wellness programs',
        'Team building activities'
      ]
    },
    {
      id: '3',
      company: 'Microsoft',
      companyLogo: '💻',
      postedDays: 18,
      title: 'Senior Sales Representative',
      employmentType: ['Contract', 'Remote'],
      salary: '$42/hr',
      location: 'Remote, Philippines',
      matchPercentage: 92,
      description: 'Drive Microsoft\'s business growth by selling enterprise solutions to key accounts. Build relationships with decision-makers and present tailored technology solutions.',
      responsibilities: [
        'Develop and execute sales strategies',
        'Build relationships with enterprise clients',
        'Present Microsoft solutions to stakeholders',
        'Achieve quarterly sales targets',
        'Collaborate with technical teams for demos'
      ],
      qualifications: [
        'Bachelor\'s degree in Business or related field',
        '5+ years B2B sales experience',
        'Strong presentation skills',
        'Knowledge of Microsoft products',
        'Proven track record in enterprise sales'
      ],
      perks: [
        'Competitive commission structure',
        'Remote work flexibility',
        'Microsoft product licenses',
        'Professional development courses',
        'Annual sales incentive trips',
        'Health and dental coverage'
      ]
    },
    {
      id: '4',
      company: 'Meta',
      companyLogo: '📘',
      postedDays: 3,
      title: 'Content Moderator',
      employmentType: ['Full-time', 'In office'],
      salary: '$25-32k',
      location: 'Clark, Pampanga',
      matchPercentage: 78,
      description: 'Help maintain a safe and positive community experience across Meta\'s platforms. Review and moderate content according to community guidelines and policies.',
      responsibilities: [
        'Review reported content for policy violations',
        'Make decisions on content removal or approval',
        'Escalate complex cases to senior moderators',
        'Maintain accuracy and speed metrics',
        'Stay updated on policy changes'
      ],
      qualifications: [
        'High school diploma required',
        'Strong attention to detail',
        'Cultural awareness and sensitivity',
        'Ability to work in fast-paced environment',
        'Emotional resilience'
      ],
      perks: [
        'Mental health support programs',
        'Free meals and transportation',
        'Career progression opportunities',
        'Team social events',
        'Health insurance',
        'Paid time off'
      ]
    },
    {
      id: '5',
      company: 'Airbnb',
      companyLogo: '🏠',
      postedDays: 1,
      title: 'Customer Experience Associate',
      employmentType: ['Contract', 'Remote'],
      salary: '$30/hr',
      location: 'Remote, Philippines',
      matchPercentage: 85,
      description: 'Deliver exceptional customer experiences for Airbnb hosts and guests. Handle inquiries, resolve issues, and ensure positive interactions with the platform.',
      responsibilities: [
        'Assist hosts and guests via multiple channels',
        'Resolve booking and payment issues',
        'Provide platform guidance and support',
        'Handle emergency situations professionally',
        'Contribute to process improvements'
      ],
      qualifications: [
        'Customer service experience preferred',
        'Excellent communication skills',
        'Empathy and problem-solving abilities',
        'Familiarity with travel industry',
        'Adaptability to changing situations'
      ],
      perks: [
        'Remote work setup allowance',
        'Airbnb travel credits',
        'Flexible working hours',
        'Professional development budget',
        'Health and wellness benefits',
        'Global team collaboration'
      ]
    },
    {
      id: '6',
      company: 'Apple',
      companyLogo: '🍎',
      postedDays: 6,
      title: 'Technical Support Engineer',
      employmentType: ['Full-time', 'Flexible schedule'],
      salary: '$38-45k',
      location: 'Angeles City, Pampanga',
      matchPercentage: 90,
      description: 'Provide world-class technical support for Apple products and services. Help customers troubleshoot issues and maximize their Apple experience.',
      responsibilities: [
        'Diagnose and resolve complex technical issues',
        'Provide software and hardware support',
        'Guide customers through troubleshooting steps',
        'Document solutions and best practices',
        'Collaborate with engineering teams'
      ],
      qualifications: [
        'Technical degree or equivalent experience',
        'Strong knowledge of Apple ecosystem',
        'Excellent problem-solving skills',
        'Customer-focused mindset',
        'Ability to explain technical concepts clearly'
      ],
      perks: [
        'Apple product discounts',
        'Comprehensive training programs',
        'Career advancement opportunities',
        'Health and wellness benefits',
        'Flexible work arrangements',
        'Innovation time for projects'
      ]
    },
    {
      id: '7',
      company: 'Tesla',
      companyLogo: '⚡',
      postedDays: 10,
      title: 'Software Engineer (AI/ML)',
      employmentType: ['Full-time', 'Hybrid'],
      salary: '$40-55k',
      location: 'Remote, Philippines',
      matchPercentage: 93,
      description: 'Join Tesla\'s AI/ML team to develop cutting-edge solutions for autonomous driving. Work on projects that impact millions of users worldwide.',
      responsibilities: [
        'Design and implement machine learning models',
        'Develop scalable and efficient algorithms',
        'Collaborate with cross-functional teams',
        'Optimize existing models for performance',
        'Stay updated with latest AI/ML advancements'
      ],
      qualifications: [
        'Master\'s degree in Computer Science or related field',
        '3+ years experience in AI/ML',
        'Strong Python and TensorFlow/PyTorch',
        'Experience with deep learning frameworks',
        'Problem-solving and critical thinking'
      ],
      perks: [
        'Remote work flexibility',
        'Tesla product discounts',
        'Learning and development budget',
        'Wellness programs',
        'Team building activities'
      ]
    },
    {
      id: '8',
      company: 'Spotify',
      companyLogo: '��',
      postedDays: 2,
      title: 'Content Creator',
      employmentType: ['Contract', 'Remote'],
      salary: '$20-25k',
      location: 'Remote, Philippines',
      matchPercentage: 82,
      description: 'Create engaging and original content for Spotify\'s global user base. Help promote new releases and artist discovery.',
      responsibilities: [
        'Develop and execute content strategies',
        'Create high-quality audio and visual content',
        'Engage with community members and influencers',
        'Analyze content performance and trends',
        'Stay updated with music industry news'
      ],
      qualifications: [
        'Strong creative writing and storytelling skills',
        'Experience with audio/video editing software',
        'Familiarity with social media platforms',
        'Ability to work independently and manage time',
        'Passion for music and entertainment'
      ],
      perks: [
        'Remote work setup allowance',
        'Spotify travel credits',
        'Flexible working hours',
        'Professional development budget',
        'Health and wellness benefits',
        'Global team collaboration'
      ]
    },
    {
      id: '9',
      company: 'Uber',
      companyLogo: '🚗',
      postedDays: 15,
      title: 'Data Analyst',
      employmentType: ['Full-time', 'Hybrid'],
      salary: '$35-45k',
      location: 'Angeles City, Pampanga',
      matchPercentage: 89,
      description: 'Analyze ride-sharing data to improve user experience and operational efficiency. Help make data-driven decisions for the company.',
      responsibilities: [
        'Collect, process, and analyze large datasets',
        'Develop data models and predictive algorithms',
        'Present findings and recommendations to stakeholders',
        'Identify trends and patterns in user behavior',
        'Stay updated with latest data analysis tools'
      ],
      qualifications: [
        'Bachelor\'s degree in Statistics, Mathematics, or related field',
        '2+ years experience in data analysis',
        'Proficient in SQL and Python',
        'Strong attention to detail and problem-solving skills',
        'Ability to work in a fast-paced environment'
      ],
      perks: [
        'Comprehensive health benefits',
        'Work from home options',
        'Uber product discounts',
        'Learning and development budget',
        'Wellness programs',
        'Team building activities'
      ]
    },
    {
      id: '10',
      company: 'Airbnb',
      companyLogo: '🏠',
      postedDays: 1,
      title: 'Customer Experience Associate',
      employmentType: ['Contract', 'Remote'],
      salary: '$30/hr',
      location: 'Remote, Philippines',
      matchPercentage: 85,
      description: 'Deliver exceptional customer experiences for Airbnb hosts and guests. Handle inquiries, resolve issues, and ensure positive interactions with the platform.',
      responsibilities: [
        'Assist hosts and guests via multiple channels',
        'Resolve booking and payment issues',
        'Provide platform guidance and support',
        'Handle emergency situations professionally',
        'Contribute to process improvements'
      ],
      qualifications: [
        'Customer service experience preferred',
        'Excellent communication skills',
        'Empathy and problem-solving abilities',
        'Familiarity with travel industry',
        'Adaptability to changing situations'
      ],
      perks: [
        'Remote work setup allowance',
        'Airbnb travel credits',
        'Flexible working hours',
        'Professional development budget',
        'Health and wellness benefits',
        'Global team collaboration'
      ]
    }
  ];

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJob(jobId);
  };

  const selectedJobData = selectedJob ? jobs.find(job => job.id === selectedJob) : null;

  const handleShare = (platform: string, job: any) => {
    const jobUrl = `${window.location.origin}/jobs/job-matching?job=${job.id}`;
    const jobTitle = `${job.title} at ${job.company}`;
    const jobDescription = `Check out this ${job.title} position at ${job.company} - ${job.matchPercentage}% match! Salary: ${job.salary}, Location: ${job.location}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(jobTitle)}&body=${encodeURIComponent(jobDescription + '\n\n' + jobUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(jobUrl).then(() => {
          // You could add a toast notification here
          alert('Link copied to clipboard!');
        });
        break;
    }
    setShareJobId(null);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (percentage >= 80) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (percentage >= 70) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getWorkType = (job: any) => {
    if (job.employmentType.some((type: string) => type.toLowerCase().includes('remote')) ||
        job.location.toLowerCase().includes('remote')) {
      return 'remote';
    }
    if (job.employmentType.some((type: string) => type.toLowerCase().includes('hybrid'))) {
      return 'hybrid';
    }
    return 'onsite';
  };

  const getWorkTypeLabel = (workType: string) => {
    switch (workType) {
      case 'remote':
        return 'Remote';
      case 'hybrid':
        return 'Hybrid';
      case 'onsite':
        return 'On Site';
      default:
        return 'All';
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to page 1 when search term changes
  };

  const handleFilterChange = (workType: string) => {
    setFilterWorkType(workType);
    setIsFilterOpen(false);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterWorkType === 'all') return matchesSearch;
      
      const jobWorkType = getWorkType(job);
      const matchesWorkType = jobWorkType === filterWorkType;
      
      return matchesSearch && matchesWorkType;
    });
  }, [searchTerm, filterWorkType, jobs]); // Added jobs to dependency array

  const totalPages = useMemo(() => {
    return Math.ceil(filteredJobs.length / itemsPerPage);
  }, [filteredJobs.length, itemsPerPage]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredJobs.slice(start, end);
  }, [currentPage, filteredJobs, itemsPerPage]);

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
              <div className="flex items-center gap-2 relative">
                <Filter className="w-4 h-4 text-gray-400" />
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
                    : `Showing ${filteredJobs.length} jobs matched to your profile`
                  }
                </span>
                <span>
                  {totalPages > 1 
                    ? `Page ${currentPage} of ${totalPages}` 
                    : 'Sorted by match percentage'
                  }
                </span>
              </div>
            </div>
          </motion.div>

          {/* Job Cards */}
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
                        <div>
                          <p className="font-medium text-white">{job.company}</p>
                          <p className="text-xs text-gray-400">{job.postedDays} days ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <BookmarkIcon 
                            className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-purple-400 text-purple-400' : ''}`} 
                          />
                        </Button>
                        
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
                    <CardTitle className="text-xl text-white mb-3">
                      {job.title}
                    </CardTitle>

                    {/* Employment Type Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.employmentType.map((type, idx) => (
                        <Badge 
                          key={idx}
                          className="bg-white/10 text-gray-300 border-white/20 text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>

                    {/* Match Percentage */}
                    <div className="mb-4">
                      <Badge className={`${getMatchColor(job.matchPercentage)} text-xs`}>
                        {job.matchPercentage}% Match
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Salary and Location */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-gray-300">
                        <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                        <span className="text-sm font-medium">{job.salary}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                        <span className="text-sm">{job.location}</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job.id);
                      }}
                    >
                      See More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mt-8 py-4"
            >
              {/* Left side - Navigation controls */}
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
                
                {/* Page Numbers */}
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

          {/* Results Info */}
          {totalPages > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
                    {searchTerm && ` matching "${searchTerm}"`}
                    {filterWorkType !== 'all' && ` with ${getWorkTypeLabel(filterWorkType)} work type`}
                  </span>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
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
                        
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveJob(selectedJobData.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <BookmarkIcon 
                              className={`w-6 h-6 ${savedJobs.includes(selectedJobData.id) ? 'fill-purple-400 text-purple-400' : ''}`} 
                            />
                          </Button>
                          
                          <div className="relative" ref={shareJobId === selectedJobData.id ? shareRef : null}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShareJobId(shareJobId === selectedJobData.id ? null : selectedJobData.id)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Share2 className="w-6 h-6" />
                            </Button>
                            
                            {shareJobId === selectedJobData.id && (
                              <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50 min-w-[160px]">
                                <div className="py-2">
                                  <button
                                    onClick={() => handleShare('facebook', selectedJobData)}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                  >
                                    <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">f</span>
                                    </div>
                                    Facebook
                                  </button>
                                  <button
                                    onClick={() => handleShare('linkedin', selectedJobData)}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                  >
                                    <Linkedin className="w-4 h-4 text-blue-500" />
                                    LinkedIn
                                  </button>
                                  <button
                                    onClick={() => handleShare('email', selectedJobData)}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                                  >
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    Email
                                  </button>
                                  <button
                                    onClick={() => handleShare('copy', selectedJobData)}
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
                      <h2 className="text-3xl font-bold text-white mb-6">
                        {selectedJobData.title}
                      </h2>

                      {/* Employment Type Badges */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {selectedJobData.employmentType.map((type, idx) => (
                          <Badge 
                            key={idx}
                            className="bg-white/10 text-gray-300 border-white/20 px-3 py-1"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>

                      {/* Match Percentage */}
                      <div className="mb-6">
                        <Badge className={`${getMatchColor(selectedJobData.matchPercentage)} px-3 py-1 text-sm`}>
                          {selectedJobData.matchPercentage}% Match
                        </Badge>
                      </div>

                      {/* Salary and Location */}
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center text-gray-300">
                          <DollarSign className="w-6 h-6 mr-4 text-green-400" />
                          <span className="font-medium text-xl">{selectedJobData.salary}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <MapPin className="w-6 h-6 mr-4 text-purple-400" />
                          <span className="text-lg">{selectedJobData.location}</span>
                        </div>
                      </div>

                      {/* Apply Button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 text-lg py-4"
                      >
                        Apply now
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
                        <p className="text-gray-300 leading-relaxed text-lg">{selectedJobData.description}</p>
                      </div>

                      {/* Responsibilities */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h3 className="flex items-center gap-3 text-white text-xl font-semibold mb-4">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          Responsibilities
                        </h3>
                        <ul className="space-y-4">
                          {selectedJobData.responsibilities.map((responsibility, idx) => (
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
                          {selectedJobData.qualifications.map((qualification, idx) => (
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
                          {selectedJobData.perks.map((perk, idx) => (
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
        </div>
      </div>
    </div>
  );
} 