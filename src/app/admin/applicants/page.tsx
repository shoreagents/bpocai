"use client"

import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

type JobSummary = {
  id: string
  company: string
  title: string
  applicants: number
  priority: 'low' | 'medium' | 'high'
  application_deadline?: string | null
  experience_level?: string | null
  work_arrangement?: string | null
  industry?: string | null
  department?: string | null
}

type Application = {
  id: string
  user_id: string
  job_id: string
  resume_slug: string
  status: string
  created_at: string
  user?: { email?: string, full_name?: string }
}

export default function Page() {
  const [jobs, setJobs] = useState<JobSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortBy, setSortBy] = useState<'applicants_desc' | 'deadline_asc' | 'deadline_desc' | 'priority_desc' | 'priority_asc'>('applicants_desc')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError(null)
        // Use public active jobs and filter by applicants > 0
        const res = await fetch('/api/jobs/active', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load jobs')
        const data = await res.json()
        const list: JobSummary[] = (data.jobs || [])
          .filter((j: any) => (j.applicants ?? 0) > 0)
          .map((j: any) => ({ 
            id: String(j.id), 
            company: j.company, 
            title: j.title, 
            applicants: Number(j.applicants || 0), 
            priority: (j.priority || 'medium'),
            application_deadline: j.application_deadline || null,
            experience_level: j.experience_level || null,
            work_arrangement: j.work_arrangement || null,
            industry: j.industry || null,
            department: j.department || null
          }))
        setJobs(list)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const openJob = (job: JobSummary) => {
    const slug = `${slugify(job.company)}-${slugify(job.title)}-${job.id}`
    router.push(`/admin/applicants/${encodeURIComponent(slug)}`)
  }

  const visibleJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = jobs.filter(j => {
      const matchesQuery = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
      const matchesPriority = priorityFilter === 'all' || j.priority === priorityFilter
      return matchesQuery && matchesPriority
    })
    const toNum = (d?: string | null) => (d ? new Date(d).getTime() : Number.POSITIVE_INFINITY)
    list = list.sort((a, b) => {
      switch (sortBy) {
        case 'applicants_desc':
          return (b.applicants || 0) - (a.applicants || 0)
        case 'deadline_asc':
          return toNum(a.application_deadline) - toNum(b.application_deadline)
        case 'deadline_desc':
          return toNum(b.application_deadline) - toNum(a.application_deadline)
        case 'priority_desc': {
          const rank = { high: 3, medium: 2, low: 1 } as const
          return (rank[b.priority] - rank[a.priority])
        }
        case 'priority_asc': {
          const rank = { high: 3, medium: 2, low: 1 } as const
          return (rank[a.priority] - rank[b.priority])
        }
        default:
          return 0
      }
    })
    return list
  }, [jobs, search, priorityFilter, sortBy])

  return (
    <AdminLayout title="Applicants" description="Manage and review applicants">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Search by job title or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="w-full bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 text-sm [&>option]:bg-gray-900 [&>option]:text-white"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                className="w-full bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 text-sm [&>option]:bg-gray-900 [&>option]:text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="applicants_desc">Most applicants</option>
                <option value="deadline_asc">Deadline (soonest)</option>
                <option value="deadline_desc">Deadline (latest)</option>
                <option value="priority_desc">Priority (high→low)</option>
                <option value="priority_asc">Priority (low→high)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-sm text-gray-400">Loading jobs…</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleJobs.map(job => (
              <Card key={job.id} className="cursor-pointer" onClick={() => openJob(job)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{job.applicants} applicants</Badge>
                    <Badge variant="outline" className="capitalize">{job.priority}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {job.application_deadline && (
                      <div>Deadline: <span className="text-white">{new Date(job.application_deadline).toLocaleDateString()}</span></div>
                    )}
                    {job.experience_level && (
                      <div>Level: <span className="capitalize text-white">{job.experience_level}</span></div>
                    )}
                    {job.work_arrangement && (
                      <div>Arrangement: <span className="capitalize text-white">{job.work_arrangement}</span></div>
                    )}
                    {job.industry && (
                      <div>Industry: <span className="text-white">{job.industry}</span></div>
                    )}
                    {job.department && (
                      <div>Department: <span className="text-white">{job.department}</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Clicking a job navigates to /admin/applicants/[id] for details */}
      </div>
    </AdminLayout>
  )
}


