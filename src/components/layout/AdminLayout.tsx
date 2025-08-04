'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Gamepad2,
  ClipboardList,
  Trophy,
  ChevronDown,
  Brain,
  Sparkles,
  Settings,
  LogOut,
  ChevronUp,
  Home,
  Cog,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Wrench,
  TestTube,
  Puzzle,
  Sliders
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface SidebarItem {
  title: string
  icon: any
  href?: string
  children?: { title: string; href: string }[]
}

const platformItems: SidebarItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { title: 'Users', icon: Users, href: '/admin/users' },
  { title: 'Resumes', icon: FileText, href: '/admin/resumes' },
  { title: 'Jobs', icon: Briefcase, href: '/admin/jobs' },
  { 
    title: 'Assessments', 
    icon: ClipboardList, 
    children: [
      { title: 'DISC Personality', href: '/admin/assessments/disc-personality' },
      { title: 'Typing Speed Test', href: '/admin/assessments/typing-speed' },
      { title: 'Logical Reasoning', href: '/admin/assessments/logical-reasoning' },
      { title: 'Communication Skills', href: '/admin/assessments/communication-skills' },
      { title: 'Workplace Judgment', href: '/admin/assessments/workplace-judgment' }
    ]
  },
  { 
    title: 'Games', 
    icon: Gamepad2, 
    children: [
      { title: 'Broken Briefs', href: '/admin/games/broken-briefs' },
      { title: 'Call Flow Builder', href: '/admin/games/call-flow-builder' },
      { title: 'Inbox Zero', href: '/admin/games/inbox-zero' },
      { title: 'Logic Grid', href: '/admin/games/logic-grid' },
      { title: 'Right Choice', href: '/admin/games/right-choice' },
      { title: 'Task Juggler', href: '/admin/games/task-juggler' },
      { title: 'Typing Hero', href: '/admin/games/typing-hero' }
    ]
  },
  { title: 'Leaderboards', icon: Trophy, href: '/admin/leaderboards' }
]

const managementItems: SidebarItem[] = [
  { 
    title: 'Assessment', 
    icon: TestTube, 
    children: [
      { title: 'DISC Personality', href: '/admin/management/assessments/disc-personality' },
      { title: 'Typing Speed Test', href: '/admin/management/assessments/typing-speed' },
      { title: 'Logical Reasoning', href: '/admin/management/assessments/logical-reasoning' },
      { title: 'Communication Skills', href: '/admin/management/assessments/communication-skills' },
      { title: 'Workplace Judgment', href: '/admin/management/assessments/workplace-judgment' }
    ]
  },
  { 
    title: 'Games', 
    icon: Puzzle, 
    children: [
      { title: 'Broken Briefs', href: '/admin/management/games/broken-briefs' },
      { title: 'Call Flow Builder', href: '/admin/management/games/call-flow-builder' },
      { title: 'Inbox Zero', href: '/admin/management/games/inbox-zero' },
      { title: 'Logic Grid', href: '/admin/management/games/logic-grid' },
      { title: 'Right Choice', href: '/admin/management/games/right-choice' },
      { title: 'Task Juggler', href: '/admin/management/games/task-juggler' },
      { title: 'Typing Hero', href: '/admin/management/games/typing-hero' }
    ]
  }
]

const settingsItems: SidebarItem[] = [
  { title: 'General Settings', icon: Sliders, href: '/admin/settings/general' }
]

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  adminUser?: {
    id: string
    email: string
    full_name: string
    is_admin: boolean
    admin_level: 'user' | 'admin'
  } | null
}

