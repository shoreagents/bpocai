'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Mail,
  File,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AdminLayout from '@/components/layout/AdminLayout'

interface Resume {
  id: string
  user_id: string
  resume_title: string
  template_used: string
  view_count: number
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
  user_avatar?: string
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewResume, setPreviewResume] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Fetch resumes from database
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/resumes')
        const data = await response.json()
        
        if (response.ok) {
          setResumes(data.resumes)
        } else {
          console.error('Failed to fetch resumes:', data.error)
        }
      } catch (error) {
        console.error('Error fetching resumes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [])

  // Filter resumes based on search term
  const filteredResumes = resumes.filter((resume) => {
    const matchesSearch = 
      resume.resume_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.template_used.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentResumes = filteredResumes.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleViewResume = async (resumeId: string) => {
    try {
      setPreviewLoading(true)
      setPreviewOpen(true)
      
      const response = await fetch(`/api/admin/resumes/${resumeId}/preview`)
      const data = await response.json()
      
      if (response.ok) {
        setPreviewResume(data.resume)
      } else {
        console.error('Failed to fetch resume preview:', data.error)
      }
    } catch (error) {
      console.error('Error fetching resume preview:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <AdminLayout title="Resume Management" description="Manage user resumes and documents">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Resumes</p>
                  <p className="text-2xl font-bold text-white">{resumes.length}</p>
                  <p className="text-xs text-green-400">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>

                     <Card className="glass-card">
             <CardContent className="p-6">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                   <Eye className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <p className="text-sm text-gray-400">Total Views</p>
                   <p className="text-2xl font-bold text-white">
                     {resumes.reduce((sum, r) => sum + r.view_count, 0)}
                   </p>
                   <p className="text-xs text-green-400">All resumes</p>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="glass-card">
             <CardContent className="p-6">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                   <FileText className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <p className="text-sm text-gray-400">Templates</p>
                   <p className="text-2xl font-bold text-white">
                     {new Set(resumes.map(r => r.template_used)).size}
                   </p>
                   <p className="text-xs text-yellow-400">Unique templates</p>
                 </div>
               </div>
             </CardContent>
           </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Users</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(resumes.map(r => r.user_id)).size}
                  </p>
                  <p className="text-xs text-purple-400">With resumes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search resumes, users, or file types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
                             <div className="flex gap-2">
                 <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                   <Filter className="w-4 h-4 mr-2" />
                   More Filters
                 </Button>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
                 ) : filteredResumes.length === 0 ? (
           <div></div>
        ) : (
          <div className="space-y-6">
            {/* Resume Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentResumes.map((resume) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass-card hover:bg-white/5 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                                             {/* Header with User Info */}
                       <div className="flex items-center space-x-3 mb-3">
                         <Avatar className="w-10 h-10">
                           <AvatarImage 
                             src={resume.user_avatar} 
                             alt={resume.user_name}
                           />
                           <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-sm">
                             {getInitials(resume.user_name)}
                           </AvatarFallback>
                         </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{resume.user_name}</p>
                          <p className="text-gray-400 text-xs truncate">{resume.user_email}</p>
                        </div>
                      </div>

                                             {/* Resume Title */}
                       <div className="mb-3">
                         <h3 className="text-white font-semibold text-sm mb-1 truncate">{resume.resume_title}</h3>
                         <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                           {resume.template_used}
                         </Badge>
                       </div>

                       {/* Resume Info */}
                       <div className="space-y-2 mb-4">
                         <div className="flex items-center justify-between text-xs">
                           <div className="flex items-center space-x-1">
                             <Eye className="w-3 h-3 text-gray-400" />
                             <span className="text-gray-400">Views</span>
                           </div>
                           <span className="text-gray-300">{resume.view_count}</span>
                         </div>
                         
                         <div className="flex items-center justify-between text-xs">
                           <div className="flex items-center space-x-1">
                             <Calendar className="w-3 h-3 text-gray-400" />
                             <span className="text-gray-400">Created</span>
                           </div>
                           <span className="text-gray-300">{formatDate(resume.created_at)}</span>
                         </div>
                       </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center space-x-1">
                                                     <Button
                             variant="ghost"
                             size="sm"
                             className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                             title="View Resume"
                             onClick={() => handleViewResume(resume.id)}
                           >
                             <Eye className="w-3 h-3" />
                           </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                            title="Download"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {!loading && filteredResumes.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredResumes.length)} of {filteredResumes.length} resumes
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
          </div>
                 )}

                   {/* Resume Preview Modal */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-white/10">
              <style jsx>{`
                .resume-preview-content {
                  font-family: Arial, sans-serif;
                }
                .resume-preview-content h1,
                .resume-preview-content h2,
                .resume-preview-content h3 {
                  color: #333;
                  margin-bottom: 10px;
                }
                .resume-preview-content p {
                  margin-bottom: 8px;
                }
                .resume-preview-content ul,
                .resume-preview-content ol {
                  margin-bottom: 10px;
                  padding-left: 20px;
                }
                .resume-preview-content li {
                  margin-bottom: 4px;
                }
              `}</style>
             <DialogHeader>
               <DialogTitle className="text-white flex items-center justify-between">
                 <span>Resume Preview</span>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setPreviewOpen(false)}
                   className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                 >
                   <X className="w-4 h-4" />
                 </Button>
               </DialogTitle>
             </DialogHeader>
             
             {previewLoading ? (
               <div className="flex items-center justify-center py-12">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
               </div>
             ) : previewResume ? (
               <div className="space-y-4">
                 {/* Resume Header */}
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                   <div>
                     <h2 className="text-xl font-bold text-white">{previewResume.resume_title}</h2>
                     <p className="text-gray-400">Created by {previewResume.user_name}</p>
                   </div>
                   <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                     {previewResume.template_used}
                   </Badge>
                 </div>

                                   {/* Resume Content */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div 
                      className="resume-preview-content"
                      style={{
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        padding: '20px',
                        backgroundColor: 'white',
                        color: '#333',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: previewResume.resume_html || 'No preview available' 
                      }}
                    />
                  </div>
                  
                  {/* View Full Resume Button */}
                  {previewResume.resume_slug && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open(`/${previewResume.resume_slug}`, '_blank')}
                        className="border-white/10 text-white hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Resume
                      </Button>
                    </div>
                  )}
               </div>
             ) : (
               <div className="text-center py-8">
                 <p className="text-gray-400">No resume data available</p>
               </div>
             )}
           </DialogContent>
         </Dialog>
       </div>
     </AdminLayout>
   )
 } 