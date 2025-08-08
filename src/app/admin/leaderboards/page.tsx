'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  ChevronDown, 
  Gamepad2, 
  ClipboardList,
  TrendingUp,
  Clock,
  Medal,
  Crown,
  Star,
  Users,
  Target,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import AdminLayout from '@/components/layout/AdminLayout'

const assessmentOptions = [
  { value: 'disc-personality', label: 'DISC Personality', icon: ClipboardList },
  { value: 'typing-speed', label: 'Typing Speed Test', icon: ClipboardList },
  { value: 'logical-reasoning', label: 'Logical Reasoning', icon: ClipboardList },
  { value: 'communication-skills', label: 'Communication Skills', icon: ClipboardList },
  { value: 'workplace-judgment', label: 'Workplace Judgment', icon: ClipboardList }
]

const gameOptions = [
  { value: 'typing-hero', label: 'Typing Hero', icon: Gamepad2 },
  { value: 'inbox-zero', label: 'Inbox Zero', icon: Gamepad2 },
  { value: 'logic-grid', label: 'Logic Grid', icon: Gamepad2 },
  { value: 'right-choice', label: 'Right Choice', icon: Gamepad2 },
  { value: 'disc-personality-game', label: 'BPOC DISC', icon: Gamepad2 },
  { value: 'ultimate', label: 'BPOC Ultimate', icon: Gamepad2 }
]

// Empty data array for now
const mockLeaderboardData: any[] = []

export default function LeaderboardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [sortBy, setSortBy] = useState('top') // 'top' or 'recent'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setSelectedItem('')
    setShowLeaderboard(false)
  }

  const handleItemSelect = (value: string) => {
    setSelectedItem(value)
    setShowLeaderboard(true)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const getOptions = () => {
    return selectedCategory === 'assessments' ? assessmentOptions : gameOptions
  }

  const getItemDisplayName = () => {
    const options = getOptions()
    const item = options.find(opt => opt.value === selectedItem)
    return item ? item.label : selectedItem
  }

  const getScoreDisplay = (score: number) => {
    if (selectedItem === 'typing-hero') return `${score} WPM`
    if (selectedItem === 'ultimate') return `${score}%`
    return score.toString()
  }

  // Get sorted data based on sortBy value
  const getSortedData = () => {
    if (sortBy === 'recent') {
      return [...mockLeaderboardData].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }
    return mockLeaderboardData // Already sorted by rank/score
  }

  // Get paginated data
  const getPaginatedData = () => {
    const sorted = getSortedData()
    const start = (currentPage - 1) * itemsPerPage
    return sorted.slice(start, start + itemsPerPage)
  }

  const totalPages = Math.ceil(mockLeaderboardData.length / itemsPerPage)

  return (
    <AdminLayout title="Leaderboards" description="View rankings and statistics">
      <div className="space-y-6">
        {/* Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Category Selection */}
          <Card className="glass-card border-white/10 hover:border-purple-500/30 transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Select Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assessments">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Assessments
                    </div>
                  </SelectItem>
                  <SelectItem value="games">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4" />
                      Games
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Item Selection */}
          <Card className="glass-card border-white/10 hover:border-blue-500/30 transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Medal className="h-5 w-5 text-blue-400" />
                Select {selectedCategory === 'assessments' ? 'Assessment' : selectedCategory === 'games' ? 'Game' : 'Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedItem} 
                onValueChange={handleItemSelect}
                disabled={!selectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Choose ${selectedCategory === 'assessments' ? 'assessment' : selectedCategory === 'games' ? 'game' : 'item'}...`} />
                </SelectTrigger>
                <SelectContent>
                  {getOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {!showLeaderboard ? (
          <>
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a Category and Item</h3>
                    <p className="text-gray-400">
                      Choose an assessment or game from the dropdowns above to view detailed leaderboards, 
                      rankings, and performance statistics. You can view top performers or recent activity.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <>
            {/* Leaderboard Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Top Score</p>
                        <p className="text-xl font-bold text-white">{getScoreDisplay(98)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Users className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Players</p>
                        <p className="text-xl font-bold text-white">156</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Target className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Avg Score</p>
                        <p className="text-xl font-bold text-white">{getScoreDisplay(85)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Active Today</p>
                        <p className="text-xl font-bold text-white">24</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Leaderboard Table */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      {getItemDisplayName()} Leaderboard
                    </CardTitle>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top Performers</SelectItem>
                        <SelectItem value="recent">Recently Played</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {mockLeaderboardData.length === 0 ? (
                    <div className="text-center py-12">
                      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">No leaderboard data found</h3>
                      <p className="text-gray-500">
                        No players have completed this {selectedCategory === 'assessments' ? 'assessment' : 'game'} yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Rank</TableHead>
                            <TableHead>Player</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Badge</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedData().map((entry) => (
                            <TableRow key={entry.rank}>
                              <TableCell className="font-medium">#{entry.rank}</TableCell>
                              <TableCell>{entry.name}</TableCell>
                              <TableCell>{getScoreDisplay(entry.score)}</TableCell>
                              <TableCell>{entry.date}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                  {entry.badge}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                              </PaginationItem>
                              {Array.from({ length: totalPages }).map((_, i) => (
                                <PaginationItem key={i + 1}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(i + 1)}
                                    isActive={currentPage === i + 1}
                                  >
                                    {i + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext 
                                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}