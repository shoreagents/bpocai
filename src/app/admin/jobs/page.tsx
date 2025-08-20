'use client'

import { useState, useEffect } from 'react'
import { getSessionToken } from '@/lib/auth-helpers'
import { Plus, MoreHorizontal, Edit, Trash2, MapPin, User, CheckCircle, AlertCircle, Pause, X, Loader2, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import AdminLayout from '@/components/layout/AdminLayout'
import React from 'react'

const industryOptions = [
  'Technology','Healthcare','Finance/Banking','Education','Manufacturing','Retail/E-commerce','Real Estate','Marketing/Advertising','Hospitality/Tourism','Construction','Government','Non-profit','Transportation/Logistics','Media/Entertainment','Food & Beverage','Others',
]
const departmentOptions = [
  'Engineering','Information Technology (IT)','Sales','Marketing','Human Resources','Finance/Accounting','Operations','Customer Service','Administration','Research & Development','Legal','Design/Creative','Project Management','Quality Assurance','Business Development','Supply Chain','Others',
]

interface JobCard {
  id: string
  company: string
  companyLogo: string
  title: string
  location: string
  locationType: 'on-site' | 'remote' | 'hybrid'
  salary: string
  employmentType: string[]
  postedDays: number
  applicants: number
  status: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  source?: 'processed' | 'original'
}

interface StatusColumn {
  id: string
  title: string
  color: string
  icon: any
}

function JobsPage() {
  const [jobs, setJobs] = useState<JobCard[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [columns, setColumns] = useState<StatusColumn[]>([
    { id: 'job-request', title: 'New Job Request', color: 'bg-yellow-500', icon: Pause },
    { id: 'approved', title: 'Processed Request', color: 'bg-orange-500', icon: AlertCircle },
    { id: 'hiring', title: 'Active/Hiring', color: 'bg-green-500', icon: CheckCircle },
    { id: 'closed', title: 'Closed', color: 'bg-gray-500', icon: X }
  ])
  const [draggedJob, setDraggedJob] = useState<string | null>(null)
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false)
  const [isAddStatusDialogOpen, setIsAddStatusDialogOpen] = useState(false)
  const [isEditJobDialogOpen, setIsEditJobDialogOpen] = useState(false)
  const [members, setMembers] = useState<Array<{ company_id: string, company: string }>>([])
  const [addingQuickJob, setAddingQuickJob] = useState<boolean>(false)
  const [editingJob, setEditingJob] = useState<any | null>(null)
  const [isImproving, setIsImproving] = useState<boolean>(false)
  const [isImprovingNew, setIsImprovingNew] = useState<boolean>(false)
  const [newJobData, setNewJobData] = useState({
    company: '',
    title: '',
    salary: '',
    salaryMin: '' as string | number,
    salaryMax: '' as string | number,
    salaryType: 'monthly',
    workArrangement: 'onsite',
    experienceLevel: '' as '' | 'entry-level' | 'mid-level' | 'senior-level',
    applicationDeadline: '' as string,
    industry: '',
    department: '',
    requirements: '' as string,
    responsibilities: '' as string,
    benefits: '' as string,
    skills: '' as string,
    jobDescription: '' as string,
    status: 'job-request',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })
  const [newStatusData, setNewStatusData] = useState({
    title: '',
    color: 'bg-blue-500'
  })

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setLoadError(null)
        const token = await getSessionToken()
        if (!token) throw new Error('Not authenticated')
        const res = await fetch('/api/admin/jobs', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to load jobs')
        }
        const data = await res.json()
        setJobs(data.jobs || [])

        // load members for company dropdown
        const mres = await fetch('/api/admin/members', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        })
        if (mres.ok) {
          const mdata = await mres.json()
          const existingMembers = mdata.members || []
          
          // Add ShoreAgents if it doesn't already exist
          const hasShoreAgents = existingMembers.some((member: any) => member.company === 'ShoreAgents')
          if (!hasShoreAgents) {
            existingMembers.unshift({ company_id: 'shoreagents', company: 'ShoreAgents' })
          }
          
          setMembers(existingMembers)
        } else {
          // If API fails, at least provide ShoreAgents as an option
          setMembers([{ company_id: 'shoreagents', company: 'ShoreAgents' }])
        }
      } catch (e) {
        console.error('Failed to load job requests', e)
        setLoadError(e instanceof Error ? e.message : 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    // Prevent dragging closed jobs
    if (job?.status === 'closed') {
      e.preventDefault()
      return
    }
    setDraggedJob(jobId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', jobId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    console.log('Drag over column')
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    if (!draggedJob) return
    const jobId = draggedJob
      setDraggedJob(null)

    const job = jobs.find(j => j.id === jobId)
    if (!job) return

    // Once in Closed, do not allow moving anywhere
    if (job.status === 'closed') return

    // Treat processed and active/hiring cards as processed-source
    // so they can never move back to New or Processed
    const isProcessed = (job as any).source === 'processed' || job.status === 'approved' || job.status === 'processed' || job.status === 'hiring' || job.status === 'active'
    if (isProcessed && status === 'job-request') {
      return
    }

    // If dropping an original job into Processed Request: run processing flow
    if (!isProcessed && status === 'approved') {
      const prev = jobs
      try {
        const token = await getSessionToken()
        if (!token) throw new Error('Not authenticated')
        const res = await fetch('/api/admin/jobs/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: jobId, asIs: true })
        })
        if (!res.ok) throw new Error('Failed to process job')
        const data = await res.json()
        setJobs(prevJobs => {
          const withoutOriginal = prevJobs.filter(j => j.id !== String(data.originalJobId))
          const existing = prevJobs.find(j => j.id === String(data.originalJobId)) || ({} as any)
          const processed = data.processedJob || {}
          const priority = processed.priority || existing.priority || 'medium'
          return [{ ...processed, priority }, ...withoutOriginal]
        })
        // Immediately hydrate with full processed fields
        try {
          const fres = await fetch(`/api/admin/processed-jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
          if (fres.ok) {
            const fdata = await fres.json()
            const pj = fdata.job
            setJobs(prev => prev.map(j => j.id === jobId ? {
              ...j,
              title: pj.job_title || j.title,
              source: 'processed' as any,
              job_description: pj.job_description,
              requirements: pj.requirements,
              responsibilities: pj.responsibilities,
              benefits: pj.benefits,
              skills: pj.skills,
              priority: ((): any => {
                const pr = String(pj.priority || '').toLowerCase()
                return pr === 'low' || pr === 'medium' || pr === 'high' ? pr : j.priority
              })()
            } : j))
          }
        } catch {}
      } catch (err) {
        console.error(err)
        setJobs(prev)
      }
      return
    }

    // Processed/Active cards: allow toggling between Processed Request and Active/Hiring, but never back to New
    if (isProcessed) {
      if (status === 'job-request') return // never allow back to New Job Request

      // Allow closing only from Active/Hiring → Closed
      if (status === 'closed') {
        // Only allow if currently active/hiring
        if (!(job.status === 'hiring' || job.status === 'active')) return
        const prev = jobs
        // Optimistic UI update
        setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status: 'closed', source: 'processed' as any } : j))
        try {
          const token = await getSessionToken()
          if (!token) throw new Error('Not authenticated')
          const res = await fetch('/api/admin/processed-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: 'update', data: { id: jobId, status: 'closed' } })
          })
          if (!res.ok) throw new Error('Failed to close processed job')
        } catch (err) {
          console.error(err)
          setJobs(prev)
        }
        return
      }

      if (status === 'approved' || status === 'hiring') {
        const prev = jobs
        const newProcessedStatus = status === 'approved' ? 'processed' : 'active'
        // Optimistic UI update
        setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status, source: 'processed' as any } : j))
        try {
          const token = await getSessionToken()
          if (!token) throw new Error('Not authenticated')
          const res = await fetch('/api/admin/processed-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: 'update', data: { id: jobId, status: newProcessedStatus } })
          })
          if (!res.ok) throw new Error('Failed to move processed job')
          // Reload processed fields to hydrate card
          const fres = await fetch(`/api/admin/processed-jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
          if (fres.ok) {
            const fdata = await fres.json()
            const pj = fdata.job
            setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? {
              ...j,
              title: pj.job_title || j.title,
              job_description: pj.job_description,
              requirements: pj.requirements,
              responsibilities: pj.responsibilities,
              benefits: pj.benefits,
              skills: pj.skills
            } : j))
          }
        } catch (err) {
          console.error(err)
          setJobs(prev)
        }
        return
      }

      // Other destinations (including Closed from non-active) ignored
      return
    }

    // Otherwise, moving an original job within job_requests
    // Special case: moving directly to Active/Hiring should also process into processed_job_requests with status 'active'
    if (status === 'hiring') {
      const prev = jobs
      try {
        const token = await getSessionToken()
        if (!token) throw new Error('Not authenticated')
        // Process original into processed table and mark active
        const res = await fetch('/api/admin/jobs/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: jobId, asIs: true, to: 'active' })
        })
        if (!res.ok) throw new Error('Failed to activate job')
        const data = await res.json()
        // Replace original with processed card and set as active/hiring
        setJobs(prevJobs => {
          const withoutOriginal = prevJobs.filter(j => j.id !== String(data.originalJobId))
          // Keep priority from processed job if available; otherwise derive from existing card
          const processed = data.processedJob || {}
          const existing = jobs.find(j => j.id === String(data.originalJobId)) || ({} as any)
          const priority = processed.priority || existing.priority || 'medium'
          return [{ ...processed, status: 'hiring', source: 'processed' as any, priority }, ...withoutOriginal]
        })
        // Hydrate processed details
        const fres = await fetch(`/api/admin/processed-jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        if (fres.ok) {
          const fdata = await fres.json()
          const pj = fdata.job
          setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? {
            ...j,
            title: pj.job_title || j.title,
            job_description: pj.job_description,
            requirements: pj.requirements,
            responsibilities: pj.responsibilities,
            benefits: pj.benefits,
            skills: pj.skills,
            priority: ((): any => {
              const pr = String(pj.priority || '').toLowerCase()
              return pr === 'low' || pr === 'medium' || pr === 'high' ? pr : j.priority
            })()
          } : j))
        }
      } catch (err) {
        console.error(err)
        setJobs(prev)
      }
      return
    }

    // Default: status-only move within original job_requests
    // Do not allow moving original jobs directly to Closed
    if (status === 'closed') return
    const prev = jobs
    setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status } : j))
    try {
      const token = await getSessionToken()
      if (!token) throw new Error('Not authenticated')
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'move', data: { id: jobId, toStatus: status } })
      })
      if (!res.ok) throw new Error('Failed to move')
    } catch (err) {
      console.error(err)
      setJobs(prev)
    }
  }

  const handleAddJob = async () => {
    if (!newJobData.company || !newJobData.title) return
    try {
      const token = await getSessionToken()
      if (!token) throw new Error('Not authenticated')
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'create',
          data: {
        company: newJobData.company,
        title: newJobData.title,
            location: '',
            salary: newJobData.salary || (newJobData.salaryMin || newJobData.salaryMax ? `₱${newJobData.salaryMin || ''} - ₱${newJobData.salaryMax || ''} / ${newJobData.salaryType}` : ''),
            status: 'job-request',
            workArrangement: newJobData.workArrangement,
            workType: 'full-time',
            experienceLevel: newJobData.experienceLevel || null,
            application_deadline: newJobData.applicationDeadline || null,
            industry: newJobData.industry || null,
            department: newJobData.department || null,
            jobDescription: newJobData.jobDescription || '',
            requirements: newJobData.requirements ? newJobData.requirements.split('\n') : [],
            responsibilities: newJobData.responsibilities ? newJobData.responsibilities.split('\n') : [],
            benefits: newJobData.benefits ? newJobData.benefits.split('\n') : [],
            skills: newJobData.skills ? newJobData.skills.split('\n') : [],
        priority: newJobData.priority,
        shift: newJobData.shift
      }
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({}))
        throw new Error(err.error || 'Failed to create job')
      }
      const data = await res.json()
      if (data?.job) setJobs(prev => [data.job, ...prev])
      setNewJobData({
        company: '', title: '', salary: '', salaryMin: '', salaryMax: '', salaryType: 'monthly',
        workArrangement: 'onsite', experienceLevel: '', applicationDeadline: '', industry: '', department: '',
        requirements: '', responsibilities: '', benefits: '', skills: '', jobDescription: '', status: 'job-request', priority: 'medium'
      })
      setIsAddJobDialogOpen(false)
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Failed to add job'
      alert(msg)
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

  const handleEditJob = async (job: JobCard) => {
    try {
      const token = await getSessionToken()
      if (!token) throw new Error('Not authenticated')
      // Always prefer processed row if exists; fallback to original
      let jobData: any = null
      let isProcessedSource = false
      try {
        const resProcessed = await fetch(`/api/admin/processed-jobs/${job.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        if (resProcessed.ok) {
          const pdata = await resProcessed.json()
          jobData = pdata.job
          isProcessedSource = true
        }
      } catch {}
      if (!jobData) {
        const resOrig = await fetch(`/api/admin/jobs/${job.id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        const odata = await resOrig.json()
        if (!resOrig.ok) throw new Error(odata.error || 'Failed to load job')
        jobData = odata.job
      }
      // also load comments
      let comments: any[] = []
      try {
        const cres = await fetch(`/api/admin/jobs/${job.id}/comments`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        if (cres.ok) { const cdata = await cres.json(); comments = cdata.comments || [] }
      } catch {}
      setEditingJob({ ...(jobData||{}), __comments: comments, __source: isProcessedSource ? 'processed' : 'original' })
    setIsEditJobDialogOpen(true)
    } catch (e) {
      console.error(e)
      alert('Failed to open job for editing')
    }
  }

  const handleUpdateJob = async () => {
    if (!editingJob) return
    try {
      const token = await getSessionToken()
      if (!token) throw new Error('Not authenticated')
      const payload = {
        id: editingJob.id,
        title: editingJob.job_title,
        location: editingJob.location,
        salary: formatEditSalary(editingJob.currency, editingJob.salary_min, editingJob.salary_max, editingJob.salary_type),
        status: mapEnumToUi(editingJob.status),
        workArrangement: editingJob.work_arrangement,
        workType: 'full-time',
        experienceLevel: editingJob.experience_level
      }
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'update', data: { ...payload, companyId: editingJob.company_id, salaryType: editingJob.salary_type, currency: editingJob.currency } })
      })
      if (!res.ok) throw new Error('Failed to update job')
      // refresh list
      setJobs(prev => prev.map(j => j.id === String(editingJob.id) ? {
        ...j,
        title: editingJob.job_title,
        location: editingJob.location,
        salary: formatSalaryDisplay(editingJob.currency, editingJob.salary_min, editingJob.salary_max, editingJob.salary_type),
        status: mapEnumToUi(editingJob.status) === 'job-request' ? 'job-request' : j.status
      } : j))
      setIsEditJobDialogOpen(false)
      setEditingJob(null)
    } catch (err) {
      console.error(err)
      alert('Failed to update job')
    }
  }

  const formatEditSalary = (currency: string, min: number | null, max: number | null, type: string) => {
    const sym = (currency || 'PHP').toUpperCase() === 'PHP' ? '₱' : (currency || 'PHP')
    if (min != null && max != null) return `${sym}${min} - ${sym}${max} / ${type}`
    if (min != null) return `${sym}${min} / ${type}`
    if (max != null) return `${sym}${max} / ${type}`
    return ''
  }

  const formatSalaryDisplay = (currency: string, min: number | null, max: number | null, type: string) => {
    const sym = (currency || 'PHP').toUpperCase() === 'PHP' ? '₱' : (currency || 'PHP')
    const fmt = (n: number) => n.toLocaleString('en-PH')
    if (min != null && max != null) return `${sym}${fmt(min)} - ${sym}${fmt(max)} / ${type}`
    if (min != null) return `${sym}${fmt(min)} / ${type}`
    if (max != null) return `${sym}${fmt(max)} / ${type}`
    return ''
  }

  const mapEnumToUi = (db: string): 'job-request' | 'approved' | 'hiring' | 'closed' => {
    const s = String(db || '').toLowerCase()
    if (s === 'active') return 'hiring'
    if (s === 'inactive') return 'job-request'
    if (s === 'processed' || s === 'approved') return 'approved'
    if (s === 'closed') return 'closed'
    return 'job-request'
  }

  const mapUiToEnum = (ui: string): 'active' | 'inactive' | 'closed' => {
    const s = String(ui || '').toLowerCase()
    if (s === 'hiring') return 'active'
    if (s === 'closed') return 'closed'
    return 'inactive'
  }

  // Build salary string for API parser
  const buildSalaryString = (currency: string, min: number | null, max: number | null, type: string) => {
    const sym = (currency || 'PHP').toUpperCase() === 'PHP' ? '₱' : (currency || 'PHP')
    const v = (n: number | null) => (n == null ? '' : String(n))
    if (min != null && max != null) return `${sym}${v(min)} - ${sym}${v(max)} / ${type}`
    if (min != null) return `${sym}${v(min)} / ${type}`
    if (max != null) return `${sym}${v(max)} / ${type}`
    return ''
  }

  // Autosave helper for inline edits
  const savePartialUpdate = async (partial: any, localMutate?: (draft: any) => any) => {
    if (!editingJob) return
    try {
      const token = await getSessionToken()
      if (!token) throw new Error('Not authenticated')
      const payload = { id: editingJob.id, ...partial }
      const endpoint = editingJob.__source === 'processed' ? '/api/admin/processed-jobs' : '/api/admin/jobs'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'update', data: payload })
      })
      if (!res.ok) throw new Error('Update failed')
      // Local mutate
      if (localMutate) setEditingJob((prev: any) => ({ ...(prev || {}), ...localMutate(prev) }))
      // reflect list minimally (title/location/priority)
      setJobs(prev => prev.map(j => j.id === String(editingJob.id)
        ? {
            ...j,
            title: (partial.title ?? j.title),
            location: (partial.location ?? j.location),
            priority: (partial.priority ?? j.priority)
          }
        : j
      ))
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    const prev = jobs
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
    try {
      const token = await getSessionToken()
      if (!token) throw new Error('Not authenticated')
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'delete', data: { id: jobId } })
      })
      if (!res.ok) throw new Error('Failed to delete')
    } catch (err) {
      console.error(err)
      setJobs(prev)
      alert('Failed to delete job')
    }
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

  const getLocationTypeColor = (locationType: string) => {
    switch (locationType) {
      case 'on-site': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'remote': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'hybrid': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getLocationTypeLabel = (locationType: string) => {
    switch (locationType) {
      case 'on-site': return 'On-Site'
      case 'remote': return 'Remote'
      case 'hybrid': return 'Hybrid'
      default: return 'On-Site'
    }
  }

  // Show the board UI but do not render job cards

  return (
    <AdminLayout 
      title="Job Management" 
      description="Manage job postings and applications"
      titleContent={null}
    >
      <div className="space-y-8">

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4 mt-12">
          {columns.map((column) => {
            const columnJobs: JobCard[] =
              column.id === 'job-request'
                ? jobs.filter(job => job.status === 'job-request' || job.status === 'inactive')
                : column.id === 'approved'
                  ? jobs.filter(job => job.status === 'approved' || job.status === 'processed')
                  : column.id === 'hiring'
                    ? jobs.filter(job => job.status === 'hiring' || job.status === 'active')
                    : column.id === 'closed'
                      ? jobs.filter(job => job.status === 'closed')
                      : []
            const IconComponent = column.icon

            return (
                             <div
                 key={column.id}
                 className="flex-shrink-0 w-80 border-2 border-dashed border-transparent hover:border-white/20 transition-colors"
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, column.id)}
               >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                    <Badge className="bg-white/10 text-white border-white/20">
                       {column.id === 'job-request' ? columnJobs.length : 0}
                    </Badge>
                  </div>
                  {column.id === 'job-request' ? (
                    <Button
                      size="sm"
                      onClick={() => setIsAddJobDialogOpen(true)}
                      className="h-7 px-2 text-xs bg-white/10 hover:bg-white/15 border border-white/15 text-white"
                    >
                      + Add Job
                    </Button>
                  ) : (
                  <IconComponent className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {column.id === 'job-request' || column.id === 'approved' || column.id === 'hiring' || column.id === 'closed' ? (
                <div className="space-y-3">
                  {columnJobs.map((job) => (
                                                             <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                        onClick={() => handleEditJob(job)}
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer active:cursor-grabbing hover:scale-102 transition-transform outline-none focus:ring-2 focus:ring-purple-500/40 rounded-md"
                    >
                      <Card className="glass-card border-white/10 hover:border-white/15 transition-all duration-200">
                        <CardContent className="p-4">
                          {/* Header with title and menu */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                                {job.title || 'Untitled Role'}
                              </h3>
                              <p className="text-xs text-gray-400">{job.company || 'ShoreAgents'}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white flex-shrink-0" onClick={(e)=> e.stopPropagation()}>
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="glass-card border-white/10 backdrop-blur-md">
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id) }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Status indicator */}
                          <div className="flex items-center mb-3">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              column.id === 'job-request' 
                                ? 'bg-yellow-500'
                                : column.id === 'approved'
                                  ? 'bg-orange-500'
                                  : column.id === 'hiring'
                                    ? 'bg-green-500'
                                    : 'bg-gray-500'
                            }`}></div>
                            <span className="text-xs text-gray-400 capitalize">
                              {column.id === 'job-request' ? 'New Request' : 
                               column.id === 'approved' ? 'Approved' :
                               column.id === 'hiring' ? 'Active' : 'Closed'}
                            </span>
                          </div>
                          
                          {/* Key info */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-xs text-gray-300">
                              <span className="font-medium">₱{job.salary.replace('₱', '')}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{job.postedDays}d ago</span>
                              <span>{job.applicants} applicants</span>
                            </div>
                          </div>

                          {/* Priority badge */}
                          <div className="flex justify-end">
                            <Badge 
                              className={`text-xs px-2 py-1 ${
                                job.priority === 'high' 
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                  : job.priority === 'medium'
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-green-500/20 text-green-400 border-green-500/30'
                              }`}
                            >
                              {job.priority}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="min-h-[120px] rounded-lg border border-white/10 bg-white/5" />
                )}
              </div>
            )
          })}
        </div>

        {/* Add Job Dialog (full form) */}
        <Dialog open={isAddJobDialogOpen} onOpenChange={setIsAddJobDialogOpen}>
          <DialogContent className="bg-[#0b0b0d] text-white border border-white/10 w-[96vw] sm:max-w-6xl xl:max-w-7xl max-w-[1400px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Create Job Request</DialogTitle>
              <DialogDescription className="text-gray-300">Provide details for the new job request. All fields can be edited later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 overflow-y-auto max-h-[75vh] pr-2 job-modal-scroll">
              {/* Member & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Member</label>
                  <select
                    className="w-full job-select border border-white/20 rounded-lg px-3 py-2"
                    value={newJobData.company}
                    onChange={(e)=> setNewJobData(p=> ({...p, company: e.target.value}))}
                  >
                    <option value="">Select company</option>
                    {members.map(m => (
                      <option key={m.company_id} value={m.company}>{m.company}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Job Title</label>
                  <Input value={newJobData.title} onChange={(e)=> setNewJobData(p=> ({...p, title: e.target.value}))} placeholder="Enter job title" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" />
                </div>
              </div>

              {/* Salary Min/Max & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Salary Min</label>
                  <Input value={newJobData.salaryMin} onChange={(e)=> setNewJobData(p=> ({...p, salaryMin: e.target.value}))} placeholder="e.g., 20000" className="bg-white/10 border-white/20 text-white" />
                </div>
                                 <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Salary Max</label>
                  <Input value={newJobData.salaryMax} onChange={(e)=> setNewJobData(p=> ({...p, salaryMax: e.target.value}))} placeholder="e.g., 25000" className="bg-white/10 border-white/20 text-white" />
                 </div>
                                 <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Salary Type</label>
                  <select className="w-full job-select border border-white/20 rounded-lg px-3 py-2" value={newJobData.salaryType} onChange={(e)=> setNewJobData(p=> ({...p, salaryType: e.target.value}))}>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
              </div>
              </div>

              {/* Work Arrangement & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Work Arrangement</label>
                  <select className="w-full job-select border border-white/20 rounded-lg px-3 py-2" value={newJobData.workArrangement} onChange={(e)=> setNewJobData(p=> ({...p, workArrangement: e.target.value}))}>
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Experience Level</label>
                  <select className="w-full job-select border border-white/20 rounded-lg px-3 py-2" value={newJobData.experienceLevel} onChange={(e)=> setNewJobData(p=> ({...p, experienceLevel: e.target.value as any}))}>
                    <option value="">Select level</option>
                    <option value="entry-level">Entry-level</option>
                    <option value="mid-level">Mid-level</option>
                    <option value="senior-level">Senior-level</option>
                  </select>
                </div>
              </div>

              {/* Deadline, Industry, Department */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Application Deadline</label>
                  <Input type="date" value={newJobData.applicationDeadline} onChange={(e)=> setNewJobData(p=> ({...p, applicationDeadline: e.target.value}))} className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Industry</label>
                  <select
                    className="w-full job-select border border-white/20 rounded-lg px-3 py-2"
                    value={newJobData.industry}
                    onChange={(e)=> setNewJobData(p=> ({...p, industry: e.target.value}))}
                  >
                    <option value="">Select industry</option>
                    {industryOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Department</label>
                  <select
                    className="w-full job-select border border-white/20 rounded-lg px-3 py-2"
                    value={newJobData.department}
                    onChange={(e)=> setNewJobData(p=> ({...p, department: e.target.value}))}
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description & Lists */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Job Description</label>
                <textarea value={newJobData.jobDescription} onChange={(e)=> setNewJobData(p=> ({...p, jobDescription: e.target.value}))} className="w-full min-h-[100px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Requirements (one per line)</label>
                <textarea value={newJobData.requirements} onChange={(e)=> setNewJobData(p=> ({...p, requirements: e.target.value}))} className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Responsibilities (one per line)</label>
                <textarea value={newJobData.responsibilities} onChange={(e)=> setNewJobData(p=> ({...p, responsibilities: e.target.value}))} className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Benefits (one per line)</label>
                <textarea value={newJobData.benefits} onChange={(e)=> setNewJobData(p=> ({...p, benefits: e.target.value}))} className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Skills (one per line)</label>
                <textarea value={newJobData.skills} onChange={(e)=> setNewJobData(p=> ({...p, skills: e.target.value}))} className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" />
              </div>

              {/* Priority + AI improve (status is implicitly New Job Request/inactive) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-300">Priority</label>
                  <select value={newJobData.priority} onChange={(e)=> setNewJobData(p=> ({...p, priority: e.target.value as any}))} className="w-full job-select border border-white/20 rounded-lg px-3 py-2">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">AI Assistant</label>
                  <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                      disabled={!newJobData.title || !newJobData.experienceLevel || isImprovingNew}
                      onClick={async ()=>{
                        try {
                          setIsImprovingNew(true)
                          const token = await getSessionToken()
                          if (!token) throw new Error('Not authenticated')
                          const payload = {
                            job_title: newJobData.title,
                            experience_level: newJobData.experienceLevel,
                            job_description: newJobData.jobDescription || '',
                            requirements: newJobData.requirements ? newJobData.requirements.split('\n') : [],
                            responsibilities: newJobData.responsibilities ? newJobData.responsibilities.split('\n') : [],
                            benefits: newJobData.benefits ? newJobData.benefits.split('\n') : [],
                            skills: newJobData.skills ? newJobData.skills.split('\n') : []
                          }
                          const res = await fetch('/api/admin/jobs/improve', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ data: payload })
                          })
                          if (!res.ok) throw new Error('AI improve failed')
                          const data = await res.json()
                          const imp = data.improved
                          setNewJobData(prev => ({
                            ...prev,
                            title: imp.job_title || prev.title,
                            experienceLevel: (imp.experience_level as any) || prev.experienceLevel,
                            jobDescription: imp.job_description || prev.jobDescription,
                            requirements: (imp.requirements || []).join('\n'),
                            responsibilities: (imp.responsibilities || []).join('\n'),
                            benefits: (imp.benefits || []).join('\n'),
                            skills: (imp.skills || []).join('\n')
                          }))
                        } catch (e) {
                          console.error(e)
                          alert('Failed to improve with AI')
                        } finally {
                          setIsImprovingNew(false)
                        }
                      }}
                    >
                      {isImprovingNew ? 'Improving…' : 'Improve with AI'}
                </Button>
                    <span className="text-xs text-gray-400">Requires Job Title and Experience Level</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleAddJob} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">Create Job Request</Button>
                <Button variant="outline" onClick={()=> setIsAddJobDialogOpen(false)} className="border-white/10 text-white hover:bg-white/10">Cancel</Button>
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
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white [&>option]:bg-gray-800 [&>option]:text-white"
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

        {/* Edit Job Dialog (temporary static UI matching uploaded design) */}
         <Dialog open={isEditJobDialogOpen} onOpenChange={setIsEditJobDialogOpen}>
          <DialogContent className="bg-[#0b0b0d] text-white border border-white/10 w-[96vw] sm:max-w-6xl xl:max-w-7xl max-w-[1400px] p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Job Request Details</DialogTitle>
              <DialogDescription>View and edit job request fields</DialogDescription>
             </DialogHeader>
             {editingJob && (
              <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[70vh] relative">
                {isImproving && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                    <div className="flex items-center gap-3 bg-black/80 border border-white/10 rounded-md px-4 py-3 shadow-2xl">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                      <span className="text-sm text-gray-100">Improving with AI...</span>
                   </div>
                   </div>
                )}
                {/* Left: main area */}
                <div className="lg:col-span-2 p-6 overflow-y-auto max-h-[80vh] pr-2 job-modal-scroll">
                  <div className="flex items-start gap-3 mb-3">
                    <h2 className="text-2xl font-semibold flex-1">{editingJob.company_name || 'Member'} | {editingJob.job_title || 'Role Title'}</h2>
                    <div className="flex gap-2 flex-col items-end">
                      <Button
                        className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white"
                        onClick={async ()=> {
                          if (!editingJob) return
                          try {
                            setIsImproving(true)
                            const token = await getSessionToken()
                            if (!token) throw new Error('Not authenticated')

                            // If editing a processed job, generate improvements and persist to processed table
                            if (editingJob.__source === 'processed') {
                              const payload = {
                                job_title: editingJob.job_title || '',
                                experience_level: editingJob.experience_level || '',
                                job_description: editingJob.job_description || '',
                                requirements: Array.isArray(editingJob.requirements) ? editingJob.requirements : [],
                                responsibilities: Array.isArray(editingJob.responsibilities) ? editingJob.responsibilities : [],
                                benefits: Array.isArray(editingJob.benefits) ? editingJob.benefits : [],
                                skills: Array.isArray(editingJob.skills) ? editingJob.skills : []
                              }
                              const res = await fetch('/api/admin/jobs/improve', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ data: payload })
                              })
                              if (!res.ok) throw new Error('AI improve failed')
                              const data = await res.json()
                              const imp = data.improved

                              // Update modal state immediately
                              setEditingJob((p:any)=> ({
                                ...(p||{}),
                                job_title: imp.job_title,
                                experience_level: imp.experience_level,
                                job_description: imp.job_description,
                                requirements: imp.requirements,
                                responsibilities: imp.responsibilities,
                                benefits: imp.benefits,
                                skills: imp.skills
                              }))

                              // Persist to processed table and reflect list
                              await savePartialUpdate({
                                title: imp.job_title,
                                experienceLevel: imp.experience_level,
                                jobDescription: imp.job_description,
                                requirements: imp.requirements,
                                responsibilities: imp.responsibilities,
                                benefits: imp.benefits,
                                skills: imp.skills
                              })
                              setJobs(prev => prev.map(j => j.id === String(editingJob.id) ? { ...j, title: imp.job_title } : j))
                            } else {
                              // Original job → process and create processed record
                              const res = await fetch('/api/admin/jobs/process', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ id: editingJob.id })
                              })
                              if (!res.ok) throw new Error('AI process failed')
                              const data = await res.json()
                              // Update board: remove original, add processed
                              setJobs(prev => {
                                const removed = prev.filter(j => j.id !== String(data.originalJobId))
                                return [data.processedJob, ...removed]
                              })
                              // Update modal header with processed data
                              setEditingJob((p:any)=> ({ ...(p||{}), status: 'processed', job_title: data.processedJob.title, __source: 'processed' }))
                            }
                          } catch (e) {
                            console.error(e)
                            alert('Failed to improve with AI')
                          } finally {
                            setIsImproving(false)
                          }
                        }}
                      >
                        Improve with AI
                      </Button>
                      {mapEnumToUi(editingJob.status) === 'job-request' && (
                        <div className="text-[11px] text-gray-400 text-right">
                          Once this job request is improved with AI, it will be moved to processed request
                        </div>
                      )}
                   </div>
                   </div>
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Status</span>
                      <span className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/15">
                        {mapEnumToUi(editingJob.status) === 'hiring' ? 'Active' : mapEnumToUi(editingJob.status) === 'job-request' ? 'Job Request' : mapEnumToUi(editingJob.status) === 'approved' ? 'Processed' : 'Closed'}
                      </span>
                 </div>
                    
                    
                  </div>

                  <div className="text-sm text-gray-300 font-semibold mb-2">Custom Fields</div>
                  <div className="rounded-lg border border-white/10 divide-y divide-white/10">
                    {/* Member */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Member</div>
                     <select
                        value={editingJob.company_id || ''}
                        onChange={(e) => savePartialUpdate({ companyId: e.target.value }, () => ({ company_id: e.target.value, company_name: (members.find(m => m.company_id === e.target.value)?.company || editingJob.company_name) }))}
                        className="w-full max-w-[60%] job-select border border-white/20 rounded-lg px-3 py-2"
                      >
                        <option value="">Select company</option>
                        {members.map(m => (<option key={m.company_id} value={m.company_id}>{m.company}</option>))}
                     </select>
                   </div>
                    {/* Role Title */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Role Title</div>
                      <input
                        className="w-full max-w-[60%] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                        value={editingJob.job_title || ''}
                        onChange={(e) => setEditingJob((p:any) => ({ ...(p||{}), job_title: e.target.value }))}
                        onBlur={(e) => savePartialUpdate({ title: e.currentTarget.value })}
                     />
                   </div>
                    
                    {/* Work Arrangement */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Work Arrangement</div>
                     <select
                        className="w-full max-w-[60%] job-select border border-white/20 rounded-lg px-3 py-2"
                        value={editingJob.work_arrangement || 'onsite'}
                        onChange={(e) => { setEditingJob((p:any) => ({ ...(p||{}), work_arrangement: e.target.value })); savePartialUpdate({ workArrangement: e.target.value }) }}
                      >
                        <option value="onsite">Onsite</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                     </select>
                   </div>
                    {/* Experience Level */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Experience Level</div>
                     <select
                        className="w-full max-w-[60%] job-select border border-white/20 rounded-lg px-3 py-2"
                        value={editingJob.experience_level || ''}
                        onChange={(e) => { setEditingJob((p:any) => ({ ...(p||{}), experience_level: e.target.value })); savePartialUpdate({ experienceLevel: e.target.value }) }}
                      >
                        <option value="">Select level</option>
                        <option value="entry-level">Entry-level</option>
                        <option value="mid-level">Mid-level</option>
                        <option value="senior-level">Senior-level</option>
                      </select>
                    </div>
                    {/* Salary Range */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Salary Range</div>
                      <div className="w-full max-w-[60%] grid grid-cols-2 gap-2">
                        <input type="number" className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={editingJob.salary_min ?? ''} onChange={(e)=> setEditingJob((p:any)=>({...(p||{}), salary_min: e.target.value===''? null: Number(e.target.value)}))} onBlur={()=> savePartialUpdate({ salary: buildSalaryString(editingJob.currency || 'PHP', editingJob.salary_min ?? null, editingJob.salary_max ?? null, editingJob.salary_type || 'monthly'), salaryType: editingJob.salary_type || 'monthly', currency: editingJob.currency || 'PHP' })} />
                        <input type="number" className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={editingJob.salary_max ?? ''} onChange={(e)=> setEditingJob((p:any)=>({...(p||{}), salary_max: e.target.value===''? null: Number(e.target.value)}))} onBlur={()=> savePartialUpdate({ salary: buildSalaryString(editingJob.currency || 'PHP', editingJob.salary_min ?? null, editingJob.salary_max ?? null, editingJob.salary_type || 'monthly'), salaryType: editingJob.salary_type || 'monthly', currency: editingJob.currency || 'PHP' })} />
                      </div>
                    </div>
                    {/* Salary Type */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Salary Type</div>
                      <select className="w-full max-w-[60%] job-select border border-white/20 rounded-lg px-3 py-2" value={editingJob.salary_type || 'monthly'} onChange={(e)=> { setEditingJob((p:any)=> ({...(p||{}), salary_type: e.target.value })); savePartialUpdate({ salaryType: e.target.value }) }}>
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                    {/* Priority */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Priority</div>
                      <select className="w-full max-w-[60%] job-select border border-white/20 rounded-lg px-3 py-2" value={editingJob.priority || 'medium'} onChange={(e)=> { setEditingJob((p:any)=> ({...(p||{}), priority: e.target.value })); savePartialUpdate({ priority: e.target.value }) }}>
                       <option value="low">Low</option>
                       <option value="medium">Medium</option>
                       <option value="high">High</option>
                     </select>
                   </div>
                    
                    {/* Industry */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Industry</div>
                      <input className="w-full max-w-[60%] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={editingJob.industry || ''} onChange={(e)=> setEditingJob((p:any)=> ({...(p||{}), industry: e.target.value}))} onBlur={(e)=> savePartialUpdate({ industry: e.currentTarget.value })} />
                 </div>
                    {/* Department */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Department</div>
                      <input className="w-full max-w-[60%] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={editingJob.department || ''} onChange={(e)=> setEditingJob((p:any)=> ({...(p||{}), department: e.target.value}))} onBlur={(e)=> savePartialUpdate({ department: e.currentTarget.value })} />
                    </div>
                    {/* Application Deadline */}
                    <div className="flex items-center justify-between p-3 gap-3">
                      <div className="text-sm text-gray-300">Application Deadline</div>
                      <input type="date" className="w-full max-w-[60%] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={editingJob.application_deadline ? String(editingJob.application_deadline).slice(0,10) : ''} onChange={(e)=> { setEditingJob((p:any)=> ({...(p||{}), application_deadline: e.target.value })); savePartialUpdate({ application_deadline: e.target.value }) }} />
                    </div>
                    {/* Job Description first */}
                    <div className="p-3">
                      <div className="text-sm text-gray-300 mb-1">Job Description</div>
                      <textarea className="w-full min-h-[120px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={editingJob.job_description || ''} onChange={(e)=> setEditingJob((p:any)=> ({...(p||{}), job_description: e.target.value }))} onBlur={(e)=> savePartialUpdate({ jobDescription: e.currentTarget.value })} />
                    </div>
                    {/* Requirements */}
                    <div className="p-3">
                      <div className="text-sm text-gray-300 mb-1">Requirements</div>
                      <textarea className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={(editingJob.requirements || []).join('\n')} onChange={(e)=> setEditingJob((p:any)=> ({...(p||{}), requirements: e.target.value.split('\n')}))} onBlur={(e)=> savePartialUpdate({ requirements: e.currentTarget.value.split('\n') })} />
                    </div>
                    {/* Responsibilities */}
                    <div className="p-3">
                      <div className="text-sm text-gray-300 mb-1">Responsibilities</div>
                      <textarea className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={(editingJob.responsibilities || []).join('\n')} onChange={(e)=> setEditingJob((p:any)=> ({...(p||{}), responsibilities: e.target.value.split('\n')}))} onBlur={(e)=> savePartialUpdate({ responsibilities: e.currentTarget.value.split('\n') })} />
                    </div>
                    {/* Benefits */}
                    <div className="p-3">
                      <div className="text-sm text-gray-300 mb-1">Benefits</div>
                      <textarea className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={(editingJob.benefits || []).join('\n')} onChange={(e)=> setEditingJob((p:any)=> ({...(p||{}), benefits: e.target.value.split('\n')}))} onBlur={(e)=> savePartialUpdate({ benefits: e.currentTarget.value.split('\n') })} />
                    </div>
                    {/* Skills */}
                    <div className="p-3">
                      <div className="text-sm text-gray-300 mb-1">Skills</div>
                      <textarea className="w-full min-h-[80px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white" value={(editingJob.skills || []).join('\n')} onChange={(e)=> setEditingJob((p:any)=> ({...(p||{}), skills: e.target.value.split('\n')}))} onBlur={(e)=> savePartialUpdate({ skills: e.currentTarget.value.split('\n') })} />
                    </div>
                  </div>
                </div>

                {/* Right: activity */}
                <div className="border-l border-white/10 bg-black/30 p-6 hidden lg:flex lg:flex-col lg:max-h-[80vh]">
                  <div className="text-sm text-gray-300 font-semibold mb-3">Activity</div>
                  <div id="comments" className="flex-1 overflow-y-auto space-y-3 pr-1 job-modal-scroll">
                    {/* Comments will be loaded below */}
                    {(editingJob.__comments || []).map((c:any)=> (
                      <div key={c.id} className="text-sm text-white/80 bg-white/5 border border-white/10 rounded-md p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={c.user_avatar || '/vercel.svg'} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                          <div className="text-xs text-gray-300 font-medium">{c.user_name || 'User'}</div>
                          <div className="text-xs text-gray-500 ml-auto">{new Date(c.created_at).toLocaleString()}</div>
                        </div>
                        <div className="leading-relaxed">{c.comment}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <textarea id="new-comment" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white min-h-[60px]" placeholder="Write a comment..." />
                    <Button className="mt-2 w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700" onClick={async ()=>{
                      const el = document.getElementById('new-comment') as HTMLTextAreaElement | null
                      if (!el || !el.value.trim()) return
                      try {
                        const token = await getSessionToken()
                        const res = await fetch(`/api/admin/jobs/${editingJob.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ comment: el.value }) })
                        if (res.ok) {
                          const data = await res.json()
                          setEditingJob((p:any)=> ({...(p||{}), __comments: [data.comment, ...((p&&p.__comments)||[])]}))
                          el.value=''
                        }
                      } catch {}
                    }}>Send</Button>
                 </div>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>
       </div>
     </AdminLayout>
   )
} 

export default function Page() {
  return <JobsPage />
} 