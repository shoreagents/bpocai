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
  Globe,
  X
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
  
  // Pagination state for Ultimate and DISC tables
  const [ultimateCurrentPage, setUltimateCurrentPage] = useState(1)
  const [discCurrentPage, setDiscCurrentPage] = useState(1)
  const [deletingStats, setDeletingStats] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteStatId, setDeleteStatId] = useState<string>('')
  const [deleteStatType, setDeleteStatType] = useState<string>('')
  const [deleteStatName, setDeleteStatName] = useState<string>('')

  // Modal state for game details
  const [selectedGameStat, setSelectedGameStat] = useState<any | null>(null)
  const [gameModalOpen, setGameModalOpen] = useState(false)
  const [gameModalType, setGameModalType] = useState<string>('')

  // New: BPOC Cultural results admin view state
  const [bpocResults, setBpocResults] = useState<any[]>([])
  const [bpocSelected, setBpocSelected] = useState<any | null>(null)
  const [bpocLoading, setBpocLoading] = useState<boolean>(false)

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

  const fetchBpocResults = useCallback(async () => {
    try {
      setBpocLoading(true)
      setError(null)
      const res = await fetch('/api/admin/bpoc-cultural-results?limit=200', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch BPOC cultural results')
      const data = await res.json()
      setBpocResults(Array.isArray(data.results) ? data.results : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch BPOC cultural results')
      setBpocResults([])
    } finally {
      setBpocLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedTab === 'typing-hero') {
      fetchTypingHeroStats()
    } else if (selectedTab === 'ultimate') {
      fetchUltimateStats()
    } else if (selectedTab === 'disc-personality') {
      fetchDiscPersonalityStats()
    } else if (selectedTab === 'bpoc-cultural') {
      fetchBpocResults()
    }
  }, [selectedTab, fetchTypingHeroStats, fetchUltimateStats, fetchDiscPersonalityStats, fetchBpocResults])

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

  // Pagination logic for Ultimate stats
  const ultimateTotalPages = Math.ceil(filteredUltimateStats.length / itemsPerPage)
  const paginatedUltimateStats = filteredUltimateStats.slice(
    (ultimateCurrentPage - 1) * itemsPerPage,
    ultimateCurrentPage * itemsPerPage
  )

  // Pagination logic for DISC stats
  const discTotalPages = Math.ceil(filteredDiscPersonalityStats.length / itemsPerPage)
  const paginatedDiscStats = filteredDiscPersonalityStats.slice(
    (discCurrentPage - 1) * itemsPerPage,
    discCurrentPage * itemsPerPage
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
    setUltimateCurrentPage(1)
    setDiscCurrentPage(1)
  }

  const handleFilterChange = (filter: string) => {
    setFilterType(filter)
    setCurrentPage(1)
    setUltimateCurrentPage(1)
    setDiscCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setCurrentPage(1)
    setUltimateCurrentPage(1)
    setDiscCurrentPage(1)
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

  const handleViewGameStat = (stat: any, type: string) => {
    setSelectedGameStat(stat)
    setGameModalType(type)
    setGameModalOpen(true)
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

  // Helper function to generate initials from full name
  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
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
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white/20 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/20 invalid:border-white/20"
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
                      {paginatedTypingHeroStats.map((stat) => (
                        <TableRow key={stat.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => handleViewGameStat(stat, 'typing-hero')}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage 
                                  src={stat.user_avatar} 
                                  alt={stat.user_name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                                  {getInitials(stat.user_name)}
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
                          <TableCell onClick={(e) => e.stopPropagation()}>
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

            {/* Pagination for Typing Hero */}
            {!loading && !error && filteredTypingHeroStats.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTypingHeroStats.length)} of {filteredTypingHeroStats.length} players
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
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white/20 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/20 invalid:border-white/20"
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
                      {paginatedUltimateStats.map((stat) => (
                        <TableRow key={stat.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => handleViewGameStat(stat, 'ultimate')}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage 
                                  src={stat.user_avatar} 
                                  alt={stat.user_name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                                  {getInitials(stat.user_name)}
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
                          <TableCell onClick={(e) => e.stopPropagation()}>
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
            
            {/* Pagination for Ultimate Stats */}
            {filteredUltimateStats.length > 0 && (
              <div className="flex items-center justify-between mt-6 px-6 pb-6">
                <div className="text-sm text-gray-400">
                  Showing {(ultimateCurrentPage - 1) * itemsPerPage + 1} to {Math.min(ultimateCurrentPage * itemsPerPage, filteredUltimateStats.length)} of {filteredUltimateStats.length} players
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUltimateCurrentPage(ultimateCurrentPage - 1)}
                    disabled={ultimateCurrentPage === 1}
                    className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, ultimateTotalPages) }, (_, i) => {
                      let pageNum
                      if (ultimateTotalPages <= 5) {
                        pageNum = i + 1
                      } else if (ultimateCurrentPage <= 3) {
                        pageNum = i + 1
                      } else if (ultimateCurrentPage >= ultimateTotalPages - 2) {
                        pageNum = ultimateTotalPages - 4 + i
                      } else {
                        pageNum = ultimateCurrentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={ultimateCurrentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUltimateCurrentPage(pageNum)}
                          className={
                            ultimateCurrentPage === pageNum
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
                    onClick={() => setUltimateCurrentPage(ultimateCurrentPage + 1)}
                    disabled={ultimateCurrentPage === ultimateTotalPages}
                    className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
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
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white/20 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/20 invalid:border-white/20"
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
                      {paginatedDiscStats.map((stat) => (
                        <TableRow key={stat.id} className="border-white/10 hover:bg-white/5 cursor-pointer" onClick={() => handleViewGameStat(stat, 'disc-personality')}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage 
                                  src={stat.user_avatar} 
                                  alt={stat.user_name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                                  {getInitials(stat.user_name)}
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
                          <TableCell onClick={(e) => e.stopPropagation()}>
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
            
            {/* Pagination for DISC Personality Stats */}
            {filteredDiscPersonalityStats.length > 0 && (
              <div className="flex items-center justify-between mt-6 px-6 pb-6">
                <div className="text-sm text-gray-400">
                  Showing {(discCurrentPage - 1) * itemsPerPage + 1} to {Math.min(discCurrentPage * itemsPerPage, filteredDiscPersonalityStats.length)} of {filteredDiscPersonalityStats.length} players
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscCurrentPage(discCurrentPage - 1)}
                    disabled={discCurrentPage === 1}
                    className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, discTotalPages) }, (_, i) => {
                      let pageNum
                      if (discTotalPages <= 5) {
                        pageNum = i + 1
                      } else if (discCurrentPage <= 3) {
                        pageNum = i + 1
                      } else if (discCurrentPage >= discTotalPages - 2) {
                        pageNum = discTotalPages - 4 + i
                      } else {
                        pageNum = discCurrentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={discCurrentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDiscCurrentPage(pageNum)}
                          className={
                            discCurrentPage === pageNum
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
                    onClick={() => setDiscCurrentPage(discCurrentPage + 1)}
                    disabled={discCurrentPage === discTotalPages}
                    className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* BPOC Cultural Results */}
        {selectedTab === 'bpoc-cultural' && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                BPOC Cultural Results
              </CardTitle>
              <div className="flex items-center gap-4 ml-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white/20 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-white/20 invalid:border-white/20"
                  />
                </div>
                {(searchTerm || filterType !== 'all') && (
                  <Button onClick={clearAllFilters} variant="ghost" size="sm" className="text-gray-400 hover:text-white border border-white/20">Clear Filters</Button>
                )}
                <Button onClick={fetchBpocResults} variant="outline" className="border-white/20 text-white hover:bg-white/10">Refresh</Button>
              </div>
            </CardHeader>
            <CardContent>
              {bpocLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">{error}</div>
              ) : (
                <div className="rounded-lg border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white font-medium">User</TableHead>
                        <TableHead className="text-white font-medium">Summary</TableHead>
                        <TableHead className="text-white font-medium">US</TableHead>
                        <TableHead className="text-white font-medium">UK</TableHead>
                        <TableHead className="text-white font-medium">AU</TableHead>
                        <TableHead className="text-white font-medium">CA</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bpocResults
                        .filter((r) => {
                          if (!searchTerm) return true
                          const hay = `${r.full_name || ''}`.toLowerCase()
                          return hay.includes(searchTerm.toLowerCase())
                        })
                        .map((r) => {
                          const res = r.result_json || {}
                          const per = (res?.per_region_recommendation || {})
                          return (
                            <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                              <TableCell onClick={() => setBpocSelected(r)} className="cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={r.avatar_url || ''} alt={r.full_name || r.user_id} />
                                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">{getInitials(r.full_name || '?')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-white">{r.full_name || r.user_id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell onClick={() => setBpocSelected(r)} className="cursor-pointer max-w-[420px]">
                                <div className="text-gray-300 truncate" title={r.summary_text || ''}>{r.summary_text || '—'}</div>
                              </TableCell>
                              <TableCell onClick={() => setBpocSelected(r)} className="cursor-pointer">{String(per?.US || per?.us || '—').toUpperCase()}</TableCell>
                              <TableCell onClick={() => setBpocSelected(r)} className="cursor-pointer">{String(per?.UK || per?.uk || '—').toUpperCase()}</TableCell>
                              <TableCell onClick={() => setBpocSelected(r)} className="cursor-pointer">{String(per?.AU || per?.au || '—').toUpperCase()}</TableCell>
                              <TableCell onClick={() => setBpocSelected(r)} className="cursor-pointer">{String(per?.CA || per?.ca || '—').toUpperCase()}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-white">
                                    <DropdownMenuItem
                                      className="text-red-400 focus:text-red-400"
                                      onClick={async () => {
                                        try {
                                          const resp = await fetch(`/api/admin/bpoc-cultural-results/${r.id}`, { method: 'DELETE' })
                                          if (resp.ok) {
                                            setBpocResults(prev => prev.filter(x => x.id !== r.id))
                                          }
                                        } catch {}
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Details Modal */}
        {gameModalOpen && selectedGameStat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setGameModalOpen(false)}>
            <div className="bg-gray-900 border border-white/20 rounded-lg p-6 max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-semibold">
                  {gameModalType === 'typing-hero' && 'Typing Hero Details'}
                  {gameModalType === 'ultimate' && 'BPOC Ultimate Details'}
                  {gameModalType === 'disc-personality' && 'BPOC DISC Personality Details'}
                </div>
                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white" onClick={() => setGameModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-300 space-y-3">
                <div>
                  <div className="text-gray-400">User</div>
                  <div className="text-white">{selectedGameStat.user_name} <span className="text-gray-400">{selectedGameStat.user_email}</span></div>
                </div>

                {/* Typing Hero Details */}
                {gameModalType === 'typing-hero' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400">Sessions</div>
                      <div className="text-white">{selectedGameStat.completed_sessions}/{selectedGameStat.total_sessions} completed</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Best WPM</div>
                      <div className="text-white">{selectedGameStat.best_wpm}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Best Accuracy</div>
                      <div className="text-white">{selectedGameStat.best_accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Recent WPM</div>
                      <div className="text-white">{selectedGameStat.recent_wpm}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Median WPM</div>
                      <div className="text-white">{selectedGameStat.median_wpm}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Consistency Index</div>
                      <div className="text-white">{selectedGameStat.consistency_index}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Percentile</div>
                      <div className="text-white">{selectedGameStat.percentile}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Last Played</div>
                      <div className="text-white">{selectedGameStat.last_played_at ? new Date(selectedGameStat.last_played_at).toLocaleDateString() : 'Never'}</div>
                    </div>
                  </div>
                )}

                {/* Ultimate Details */}
                {gameModalType === 'ultimate' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400">Sessions</div>
                      <div className="text-white">{selectedGameStat.total_sessions}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Smart</div>
                      <div className="text-white">{selectedGameStat.smart}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Motivated</div>
                      <div className="text-white">{selectedGameStat.motivated}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Integrity</div>
                      <div className="text-white">{selectedGameStat.integrity}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Business</div>
                      <div className="text-white">{selectedGameStat.business}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Platinum Choices</div>
                      <div className="text-white">{selectedGameStat.platinum_choices}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Gold Choices</div>
                      <div className="text-white">{selectedGameStat.gold_choices}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Bronze Choices</div>
                      <div className="text-white">{selectedGameStat.bronze_choices}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Nightmare Choices</div>
                      <div className="text-white">{selectedGameStat.nightmare_choices}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Last Tier</div>
                      <div className="text-white">{selectedGameStat.last_tier || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Recommendation</div>
                      <div className="text-white">{selectedGameStat.last_recommendation || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Client Value</div>
                      <div className="text-white">{selectedGameStat.last_client_value || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Last Taken</div>
                      <div className="text-white">{selectedGameStat.last_taken_at ? new Date(selectedGameStat.last_taken_at).toLocaleDateString() : 'Never'}</div>
                    </div>
                  </div>
                )}

                {/* DISC Personality Details */}
                {gameModalType === 'disc-personality' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400">D - Dominance</div>
                      <div className="text-white">{selectedGameStat.d}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">I - Influence</div>
                      <div className="text-white">{selectedGameStat.i}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">S - Steadiness</div>
                      <div className="text-white">{selectedGameStat.s}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">C - Conscientiousness</div>
                      <div className="text-white">{selectedGameStat.c}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Primary Style</div>
                      <div className="text-white">{selectedGameStat.primary_style}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Secondary Style</div>
                      <div className="text-white">{selectedGameStat.secondary_style}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Consistency Index</div>
                      <div className="text-white">{selectedGameStat.consistency_index}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Last Taken</div>
                      <div className="text-white">{selectedGameStat.last_taken_at ? new Date(selectedGameStat.last_taken_at).toLocaleDateString() : 'Never'}</div>
                    </div>
                    {selectedGameStat.strengths && selectedGameStat.strengths.length > 0 && (
                      <div className="col-span-2">
                        <div className="text-gray-400">Strengths</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedGameStat.strengths.map((strength: string, index: number) => (
                            <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/30">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedGameStat.blind_spots && selectedGameStat.blind_spots.length > 0 && (
                      <div className="col-span-2">
                        <div className="text-gray-400">Blind Spots</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedGameStat.blind_spots.map((spot: string, index: number) => (
                            <Badge key={index} className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              {spot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedGameStat.preferred_env && selectedGameStat.preferred_env.length > 0 && (
                      <div className="col-span-2">
                        <div className="text-gray-400">Preferred Environment</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedGameStat.preferred_env.map((env: string, index: number) => (
                            <Badge key={index} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                              {env}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BPOC Cultural Result Modal */}
        {bpocSelected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setBpocSelected(null)}>
            <div className="bg-gray-900 border border-white/20 rounded-lg p-6 max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-semibold">BPOC Cultural Result</div>
                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white" onClick={() => setBpocSelected(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-300 space-y-3">
                <div>
                  <div className="text-gray-400">User</div>
                  <div className="text-white">{bpocSelected.full_name || bpocSelected.user_id} <span className="text-gray-400">{bpocSelected.email || ''}</span></div>
                </div>
                <div>
                  <div className="text-gray-400">Summary</div>
                  <div className="text-white whitespace-pre-wrap">{bpocSelected.summary_text || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Hire Recommendation</div>
                  <div className="text-white">{String(bpocSelected.result_json?.hire_recommendation || '—').replace(/_/g,' ').toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Per‑Region</div>
                  <div className="flex flex-wrap gap-2">
                    {['US','UK','AU','CA'].map(r => (
                      <Badge key={r} className="bg-white/10 border-white/20 text-white">{r}: {String(bpocSelected.result_json?.per_region_recommendation?.[r] || bpocSelected.result_json?.per_region_recommendation?.[r.toLowerCase()] || '—').toUpperCase()}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Writing</div>
                  <div className="text-white text-sm">Score: {bpocSelected.result_json?.writing?.score ?? '—'} • Style: {bpocSelected.result_json?.writing?.style || '—'} • Tone: {bpocSelected.result_json?.writing?.tone || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400">Strengths</div>
                  <div className="flex flex-wrap gap-2">
                    {(bpocSelected.result_json?.strengths || []).map((s: string, i: number) => (
                      <Badge key={`s-${i}`} className="bg-white/10 border-white/20 text-white">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Risks</div>
                  <div className="flex flex-wrap gap-2">
                    {(bpocSelected.result_json?.risks || []).map((s: string, i: number) => (
                      <Badge key={`r-${i}`} className="bg-white/10 border-white/20 text-white">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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