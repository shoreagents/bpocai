'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSessionToken } from '@/lib/auth-helpers'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

function extractIdFromSlug(slug: string): string | null {
  // Expect format: some-slug-{id}
  const parts = slug.split('-')
  const last = parts[parts.length - 1]
  return /^[0-9]+$/.test(last) ? last : null
}

export default function ApplicantsJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params.slug || '')
  const id = extractIdFromSlug(slug)

  const [jobHeader, setJobHeader] = useState<{ title: string; company: string; applicants: number } | null>(null)
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'screening' | 'in-review' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected' | 'withdrawn'>('all')
	const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'status_asc' | 'status_desc'>('newest')
  const [viewSlug, setViewSlug] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      if (!id) { setError('Invalid job'); return }
      try {
        setLoading(true)
        setError(null)
        const jobRes = await fetch(`/api/jobs/active/${id}`, { cache: 'no-store' })
        if (jobRes.ok) {
          const jd = await jobRes.json()
          setJobHeader({ title: jd.job?.title || 'Job', company: jd.job?.company || '', applicants: jd.job?.applicants ?? 0 })
        }
        const token = await getSessionToken()
        const res = await fetch(`/api/admin/applicants?jobId=${id}`, { cache: 'no-store', headers: token ? { Authorization: `Bearer ${token}` } : {} })
        if (res.ok) {
          const data = await res.json()
          setApps(data.applications || [])
        }
      } catch (e) {
        setError('Failed to load applicants')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

	const visibleApps = (() => {
		const q = search.trim().toLowerCase()
		let list = apps.filter((a: any) => {
			const name = (a.user?.full_name || a.user?.email || '').toLowerCase()
			const matchesQuery = !q || name.includes(q)
			const matchesStatus = statusFilter === 'all' || a.status === statusFilter
			return matchesQuery && matchesStatus
		})
		list = list.sort((a: any, b: any) => {
			switch (sortBy) {
				case 'newest':
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				case 'oldest':
					return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
				case 'name_asc':
					return String(a.user?.full_name || a.user?.email || '').localeCompare(String(b.user?.full_name || b.user?.email || ''))
				case 'name_desc':
					return String(b.user?.full_name || b.user?.email || '').localeCompare(String(a.user?.full_name || a.user?.email || ''))
				case 'status_asc':
					return String(a.status).localeCompare(String(b.status))
				case 'status_desc':
					return String(b.status).localeCompare(String(a.status))
				default:
					return 0
			}
		})
		return list
	})()

  return (
    <AdminLayout 
      title={jobHeader ? `${jobHeader.title}` : 'Applicants'} 
      description={jobHeader ? `${jobHeader.company} • ${jobHeader.applicants} applicants` : ''}
    >
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
		{error && <div className="text-sm text-red-400">{error}</div>}
		{/* Filters */}
		<Card>
			<CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
				<Input
					placeholder="Search applicant name or email"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<div className="flex gap-2">
					<select
						className="w-full bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 text-sm [&>option]:bg-gray-900 [&>option]:text-white"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as any)}
					>
						<option value="all">All statuses</option>
						<option value="submitted">Submitted</option>
						<option value="screening">Screening</option>
						<option value="in-review">In review</option>
						<option value="interview">Interview</option>
						<option value="assessment">Assessment</option>
						<option value="offer">Offer</option>
						<option value="hired">Hired</option>
						<option value="rejected">Rejected</option>
						<option value="withdrawn">Withdrawn</option>
					</select>
					<select
						className="w-full bg-white/10 text-white border border-white/20 rounded-md px-3 py-2 text-sm [&>option]:bg-gray-900 [&>option]:text-white"
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as any)}
					>
						<option value="newest">Newest</option>
						<option value="oldest">Oldest</option>
						<option value="name_asc">Name (A→Z)</option>
						<option value="name_desc">Name (Z→A)</option>
						<option value="status_asc">Status (A→Z)</option>
						<option value="status_desc">Status (Z→A)</option>
					</select>
				</div>
			</CardContent>
		</Card>
        {loading ? (
          <div className="text-sm text-gray-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleApps.map((a: any) => (
              <Card key={a.id} className="hover:border-white/20 transition-colors">
                <CardContent className="p-4 flex items-start gap-4">
                  <img
                    src={a.user?.avatar_url || '/vercel.svg'}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-white break-words">{a.user?.full_name || a.user?.email || 'Applicant'}</div>
                      <Badge className={`capitalize whitespace-nowrap ${statusClass(a.status)}`}>{a.status || 'submitted'}</Badge>
                    </div>
                    <div className="text-xs text-gray-300 break-words">{a.user?.position || '—'}{a.user?.location ? ` • ${a.user.location}` : ''}</div>
                    <div className="text-xs text-gray-400 break-words">Resume: <span className="text-gray-200">{a.resume_title || '—'}</span></div>
                    <div className="text-xs text-gray-500">Applied {new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <Button variant="outline" onClick={() => setViewSlug(a.resume_slug)}>View</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Dialog open={!!viewSlug} onOpenChange={(open)=> { if (!open) setViewSlug(null) }}>
          <DialogContent className="w-[96vw] sm:max-w-6xl">
            <DialogHeader>
              <DialogTitle>Resume Preview</DialogTitle>
            </DialogHeader>
            <div className="h-[75vh] w-full">
              {viewSlug && (
                <iframe src={`/${viewSlug}`} className="w-full h-full rounded-md border border-white/10" title="Resume Preview" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

function statusClass(status: string): string {
  const s = String(status || '').toLowerCase()
  if (s === 'hired') return 'bg-green-500/20 text-green-300 border border-green-500/30'
  if (s === 'rejected') return 'bg-red-500/20 text-red-300 border border-red-500/30'
  if (s === 'offer') return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
  if (s === 'interview') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
  if (s === 'assessment') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
  if (s === 'screening') return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
  if (s === 'in-review') return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
  if (s === 'withdrawn') return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
  return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
}
