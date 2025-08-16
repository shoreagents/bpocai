'use client'

import { useState, useEffect } from 'react'

import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  location?: string
  bio?: string
  position?: string
  admin_level?: string
  is_admin?: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [adminLevelFilter, setAdminLevelFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [togglingUsers, setTogglingUsers] = useState<Set<string>>(new Set())
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set())
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; userId: string; userName: string } | null>(null)

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        console.log('Frontend: Loading state set to true')
        console.log('Frontend: Fetching users from API...')
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch('/api/admin/users', {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
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
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Frontend: Request timed out after 10 seconds')
        } else {
          console.error('Frontend: Error fetching users:', error)
        }
        setUsers([])
      } finally {
        setLoading(false)
        console.log('Frontend: Loading state set to false')
      }
    }

    fetchUsers()
    
    // Cleanup function to ensure loading is reset if component unmounts
    return () => {
      setLoading(false)
    }
  }, [])



          const filteredUsers = users.filter(user => {
     const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.position?.toLowerCase().includes(searchTerm.toLowerCase())
      
     const matchesPosition = positionFilter === 'all' || user.position === positionFilter
     const matchesAdminLevel = adminLevelFilter === 'all' || user.admin_level === adminLevelFilter
     
     return matchesSearch && matchesPosition && matchesAdminLevel
   })

   // Pagination logic
   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
   const startIndex = (currentPage - 1) * itemsPerPage
   const endIndex = startIndex + itemsPerPage
   const currentUsers = filteredUsers.slice(startIndex, endIndex)

       // Reset to first page when filters change
    useEffect(() => {
      setCurrentPage(1)
    }, [searchTerm, positionFilter, adminLevelFilter])



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }



  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleToggleAdmin = async (userId: string, currentAdminLevel: string | undefined) => {
    try {
      setTogglingUsers(prev => new Set(prev).add(userId))
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggleAdmin',
          userId: userId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Admin toggle result:', result)
        
        // Update the local state to reflect the change
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, admin_level: result.newAdminLevel }
              : user
          )
        )
        
        // Show success notification
        toast.success(result.message)
      } else {
        const error = await response.text()
        console.error('Failed to toggle admin status:', error)
        toast.error('Failed to update admin status')
      }
    } catch (error) {
      console.error('Error toggling admin status:', error)
      toast.error('Error updating admin status')
    } finally {
      setTogglingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const openDeleteDialog = (userId: string, userName: string) => {
    setDeleteDialog({ isOpen: true, userId, userName })
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      setDeletingUsers(prev => new Set(prev).add(userId))
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          userId: userId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Delete result:', result)
        
        // Remove user from local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
        
        // Show success toast
        toast.success(result.message)
      } else {
        const error = await response.text()
        console.error('Failed to delete user:', error)
        toast.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error deleting user')
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  return (
    <AdminLayout title="Users" description="Manage platform users and their accounts">
      <div className="admin-users-page space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    {users.filter(u => u.last_sign_in_at).length}
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
                    {users.filter(u => !u.last_sign_in_at).length}
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
                    {users.filter(u => !u.full_name).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Admin Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.admin_level === 'admin').length}
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
                <Search className="absolute left-4 top-1/3 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, location, phone, bio, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
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

                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                       {adminLevelFilter === 'all' ? 'All Admin Levels' : adminLevelFilter}
                       <ChevronDown className="ml-2 h-4 w-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent className="bg-gray-800 border-white/10">
                     <DropdownMenuItem 
                       onClick={() => setAdminLevelFilter('all')}
                       className="text-white hover:bg-white/10"
                     >
                       All Admin Levels
                     </DropdownMenuItem>
                     <DropdownMenuSeparator className="bg-white/10" />
                     <DropdownMenuItem 
                       onClick={() => setAdminLevelFilter('user')}
                       className="text-white hover:bg-white/10"
                     >
                       User
                     </DropdownMenuItem>
                     <DropdownMenuItem 
                       onClick={() => setAdminLevelFilter('admin')}
                       className="text-white hover:bg-white/10"
                     >
                       Admin
                     </DropdownMenuItem>
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
                       <TableHead className="text-white font-medium">Admin Level</TableHead>
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
                         <TableCell>
                           <Badge 
                             variant={user.admin_level === 'admin' ? 'default' : 'secondary'}
                             className={
                               user.admin_level === 'admin' 
                                 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                                 : 'bg-gray-600 text-gray-200'
                             }
                           >
                             {user.admin_level || 'user'}
                           </Badge>
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
                              <DropdownMenuItem 
                                className="text-white hover:bg-white/10"
                                onClick={() => handleToggleAdmin(user.id, user.admin_level)}
                                disabled={togglingUsers.has(user.id)}
                              >
                                {togglingUsers.has(user.id) ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Updating...
                                  </>
                                ) : user.admin_level === 'admin' ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-white/10">
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem 
                                className="text-red-400 hover:bg-red-500/10"
                                onClick={() => openDeleteDialog(user.id, user.full_name || user.email)}
                                disabled={deletingUsers.has(user.id)}
                              >
                                {deletingUsers.has(user.id) ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </>
                                )}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog?.isOpen} onOpenChange={(open) => !open && setDeleteDialog(null)}>
          <AlertDialogContent className="glass-card border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to delete user "{deleteDialog?.userName}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/10 text-white hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (deleteDialog) {
                    handleDeleteUser(deleteDialog.userId, deleteDialog.userName)
                    setDeleteDialog(null)
                  }
                }}
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
} 