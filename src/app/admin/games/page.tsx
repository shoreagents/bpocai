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
    { id: 'typing-hero', name: 'Typing Hero', icon: Keyboard },
    { id: 'disc-personality', name: 'BPOC DISC', icon: Brain },
    { id: 'ultimate', name: 'BPOC Ultimate', icon: Star },
    { id: 'bpoc-cultural', name: 'BPOC Cultural', icon: Globe }
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
              </button>
            )
          })}
        </div>


      </div>
    </AdminLayout>
  )
} 