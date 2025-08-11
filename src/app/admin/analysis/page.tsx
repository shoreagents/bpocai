'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Sparkles,
  Trophy,
  RefreshCw,
  Eye,
  Download,
  Filter,
  Search,
  X,
  Star,
  TrendingDown,
  Award
} from 'lucide-react'

interface Analysis {
  id: string
  user_id: string
  overall_score: number
  ats_compatibility_score: number
  content_quality_score: number
  professional_presentation_score: number
  skills_alignment_score: number
  improved_summary: string
  key_strengths: string[]
  strengths_analysis: any
  salary_analysis: any
  career_path: any
  section_analysis: any
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  user_avatar?: string
}

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [stats, setStats] = useState({
    totalAnalyses: 0,
    completedAnalyses: 0,
    failedAnalyses: 0,
    processingAnalyses: 0,
    averageScore: 0,
    successRate: 0
  })

  // Fetch analyses from database
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/analysis')
        const data = await response.json()
        
        if (response.ok) {
          const validatedAnalyses = data.analyses.map(validateAnalysisData)
          setAnalyses(validatedAnalyses)
          setStats({
            totalAnalyses: data.total,
            completedAnalyses: data.total,
            failedAnalyses: 0,
            processingAnalyses: 0,
            averageScore: data.averageScore,
            successRate: 100
          })
        } else {
          console.error('Failed to fetch analyses:', data.error)
        }
      } catch (error) {
        console.error('Error fetching analyses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [])

  // Filter analyses based on search term
  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch = 
      analysis.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAnalyses = filteredAnalyses.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const refreshAnalyses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analysis')
      const data = await response.json()
      
      if (response.ok) {
        const validatedAnalyses = data.analyses.map(validateAnalysisData)
        setAnalyses(validatedAnalyses)
        setStats({
          totalAnalyses: data.total,
          completedAnalyses: data.total,
          failedAnalyses: 0,
          processingAnalyses: 0,
          averageScore: data.averageScore,
          successRate: 100
        })
      } else {
        console.error('Failed to refresh analyses:', data.error)
      }
    } catch (error) {
      console.error('Error refreshing analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to validate and format analysis data
  const validateAnalysisData = (analysis: Analysis) => {
    // Ensure key_strengths is always an array
    if (!Array.isArray(analysis.key_strengths)) {
      analysis.key_strengths = analysis.key_strengths ? [String(analysis.key_strengths)] : []
    }

    // Ensure strengths_analysis is an object with proper structure
    if (!analysis.strengths_analysis || typeof analysis.strengths_analysis !== 'object') {
      analysis.strengths_analysis = {}
    }

    // Ensure salary_analysis is an object with proper structure
    if (!analysis.salary_analysis || typeof analysis.salary_analysis !== 'object') {
      analysis.salary_analysis = {}
    }

    // Ensure career_path is an object with proper structure
    if (!analysis.career_path || typeof analysis.career_path !== 'object') {
      analysis.career_path = {}
    }

    // Ensure section_analysis is an object with proper structure
    if (!analysis.section_analysis || typeof analysis.section_analysis !== 'object') {
      analysis.section_analysis = {}
    }

    return analysis
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const handleViewAnalysis = (analysis: Analysis) => {
    console.log('handleViewAnalysis called with:', analysis)
    console.log('Strengths Analysis:', analysis.strengths_analysis)
    console.log('Salary Analysis:', analysis.salary_analysis)
    console.log('Career Path:', analysis.career_path)
    console.log('Section Analysis:', analysis.section_analysis)
    try {
      setSelectedAnalysis(analysis)
      setAnalysisModalOpen(true)
      console.log('Modal state updated - selectedAnalysis:', analysis, 'analysisModalOpen:', true)
    } catch (error) {
      console.error('Error in handleViewAnalysis:', error)
    }
  }

  const dashboardCards = [
    {
      title: 'Total Analyses',
      value: stats.totalAnalyses,
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-600',
      description: 'All time analyses',
      trend: '+12% this week'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      description: 'Completed successfully',
      trend: '+2.1% this month'
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: Trophy,
      color: 'from-purple-500 to-pink-600',
      description: 'Overall performance',
      trend: '+5.3% improvement'
    },
    {
      title: 'Active Processing',
      value: stats.processingAnalyses,
      icon: Activity,
      color: 'from-yellow-500 to-orange-600',
      description: 'Currently processing',
      trend: '-8% from yesterday'
    }
  ]

  return (
    <AdminLayout title="AI Analysis Management" description="Manage and view AI-powered resume analysis results">
      <div className="space-y-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card hover:bg-white/5 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                      <p className="text-xs text-green-400 mt-2">{card.trend}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700" onClick={refreshAnalyses}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No analysis results found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white">User</TableHead>
                      <TableHead className="text-white">Overall Score</TableHead>
                      <TableHead className="text-white">ATS Compatibility</TableHead>
                      <TableHead className="text-white">Content Quality</TableHead>
                      <TableHead className="text-white">Professional Presentation</TableHead>
                      <TableHead className="text-white">Skills Alignment</TableHead>
                      <TableHead className="text-white">Created At</TableHead>
                      <TableHead className="text-white">Updated At</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAnalyses.map((analysis) => (
                      <TableRow key={analysis.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage 
                                src={analysis.user_avatar} 
                                alt={analysis.user_name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                                {getInitials(analysis.user_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium text-sm">{analysis.user_name}</p>
                              <p className="text-gray-400 text-xs">{analysis.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getScoreBadge(analysis.overall_score)}>
                            {analysis.overall_score}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getScoreColor(analysis.ats_compatibility_score)}>
                            {analysis.ats_compatibility_score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getScoreColor(analysis.content_quality_score)}>
                            {analysis.content_quality_score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getScoreColor(analysis.professional_presentation_score)}>
                            {analysis.professional_presentation_score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getScoreColor(analysis.skills_alignment_score)}>
                            {analysis.skills_alignment_score}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-300 text-sm">
                            {formatDate(analysis.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-300 text-sm">
                            {formatDate(analysis.updated_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAnalysis(analysis)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Analysis
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredAnalyses.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAnalyses.length)} of {filteredAnalyses.length} analyses
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-cyan-500 text-white hover:bg-cyan-600"
                              : "border-white/10 text-white hover:bg-white/10"
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Details Modal */}
        {analysisModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">AI Analysis Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAnalysisModalOpen(false)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedAnalysis && (
                <div className="space-y-6 px-6 py-6 flex-1 overflow-y-auto">
                  {/* User Info */}
                  <div className="flex items-center space-x-6 p-6 bg-white/5 rounded-lg border border-white/10">
                    <Avatar className="w-16 h-16">
                      <AvatarImage 
                        src={selectedAnalysis.user_avatar} 
                        alt={selectedAnalysis.user_name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xl">
                        {getInitials(selectedAnalysis.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedAnalysis.user_name}</h3>
                      <p className="text-gray-400 text-lg">{selectedAnalysis.user_email}</p>
                      <p className="text-gray-500">Analysis created: {formatDate(selectedAnalysis.created_at)}</p>
                    </div>
                  </div>

                  {/* Overall Score */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-2xl">
                        <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
                        Overall Score: {selectedAnalysis.overall_score || 'N/A'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedAnalysis.overall_score ? (
                        <Progress value={selectedAnalysis.overall_score} className="h-4" />
                      ) : (
                        <div className="text-gray-400 text-sm">No score data available</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">ATS Compatibility</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.ats_compatibility_score ? (
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-green-400">{selectedAnalysis.ats_compatibility_score}</span>
                            <Progress value={selectedAnalysis.ats_compatibility_score} className="w-24 h-3" />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No data available</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Content Quality</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.content_quality_score ? (
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-blue-400">{selectedAnalysis.content_quality_score}</span>
                            <Progress value={selectedAnalysis.content_quality_score} className="w-24 h-3" />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No data available</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Professional Presentation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.professional_presentation_score ? (
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-purple-400">{selectedAnalysis.professional_presentation_score}</span>
                            <Progress value={selectedAnalysis.professional_presentation_score} className="w-24 h-3" />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No data available</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Skills Alignment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.skills_alignment_score ? (
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-cyan-400">{selectedAnalysis.skills_alignment_score}</span>
                            <Progress value={selectedAnalysis.skills_alignment_score} className="w-24 h-3" />
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Improved Summary */}
                  <div>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                          Improved Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.improved_summary ? (
                          <p className="text-gray-300 leading-relaxed">{selectedAnalysis.improved_summary}</p>
                        ) : (
                          <div className="text-gray-400 text-sm">No improved summary available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Key Strengths */}
                  <div>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Award className="w-5 h-5 mr-2 text-green-400" />
                          Key Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.key_strengths && selectedAnalysis.key_strengths.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(selectedAnalysis.key_strengths) ? (
                              selectedAnalysis.key_strengths.map((strength: string, index: number) => (
                                <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/30">
                                  {String(strength)}
                                </Badge>
                              ))
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                {String(selectedAnalysis.key_strengths)}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No key strengths data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Strengths Analysis */}
                  <div>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-400" />
                          Strengths Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.strengths_analysis ? (
                          <div className="space-y-4">
                            {selectedAnalysis.strengths_analysis.topStrengths && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Top Strengths</h4>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(selectedAnalysis.strengths_analysis.topStrengths) ? 
                                    selectedAnalysis.strengths_analysis.topStrengths.map((strength: string, index: number) => (
                                      <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                        {strength}
                                      </Badge>
                                    )) : (
                                      <span className="text-gray-300">No top strengths data</span>
                                    )
                                  }
                                </div>
                              </div>
                            )}
                            
                            {selectedAnalysis.strengths_analysis.uniqueValue && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Unique Value</h4>
                                <p className="text-gray-300">{selectedAnalysis.strengths_analysis.uniqueValue}</p>
                              </div>
                            )}
                            
                            {selectedAnalysis.strengths_analysis.areasToHighlight && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Areas to Highlight</h4>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(selectedAnalysis.strengths_analysis.areasToHighlight) ? 
                                    selectedAnalysis.strengths_analysis.areasToHighlight.map((area: string, index: number) => (
                                      <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/30">
                                        {area}
                                      </Badge>
                                    )) : (
                                      <span className="text-gray-300">No highlight areas data</span>
                                    )
                                  }
                                </div>
                              </div>
                            )}
                            
                            {/* Fallback for old data structure */}
                            {!selectedAnalysis.strengths_analysis.topStrengths && 
                             !selectedAnalysis.strengths_analysis.uniqueValue && 
                             !selectedAnalysis.strengths_analysis.areasToHighlight && (
                              <div className="text-gray-400 text-sm">
                                {Object.keys(selectedAnalysis.strengths_analysis).length > 0 ? (
                                  Object.entries(selectedAnalysis.strengths_analysis).map(([key, value]) => (
                                    <div key={key} className="mb-3">
                                      <h4 className="text-white font-medium capitalize mb-2">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {Array.isArray(value) ? value.map((item: string, index: number) => (
                                          <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                            {item}
                                          </Badge>
                                        )) : (
                                          <span className="text-gray-300">{String(value)}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <span>No strengths analysis data available</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No strengths analysis data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Salary Analysis */}
                  <div>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                          Salary Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.salary_analysis ? (
                          <div className="space-y-3">
                            {selectedAnalysis.salary_analysis.currentLevel && (
                              <div className="flex items-center gap-3">
                                <span className="text-gray-300 capitalize min-w-[120px]">Current Level:</span>
                                <span className="text-white font-medium">{selectedAnalysis.salary_analysis.currentLevel}</span>
                              </div>
                            )}
                            
                            {selectedAnalysis.salary_analysis.recommendedSalaryRange && (
                              <div className="flex items-center gap-3">
                                <span className="text-gray-300 capitalize min-w-[120px]">Salary Range:</span>
                                <span className="text-white font-medium">{selectedAnalysis.salary_analysis.recommendedSalaryRange}</span>
                              </div>
                            )}
                            
                            {selectedAnalysis.salary_analysis.marketPosition && (
                              <div className="flex items-center gap-3">
                                <span className="text-gray-300 capitalize min-w-[120px]">Market Position:</span>
                                <span className="text-white font-medium">{selectedAnalysis.salary_analysis.marketPosition}</span>
                              </div>
                            )}
                            
                            {selectedAnalysis.salary_analysis.growthPotential && (
                              <div className="flex items-center gap-3">
                                <span className="text-gray-300 capitalize min-w-[120px]">Growth Potential:</span>
                                <span className="text-white font-medium">{selectedAnalysis.salary_analysis.growthPotential}</span>
                              </div>
                            )}
                            
                            {/* Fallback for old data structure */}
                            {!selectedAnalysis.salary_analysis.currentLevel && 
                             !selectedAnalysis.salary_analysis.recommendedSalaryRange && 
                             !selectedAnalysis.salary_analysis.marketPosition && 
                             !selectedAnalysis.salary_analysis.growthPotential && (
                              <div className="text-gray-400 text-sm">
                                {Object.keys(selectedAnalysis.salary_analysis).length > 0 ? (
                                  Object.entries(selectedAnalysis.salary_analysis).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-3">
                                      <span className="text-gray-300 capitalize min-w-[120px]">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}:
                                      </span>
                                      <span className="text-white font-medium">
                                        {Array.isArray(value) ? value.join(', ') : String(value || 'N/A')}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span>No salary analysis data available</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No salary analysis data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Career Path */}
                  <div>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Target className="w-5 h-5 mr-2 text-purple-400" />
                          Career Path
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.career_path ? (
                          <div className="space-y-4">
                            {selectedAnalysis.career_path.currentRole && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Current Role</h4>
                                <p className="text-gray-300">{selectedAnalysis.career_path.currentRole}</p>
                              </div>
                            )}
                            
                            {selectedAnalysis.career_path.targetRole && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Target Role</h4>
                                <p className="text-gray-300">{selectedAnalysis.career_path.targetRole}</p>
                              </div>
                            )}
                            
                            {selectedAnalysis.career_path.nextCareerSteps && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Next Career Steps</h4>
                                <ul className="space-y-2">
                                  {Array.isArray(selectedAnalysis.career_path.nextCareerSteps) ? 
                                    selectedAnalysis.career_path.nextCareerSteps.map((step: any, index: number) => (
                                      <li key={index} className="text-gray-300">
                                        {typeof step === 'object' && step.title ? (
                                          <div>
                                            <span className="text-white font-medium">{step.title}:</span> {step.description}
                                          </div>
                                        ) : (
                                          <span>{String(step)}</span>
                                        )}
                                      </li>
                                    )) : (
                                      <span className="text-gray-300">No next steps data</span>
                                    )
                                  }
                                </ul>
                              </div>
                            )}
                            
                            {selectedAnalysis.career_path.timeline && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Timeline</h4>
                                <p className="text-gray-300">{selectedAnalysis.career_path.timeline}</p>
                              </div>
                            )}
                            
                            {/* Fallback for old data structure */}
                            {!selectedAnalysis.career_path.currentRole && 
                             !selectedAnalysis.career_path.targetRole && 
                             !selectedAnalysis.career_path.nextCareerSteps && 
                             !selectedAnalysis.career_path.timeline && (
                              <div className="text-gray-400 text-sm">
                                {Object.keys(selectedAnalysis.career_path).length > 0 ? (
                                  Object.entries(selectedAnalysis.career_path).map(([key, value]) => (
                                    <div key={key}>
                                      <h4 className="text-white font-medium capitalize mb-2">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                      </h4>
                                      <div className="text-gray-300">
                                        {Array.isArray(value) ? (
                                          <ul className="list-disc list-inside space-y-1">
                                            {value.map((item: any, index: number) => (
                                              <li key={index}>
                                                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <span>{String(value)}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <span>No career path data available</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No career path data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Section Analysis */}
                  <div>
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                          Section Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedAnalysis.section_analysis ? (
                          <div className="space-y-4">
                            {Object.entries(selectedAnalysis.section_analysis).map(([section, data]: [string, any]) => (
                              <div key={section} className="border-b border-white/10 pb-4 last:border-b-0">
                                <h4 className="text-white font-medium capitalize mb-2">
                                  {section.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()} Section
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  {data.score && (
                                    <div>
                                      <span className="text-gray-400">Score: </span>
                                      <span className="text-white font-medium">{data.score}</span>
                                    </div>
                                  )}
                                  {data.reasons && data.reasons.length > 0 && (
                                    <div>
                                      <span className="text-gray-400">Reasons: </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Array.isArray(data.reasons) ? data.reasons.map((reason: string, index: number) => (
                                          <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                            {reason}
                                          </Badge>
                                        )) : (
                                          <span className="text-gray-300 text-sm">{String(data.reasons)}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {data.issues && data.issues.length > 0 && (
                                    <div>
                                      <span className="text-gray-400">Issues: </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Array.isArray(data.issues) ? data.issues.map((issue: string, index: number) => (
                                          <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                            {issue}
                                          </Badge>
                                        )) : (
                                          <span className="text-gray-300 text-sm">{String(data.issues)}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {data.improvements && data.improvements.length > 0 && (
                                    <div className="lg:col-span-3">
                                      <span className="text-gray-400">Improvements: </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Array.isArray(data.improvements) ? data.improvements.map((improvement: string, index: number) => (
                                          <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                            {improvement}
                                          </Badge>
                                        )) : (
                                          <span className="text-gray-300 text-sm">{String(data.improvements)}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Fallback for sections with minimal data */}
                                  {!data.score && !data.reasons && !data.issues && !data.improvements && (
                                    <div className="lg:col-span-3">
                                      <span className="text-gray-400">Data: </span>
                                      <span className="text-gray-300 text-sm">
                                        {typeof data === 'object' ? JSON.stringify(data) : String(data)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">No section analysis data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
