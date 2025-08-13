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
  User,
  Target,
  BarChart3,
  FileText,
  Brain,
  MessageSquare,
  PuzzleIcon,
  Keyboard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

interface AssessmentData {
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
}

interface AssessmentTab {
  id: string
  name: string
  badge?: number
  icon: any
}

export default function AssessmentsPage() {
  const [selectedTab, setSelectedTab] = useState('typing-speed')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Temporary placeholder: Coming Soon
  return (
    <AdminLayout 
      title="Assessment Management" 
      description="Manage and monitor assessment performance and analytics"
    >
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="glass-card border-white/10 max-w-xl w-full text-center">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              The Assessments admin page is under development. Check back soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )

  const tabs: AssessmentTab[] = [
    { id: 'typing-speed', name: 'Typing Speed Test', badge: 3, icon: Keyboard },
    { id: 'disc-personality', name: 'DISC Personality', badge: 2, icon: Brain },
    { id: 'communication', name: 'Communication Skills', badge: 1, icon: MessageSquare },
    { id: 'logical-reasoning', name: 'Logical Reasoning', badge: 4, icon: PuzzleIcon },
    { id: 'workplace-judgment', name: 'Workplace Judgment', badge: 2, icon: Brain }
  ]

  const assessmentData: AssessmentData[] = [
    {
      id: '1',
      header: 'Basic Typing Assessment',
      sectionType: 'Speed Test',
      status: 'Done',
      target: 45,
      limit: 50,
      reviewer: 'Eddie Lake',
      participants: 156,
      completionRate: 92,
      averageScore: 78
    },
    {
      id: '2',
      header: 'Advanced Typing with Programming',
      sectionType: 'Technical Test',
      status: 'In Process',
      target: 30,
      limit: 35,
      reviewer: 'Jamik Tashpulatov',
      participants: 89,
      completionRate: 67,
      averageScore: 65
    },
    {
      id: '3',
      header: 'Speed Accuracy Challenge',
      sectionType: 'Challenge',
      status: 'Done',
      target: 25,
      limit: 28,
      reviewer: 'Eddie Lake',
      participants: 203,
      completionRate: 95,
      averageScore: 82
    },
    {
      id: '4',
      header: 'Professional Email Typing',
      sectionType: 'Business Test',
      status: 'In Process',
      target: 20,
      limit: 22,
      reviewer: 'Jamik Tashpulatov',
      participants: 67,
      completionRate: 73,
      averageScore: 71
    },
    {
      id: '5',
      header: 'Technical Documentation',
      sectionType: 'Documentation',
      status: 'Pending',
      target: 15,
      limit: 18,
      reviewer: 'Assign reviewer',
      participants: 34,
      completionRate: 45,
      averageScore: 58
    },
    {
      id: '6',
      header: 'Code Snippet Typing',
      sectionType: 'Programming',
      status: 'Review',
      target: 12,
      limit: 15,
      reviewer: 'Eddie Lake',
      participants: 28,
      completionRate: 89,
      averageScore: 76
    },
    {
      id: '7',
      header: 'Multilingual Typing Test',
      sectionType: 'Language Test',
      status: 'Done',
      target: 18,
      limit: 20,
      reviewer: 'Jamik Tashpulatov',
      participants: 92,
      completionRate: 88,
      averageScore: 79
    },
    {
      id: '8',
      header: 'Real-time Collaboration',
      sectionType: 'Team Test',
      status: 'In Process',
      target: 10,
      limit: 12,
      reviewer: 'Eddie Lake',
      participants: 45,
      completionRate: 62,
      averageScore: 69
    },
    {
      id: '9',
      header: 'Accessibility Typing Test',
      sectionType: 'Accessibility',
      status: 'Pending',
      target: 8,
      limit: 10,
      reviewer: 'Assign reviewer',
      participants: 23,
      completionRate: 39,
      averageScore: 52
    },
    {
      id: '10',
      header: 'Mobile Typing Assessment',
      sectionType: 'Mobile Test',
      status: 'Review',
      target: 15,
      limit: 18,
      reviewer: 'Jamik Tashpulatov',
      participants: 78,
      completionRate: 81,
      averageScore: 74
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(assessmentData.map(item => item.id))
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
      title="Assessment Management" 
      description="Manage and monitor assessment performance and analytics"
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
            Add Section
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
              {currentTab?.name} Assessment Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedRows.length === assessmentData.length}
                        onCheckedChange={handleSelectAll}
                        className="border-white/20"
                      />
                    </TableHead>
                    <TableHead className="text-white font-medium">Header</TableHead>
                    <TableHead className="text-white font-medium">Section Type</TableHead>
                    <TableHead className="text-white font-medium">Status</TableHead>
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
                  {assessmentData.map((item) => (
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
                          <Target className="w-4 h-4 text-cyan-400" />
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
                {selectedRows.length} of {assessmentData.length} row(s) selected.
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