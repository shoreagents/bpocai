'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Target,
  Zap,
  Crown,
  Gem,
  Flame,
  Sparkles,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LeaderboardPage() {
  const router = useRouter();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('overall');

  const topPerformers = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      company: 'TechCorp Solutions',
      avatar: '/api/placeholder/60/60',
      score: 98.5,
      change: '+2.3',
      changeType: 'up',
      position: 'Senior Customer Service Rep',
      location: 'Manila, Philippines',
      stats: {
        applications: 156,
        interviews: 23,
        hires: 8,
        rating: 4.9,
        responseTime: '2.1 hours'
      },
      badges: ['Top Performer', 'Fast Responder', 'Quality Champion'],
      tier: 'diamond'
    },
    {
      rank: 2,
      name: 'Michael Chen',
      company: 'CloudTech Inc',
      avatar: '/api/placeholder/60/60',
      score: 96.8,
      change: '+1.8',
      changeType: 'up',
      position: 'Technical Support Specialist',
      location: 'Cebu, Philippines',
      stats: {
        applications: 142,
        interviews: 19,
        hires: 6,
        rating: 4.8,
        responseTime: '1.8 hours'
      },
      badges: ['Technical Expert', 'Problem Solver', 'Team Player'],
      tier: 'diamond'
    },
    {
      rank: 3,
      name: 'Maria Rodriguez',
      company: 'GrowthCorp',
      avatar: '/api/placeholder/60/60',
      score: 94.2,
      change: '+3.1',
      changeType: 'up',
      position: 'Sales Representative',
      location: 'Davao, Philippines',
      stats: {
        applications: 128,
        interviews: 21,
        hires: 7,
        rating: 4.7,
        responseTime: '2.5 hours'
      },
      badges: ['Sales Leader', 'Client Favorite', 'Goal Crusher'],
      tier: 'gold'
    },
    {
      rank: 4,
      name: 'David Kim',
      company: 'SocialMedia Pro',
      avatar: '/api/placeholder/60/60',
      score: 91.7,
      change: '-0.5',
      changeType: 'down',
      position: 'Content Moderator',
      location: 'Quezon City, Philippines',
      stats: {
        applications: 115,
        interviews: 16,
        hires: 5,
        rating: 4.6,
        responseTime: '3.2 hours'
      },
      badges: ['Content Expert', 'Detail Oriented', 'Reliable'],
      tier: 'gold'
    },
    {
      rank: 5,
      name: 'Lisa Wang',
      company: 'Executive Solutions',
      avatar: '/api/placeholder/60/60',
      score: 89.3,
      change: '+1.2',
      changeType: 'up',
      position: 'Virtual Assistant',
      location: 'Makati, Philippines',
      stats: {
        applications: 98,
        interviews: 14,
        hires: 4,
        rating: 4.5,
        responseTime: '2.8 hours'
      },
      badges: ['Organized', 'Efficient', 'Multi-tasker'],
      tier: 'silver'
    }
  ];

  const companyLeaders = [
    {
      rank: 1,
      company: 'TechCorp Solutions',
      logo: '/api/placeholder/50/50',
      score: 97.2,
      change: '+2.1',
      changeType: 'up',
      employees: 45,
      location: 'Manila, Philippines',
      stats: {
        totalHires: 23,
        avgRating: 4.8,
        responseTime: '1.9 hours',
        retentionRate: '94%'
      },
      specialties: ['Customer Service', 'Technical Support', 'Sales']
    },
    {
      rank: 2,
      company: 'CloudTech Inc',
      logo: '/api/placeholder/50/50',
      score: 95.6,
      change: '+1.7',
      changeType: 'up',
      employees: 32,
      location: 'Cebu, Philippines',
      stats: {
        totalHires: 18,
        avgRating: 4.7,
        responseTime: '2.2 hours',
        retentionRate: '91%'
      },
      specialties: ['Technical Support', 'DevOps', 'Cloud Services']
    },
    {
      rank: 3,
      company: 'GrowthCorp',
      logo: '/api/placeholder/50/50',
      score: 93.1,
      change: '+2.8',
      changeType: 'up',
      employees: 28,
      location: 'Davao, Philippines',
      stats: {
        totalHires: 15,
        avgRating: 4.6,
        responseTime: '2.4 hours',
        retentionRate: '89%'
      },
      specialties: ['Sales', 'Marketing', 'Business Development']
    }
  ];

  const recentAchievements = [
    {
      id: 1,
      name: 'Sarah Johnson',
      achievement: 'Perfect Score Week',
      description: 'Achieved 100% rating for 5 consecutive days',
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      date: '2 hours ago',
      points: 50
    },
    {
      id: 2,
      name: 'Michael Chen',
      achievement: 'Speed Demon',
      description: 'Responded to applications in under 1 hour',
      icon: <Zap className="h-5 w-5 text-blue-500" />,
      date: '4 hours ago',
      points: 30
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      achievement: 'Hiring Champion',
      description: 'Successfully hired 3 candidates this week',
      icon: <Target className="h-5 w-5 text-green-500" />,
      date: '6 hours ago',
      points: 40
    },
    {
      id: 4,
      name: 'TechCorp Solutions',
      achievement: 'Company Milestone',
      description: 'Reached 100 total successful hires',
      icon: <Building2 className="h-5 w-5 text-purple-500" />,
      date: '1 day ago',
      points: 100
    }
  ];

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'diamond': return <Gem className="h-5 w-5 text-blue-500" />;
      case 'gold': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'silver': return <Medal className="h-5 w-5 text-gray-400" />;
      default: return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'diamond': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'gold': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300';
      case 'silver': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-500" />;
      case 3: return <Award className="h-6 w-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
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
                <Link href="/recruiter/post-job" className="text-gray-700 hover:text-emerald-600 font-medium">Jobs</Link>
                <Link href="/recruiter/applications" className="text-gray-700 hover:text-emerald-600 font-medium">Applications</Link>
                <Link href="/recruiter/candidates" className="text-gray-700 hover:text-emerald-600 font-medium">Applicants</Link>
                <Link href="/recruiter/analytics" className="text-gray-700 hover:text-emerald-600 font-medium">Analysis</Link>
                <Link href="/recruiter/leaderboard" className="text-emerald-600 font-medium border-b-2 border-emerald-600">Leaderboard</Link>
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                Leaderboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">Top performers and companies in the BPOC network</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="individuals">Individuals</SelectItem>
                  <SelectItem value="companies">Companies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="individuals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-emerald-50 border border-emerald-200">
            <TabsTrigger value="individuals" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Top Individuals</TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Top Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="individuals" className="space-y-6">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {topPerformers.slice(0, 3).map((performer, index) => (
                <Card key={performer.rank} className={`relative overflow-hidden ${
                  index === 0 ? 'ring-2 ring-yellow-400 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50' : 
                  index === 1 ? 'ring-2 ring-gray-300 shadow-md bg-gradient-to-br from-gray-50 to-slate-50' : 
                  'ring-2 ring-amber-500 shadow-md bg-gradient-to-br from-orange-50 to-amber-50'
                }`}>
                  <div className={`absolute top-0 left-0 right-0 h-2 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-slate-400' : 
                    'bg-gradient-to-r from-orange-400 to-amber-500'
                  }`}></div>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {getRankIcon(performer.rank)}
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{performer.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{performer.position}</p>
                    <p className="text-sm text-gray-500 mb-3">{performer.company}</p>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">{performer.score}</span>
                      <div className="flex items-center space-x-1">
                        {getChangeIcon(performer.changeType)}
                        <span className={`text-sm ${
                          performer.changeType === 'up' ? 'text-green-600' : 
                          performer.changeType === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {performer.change}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${getTierColor(performer.tier)} flex items-center space-x-1 w-fit mx-auto`}>
                      {getTierIcon(performer.tier)}
                      <span className="capitalize">{performer.tier}</span>
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Leaderboard */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 text-emerald-500 mr-2" />
                  Complete Rankings
                </CardTitle>
                <CardDescription>All top performers ranked by overall score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer) => (
                    <div key={performer.rank} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(performer.rank)}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {performer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                          <Badge className={`${getTierColor(performer.tier)} flex items-center space-x-1`}>
                            {getTierIcon(performer.tier)}
                            <span className="capitalize text-xs">{performer.tier}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{performer.position} • {performer.company}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{performer.stats.applications} apps</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{performer.stats.hires} hires</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{performer.stats.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl font-bold text-gray-900">{performer.score}</span>
                          <div className="flex items-center space-x-1">
                            {getChangeIcon(performer.changeType)}
                            <span className={`text-sm ${
                              performer.changeType === 'up' ? 'text-green-600' : 
                              performer.changeType === 'down' ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {performer.change}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {performer.badges.slice(0, 2).map((badge, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            {/* Top 3 Company Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {companyLeaders.slice(0, 3).map((company, index) => (
                <Card key={company.rank} className={`relative overflow-hidden ${
                  index === 0 ? 'ring-2 ring-yellow-400 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50' : 
                  index === 1 ? 'ring-2 ring-gray-300 shadow-md bg-gradient-to-br from-gray-50 to-slate-50' : 
                  'ring-2 ring-amber-500 shadow-md bg-gradient-to-br from-orange-50 to-amber-50'
                }`}>
                  <div className={`absolute top-0 left-0 right-0 h-2 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-slate-400' : 
                    'bg-gradient-to-r from-orange-400 to-amber-500'
                  }`}></div>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {getRankIcon(company.rank)}
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {company.company.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{company.company}</h3>
                    <p className="text-sm text-gray-600 mb-2">{company.location}</p>
                    <p className="text-sm text-gray-500 mb-3">{company.employees} employees</p>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">{company.score}</span>
                      <div className="flex items-center space-x-1">
                        {getChangeIcon(company.changeType)}
                        <span className={`text-sm ${
                          company.changeType === 'up' ? 'text-green-600' : 
                          company.changeType === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {company.change}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {company.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <Badge className={`${getTierColor('diamond')} flex items-center space-x-1 w-fit mx-auto`}>
                      <Gem className="h-4 w-4" />
                      <span>Enterprise</span>
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Complete Company Rankings */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 text-emerald-500 mr-2" />
                  Complete Company Rankings
                </CardTitle>
                <CardDescription>All top companies ranked by overall performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyLeaders.map((company) => (
                    <div key={company.rank} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(company.rank)}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {company.company.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{company.company}</h4>
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 bg-gray-50">
                            {company.employees} employees
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{company.location}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{company.stats.totalHires} hires</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{company.stats.avgRating} avg rating</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{company.stats.retentionRate} retention</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {company.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl font-bold text-gray-900">{company.score}</span>
                          <div className="flex items-center space-x-1">
                            {getChangeIcon(company.changeType)}
                            <span className={`text-sm ${
                              company.changeType === 'up' ? 'text-green-600' : 
                              company.changeType === 'down' ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {company.change}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Overall Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Achievements */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 text-orange-500 mr-2" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Latest accomplishments and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                  <div className="flex-shrink-0">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">{achievement.achievement}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
              <input type="email" placeholder="Enter your email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input type="password" placeholder="Enter your password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
              <input placeholder="Enter your company name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" placeholder="Enter your email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input type="password" placeholder="Create a password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
