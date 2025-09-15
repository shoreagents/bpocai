'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Star,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Target,
  Zap,
  Shield,
  Globe,
  Award,
  Search,
  Filter,
  Eye,
  MessageCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function RecruiterHomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const stats = [
    {
      title: 'Active Candidates',
      value: '15,000+',
      description: 'Pre-screened professionals',
      icon: Users,
      color: 'text-emerald-600'
    },
    {
      title: 'Success Rate',
      value: '85%',
      description: 'Placement success rate',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Average Time',
      value: '7 Days',
      description: 'To find perfect match',
      icon: Clock,
      color: 'text-purple-600'
    },
    {
      title: 'Cost Savings',
      value: '60%',
      description: 'Reduced hiring costs',
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ];

  const features = [
    {
      icon: Target,
      title: 'AI-Powered Matching',
      description: 'Our advanced AI analyzes candidate profiles and matches them with your job requirements for the perfect fit.'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Get immediate access to pre-screened candidates with verified skills and experience.'
    },
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'All candidates go through our rigorous screening process including skills assessment and cultural fit evaluation.'
    },
    {
      icon: Globe,
      title: 'Global Talent Pool',
      description: 'Access top BPO professionals from the Philippines with diverse skills and experience levels.'
    }
  ];

  const candidateTypes = [
    {
      title: 'Customer Service',
      count: '5,200+',
      description: 'Experienced customer support professionals',
      skills: ['Communication', 'Problem Solving', 'Multi-tasking'],
      avgExperience: '3-5 years'
    },
    {
      title: 'Technical Support',
      count: '3,800+',
      description: 'IT and technical support specialists',
      skills: ['Technical Troubleshooting', 'Software Support', 'Network Management'],
      avgExperience: '4-6 years'
    },
    {
      title: 'Sales & Marketing',
      count: '2,900+',
      description: 'Sales professionals and marketing experts',
      skills: ['Lead Generation', 'Sales Closing', 'Digital Marketing'],
      avgExperience: '2-4 years'
    },
    {
      title: 'Back Office',
      count: '3,100+',
      description: 'Administrative and back-office specialists',
      skills: ['Data Entry', 'Process Management', 'Quality Assurance'],
      avgExperience: '2-5 years'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechCorp Solutions',
      role: 'HR Director',
      content: 'BPOC.IO has revolutionized our hiring process. We found 3 perfect candidates in just 5 days!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      company: 'Global Services Inc',
      role: 'Recruitment Manager',
      content: 'The AI matching is incredible. Candidates are pre-screened and ready to start immediately.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      company: 'Customer First Co',
      role: 'Talent Acquisition Lead',
      content: 'Quality candidates, fast turnaround, and excellent support. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
      {/* Recruiter Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-900/5">
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
                <Link href="/recruiter" className="text-emerald-600 font-medium border-b-2 border-emerald-600 relative group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600"></span>
                </Link>
                <Link href="/recruiter/dashboard" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group">
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link href="/recruiter/post-job" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group">
                  Jobs
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link href="/recruiter/candidates" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group">
                  Candidates
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link href="/recruiter/analytics" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200 relative group">
                  Analytics
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="text-center">
            {/* Main Headline with Animation */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="block">Find Your Next</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-300 animate-pulse">
                  Perfect Hire
                </span>
              </h1>
              
              {/* Compelling Subtitle for Recruiters */}
              <div className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                <p className="mb-6 text-2xl md:text-3xl font-semibold text-white">
                  Stop wasting time on unqualified candidates
                </p>
                <p className="mb-6 text-lg">
                  Access <span className="font-bold text-emerald-400">15,000+ pre-vetted BPO professionals</span> ready to start immediately
                </p>
                
                {/* Stats Display */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 max-w-6xl mx-auto">
                  {/* Active Candidates */}
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <Users className="h-6 w-6 text-emerald-400" />
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">15,000+</div>
                      <div className="text-xs text-emerald-300 font-medium">Active Candidates</div>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <TrendingUp className="h-6 w-6 text-cyan-400" />
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">85%</div>
                      <div className="text-xs text-cyan-300 font-medium">Success Rate</div>
                    </div>
                  </div>

                  {/* Average Time */}
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <Clock className="h-6 w-6 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">7 Days</div>
                      <div className="text-xs text-purple-300 font-medium">Average Time</div>
                    </div>
                  </div>

                  {/* Cost Savings */}
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <DollarSign className="h-6 w-6 text-orange-400" />
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">60%</div>
                      <div className="text-xs text-orange-300 font-medium">Cost Savings</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* CTA Buttons with Enhanced Styling */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-2xl shadow-emerald-500/25 text-lg px-10 py-4 rounded-full font-semibold transform hover:scale-105 transition-all duration-300"
                onClick={() => router.push('/recruiter/candidates')}
              >
                🎯 Start Hiring Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent text-lg px-10 py-4 rounded-full font-semibold backdrop-blur-sm transition-all duration-300"
                onClick={() => router.push('/recruiter/candidates')}
              >
                👀 View Candidate Pool
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-white/20">
              <p className="text-sm text-gray-400 mb-8 text-center">Trusted by 500+ companies worldwide</p>
              
              {/* Company Names Carousel */}
              <div className="relative w-full overflow-hidden">
                <div className="flex animate-scroll whitespace-nowrap">
                  <div className="flex items-center space-x-12 text-white/60">
                    <span className="text-xl font-bold">TechCorp</span>
                    <span className="text-xl font-bold">GlobalBPO</span>
                    <span className="text-xl font-bold">CallCenter Pro</span>
                    <span className="text-xl font-bold">SupportHub</span>
                    <span className="text-xl font-bold">DataFlow</span>
                    <span className="text-xl font-bold">CloudTech</span>
                    <span className="text-xl font-bold">NexGen</span>
                    <span className="text-xl font-bold">ProCall</span>
                    <span className="text-xl font-bold">TechCorp</span>
                    <span className="text-xl font-bold">GlobalBPO</span>
                    <span className="text-xl font-bold">CallCenter Pro</span>
                    <span className="text-xl font-bold">SupportHub</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BPOC Recruiter?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most advanced BPO recruitment platform to help you find the perfect candidates faster and more efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and find your perfect candidates with our streamlined process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Post Your Job</h3>
              <p className="text-gray-600">
                Create a detailed job posting with requirements, skills, and preferences. Our AI will help optimize your listing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Matching</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your requirements and matches you with the most qualified candidates from our database.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interview & Hire</h3>
              <p className="text-gray-600">
                Review matched candidates, conduct interviews, and make your hire. We handle all the paperwork and onboarding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of companies who trust BPOC.IO for their recruitment needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-emerald-600">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your recruitment needs. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
                <CardDescription className="text-gray-600">Perfect for small teams</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">₱2,500</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 5 job postings</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">100 candidate profiles</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Email support</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-white border-2 border-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Professional</CardTitle>
                <CardDescription className="text-gray-600">Ideal for growing companies</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">₱7,500</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited job postings</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">500 candidate profiles</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">AI-powered matching</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
                <CardDescription className="text-gray-600">For large organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">₱15,000</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited everything</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Dedicated account manager</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">24/7 phone support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Custom reporting</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Secure & Compliant</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <span>Global Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="border-t border-gray-200"></div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 text-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of recruiters who have found their perfect candidates on BPOC.IO
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white border-0 shadow-lg shadow-emerald-500/25 text-lg px-8 py-4 rounded-full"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-white text-lg px-8 py-4 rounded-full shadow-sm"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

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