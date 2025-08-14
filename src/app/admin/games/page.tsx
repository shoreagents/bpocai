'use client'

import { useState } from 'react'
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
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

interface GameTab {
  id: string
  name: string
  badge?: number
  icon: any
}

export default function GamesPage() {
  const [selectedTab, setSelectedTab] = useState('typing-hero')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const tabs: GameTab[] = [
    { id: 'typing-hero', name: 'Typing Hero', badge: 4, icon: Keyboard },
    { id: 'disc-personality', name: 'BPOC DISC', badge: 2, icon: Brain },
    { id: 'ultimate', name: 'BPOC Ultimate', badge: 1, icon: Star },
    { id: 'bpoc-cultural', name: 'BPOC Cultural', badge: 1, icon: Globe }
  ]

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

  const currentTab = tabs.find(tab => tab.id === selectedTab)

  return (
    <AdminLayout 
      title="Game Management" 
      description="Manage and monitor game performance and player analytics"
      titleContent={
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Customize Columns
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-white/10">
              <DropdownMenuItem>Show/Hide Columns</DropdownMenuItem>
              <DropdownMenuItem>Column Order</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Reset to Default</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Game
          </Button>
        </div>
      }
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
                {tab.badge && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      isActive 
                        ? 'bg-gray-200 text-gray-900' 
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Data Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {currentTab?.icon && <currentTab.icon className="w-5 h-5" />}
              {currentTab?.name} Game Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedRows.length === gameData.length}
                        onCheckedChange={handleSelectAll}
                        className="border-white/20"
                      />
                    </TableHead>
                    <TableHead className="text-white font-medium">Header</TableHead>
                    <TableHead className="text-white font-medium">Section Type</TableHead>
                    <TableHead className="text-white font-medium">Status</TableHead>
                    <TableHead className="text-white font-medium">Difficulty</TableHead>
                    <TableHead className="text-white font-medium">Category</TableHead>
                    <TableHead className="text-white font-medium">Target</TableHead>
                    <TableHead className="text-white font-medium">Limit</TableHead>
                    <TableHead className="text-white font-medium">Reviewer</TableHead>
                    <TableHead className="text-white font-medium">Participants</TableHead>
                    <TableHead className="text-white font-medium">Completion Rate</TableHead>
                    <TableHead className="text-white font-medium">Avg Score</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameData.map((item) => (
                    <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full cursor-grab"></div>
                          <Checkbox 
                            checked={selectedRows.includes(item.id)}
                            onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                            className="border-white/20"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {item.header}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-white/10 text-white border-white/20">
                          {item.sectionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(item.difficulty)}>
                          {item.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{item.target}</TableCell>
                      <TableCell className="text-white">{item.limit}</TableCell>
                      <TableCell>
                        {item.reviewer === 'Assign reviewer' ? (
                          <select className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm">
                            <option>Assign reviewer</option>
                            <option>Eddie Lake</option>
                            <option>Jamik Tashpulatov</option>
                          </select>
                        ) : (
                          <span className="text-white">{item.reviewer}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white">{item.participants}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full"
                              style={{ width: `${item.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm">{item.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">{item.averageScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 border-white/10">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                {selectedRows.length} of {gameData.length} row(s) selected.
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Rows per page</span>
                  <select className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Page 1 of 7</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      &lt;&lt;
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      &lt;
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      &gt;
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      &gt;&gt;
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
} 