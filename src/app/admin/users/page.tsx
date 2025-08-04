'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCheck,
  UserX,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AdminLayout from '@/components/layout/AdminLayout'
import { ChevronDown } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  created_at: string
  last_sign_in_at?: string
  status: 'active' | 'inactive' | 'pending'
  role: 'user' | 'admin' | 'moderator'
  location?: string
  bio?: string
  position?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Frontend: Fetching users from API...')
        const response = await fetch('/api/admin/users')
        console.log('Frontend: Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Frontend: Received data:', data)
          setUsers(data.users || [])
        } else {
          const errorText = await response.text()
          console.error('Frontend: Failed to fetch users:', errorText)
          setUsers([])
        }
      } catch (error) {
        console.error('Frontend: Error fetching users:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Mock data for development
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      phone: '+1 (555) 123-4567',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-15T10:30:00Z',
      last_sign_in_at: '2024-03-20T14:22:00Z',
      status: 'active',
      role: 'user',
      location: 'New York, NY',
      bio: 'Software developer with 5 years of experience'
    },
    {
      id: '2',
      email: 'sarah.wilson@example.com',
      full_name: 'Sarah Wilson',
      phone: '+1 (555) 987-6543',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-02-10T09:15:00Z',
      last_sign_in_at: '2024-03-19T16:45:00Z',
      status: 'active',
      role: 'admin',
      location: 'San Francisco, CA',
      bio: 'Product manager passionate about user experience'
    },
    {
      id: '3',
      email: 'mike.chen@example.com',
      full_name: 'Mike Chen',
      phone: '+1 (555) 456-7890',
      created_at: '2024-03-05T11:20:00Z',
      last_sign_in_at: '2024-03-18T13:10:00Z',
      status: 'inactive',
      role: 'user',
      location: 'Austin, TX',
      bio: 'Data scientist specializing in machine learning'
    },
    {
      id: '4',
      email: 'emma.rodriguez@example.com',
      full_name: 'Emma Rodriguez',
      phone: '+1 (555) 321-0987',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-25T15:45:00Z',
      last_sign_in_at: '2024-03-20T10:30:00Z',
      status: 'active',
      role: 'moderator',
      location: 'Chicago, IL',
      bio: 'Community manager and content creator'
    },
    {
      id: '5',
      email: 'alex.kumar@example.com',
      full_name: 'Alex Kumar',
      phone: '+1 (555) 654-3210',
      created_at: '2024-02-28T08:30:00Z',
      status: 'pending',
      role: 'user',
      location: 'Seattle, WA',
      bio: 'UX designer focused on accessibility'
    }
  ]

          const filteredUsers = users.filter(user => {
     const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.position?.toLowerCase().includes(searchTerm.toLowerCase())
      
     const matchesPosition = positionFilter === 'all' || user.position === positionFilter
     
     return matchesSearch && matchesPosition
   })

   // Pagination logic
   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
   const startIndex = (currentPage - 1) * itemsPerPage
   const endIndex = startIndex + itemsPerPage
   const currentUsers = filteredUsers.slice(startIndex, endIndex)

       // Reset to first page when filters change
    useEffect(() => {
      setCurrentPage(1)
    }, [searchTerm, positionFilter])

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    return variants[status as keyof typeof variants] || variants.inactive
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      moderator: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      user: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    return variants[role as keyof typeof variants] || variants.user
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <AdminLayout title="Users" description="Manage platform users and their accounts">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Inactive Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === 'inactive').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                 <Input
                   placeholder="Search users by name, email, location, phone, bio, or position..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                 />
              </div>
                                                           <div className="flex gap-2">
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                       {positionFilter === 'all' ? 'All Positions' : positionFilter}
                       <ChevronDown className="ml-2 h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="bg-gray-800 border-white/10">
                     <DropdownMenuItem 
                       onClick={() => setPositionFilter('all')}
                       className="text-white hover:bg-white/10"
                     >
                       All Positions
                     </DropdownMenuItem>
                     <DropdownMenuSeparator className="bg-white/10" />
                     {Array.from(new Set(users.map(u => u.position).filter(Boolean))).map(position => (
                       <DropdownMenuItem 
                         key={position} 
                         onClick={() => setPositionFilter(position || 'all')}
                         className="text-white hover:bg-white/10"
                       >
                         {position}
                       </DropdownMenuItem>
                     ))}
                   </DropdownMenuContent>
                 </DropdownMenu>

                 <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                   <Filter className="w-4 h-4 mr-2" />
                   More Filters
                 </Button>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                                     <TableHeader>
                     <TableRow className="border-white/10 hover:bg-white/5">
                       <TableHead className="text-white font-medium">Full Name</TableHead>
                       <TableHead className="text-white font-medium">Location</TableHead>
                       <TableHead className="text-white font-medium">Created At</TableHead>
                       <TableHead className="text-white font-medium">Updated At</TableHead>
                       <TableHead className="text-white font-medium">Phone</TableHead>
                       <TableHead className="text-white font-medium">Bio</TableHead>
                       <TableHead className="text-white font-medium">Position</TableHead>
                       <TableHead className="text-white font-medium text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                                         {currentUsers.map((user) => (
                       <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                         <TableCell>
                           <div className="flex items-center space-x-3">
                             <Avatar className="w-8 h-8">
                               <AvatarImage src={user.avatar_url} />
                               <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs">
                                 {getInitials(user.full_name || user.email)}
                               </AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium text-white">{user.full_name || 'No Name'}</p>
                               <p className="text-sm text-gray-400">{user.email}</p>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <span className="text-gray-300">{user.location || 'N/A'}</span>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center space-x-2 text-sm">
                             <Calendar className="w-3 h-3 text-gray-400" />
                             <span className="text-gray-300">{formatDate(user.created_at)}</span>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center space-x-2 text-sm">
                             <Calendar className="w-3 h-3 text-gray-400" />
                             <span className="text-gray-300">{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}</span>
                           </div>
                         </TableCell>
                         <TableCell>
                           <span className="text-gray-300">{user.phone || 'N/A'}</span>
                         </TableCell>
                         <TableCell>
                           <span className="text-gray-300 max-w-xs truncate" title={user.bio || ''}>
                             {user.bio || 'N/A'}
                           </span>
                         </TableCell>
                         <TableCell>
                           <span className="text-gray-300">{user.position || 'N/A'}</span>
                         </TableCell>
                         <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-white/10">
                              <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem className="text-white hover:bg-white/10">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-white/10">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
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

            {/* Pagination */}
            {!loading && filteredUsers.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
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
      </div>
    </AdminLayout>
  )
} 