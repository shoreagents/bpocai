'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export default function LeaderboardsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const itemsPerPage = 5;
  const filterRef = useRef<HTMLDivElement>(null);
  const pageSelectorRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(event.target as Node)) {
        setIsPageSelectorOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  // Mock leaderboard data - expanded for pagination demo
  const allPerformers = [
    {
      rank: 1,
      name: 'Maria Santos',
      company: 'Amazon',
      position: 'Senior Customer Service Rep',
      score: 2847,
      achievements: 12,
      level: 'Expert',
      avatar: '👩‍💼'
    },
    {
      rank: 2,
      name: 'Juan Cruz',
      company: 'Google',
      position: 'Technical Support Specialist',
      score: 2756,
      achievements: 10,
      level: 'Advanced',
      avatar: '👨‍💻'
    },
    {
      rank: 3,
      name: 'Ana Rodriguez',
      company: 'Microsoft',
      position: 'Sales Representative',
      score: 2689,
      achievements: 11,
      level: 'Expert',
      avatar: '👩‍💼'
    },
    {
      rank: 4,
      name: 'Carlos Mendoza',
      company: 'Meta',
      position: 'Content Moderator',
      score: 2634,
      achievements: 8,
      level: 'Advanced',
      avatar: '👨‍💼'
    },
    {
      rank: 5,
      name: 'Sofia Garcia',
      company: 'Apple',
      position: 'Technical Support Engineer',
      score: 2591,
      achievements: 9,
      level: 'Advanced',
      avatar: '👩‍🔧'
    },
    {
      rank: 6,
      name: 'Miguel Fernandez',
      company: 'Shopify',
      position: 'Customer Success Manager',
      score: 2543,
      achievements: 7,
      level: 'Intermediate',
      avatar: '👨‍💼'
    },
    {
      rank: 7,
      name: 'Isabella Torres',
      company: 'Zoom',
      position: 'Technical Support Specialist',
      score: 2498,
      achievements: 8,
      level: 'Advanced',
      avatar: '👩‍💻'
    },
    {
      rank: 8,
      name: 'Diego Morales',
      company: 'Spotify',
      position: 'Content Moderator',
      score: 2445,
      achievements: 6,
      level: 'Intermediate',
      avatar: '👨‍🎵'
    },
    {
      rank: 9,
      name: 'Carmen Silva',
      company: 'Netflix',
      position: 'Customer Experience Associate',
      score: 2398,
      achievements: 9,
      level: 'Advanced',
      avatar: '👩‍📺'
    },
    {
      rank: 10,
      name: 'Roberto Dela Cruz',
      company: 'PayPal',
      position: 'Financial Support Specialist',
      score: 2356,
      achievements: 5,
      level: 'Intermediate',
      avatar: '👨‍💳'
    },
    {
      rank: 11,
      name: 'Francesca Lopez',
      company: 'Uber',
      position: 'Operations Coordinator',
      score: 2312,
      achievements: 7,
      level: 'Advanced',
      avatar: '👩‍🚗'
    },
    {
      rank: 12,
      name: 'Antonio Reyes',
      company: 'Tesla',
      position: 'Customer Support Engineer',
      score: 2267,
      achievements: 6,
      level: 'Intermediate',
      avatar: '👨‍⚡'
    }
  ];

  const monthlyStats = [
    { label: 'Total Active Users', value: '2,847', icon: Users, color: 'text-cyan-400' },
    { label: 'Assessments Completed', value: '8,291', icon: Target, color: 'text-green-400' },
    { label: 'Jobs Applied', value: '1,562', icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Career Level Ups', value: '234', icon: Crown, color: 'text-yellow-400' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Advanced':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  // Filter and paginate data
  const filteredPerformers = useMemo(() => {
    return allPerformers.filter((performer) => {
      const matchesSearch = performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          performer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          performer.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = filterLevel === 'all' || performer.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [searchTerm, filterLevel]);

  const totalPages = Math.ceil(filteredPerformers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPerformers = filteredPerformers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (level: string) => {
    setFilterLevel(level);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'all': return 'All Levels';
      case 'Expert': return 'Expert';
      case 'Advanced': return 'Advanced';
      case 'Intermediate': return 'Intermediate';
      default: return 'All Levels';
    }
  };

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
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Trophy className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Leaderboards</h1>
                  <p className="text-gray-400">Top performers in the BPO community</p>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search performers..."
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
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm flex items-center gap-2 min-w-[120px] justify-between hover:bg-white/20 transition-colors"
                  >
                    <span>{getLevelLabel(filterLevel)}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50">
                      {['all', 'Expert', 'Advanced', 'Intermediate'].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleFilterChange(level)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            filterLevel === level ? 'bg-cyan-500/20 text-cyan-400' : 'text-white'
                          }`}
                        >
                          {getLevelLabel(level)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Monthly Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {monthlyStats.map((stat, index) => (
              <Card key={index} className="glass-card border-white/10 hover:border-cyan-400/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Current Period */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Current Period: July 2025</span>
                </div>
                <span>Rankings updated daily</span>
              </div>
            </div>
          </motion.div>

          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🏆 Top Performers</h2>
              <p className="text-gray-400">Leading professionals based on assessments, achievements, and career progress</p>
            </div>

            <div className="space-y-4">
              {paginatedPerformers.map((performer, index) => (
                <motion.div
                  key={performer.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="glass-card border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5">
                          {getRankIcon(performer.rank)}
                        </div>

                        {/* Avatar */}
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center text-2xl">
                          {performer.avatar}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{performer.name}</h3>
                            <Badge className={`${getLevelColor(performer.level)} text-xs`}>
                              {performer.level}
                            </Badge>
                          </div>
                          <p className="text-gray-300 mb-1">{performer.position}</p>
                          <p className="text-sm text-gray-400">{performer.company}</p>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-400 mb-1">
                            {performer.score.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">
                            {performer.achievements} achievements
                          </div>
                        </div>
                      </div>
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
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between mt-8 py-4"
              >
                {/* Left side - Navigation */}
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
                  
                  {/* Show first few pages, ellipsis, and last page if needed */}
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
          </motion.div>

          {/* Results Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPerformers.length)} of {filteredPerformers.length} performers
                  {searchTerm && ` matching "${searchTerm}"`}
                  {filterLevel !== 'all' && ` with ${filterLevel} level`}
                </span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          </motion.div>


        </div>
      </div>
    </div>
  );
} 