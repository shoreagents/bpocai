'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/components/layout/AdminLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RefreshCw, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'

interface WorkStatusRow {
  userId: string
  fullName: string | null
  email: string | null
  avatarUrl: string | null
  currentEmployer: string | null
  currentPosition: string | null
  currentSalary: number | null
  noticePeriodDays: number | null
  salaryGoal: number | null
  currentMood: string | null
  workStatus: string | null
  employmentType: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminWorkStatusesPage() {
  const { session } = useAuth()
  const [rows, setRows] = useState<WorkStatusRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [mood, setMood] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [limit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<WorkStatusRow | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      if (q) params.set('q', q)
      if (mood) params.set('mood', mood)
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/user-work-status?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setRows(data.results || [])
      setTotal(data.total || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load work statuses')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset])

  const moodBadge = (m: string | null) => {
    if (!m) return <Badge className="bg-white/10 text-white border-white/20">—</Badge>
    const map: Record<string, string> = {
      happy: 'bg-green-500/20 text-green-400 border-green-500/30',
      satisfied: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      frustrated: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      stressed: 'bg-red-500/20 text-red-400 border-red-500/30',
      excited: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      bored: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    }
    const cls = map[m] || 'bg-white/10 text-white border-white/20'
    return <Badge className={cls}>{m}</Badge>
  }

  const statusBadge = (s: string | null) => {
    if (!s) return <Badge className="bg-white/10 text-white border-white/20">—</Badge>
    const map: Record<string, string> = {
      employed: 'bg-green-500/20 text-green-400 border-green-500/30',
      unemployed: 'bg-red-500/20 text-red-400 border-red-500/30',
      freelancer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'part-time': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'on-leave': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      retired: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      student: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'career-break': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      transitioning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'remote-worker': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    }
    const cls = map[s] || 'bg-white/10 text-white border-white/20'
    return <Badge className={cls}>{s}</Badge>
  }

  const pageInfo = useMemo(() => {
    const start = offset + 1
    const end = Math.min(offset + limit, total)
    return { start, end }
  }, [offset, limit, total])

  const formatOptionLabel = (value: string) => {
    // Preserve hyphens but capitalize each segment
    return value
      .split('-')
      .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase())
      .join('-')
  }

  const fetchProfile = async (userId: string) => {
    try {
      setProfileLoading(true)
      setProfile(null)
      const res = await fetch(`/api/user/profile?userId=${encodeURIComponent(userId)}` , {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        cache: 'no-store'
      })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setProfile(data.user || null)
    } catch (e) {
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <AdminLayout title="Work Statuses" description="Track users' current employment status and availability">
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
              <Select value={mood} onValueChange={(v) => setMood(v)}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Mood" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {['happy','satisfied','neutral','frustrated','stressed','excited','bored'].map((m) => (
                    <SelectItem key={m} value={m}>{formatOptionLabel(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Work status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {[
                    'employed','unemployed','freelancer','part-time','on-leave','retired','student','career-break','transitioning','remote-worker'
                  ].map((s) => (
                    <SelectItem key={s} value={s}>{formatOptionLabel(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => { setOffset(0); fetchData() }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">User Work Statuses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">{error}</div>
            ) : (
              <div className="rounded-lg border border-white/10 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white">User</TableHead>
                      <TableHead className="text-white">Employer / Position</TableHead>
                      <TableHead className="text-white">Salary</TableHead>
                      <TableHead className="text-white">Notice Period</TableHead>
                      <TableHead className="text-white">Goal</TableHead>
                      <TableHead className="text-white">Mood</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Type</TableHead>
                      <TableHead className="text-white">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.userId} className="border-white/10 hover:bg-white/5">
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={r.avatarUrl || undefined} alt={r.fullName || r.userId} />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs">
                                {(r.fullName || '?').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white font-medium">{r.fullName || r.userId}</div>
                              <div className="text-gray-400 text-xs">{r.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">
                          <div className="min-w-[220px]">
                            <div className="text-white text-sm">{r.currentEmployer || '—'}</div>
                            <div className="text-gray-400 text-xs">{r.currentPosition || '—'}</div>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">
                          <div className="text-white text-sm">{r.currentSalary != null ? `₱${Number(r.currentSalary).toLocaleString()}` : '—'}</div>
                        </TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">
                          <div className="text-white text-sm">{r.noticePeriodDays != null ? `${r.noticePeriodDays} days` : '—'}</div>
                        </TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">
                          <div className="text-white text-sm">{r.salaryGoal != null ? `₱${Number(r.salaryGoal).toLocaleString()}` : '—'}</div>
                        </TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">{moodBadge(r.currentMood)}</TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">{statusBadge(r.workStatus)}</TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">
                          <Badge className="bg-white/10 text-white border-white/20">{r.employmentType || '—'}</Badge>
                        </TableCell>
                        <TableCell onClick={() => { setSelected(r); fetchProfile(r.userId) }} className="cursor-pointer">
                          <div className="text-gray-400 text-xs">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—'}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
              <div>
                Showing {total ? pageInfo.start : 0}–{total ? pageInfo.end : 0} of {total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setProfile(null) } }}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selected?.avatarUrl || undefined} alt={selected?.fullName || selected?.userId || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs">
                    {(selected?.fullName || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {selected?.fullName || selected?.userId}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-xs">Email</div>
                  <div className="text-white text-sm">{profile?.email || selected?.email || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Location</div>
                  <div className="text-white text-sm">{profile?.location || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Phone</div>
                  <div className="text-white text-sm">{profile?.phone || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Position</div>
                  <div className="text-white text-sm">{profile?.position || '—'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-400 text-xs">Bio</div>
                  <div className="text-white text-sm whitespace-pre-wrap">{profile?.bio || '—'}</div>
                </div>
              </div>
              {/* Work Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-xs">Current Employer</div>
                  <div className="text-white text-sm">{selected?.currentEmployer || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Current Position</div>
                  <div className="text-white text-sm">{selected?.currentPosition || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Current Salary</div>
                  <div className="text-white text-sm">{selected?.currentSalary != null ? `₱${Number(selected.currentSalary).toLocaleString()}` : '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Salary Goal</div>
                  <div className="text-white text-sm">{selected?.salaryGoal != null ? `₱${Number(selected.salaryGoal).toLocaleString()}` : '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Notice Period</div>
                  <div className="text-white text-sm">{selected?.noticePeriodDays != null ? `${selected.noticePeriodDays} days` : '—'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Mood</div>
                  <div className="mt-1">{moodBadge(selected?.currentMood || null)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Work Status</div>
                  <div className="mt-1">{statusBadge(selected?.workStatus || null)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Employment Type</div>
                  <div className="mt-1"><Badge className="bg-white/10 text-white border-white/20">{selected?.employmentType || '—'}</Badge></div>
                </div>
              </div>
              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-xs">Profile Created</div>
                  <div className="text-white text-sm">{profileLoading ? 'Loading…' : (profile?.created_at ? new Date(profile.created_at).toLocaleString() : '—')}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Profile Updated</div>
                  <div className="text-white text-sm">{profileLoading ? 'Loading…' : (profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : '—')}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Work Status Updated</div>
                  <div className="text-white text-sm">{selected?.updatedAt ? new Date(selected.updatedAt).toLocaleString() : '—'}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}


