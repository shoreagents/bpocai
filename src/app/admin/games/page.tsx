'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MoreHorizontal, 
  Plus, 
  Settings, 
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  BarChart3,
  Brain,
  MessageSquare,
  PuzzleIcon,
  Keyboard,
  Star,
  Globe
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AdminLayout from '@/components/layout/AdminLayout'
import { toast } from '@/components/ui/toast'

interface GameData {
  id: string
  header: string
  sectionType: string
  status: 'Done' | 'In Process' | 'Pending' | 'Review'
  target: number
  limit: number
  reviewer: string
  participants: number
  completionRate: number
  averageScore: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
}

interface TypingHeroStats {
  id: string
  user_id: string
  total_sessions: number
  completed_sessions: number
  last_played_at: string
  best_wpm: number
  best_accuracy: number
  median_wpm: number
  recent_wpm: number
  consistency_index: number
  percentile: number
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  user_avatar?: string
}

interface UltimateStats {
  id: string
  user_id: string
  total_sessions: number
  last_taken_at: string
  smart: number
  motivated: number
  integrity: number
  business: number
  platinum_choices: number
  gold_choices: number
  bronze_choices: number
  nightmare_choices: number
  last_tier: string
  last_recommendation: string
  last_client_value: string
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  user_avatar?: string
}

interface DiscPersonalityStats {
  id: string
  user_id: string
  last_taken_at: string
  d: number
  i: number
  s: number
  c: number
  primary_style: string
  secondary_style: string
  consistency_index: number
  strengths: string[]
  blind_spots: string[]
  preferred_env: string[]
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  user_avatar?: string
}

interface GameTab {
  id: string
  name: string
  badge?: number
  icon: any
}

