'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  SlidersHorizontal
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JobMatchingPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Mock job data following the image layout
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
      matchPercentage: 95
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
      matchPercentage: 88
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
      matchPercentage: 92
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
      matchPercentage: 78
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
      matchPercentage: 85
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
      matchPercentage: 90
    }
  ];

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (percentage >= 80) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (percentage >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
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

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
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
                <span>Showing {jobs.length} jobs matched to your profile</span>
                <span>Sorted by match percentage</span>
              </div>
            </div>
          </motion.div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-white/10 hover:border-purple-400/30 h-full transition-all duration-300">
                  <CardHeader className="pb-4">
                    {/* Company and Save */}
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
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveJob(job.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <BookmarkIcon 
                          className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-purple-400 text-purple-400' : ''}`} 
                        />
                      </Button>
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
                    >
                      Apply now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 