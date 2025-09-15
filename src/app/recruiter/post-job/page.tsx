'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  FileText,
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PostJobPage() {
  const router = useRouter();
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    employmentType: '',
    experienceLevel: '',
    description: '',
    requirements: '',
    benefits: '',
    remote: false,
    urgent: false
  });
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
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
                <Link href="/recruiter/candidates" className="text-gray-700 hover:text-emerald-600 font-medium">Candidates</Link>
                <Link href="/recruiter/analytics" className="text-gray-700 hover:text-emerald-600 font-medium">Analytics</Link>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600">Create a job posting to attract top talent</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Publish Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Provide the essential details about the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">Job Title *</label>
                  <Input
                    id="title"
                    placeholder="e.g. Senior Frontend Developer"
                    value={jobData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[3px]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-gray-700">Company Name *</label>
                  <Input
                    id="company"
                    placeholder="e.g. Tech Corp"
                    value={jobData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[3px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={jobData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[3px]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="employmentType" className="text-sm font-medium text-gray-700">Employment Type *</label>
                  <Select value={jobData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="experienceLevel" className="text-sm font-medium text-gray-700">Experience Level *</label>
                <Select value={jobData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                    <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <DollarSign className="h-5 w-5 mr-2" />
                Salary & Compensation
              </CardTitle>
              <CardDescription className="text-gray-600">
                Specify the salary range and benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="salaryMin" className="text-sm font-medium text-gray-700">Minimum Salary</label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g. 80000"
                    value={jobData.salaryMin}
                    onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                    className="focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[3px]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="salaryMax" className="text-sm font-medium text-gray-700">Maximum Salary</label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g. 120000"
                    value={jobData.salaryMax}
                    onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                    className="focus-visible:border-green-500 focus-visible:ring-green-500/50 focus-visible:ring-[3px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="benefits" className="text-sm font-medium text-gray-700">Benefits & Perks</label>
                <Textarea
                  id="benefits"
                  placeholder="e.g. Health insurance, 401k, flexible hours, remote work..."
                  value={jobData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  rows={3}
                  className="focus-visible:ring-green-500 focus-visible:ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <FileText className="h-5 w-5 mr-2" />
                Job Description
              </CardTitle>
              <CardDescription className="text-gray-600">
                Describe the role, responsibilities, and what you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Job Description *</label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, key responsibilities, and what the candidate will be working on..."
                  value={jobData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="focus-visible:ring-green-500 focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="requirements" className="text-sm font-medium text-gray-700">Requirements & Qualifications *</label>
                <Textarea
                  id="requirements"
                  placeholder="List the required skills, experience, and qualifications..."
                  value={jobData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={6}
                  className="focus-visible:ring-green-500 focus-visible:ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Clock className="h-5 w-5 mr-2" />
                Additional Options
              </CardTitle>
              <CardDescription className="text-gray-600">
                Set additional preferences for your job posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={jobData.remote}
                  onCheckedChange={(checked) => handleInputChange('remote', checked as boolean)}
                  className="border-gray-300 bg-white data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <label htmlFor="remote" className="text-sm font-medium text-gray-700">Remote work allowed</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={jobData.urgent}
                  onCheckedChange={(checked) => handleInputChange('urgent', checked as boolean)}
                  className="border-gray-300 bg-white data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <label htmlFor="urgent" className="text-sm font-medium text-gray-700">Urgent hiring (highlight this job)</label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pb-8">
            <Button variant="outline" size="lg">
              Save as Draft
            </Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Publish Job
            </Button>
          </div>
        </div>
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
    </div>
  );
}
