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
  MoreHorizontal,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Trophy,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RecruiterSignInModal from '@/components/auth/RecruiterSignInModal';
import RecruiterSignUpForm from '@/components/auth/RecruiterSignUpForm';
import RecruiterNavbar from '@/components/layout/RecruiterNavbar';

export default function CandidatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Modal handler functions
  const handleSwitchToSignUp = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUpModal(false);
    setShowSignInModal(true);
  };
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: "Total", count: 0, color: "bg-gradient-to-br from-blue-500 to-blue-600", icon: Users },
    { label: "Profile Complete", count: 0, color: "bg-gradient-to-br from-green-500 to-green-600", icon: Star }
  ]);

  // Fetch real candidates data from database
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/recruiter/candidates', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load candidates');
        
        const data = await response.json();
        if (data.success) {
          setCandidates(data.candidates);
          
          // Update stats
          const profileCount = data.candidates.filter((candidate: any) => candidate.profileComplete).length;
          
          setStats([
            { label: "Total", count: data.total, color: "bg-gradient-to-br from-blue-500 to-blue-600", icon: Users },
            { label: "Profile Complete", count: profileCount, color: "bg-gradient-to-br from-green-500 to-green-600", icon: Star }
          ]);
        } else {
          throw new Error(data.error || 'Failed to load candidates');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'New Application';
      case 'reviewed': return 'Under Review';
      case 'interviewed': return 'Interviewed';
      case 'hired': return 'Hired';
      default: return 'Unknown';
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-yellow-500 text-white font-semibold">GOLD</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-gray-400 text-white font-semibold">SILVER</Badge>;
    } else {
      return <Badge className="bg-amber-600 text-white font-semibold">BRONZE</Badge>;
    }
  };

  const getProfileStatusBadge = (isComplete: boolean) => {
    if (!isComplete) {
      return <Badge className="bg-orange-500 text-white font-semibold">Profile Not Complete</Badge>;
    }
    return null;
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Recruiter Navbar */}
      <RecruiterNavbar 
        currentPage="candidates" 
        onSignInClick={() => setShowSignInModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
              <p className="text-gray-600">Review and manage job applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Candidates</p>
                  <div className="text-3xl font-bold text-blue-900">
                    {loading ? (
                      <span className="inline-block w-12 h-8 bg-blue-300 animate-pulse rounded"></span>
                    ) : (
                      candidates.length.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-blue-700 mt-2">Qualified professionals</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Profile Complete</p>
                  <div className="text-3xl font-bold text-emerald-900">
                    {loading ? (
                      <span className="inline-block w-12 h-8 bg-emerald-300 animate-pulse rounded"></span>
                    ) : (
                      candidates.filter(c => c.profileComplete).length.toLocaleString()
                    )}
                  </div>
                  <p className="text-sm text-emerald-700 mt-2">Ready for interviews</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                  <Input
                    placeholder="Search candidates, skills, or job titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 !bg-white border-2 border-emerald-200 text-gray-900 placeholder-black focus:border-emerald-500 focus:ring-emerald-500/50 focus:ring-[3px] focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50 focus-visible:ring-[3px] shadow-md hover:border-emerald-300 transition-colors"
                  />
                </div>
              </div>
              <select className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-gray-400 transition-colors min-w-[140px]">
                <option value="all">All Status</option>
                <option value="new">New Applications</option>
                <option value="reviewed">Under Review</option>
                <option value="interviewed">Interviewed</option>
                <option value="hired">Hired</option>
              </select>
              <select className="px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm hover:border-gray-400 transition-colors min-w-[140px]">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rating</option>
                <option value="experience">Most Experience</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-white border border-red-200 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p className="text-lg font-medium">Error loading candidates</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Candidates List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredCandidates.length === 0 ? (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">No candidates found</p>
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'Try adjusting your search terms' : 'No qualified candidates available yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate, index) => {
                  // Create color variations for candidate cards
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
                    <Card key={candidate.id} className={`${cardColor} shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1`}>
                    <CardContent className="p-6 text-center flex flex-col h-full">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 flex-shrink-0">
                        {candidate.avatar && candidate.avatar.startsWith('http') ? (
                          <img 
                            src={candidate.avatar} 
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          candidate.avatar
                        )}
                      </div>

                      {/* First Name and Username */}
                      <div className="mb-4 flex-shrink-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{candidate.name.split(' ')[0]}</h3>
                        <p className="text-gray-600 text-sm truncate">@{candidate.slug}</p>
                      </div>

                      {/* Location and Join Date */}
                      <div className="mb-4 flex-shrink-0">
                        <div className="flex items-center justify-center gap-2 mb-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{candidate.location}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span className="truncate">Joined {candidate.joinDate}</span>
                        </div>
                      </div>

                      {/* Applicant Score */}
                      <div className="flex items-center justify-center gap-2 mb-4 flex-shrink-0">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Applications: {candidate.applicantScore || 0}
                        </span>
                      </div>

                      {/* Action Buttons - Push to bottom */}
                      <div className="mt-auto flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                          onClick={() => router.push(`/${candidate.slug}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => router.push(`/recruiter/messages?candidate=${encodeURIComponent(candidate.name)}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

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

            {/* For Recruiters */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-emerald-400">For Recruiters</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <ul className="space-y-3">
                  <li><Link href="/recruiter/dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                  <li><Link href="/recruiter/post-job" className="text-gray-300 hover:text-emerald-400 transition-colors">Post a Job</Link></li>
                  <li><Link href="/recruiter/applications" className="text-gray-300 hover:text-emerald-400 transition-colors">Applications</Link></li>
                </ul>
                <ul className="space-y-3">
                  <li><Link href="/recruiter/candidates" className="text-gray-300 hover:text-emerald-400 transition-colors">Browse Candidates</Link></li>
                  <li><Link href="/recruiter/analytics" className="text-gray-300 hover:text-emerald-400 transition-colors">Analytics</Link></li>
                  <li><Link href="/recruiter/leaderboard" className="text-gray-300 hover:text-emerald-400 transition-colors">Leaderboard</Link></li>
                </ul>
              </div>
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
