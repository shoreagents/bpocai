'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { 
	Trophy, 
	Gamepad2, 
	ClipboardList,
	Users,
	Target,
	BarChart3,
	MoreHorizontal,
	Crown,
	Medal,
	ChevronLeft,
	ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import AdminLayout from '@/components/layout/AdminLayout'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

const GAME_LABELS: Record<string, string> = {
	'typing-hero': 'Typing Hero',
	'bpoc-cultural': 'BPOC Cultural',
	'ultimate': 'Ultimate',
	'disc-personality': 'DISC Personality',
}
function getGameName(id: string): string { return GAME_LABELS[id] || id }

export default function LeaderboardsPage() {
	const [category, setCategory] = useState<'game' | 'applicants' | 'engagement' | 'overall'>('overall')
	const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly')
	const [gameId, setGameId] = useState<string>('bpoc-cultural')
	const [rows, setRows] = useState<any[]>([])
	const [total, setTotal] = useState<number>(0)
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')

	const [openUserId, setOpenUserId] = useState<string | null>(null)
	const [openUserInfo, setOpenUserInfo] = useState<{ full_name?: string | null; avatar_url?: string | null } | null>(null)
	const [openUserResumeSlug, setOpenUserResumeSlug] = useState<string | null>(null)
	const [breakdown, setBreakdown] = useState<any | null>(null)
	const [loadingBreakdown, setLoadingBreakdown] = useState<boolean>(false)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

	const pageItems = useMemo<(number | string)[]>(() => {
		const items: Array<number | string> = []
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i += 1) items.push(i)
			return items
		}
		items.push(1)
		const start = Math.max(2, page - 1)
		const end = Math.min(totalPages - 1, page + 1)
		if (start > 2) items.push('...')
		for (let i = start; i <= end; i += 1) items.push(i)
		if (end < totalPages - 1) items.push('...')
		items.push(totalPages)
		return items
	}, [totalPages, page])

	const fetchRows = async () => {
		try {
			setLoading(true)
			setError('')
			const params = new URLSearchParams()
			params.set('category', category)
			if (category === 'game') { params.set('period', period); params.set('gameId', gameId) }
			params.set('limit', String(pageSize))
			params.set('offset', String((page - 1) * pageSize))
			const res = await fetch(`/api/leaderboards?${params.toString()}&source=tables`, { cache: 'no-store' })
			if (!res.ok) throw new Error('Failed to load')
			const data = await res.json()
			setRows(data.results || [])
			setTotal(data.total || 0)
		} catch (e: any) {
			setError(e?.message || 'Failed to load')
			setRows([])
			setTotal(0)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { fetchRows() }, [category, period, gameId, page, pageSize])

	const handleDelete = async (row: any) => {
		try {
			const body: any = { category, userId: row.userId }
			if (category === 'game') { body.period = period; body.gameId = gameId }
			const res = await fetch('/api/admin/leaderboards', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
			if (!res.ok) throw new Error('Delete failed')
			await fetchRows()
		} catch {
			// no-op
		}
	}

	const formatNumber = (n: any) => {
		const v = Number(n)
		if (!Number.isFinite(v)) return '-'
		return Math.round(v)
	}

	const openBreakdown = async (row: any) => {
		setOpenUserId(row.userId)
		setOpenUserInfo(row.user || null)
		setOpenUserResumeSlug(null)
		setLoadingBreakdown(true)
		setBreakdown(null)
		try {
			const [bRes, rRes] = await Promise.all([
				fetch(`/api/leaderboards/user/${row.userId}`, { cache: 'no-store' }),
				fetch(`/api/users/${row.userId}/resume`, { cache: 'no-store' })
			])
			const b = bRes.ok ? await bRes.json() : null
			const r = rRes.ok ? await rRes.json() : null
			setBreakdown(b)
			setOpenUserResumeSlug(r?.slug || null)
		} catch {
			setBreakdown(null)
		} finally {
			setLoadingBreakdown(false)
		}
	}

	const selectedRow = useMemo(() => rows.find((r: any) => r.userId === openUserId) || null, [rows, openUserId])

	const goToResume = async (e: React.MouseEvent, userId: string) => {
		e.stopPropagation()
		try {
			const res = await fetch(`/api/users/${userId}/resume`, { cache: 'no-store' })
			if (!res.ok) return
			const data = await res.json()
			if (data?.slug) window.open(`/${data.slug}`, '_blank')
		} catch {}
	}

	return (
		<AdminLayout title="Leaderboards" description="Moderate leaderboard data">
			<div className="space-y-6">
				<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="glass-card border-white/10">
						<CardHeader><CardTitle className="text-white">Category</CardTitle></CardHeader>
						<CardContent>
							<Select value={category} onValueChange={(v: any) => setCategory(v)}>
								<SelectTrigger className="w-full"><SelectValue placeholder="Category" /></SelectTrigger>
								<SelectContent>
									<SelectItem value="overall">Overall</SelectItem>
									<SelectItem value="game">Games</SelectItem>
									<SelectItem value="applicants">Applications</SelectItem>
									<SelectItem value="engagement">Engagement</SelectItem>
								</SelectContent>
							</Select>
						</CardContent>
					</Card>
					{category === 'game' && (
						<Card className="glass-card border-white/10">
							<CardHeader><CardTitle className="text-white">Period</CardTitle></CardHeader>
							<CardContent>
								<Select value={period} onValueChange={(v: any) => setPeriod(v)}>
									<SelectTrigger className="w-full"><SelectValue placeholder="Period" /></SelectTrigger>
									<SelectContent>
										<SelectItem value="weekly">Weekly</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
										<SelectItem value="all">All-time</SelectItem>
									</SelectContent>
								</Select>
							</CardContent>
						</Card>
					)}
					{category === 'game' && (
						<Card className="glass-card border-white/10">
							<CardHeader><CardTitle className="text-white">Game</CardTitle></CardHeader>
							<CardContent>
								<Select value={gameId} onValueChange={(v: any) => setGameId(v)}>
									<SelectTrigger className="w-full"><SelectValue placeholder="Game" /></SelectTrigger>
									<SelectContent>
										<SelectItem value="bpoc-cultural">BPOC Cultural</SelectItem>
										<SelectItem value="typing-hero">Typing Hero</SelectItem>
										<SelectItem value="ultimate">Ultimate</SelectItem>
										<SelectItem value="disc-personality">DISC Personality</SelectItem>
									</SelectContent>
								</Select>
							</CardContent>
						</Card>
					)}
				</motion.div>

				<Card className="glass-card border-white/10">
					<CardHeader>
						<CardTitle className="text-white">Results ({total})</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="text-gray-400 py-10 text-center">Loading…</div>
						) : error ? (
							<div className="text-red-400 py-10 text-center">{error}</div>
						) : rows.length === 0 ? (
							<div className="text-gray-400 py-10 text-center">No data</div>
						) : (
							<>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[80px]">Position</TableHead>
											<TableHead>User</TableHead>
											{category === 'game' && <TableHead className="text-right">Best</TableHead>}
											{category === 'game' && <TableHead className="text-right">Plays</TableHead>}
											{category === 'game' && <TableHead className="text-right">Last Played</TableHead>}
											{category !== 'game' && category !== 'overall' && <TableHead className="text-right">Score</TableHead>}
											{category === 'overall' && <TableHead className="text-right">Overall</TableHead>}
											{category === 'overall' && <TableHead className="text-right">Games</TableHead>}
											{category === 'overall' && <TableHead className="text-right">Applications</TableHead>}
											{category === 'overall' && <TableHead className="text-right">Engagement</TableHead>}
											<TableHead className="w-[60px] text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{rows.map((r: any) => (
											<TableRow key={r.userId} className="cursor-pointer" onClick={() => openBreakdown(r)}>
												<TableCell className="font-medium">#{r.rank || '-'}</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">
															{r.user?.avatar_url ? (
																<img src={r.user.avatar_url} alt={r.user?.full_name || r.userId} className="w-full h-full object-cover" />
															) : null}
														</div>
													<div className="min-w-0">
														<div className="truncate text-white">{r.user?.full_name || r.userId}</div>
													</div>
												</div>
											</TableCell>
											{category === 'game' && <TableCell className="text-right">{formatNumber(r.bestScore)}</TableCell>}
											{category === 'game' && <TableCell className="text-right">{formatNumber(r.plays)}</TableCell>}
											{category === 'game' && <TableCell className="text-right">{r.lastPlayed ? new Date(r.lastPlayed).toLocaleDateString() : '-'}</TableCell>}
											{category !== 'game' && category !== 'overall' && <TableCell className="text-right">{formatNumber(r.score)}</TableCell>}
											{category === 'overall' && <TableCell className="text-right">{formatNumber(r.score)}</TableCell>}
											{category === 'overall' && <TableCell className="text-right">{formatNumber(r.components?.game_norm)}</TableCell>}
											{category === 'overall' && <TableCell className="text-right">{formatNumber(r.components?.applicant_norm)}</TableCell>}
											{category === 'overall' && <TableCell className="text-right">{formatNumber(r.components?.engagement_norm)}</TableCell>}
											<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-8 w-8">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-white">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem onClick={() => handleDelete(r)} className="text-red-400 focus:text-red-400">
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
										))}
									</TableBody>
								</Table>
								{total > 0 && (
									<div className="flex items-center justify-end mt-6 gap-3">
										<Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50">
											<ChevronLeft className="w-4 h-4" />
										</Button>
										<div className="flex items-center gap-2">
											{pageItems.map((it, idx) => (
												typeof it === 'number' ? (
													<Button key={idx} variant={it === page ? 'secondary' : 'outline'} size="sm" onClick={() => setPage(it)} className={`h-8 px-3 ${it === page ? 'bg-white/10 text-white' : 'text-gray-300 border-white/20 hover:bg-white/10'}`}>
														{it}
													</Button>
												) : (
													<span key={idx} className="text-gray-400 px-2">…</span>
												)
											))}
										</div>
										<div className="text-gray-300 text-sm px-3 py-1 rounded bg-white/5 border border-white/10">Page {page} of {totalPages}</div>
										<Select value={String(pageSize)} onValueChange={(v: string) => { setPageSize(Number(v)); setPage(1) }}>
											<SelectTrigger className="w-[120px] h-8">
												<SelectValue placeholder="Page size" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="5">5 / page</SelectItem>
												<SelectItem value="10">10 / page</SelectItem>
												<SelectItem value="15">15 / page</SelectItem>
												<SelectItem value="20">20 / page</SelectItem>
												<SelectItem value="25">25 / page</SelectItem>
											</SelectContent>
										</Select>
										<Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50">
											<ChevronRight className="w-4 h-4" />
										</Button>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			</div>

			<Dialog open={!!openUserId} onOpenChange={(o) => { if (!o) { setOpenUserId(null); setBreakdown(null) } }}>
				<DialogContent className="bg-gray-900 border-gray-700 text-white w-[98vw] max-w-none sm:max-w-[1600px] md:max-w-[1600px] lg:max-w-[1700px] xl:max-w-[1800px]">
					<DialogHeader>
						<DialogTitle className="text-xl flex items-center gap-3">
							<span>🎯 User Score Breakdown</span>
							{selectedRow?.rank && (
								<Badge className="bg-cyan-500/20 border-cyan-500/30 text-cyan-300">Rank #{selectedRow.rank}</Badge>
							)}
						</DialogTitle>
					</DialogHeader>
					{/* User quick info */}
					{selectedRow && (
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-cyan-500/20">
								{selectedRow.user?.avatar_url ? (
									<img src={selectedRow.user.avatar_url} alt={selectedRow.user?.full_name || selectedRow.userId} className="w-full h-full object-cover" />
								) : null}
							</div>
							<button
								onClick={(e) => goToResume(e as any, selectedRow.userId)}
								className="text-cyan-300 hover:underline truncate"
								title="Open resume"
							>
								{selectedRow.user?.full_name || selectedRow.userId}
							</button>
							<Badge className="bg-amber-500/20 border-amber-500/30 text-amber-300">Hire‑ready</Badge>
						</div>
					)}
					{loadingBreakdown && (
						<div className="text-gray-400">Loading...</div>
					)}
					{!loadingBreakdown && breakdown &&
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Games */}
								<div className="bg-white/5 rounded p-4 md:col-span-1">
									<div className="font-semibold mb-2">Games 🎮</div>
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow className="hover:bg-transparent">
													<TableHead className="text-gray-300">Game</TableHead>
													<TableHead className="text-right text-gray-300">Best</TableHead>
													<TableHead className="text-right text-gray-300">Plays</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{(breakdown.games || []).map((g: any, idx: number) => (
													<TableRow key={`${g.game_id}-${idx}`} className="hover:bg-transparent">
														<TableCell>{getGameName(g.game_id)}</TableCell>
														<TableCell className="text-right">{g.best_score}</TableCell>
														<TableCell className="text-right">{g.plays}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</div>

								{/* Applications & Engagement */}
								<div className="bg-white/5 rounded p-4 md:col-span-2">
									<div className="font-semibold mb-2">Applications 📄 & Engagement ✨</div>
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										<div>
											<div className="mb-1 font-medium">Applications (total: {breakdown.applications?.total ?? 0})</div>
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow className="hover:bg-transparent">
															<TableHead className="text-gray-300">Job ID</TableHead>
															<TableHead className="text-gray-300">Status</TableHead>
															<TableHead className="text-right text-gray-300">Points</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{(breakdown.applications?.items || []).map((i: any, idx: number) => (
															<TableRow key={`${i.job_id}-${idx}`} className="hover:bg-transparent">
																<TableCell>{i.job_id}</TableCell>
																<TableCell>{i.status}</TableCell>
																<TableCell className="text-right">{i.points}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										</div>
										<div>
											<div className="mb-1 font-medium">Engagement (total: {breakdown.engagement?.total ?? 0})</div>
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow className="hover:bg-transparent">
															<TableHead className="text-gray-300">Action</TableHead>
															<TableHead className="text-right text-gray-300">Points</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{(breakdown.engagement?.items || []).map((i: any, idx: number) => (
															<TableRow key={`${i.label}-${idx}`} className="hover:bg-transparent">
																<TableCell>{i.label}</TableCell>
																<TableCell className="text-right">{i.points}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										</div>
									</div>
								</div>
								{/* Totals row under tables */}
								<div className="flex flex-wrap items-center gap-3 text-sm mt-4">
									<div className="px-3 py-2 rounded bg-white/5 border border-white/10">
										<span className="text-gray-400 mr-2">🎮 Games</span>
										<span className="text-white font-semibold">{(breakdown.games || []).reduce((sum: number, g: any) => sum + (g.best_score || 0), 0)}</span>
									</div>
									<div className="px-3 py-2 rounded bg-white/5 border border-white/10">
										<span className="text-gray-400 mr-2">🏆 Overall</span>
										<span className="text-white font-semibold">{breakdown.overall?.overall_score ?? 0}</span>
									</div>
									<div className="px-3 py-2 rounded bg-white/5 border border-white/10">
										<span className="text-gray-400 mr-2">📄 Applications</span>
										<span className="text-white font-semibold">{breakdown.applications?.total ?? 0}</span>
									</div>
									<div className="px-3 py-2 rounded bg-white/5 border border-white/10">
										<span className="text-gray-400 mr-2">✨ Engagement</span>
										<span className="text-white font-semibold">{breakdown.engagement?.total ?? 0}</span>
									</div>
								</div>
							</div>
						</div>
					}
					</DialogContent>
				</Dialog>
		</AdminLayout>
	)
}