export default function AdminLayout({ 
  children, 
  title = "Admin Panel", 
  description = "Manage BPOC.AI platform",
  adminUser 
}: AdminLayoutProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['platform', 'management', 'settings']))
  const [userExpanded, setUserExpanded] = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)
  const pathname = usePathname()

  const toggleExpanded = (itemTitle: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemTitle)) {
      newExpanded.delete(itemTitle)
    } else {
      newExpanded.add(itemTitle)
    }
    setExpandedItems(newExpanded)
  }

  const SidebarItem = ({ item, level = 0, category = 'platform' }: { item: SidebarItem; level?: number; category?: string }) => {
    const isExpanded = expandedItems.has(item.title)
    const hasChildren = item.children && item.children.length > 0
    const isActive = pathname === item.href || (pathname === '/admin/dashboard' && item.title === 'Dashboard')

    // Define category colors
    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'platform':
          return 'text-cyan-400'
        case 'management':
          return 'text-purple-400'
        case 'settings':
          return 'text-yellow-400'
        default:
          return 'text-cyan-400'
      }
    }

    return (
      <div>
        <button
          onClick={() => hasChildren ? toggleExpanded(item.title) : undefined}
          className={cn(
            "w-full flex items-center rounded-lg transition-all duration-200 group",
            level === 0 ? "font-medium" : "font-normal",
            isActive ? "bg-white/10" : level === 0 ? "hover:bg-white/10" : "hover:bg-white/5",
            sidebarMinimized ? "justify-center px-2 py-2" : "justify-between px-3 py-2"
          )}
        >
          <div className={cn(
            "flex items-center",
            sidebarMinimized ? "justify-center" : "space-x-3"
          )}>
            <item.icon className={cn(
              "w-4 h-4",
              level === 0 ? getCategoryColor(category) : "text-gray-400"
            )} />
            {!sidebarMinimized && (
              <span className={cn(
                level === 0 ? "text-white" : "text-gray-300"
              )}>
                {item.title}
              </span>
            )}
          </div>
          {hasChildren && !sidebarMinimized && (
            <ChevronUp className={cn(
              "w-4 h-4 transition-transform duration-200",
              isExpanded ? "rotate-0" : "rotate-180"
            )} />
          )}
        </button>
        
        {hasChildren && isExpanded && !sidebarMinimized && (
          <div className="ml-6 mt-2 space-y-1">
            {item.children?.map((child) => {
              const isChildActive = pathname === child.href
              return (
                <button
                  key={child.href}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                    isChildActive ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-300 hover:text-white"
                  )}
                >
                  <span>{child.title}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          "h-screen fixed left-0 top-0 glass-card border-r border-white/10 overflow-y-auto transition-all duration-300",
          sidebarMinimized ? "w-16" : "w-64"
        )}>
          <div className={cn(
            "transition-all duration-300",
            sidebarMinimized ? "p-3" : "p-6"
          )}>
            {/* Header */}
            <div className={cn(
              "flex items-center mb-6",
              sidebarMinimized ? "justify-center" : "space-x-2"
            )}>
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!sidebarMinimized && (
                <div className="flex items-center space-x-2">
                  <div>
                    <h2 className="text-lg font-bold gradient-text">Admin Panel</h2>
                    <p className="text-xs text-gray-400">BPOC.AI Management</p>
                  </div>
                  <button
                    onClick={() => setSidebarMinimized(!sidebarMinimized)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Minimize Button for minimized state */}
            {sidebarMinimized && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setSidebarMinimized(!sidebarMinimized)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}

            {/* Platform Section */}
            <div className="mb-6">
              <div className={cn(
                "flex items-center mb-3",
                sidebarMinimized ? "justify-center" : "space-x-2"
              )}>
                <Home className="w-4 h-4 text-cyan-400" />
                {!sidebarMinimized && (
                  <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Platform</span>
                )}
              </div>
              <div className="space-y-1">
                {platformItems.map((item) => (
                  <SidebarItem key={item.title} item={item} category="platform" />
                ))}
              </div>
            </div>

            <Separator className="my-6 bg-white/10" />

            {/* Management Section */}
            <div className="mb-6">
              <div className={cn(
                "flex items-center mb-3",
                sidebarMinimized ? "justify-center" : "space-x-2"
              )}>
                                 <Cog className="w-4 h-4 text-purple-400" />
                                  {!sidebarMinimized && (
                    <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Career Tools Management</span>
                  )}
              </div>
              <div className="space-y-1">
                {managementItems.map((item) => (
                  <SidebarItem key={item.title} item={item} category="management" />
                ))}
              </div>
            </div>

            <Separator className="my-6 bg-white/10" />

            {/* Settings Section */}
            <div className="mb-4">
              <div className={cn(
                "flex items-center mb-2",
                sidebarMinimized ? "justify-center" : "space-x-2"
              )}>
                <Cog className="w-4 h-4 text-yellow-400" />
                {!sidebarMinimized && (
                  <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Settings</span>
                )}
              </div>
              <div className="space-y-1">
                {settingsItems.map((item) => (
                  <SidebarItem key={item.title} item={item} category="settings" />
                ))}
              </div>
            </div>

            {/* User Profile Section */}
            <div className="mt-auto pt-6">
              <Separator className="mb-6 bg-white/10" />
              <div className="space-y-2">
                <button
                  onClick={() => setUserExpanded(!userExpanded)}
                  className={cn(
                    "w-full flex items-center rounded-lg hover:bg-white/10 transition-all duration-200",
                    sidebarMinimized ? "justify-center p-3" : "justify-between p-3"
                  )}
                >
                  <div className={cn(
                    "flex items-center",
                    sidebarMinimized ? "justify-center" : "space-x-3"
                  )}>
                    <UserCircle className={cn(
                      "text-cyan-400",
                      sidebarMinimized ? "w-8 h-8" : "w-10 h-10"
                    )} />
                    {!sidebarMinimized && (
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">
                          {adminUser?.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {adminUser?.email || 'admin@bpoc.ai'}
                        </p>
                        <p className="text-xs text-cyan-400">
                          {adminUser?.admin_level === 'admin' ? 'Admin' : 'User'}
                        </p>
                      </div>
                    )}
                  </div>
                  {!sidebarMinimized && (
                    <ChevronUp className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      userExpanded ? "rotate-0" : "rotate-180"
                    )} />
                  )}
                </button>
                
                {userExpanded && !sidebarMinimized && (
                  <div className="ml-4 mt-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-white/5 text-gray-300 hover:text-white">
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 p-8 transition-all duration-300",
          sidebarMinimized ? "ml-16" : "ml-64"
        )}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text">{title}</h1>
                <p className="text-gray-400 mt-2">{description}</p>
              </div>
            </div>

            {/* Page Content */}
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 