'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreHorizontal, Edit, Trash2, MapPin, User, CheckCircle, AlertCircle, Pause, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AdminLayout from '@/components/layout/AdminLayout'

interface JobCard {
  id: string
  company: string
  companyLogo: string
  title: string
  location: string
  salary: string
  employmentType: string[]
  postedDays: number
  applicants: number
  status: string
  priority: 'low' | 'medium' | 'high'
}

interface StatusColumn {
  id: string
  title: string
  color: string
  icon: any
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobCard[]>([])
  const [columns, setColumns] = useState<StatusColumn[]>([
    { id: 'on-hold', title: 'On Hold', color: 'bg-yellow-500', icon: Pause },
    { id: 'needs-approval', title: 'Needs Approval', color: 'bg-orange-500', icon: AlertCircle },
    { id: 'hiring', title: 'Hiring', color: 'bg-green-500', icon: CheckCircle },
    { id: 'closed', title: 'Closed', color: 'bg-gray-500', icon: X }
  ])
  const [draggedJob, setDraggedJob] = useState<string | null>(null)
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false)
  const [isAddStatusDialogOpen, setIsAddStatusDialogOpen] = useState(false)
  const [isEditJobDialogOpen, setIsEditJobDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobCard | null>(null)
  const [newJobData, setNewJobData] = useState({
    company: '',
    title: '',
    location: '',
    salary: '',
    status: 'on-hold',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const [newStatusData, setNewStatusData] = useState({
    title: '',
    color: 'bg-blue-500'
  })

  useEffect(() => {
    const sampleJobs: JobCard[] = [
             {
         id: '1',
         company: 'Amazon',
         companyLogo: '🛒',
         title: 'Senior Customer Service Rep',
         location: 'Clark, Pampanga',
         salary: '₱1,750/hr',
         employmentType: ['Full-time', 'Senior level'],
         postedDays: 5,
         applicants: 24,
         status: 'hiring',
         priority: 'high'
       },
       {
         id: '2',
         company: 'Google',
         companyLogo: '🔍',
         title: 'Technical Support Specialist',
         location: 'Makati, Metro Manila',
         salary: '₱1,400/hr',
         employmentType: ['Full-time', 'Mid level'],
         postedDays: 3,
         applicants: 18,
         status: 'needs-approval',
         priority: 'medium'
       },
       {
         id: '3',
         company: 'Microsoft',
         companyLogo: '🪟',
         title: 'Customer Success Manager',
         location: 'BGC, Taguig',
         salary: '₱1,600/hr',
         employmentType: ['Full-time', 'Senior level'],
         postedDays: 7,
         applicants: 31,
         status: 'on-hold',
         priority: 'low'
       },
       {
         id: '4',
         company: 'Shopee',
         companyLogo: '🛍️',
         title: 'E-commerce Support Agent',
         location: 'Quezon City',
         salary: '₱1,100/hr',
         employmentType: ['Full-time', 'Entry level'],
         postedDays: 2,
         applicants: 45,
         status: 'closed',
         priority: 'medium'
       }
    ]
    setJobs(sampleJobs)
  }, [])

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    console.log('Drag started for job:', jobId)
    setDraggedJob(jobId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', jobId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    console.log('Drag over column')
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    console.log('Drop event triggered for status:', status)
    if (draggedJob) {
      console.log('Moving job', draggedJob, 'to status:', status)
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === draggedJob ? { ...job, status } : job
        )
      )
      setDraggedJob(null)
    }
  }

  const handleAddJob = () => {
    if (newJobData.company && newJobData.title) {
      const newJob: JobCard = {
        id: Date.now().toString(),
        company: newJobData.company,
        companyLogo: '🏢',
        title: newJobData.title,
        location: newJobData.location,
        salary: newJobData.salary,
        employmentType: ['Full-time'],
        postedDays: 0,
        applicants: 0,
        status: newJobData.status,
        priority: newJobData.priority
      }
      setJobs(prev => [...prev, newJob])
      setNewJobData({
        company: '',
        title: '',
        location: '',
        salary: '',
        status: 'on-hold',
        priority: 'medium'
      })
      setIsAddJobDialogOpen(false)
    }
  }

  const handleAddStatus = () => {
    if (newStatusData.title) {
      const newStatus: StatusColumn = {
        id: newStatusData.title.toLowerCase().replace(/\s+/g, '-'),
        title: newStatusData.title,
        color: newStatusData.color,
        icon: CheckCircle
      }
      setColumns(prev => [...prev, newStatus])
      setNewStatusData({
        title: '',
        color: 'bg-blue-500'
      })
      setIsAddStatusDialogOpen(false)
    }
  }

  const handleEditJob = (job: JobCard) => {
    setEditingJob(job)
    setIsEditJobDialogOpen(true)
  }

  const handleUpdateJob = () => {
    if (editingJob) {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === editingJob.id ? editingJob : job
        )
      )
      setEditingJob(null)
      setIsEditJobDialogOpen(false)
    }
  }

  const handleDeleteJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High'
      case 'medium': return 'Medium'
      case 'low': return 'Low'
      default: return 'Unknown'
    }
  }

  return (
    <AdminLayout title="Job Management" description="Manage job postings and applications">
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end">
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddStatusDialogOpen(true)}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
            <Button
              onClick={() => setIsAddJobDialogOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnJobs = jobs.filter(job => job.status === column.id)
            const IconComponent = column.icon

            return (
                             <div
                 key={column.id}
                 className="flex-shrink-0 w-80 border-2 border-dashed border-transparent hover:border-white/20 transition-colors"
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, column.id)}
               >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                    <Badge className="bg-white/10 text-white border-white/20">
                      {columnJobs.length}
                    </Badge>
                  </div>
                  <IconComponent className="w-5 h-5 text-gray-400" />
                </div>

                {/* Job Cards */}
                <div className="space-y-3">
                  {columnJobs.map((job) => (
                                         <div
                       key={job.id}
                       draggable
                       onDragStart={(e) => handleDragStart(e, job.id)}
                       className="cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                     >
                      <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-sm">{job.companyLogo}</span>
                              </div>
                              <div>
                                <p className="font-medium text-white text-sm">{job.company}</p>
                                <p className="text-xs text-gray-400">{job.postedDays} days ago</p>
                              </div>
                            </div>
                                                         <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-6 w-6">
                                   <MoreHorizontal className="w-3 h-3" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent className="glass-card border-white/10 backdrop-blur-md">
                                 <DropdownMenuItem 
                                   className="text-white hover:bg-white/10 focus:bg-white/10"
                                   onClick={() => handleEditJob(job)}
                                 >
                                   <Edit className="mr-2 h-4 w-4" />
                                   Edit
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator className="bg-white/10" />
                                 <DropdownMenuItem 
                                   className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                                   onClick={() => handleDeleteJob(job.id)}
                                 >
                                   <Trash2 className="mr-2 h-4 w-4" />
                                   Delete
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <h4 className="font-semibold text-white text-sm line-clamp-2">
                            {job.title}
                          </h4>
                          
                          <div className="space-y-2">
                                                         <div className="flex items-center text-gray-300 text-xs">
                               <MapPin className="w-3 h-3 mr-1" />
                               <span>{job.location}</span>
                             </div>
                             <div className="flex items-center text-gray-300 text-xs">
                               <span className="mr-1">₱</span>
                               <span>{job.salary.replace('₱', '')}</span>
                             </div>
                             <div className="flex items-center text-gray-300 text-xs">
                               <User className="w-3 h-3 mr-1" />
                               <span>{job.applicants} applicants</span>
                             </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge className={getPriorityColor(job.priority)}>
                              {getPriorityLabel(job.priority)}
                            </Badge>
                            <Badge className="bg-white/10 text-white border-white/20">
                              {job.employmentType[0]}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Job Dialog */}
        <Dialog open={isAddJobDialogOpen} onOpenChange={setIsAddJobDialogOpen}>
          <DialogContent className="bg-gray-900/95 backdrop-blur-md border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Add New Job</DialogTitle>
              <DialogDescription className="text-gray-300">
                Create a new job posting to track applications and candidates.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Company</label>
                  <Input
                    value={newJobData.company}
                    onChange={(e) => setNewJobData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter company name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Job Title</label>
                  <Input
                    value={newJobData.title}
                    onChange={(e) => setNewJobData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter job title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Location</label>
                  <Input
                    value={newJobData.location}
                    onChange={(e) => setNewJobData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-300">Salary</label>
                   <Input
                     value={newJobData.salary}
                     onChange={(e) => setNewJobData(prev => ({ ...prev, salary: e.target.value }))}
                     placeholder="e.g., ₱1,500/hr or ₱25,000/month"
                     className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                   />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select
                    value={newJobData.status}
                    onChange={(e) => setNewJobData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    {columns.map(column => (
                      <option key={column.id} value={column.id}>{column.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Priority</label>
                  <select
                    value={newJobData.priority}
                    onChange={(e) => setNewJobData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddJob}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                >
                  Add Job
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddJobDialogOpen(false)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Status Dialog */}
        <Dialog open={isAddStatusDialogOpen} onOpenChange={setIsAddStatusDialogOpen}>
          <DialogContent className="bg-gray-900/95 backdrop-blur-md border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Add New Status Group</DialogTitle>
              <DialogDescription className="text-gray-300">
                Create a new status column to organize your job postings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status Name</label>
                <Input
                  value={newStatusData.title}
                  onChange={(e) => setNewStatusData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Approved, In Review, Final Stage"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Color</label>
                <select
                  value={newStatusData.color}
                  onChange={(e) => setNewStatusData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-pink-500">Pink</option>
                  <option value="bg-indigo-500">Indigo</option>
                  <option value="bg-teal-500">Teal</option>
                  <option value="bg-orange-500">Orange</option>
                  <option value="bg-red-500">Red</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddStatus}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                >
                  Add Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddStatusDialogOpen(false)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
                 </Dialog>

         {/* Edit Job Dialog */}
         <Dialog open={isEditJobDialogOpen} onOpenChange={setIsEditJobDialogOpen}>
           <DialogContent className="bg-gray-900/95 backdrop-blur-md border border-white/10 text-white">
             <DialogHeader>
               <DialogTitle className="text-2xl font-bold text-white">Edit Job</DialogTitle>
               <DialogDescription className="text-gray-300">
                 Update the job posting details.
               </DialogDescription>
             </DialogHeader>
             {editingJob && (
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Company</label>
                     <Input
                       value={editingJob.company}
                       onChange={(e) => setEditingJob(prev => prev ? { ...prev, company: e.target.value } : null)}
                       placeholder="Enter company name"
                       className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Job Title</label>
                     <Input
                       value={editingJob.title}
                       onChange={(e) => setEditingJob(prev => prev ? { ...prev, title: e.target.value } : null)}
                       placeholder="Enter job title"
                       className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Location</label>
                     <Input
                       value={editingJob.location}
                       onChange={(e) => setEditingJob(prev => prev ? { ...prev, location: e.target.value } : null)}
                       placeholder="Enter location"
                       className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Salary</label>
                     <Input
                       value={editingJob.salary}
                       onChange={(e) => setEditingJob(prev => prev ? { ...prev, salary: e.target.value } : null)}
                       placeholder="e.g., ₱1,500/hr or ₱25,000/month"
                       className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Status</label>
                     <select
                       value={editingJob.status}
                       onChange={(e) => setEditingJob(prev => prev ? { ...prev, status: e.target.value } : null)}
                       className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                     >
                       {columns.map(column => (
                         <option key={column.id} value={column.id}>{column.title}</option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300">Priority</label>
                     <select
                       value={editingJob.priority}
                       onChange={(e) => setEditingJob(prev => prev ? { ...prev, priority: e.target.value as 'low' | 'medium' | 'high' } : null)}
                       className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                     >
                       <option value="low">Low</option>
                       <option value="medium">Medium</option>
                       <option value="high">High</option>
                     </select>
                   </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                   <Button
                     onClick={handleUpdateJob}
                     className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                   >
                     Update Job
                   </Button>
                   <Button
                     variant="outline"
                     onClick={() => {
                       setIsEditJobDialogOpen(false)
                       setEditingJob(null)
                     }}
                     className="border-white/10 text-white hover:bg-white/10"
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>
       </div>
     </AdminLayout>
   )
} 