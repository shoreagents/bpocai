'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30d');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const stats = [
    {
      title: 'Total Applications',
      value: '1,234',
      change: '+15%',
      changeType: 'positive',
      icon: FileText
    },
    {
      title: 'Active Jobs',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Hired Candidates',
      value: '8',
      change: '+3',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Success Rate',
      value: '67%',
      change: '+5%',
      changeType: 'positive',
      icon: Activity
    }
  ];

  const topJobs = [
    {
      title: 'Senior Frontend Developer',
      applications: 45,
      views: 234,
      conversion: '19.2%',
      status: 'active'
    },
    {
      title: 'UX Designer',
      applications: 23,
      views: 156,
      conversion: '14.7%',
      status: 'active'
    },
    {
      title: 'Product Manager',
      applications: 18,
      views: 98,
      conversion: '18.4%',
      status: 'closed'
    },
    {
      title: 'Backend Developer',
      applications: 32,
      views: 187,
      conversion: '17.1%',
      status: 'active'
    }
  ];

  const candidateSources = [
    { source: 'BPOC Platform', count: 456, percentage: 37 },
    { source: 'LinkedIn', count: 234, percentage: 19 },
    { source: 'Indeed', count: 189, percentage: 15 },
    { source: 'Glassdoor', count: 156, percentage: 13 },
    { source: 'Direct Applications', count: 199, percentage: 16 }
  ];

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
                <Link href="/recruiter/applications" className="text-gray-700 hover:text-emerald-600 font-medium">Applications</Link>
                <Link href="/recruiter/candidates" className="text-gray-700 hover:text-emerald-600 font-medium">Applicants</Link>
                <Link href="/recruiter/analytics" className="text-emerald-600 font-medium border-b-2 border-emerald-600">Analysis</Link>
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
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-600">Track your recruitment performance and trends</p>
            </div>
            <div className="flex space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  <span>from last period</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Content */}
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Trends Chart */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Application Trends
                  </CardTitle>
                  <CardDescription className="text-gray-600">Applications received over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                      <p className="font-medium">Chart placeholder</p>
                      <p className="text-sm text-gray-500">Application trends over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidate Sources */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <PieChart className="h-5 w-5 mr-2" />
                    Candidate Sources
                  </CardTitle>
                  <CardDescription className="text-gray-600">Where your candidates are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidateSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium text-gray-900">{source.source}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-blue-600 font-semibold">{source.count}</span>
                          <span className="text-sm font-medium text-emerald-600">{source.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900 placeholder-gray-500"
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