export default function GamesPage() {
  const [selectedTab, setSelectedTab] = useState('typing-hero')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [typingHeroStats, setTypingHeroStats] = useState<TypingHeroStats[]>([])
  const [ultimateStats, setUltimateStats] = useState<UltimateStats[]>([])
  const [discPersonalityStats, setDiscPersonalityStats] = useState<DiscPersonalityStats[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const [deletingStats, setDeletingStats] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteStatId, setDeleteStatId] = useState<string>('')
  const [deleteStatType, setDeleteStatType] = useState<string>('')
  const [deleteStatName, setDeleteStatName] = useState<string>('')

  const tabs: GameTab[] = [
    { id: 'typing-hero', name: 'Typing Hero', icon: Keyboard },
    { id: 'disc-personality', name: 'BPOC DISC', icon: Brain },
    { id: 'ultimate', name: 'BPOC Ultimate', icon: Star },
    { id: 'bpoc-cultural', name: 'BPOC Cultural', icon: Globe }
  ]

  const fetchTypingHeroStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/typing-hero-stats')
      if (response.ok) {
        const data = await response.json()
        setTypingHeroStats(data.stats || [])
      } else {
        setError('Failed to fetch typing hero stats')
        setTypingHeroStats([])
      }
    } catch (error) {
      setError('Failed to fetch typing hero stats')
      setTypingHeroStats([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUltimateStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/ultimate-stats')
      if (response.ok) {
        const data = await response.json()
        setUltimateStats(data.stats || [])
      } else {
        setError('Failed to fetch ultimate stats')
        setUltimateStats([])
      }
    } catch (error) {
      setError('Failed to fetch ultimate stats')
      setUltimateStats([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDiscPersonalityStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Frontend: Fetching DISC personality stats...')
      const response = await fetch('/api/admin/disc-personality-stats')
      console.log('Frontend: DISC API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Frontend: DISC API data received:', data)
        setDiscPersonalityStats(data.stats || [])
      } else {
        console.error('Frontend: DISC API error status:', response.status)
        setError('Failed to fetch DISC personality stats')
        setDiscPersonalityStats([])
      }
    } catch (error) {
      console.error('Frontend: DISC API fetch error:', error)
      setError('Failed to fetch DISC personality stats')
      setDiscPersonalityStats([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedTab === 'typing-hero') {
      fetchTypingHeroStats()
    } else if (selectedTab === 'ultimate') {
      fetchUltimateStats()
    } else if (selectedTab === 'disc-personality') {
      fetchDiscPersonalityStats()
    }
  }, [selectedTab, fetchTypingHeroStats, fetchUltimateStats, fetchDiscPersonalityStats])

  const gameData: GameData[] = [
    {
      id: '1',
      header: 'Speed Typing Challenge',
      sectionType: 'Speed Game',
      status: 'Done',
      target: 50,
      limit: 55,
      reviewer: 'Eddie Lake',
      participants: 234,
      completionRate: 94,
      averageScore: 82,
      difficulty: 'Medium',
      category: 'Typing'
    },
    {
      id: '2',
      header: 'Programming Syntax Race',
      sectionType: 'Technical Game',
      status: 'In Process',
      target: 35,
      limit: 40,
      reviewer: 'Jamik Tashpulatov',
      participants: 156,
      completionRate: 78,
      averageScore: 71,
      difficulty: 'Hard',
      category: 'Programming'
    },
    {
      id: '3',
      header: 'Word Accuracy Master',
      sectionType: 'Accuracy Game',
      status: 'Done',
      target: 30,
      limit: 32,
      reviewer: 'Eddie Lake',
      participants: 189,
      completionRate: 96,
      averageScore: 88,
      difficulty: 'Easy',
      category: 'Typing'
    },
    {
      id: '4',
      header: 'Logic Puzzle Solver',
      sectionType: 'Puzzle Game',
      status: 'In Process',
      target: 25,
      limit: 28,
      reviewer: 'Jamik Tashpulatov',
      participants: 98,
      completionRate: 72,
      averageScore: 65,
      difficulty: 'Hard',
      category: 'Logic'
    },
    {
      id: '5',
      header: 'Email Management Pro',
      sectionType: 'Management Game',
      status: 'Pending',
      target: 20,
      limit: 22,
      reviewer: 'Assign reviewer',
      participants: 67,
      completionRate: 58,
      averageScore: 54,
      difficulty: 'Medium',
      category: 'Productivity'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'In Process':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'Pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'Review':
        return <BarChart3 className="w-4 h-4 text-purple-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'In Process':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Review':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(gameData.map(item => item.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id])
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }

  // Filter and paginate typing hero stats
  const filteredTypingHeroStats = typingHeroStats.filter(stat => {
    // Search filter
    const matchesSearch = stat.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stat.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    // Type filter
    switch (filterType) {
      case 'active':
        return stat.last_played_at && new Date(stat.last_played_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      case 'inactive':
        return !stat.last_played_at || new Date(stat.last_played_at) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      case 'high-wpm':
        return stat.best_wpm >= 50
      case 'high-accuracy':
        return stat.best_accuracy >= 90
      case 'recent':
        return stat.last_played_at && new Date(stat.last_played_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      case 'all':
      default:
        return true
    }
  })

  // Filter Ultimate stats
  const filteredUltimateStats = ultimateStats.filter(stat => {
    // Search filter
    const matchesSearch = stat.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stat.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    // Type filter
    switch (filterType) {
      case 'active':
        return stat.last_taken_at && new Date(stat.last_taken_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      case 'inactive':
        return !stat.last_taken_at || new Date(stat.last_taken_at) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      case 'high-score':
        return stat.smart >= 80 || stat.motivated >= 80 || stat.integrity >= 80 || stat.business >= 80
      case 'high-leadership':
        return stat.smart >= 80
      case 'high-integrity':
        return stat.integrity >= 80
      case 'recent':
        return stat.last_taken_at && new Date(stat.last_taken_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      case 'all':
      default:
        return true
    }
  })

  // Filter DISC Personality stats
  const filteredDiscPersonalityStats = discPersonalityStats.filter(stat => {
    // Search filter
    const matchesSearch = stat.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stat.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    // Type filter
    switch (filterType) {
      case 'active':
        return stat.last_taken_at && new Date(stat.last_taken_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      case 'inactive':
        return !stat.last_taken_at || new Date(stat.last_taken_at) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      case 'high-consistency':
        return stat.consistency_index >= 80
      case 'recent':
        return stat.last_taken_at && new Date(stat.last_taken_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      case 'all':
      default:
        return true
    }
  })

  const totalPages = Math.ceil(filteredTypingHeroStats.length / itemsPerPage)
  const paginatedTypingHeroStats = filteredTypingHeroStats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filter: string) => {
    setFilterType(filter)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDeleteStat = async (statId: string, statType: string, statName: string) => {
    setDeleteStatId(statId)
    setDeleteStatType(statType)
    setDeleteStatName(statName)
    setShowDeleteDialog(true)
  }

  const confirmDeleteStat = async () => {
    if (!deleteStatId || !deleteStatType) return

    try {
      setDeletingStats(prev => [...prev, deleteStatId])
      
      let endpoint = ''
      switch (deleteStatType) {
        case 'typing-hero':
          endpoint = `/api/admin/typing-hero-stats/${deleteStatId}`
          break
        case 'disc-personality':
          endpoint = `/api/admin/disc-personality-stats/${deleteStatId}`
          break
        case 'ultimate':
          endpoint = `/api/admin/ultimate-stats/${deleteStatId}`
          break
        default:
          throw new Error('Invalid stat type')
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the deleted stat from the appropriate state
        switch (deleteStatType) {
          case 'typing-hero':
            setTypingHeroStats(prev => prev.filter(stat => stat.id !== deleteStatId))
            break
          case 'disc-personality':
            setDiscPersonalityStats(prev => prev.filter(stat => stat.id !== deleteStatId))
            break
          case 'ultimate':
            setUltimateStats(prev => prev.filter(stat => stat.id !== deleteStatId))
            break
        }
        setShowDeleteDialog(false)
        setDeleteStatId('')
        setDeleteStatType('')
        setDeleteStatName('')
        toast.success('Stat record deleted successfully')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete stat')
      }
    } catch (error) {
      console.error('Error deleting stat:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete stat'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setDeletingStats(prev => prev.filter(id => id !== deleteStatId))
    }
  }

  const currentTab = tabs.find(tab => tab.id === selectedTab)

  return (
    <AdminLayout 
      title="Game Management" 
      description="Manage and monitor game performance and player analytics"

    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 border border-white/10 rounded-lg p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = selectedTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 border border-transparent ${
                  isActive 
                    ? 'bg-white text-gray-900 font-medium border-white/20' 
                    : 'text-white hover:bg-white/5 border-white/10'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>


        {/* Typing Hero Stats Table */}
        {selectedTab === 'typing-hero' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Typing Hero Statistics
              </CardTitle>
              <div className="flex items-center gap-4 ml-auto">
                <div className="relative">
                  <Select value={filterType || 'all'} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white focus:ring-cyan-500">
                      <SelectValue placeholder="All Players" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="all">All Players</SelectItem>
                      <SelectItem value="active">Active Players</SelectItem>
                      <SelectItem value="inactive">Inactive Players</SelectItem>
                      <SelectItem value="high-wpm">High WPM (50+)</SelectItem>
                      <SelectItem value="high-accuracy">High Accuracy (90%+)</SelectItem>
                      <SelectItem value="recent">Recently Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                {(searchTerm || filterType !== 'all') && (
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white border border-white/20"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">{error}</div>
              ) : (
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white font-medium">Name</TableHead>
                        <TableHead className="text-white font-medium">Sessions</TableHead>
                        <TableHead className="text-white font-medium">Best WPM</TableHead>
                        <TableHead className="text-white font-medium">Best Accuracy</TableHead>
                        <TableHead className="text-white font-medium">Consistency</TableHead>
                        <TableHead className="text-white font-medium">Percentile</TableHead>
                        <TableHead className="text-white font-medium">Last Played</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTypingHeroStats.map((stat) => (
                        <TableRow key={stat.id} className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage 
                                  src={stat.user_avatar} 
                                  alt={stat.user_name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-600 text-white text-xs">
                                  {stat.user_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-white">{stat.user_name}</div>
                                <div className="text-sm text-gray-400">{stat.user_email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.completed_sessions}/{stat.total_sessions}</div>
                              <div className="text-xs text-gray-400">completed</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.best_wpm}</div>
                              <div className="text-xs text-gray-400">WPM</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.best_accuracy}%</div>
                              <div className="text-xs text-gray-400">accuracy</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.consistency_index}</div>
                              <div className="text-xs text-gray-400">index</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.percentile}</div>
                              <div className="text-xs text-gray-400">percentile</div>
                            </div>
                          </TableCell>
                                                     <TableCell>
                             <div className="text-sm text-gray-400">
                               {stat.created_at ? new Date(stat.created_at).toLocaleDateString() : 'Unknown'}
                             </div>
                           </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-white/10">
                                <DropdownMenuItem 
                                  className="text-red-400"
                                  onClick={() => handleDeleteStat(stat.id, 'typing-hero', stat.user_name)}
                                  disabled={deletingStats.includes(stat.id)}
                                >
                                  {deletingStats.includes(stat.id) ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ultimate Stats Table */}
        {selectedTab === 'ultimate' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5" />
                BPOC Ultimate Statistics
              </CardTitle>
              <div className="flex items-center gap-4 ml-auto">
                <div className="relative">
                  <Select value={filterType || 'all'} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white focus:ring-cyan-500">
                      <SelectValue placeholder="All Players" />
                    </SelectTrigger>
                                         <SelectContent className="bg-gray-900 border-white/10">
                       <SelectItem value="all">All Players</SelectItem>
                       <SelectItem value="active">Active Players</SelectItem>
                       <SelectItem value="inactive">Inactive Players</SelectItem>
                       <SelectItem value="high-score">High Score (80%+)</SelectItem>
                       <SelectItem value="high-leadership">High Smart (80%+)</SelectItem>
                       <SelectItem value="high-integrity">High Integrity (80%+)</SelectItem>
                       <SelectItem value="recent">Recently Active</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                {(searchTerm || filterType !== 'all') && (
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white border border-white/20"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">{error}</div>
              ) : (
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <Table>
                                         <TableHeader>
                       <TableRow className="border-white/10 hover:bg-white/5">
                         <TableHead className="text-white font-medium">Name</TableHead>
                         <TableHead className="text-white font-medium">Sessions</TableHead>
                         <TableHead className="text-white font-medium">Smart</TableHead>
                         <TableHead className="text-white font-medium">Motivated</TableHead>
                         <TableHead className="text-white font-medium">Integrity</TableHead>
                         <TableHead className="text-white font-medium">Business</TableHead>
                         <TableHead className="text-white font-medium">Platinum</TableHead>
                         <TableHead className="text-white font-medium">Gold</TableHead>
                         <TableHead className="text-white font-medium">Bronze</TableHead>
                         <TableHead className="text-white font-medium">Last Tier</TableHead>
                         <TableHead className="text-white font-medium">Last Taken</TableHead>
                         <TableHead className="w-12"></TableHead>
                       </TableRow>
                     </TableHeader>
                    <TableBody>
                      {filteredUltimateStats.map((stat) => (
                        <TableRow key={stat.id} className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage 
                                  src={stat.user_avatar} 
                                  alt={stat.user_name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-600 text-white text-xs">
                                  {stat.user_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-white">{stat.user_name}</div>
                                <div className="text-sm text-gray-400">{stat.user_email}</div>
                              </div>
                            </div>
                          </TableCell>
                                                     <TableCell>
                             <div className="text-center">
                               <div className="font-medium text-white">{stat.total_sessions}</div>
                               <div className="text-xs text-gray-400">sessions</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <div className="font-medium text-white">{stat.smart}</div>
                               <div className="text-xs text-gray-400">smart</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <div className="font-medium text-white">{stat.motivated}</div>
                               <div className="text-xs text-gray-400">motivated</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <div className="font-medium text-white">{stat.integrity}</div>
                               <div className="text-xs text-gray-400">integrity</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <div className="text-white">{stat.business}</div>
                               <div className="text-xs text-gray-400">business</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <div className="font-medium text-white">{stat.platinum_choices}</div>
                               <div className="text-xs text-gray-400">platinum</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <div className="font-medium text-white">{stat.gold_choices}</div>
                               <div className="text-xs text-gray-400">gold</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <div className="font-medium text-white">{stat.bronze_choices}</div>
                               <div className="text-xs text-gray-400">bronze</div>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-center">
                               <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                 {stat.last_tier || 'N/A'}
                               </Badge>
                             </div>
                           </TableCell>
                           <TableCell>
                             <div className="text-sm text-gray-400">
                               {stat.last_taken_at ? new Date(stat.last_taken_at).toLocaleDateString() : 'Never'}
                             </div>
                           </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-white/10">
                                <DropdownMenuItem 
                                  className="text-red-400"
                                  onClick={() => handleDeleteStat(stat.id, 'ultimate', stat.user_name)}
                                  disabled={deletingStats.includes(stat.id)}
                                >
                                  {deletingStats.includes(stat.id) ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* DISC Personality Stats Table */}
        {selectedTab === 'disc-personality' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                BPOC DISC Personality Statistics
              </CardTitle>
              <div className="flex items-center gap-4 ml-auto">
                <div className="relative">
                  <Select value={filterType || 'all'} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white focus:ring-cyan-500">
                      <SelectValue placeholder="All Players" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="all">All Players</SelectItem>
                      <SelectItem value="active">Active Players</SelectItem>
                      <SelectItem value="inactive">Inactive Players</SelectItem>
                      <SelectItem value="high-consistency">High Consistency (80%+)</SelectItem>
                      <SelectItem value="recent">Recently Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                {(searchTerm || filterType !== 'all') && (
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white border border-white/20"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">{error}</div>
              ) : (
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white font-medium">Name</TableHead>
                        <TableHead className="text-white font-medium">D Score</TableHead>
                        <TableHead className="text-white font-medium">I Score</TableHead>
                        <TableHead className="text-white font-medium">S Score</TableHead>
                        <TableHead className="text-white font-medium">C Score</TableHead>
                        <TableHead className="text-white font-medium">Primary Style</TableHead>
                        <TableHead className="text-white font-medium">Secondary Style</TableHead>
                        <TableHead className="text-white font-medium">Consistency</TableHead>
                        <TableHead className="text-white font-medium">Last Taken</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDiscPersonalityStats.map((stat) => (
                        <TableRow key={stat.id} className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage 
                                  src={stat.user_avatar} 
                                  alt={stat.user_name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-600 text-white text-xs">
                                  {stat.user_name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-white">{stat.user_name}</div>
                                <div className="text-sm text-gray-400">{stat.user_email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.d}</div>
                              <div className="text-xs text-gray-400">Dominance</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.i}</div>
                              <div className="text-xs text-gray-400">Influence</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.s}</div>
                              <div className="text-xs text-gray-400">Steadiness</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.c}</div>
                              <div className="text-xs text-gray-400">Conscientiousness</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {stat.primary_style}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                {stat.secondary_style}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium text-white">{stat.consistency_index}%</div>
                              <div className="text-xs text-gray-400">consistency</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-400">
                              {stat.last_taken_at ? new Date(stat.last_taken_at).toLocaleDateString() : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-white/10">
                                <DropdownMenuItem 
                                  className="text-red-400"
                                  onClick={() => handleDeleteStat(stat.id, 'disc-personality', stat.user_name)}
                                  disabled={deletingStats.includes(stat.id)}
                                >
                                  {deletingStats.includes(stat.id) ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Stat Record</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete the stat record for <span className="font-medium text-white">{deleteStatName}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeleteStatId('')
                    setDeleteStatType('')
                    setDeleteStatName('')
                  }}
                  className="border border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteStat}
                  disabled={deletingStats.includes(deleteStatId)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deletingStats.includes(deleteStatId) ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
} 