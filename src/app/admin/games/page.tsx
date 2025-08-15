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
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AdminLayout from '@/components/layout/AdminLayout'

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
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (selectedTab === 'typing-hero') {
      fetchTypingHeroStats()
    }
  }, [selectedTab, fetchTypingHeroStats])

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
  const filteredTypingHeroStats = typingHeroStats.filter(stat =>
    stat.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTypingHeroStats.length / itemsPerPage)
  const paginatedTypingHeroStats = filteredTypingHeroStats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
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
                              {stat.last_played_at ? new Date(stat.last_played_at).toLocaleDateString() : 'Never'}
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
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Player</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
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
      </div>
    </AdminLayout>
  )
} 