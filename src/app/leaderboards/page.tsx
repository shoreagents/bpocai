'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { 
  ArrowLeft,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Crown,
  Medal,
  Sparkles,
  Stars,
  Briefcase,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const GAME_LABELS: Record<string, string> = {
  'typing-hero': 'Typing Hero',
  'bpoc-cultural': 'BPOC Cultural',
  'ultimate': 'Ultimate',
  'disc-personality': 'DISC Personality',
}

const GAME_EMOJI: Record<string, string> = {
  'typing-hero': '⌨️',
  'bpoc-cultural': '🌍',
  'ultimate': '🧭',
  'disc-personality': '🧠',
}

function getGameName(id: string): string {
  return GAME_LABELS[id] || id
}

function getGameEmoji(id: string): string {
  return GAME_EMOJI[id] || '🎮'
}

function getCategoryEmoji(c: string) {
  if (c === 'overall') return '🏆'
  if (c === 'game') return '🎮'
  if (c === 'applicants') return '📄'
  if (c === 'engagement') return '✨'
  return '⭐'
}

function getPeriodLabel(p: string) {
  if (p === 'weekly') return 'Weekly'
  if (p === 'monthly') return 'Monthly'
  return 'All‑time'
}

type Category = 'overall' | 'game' | 'applicants' | 'engagement'
type Period = 'weekly' | 'monthly' | 'all'

interface UserInfo { full_name: string | null; avatar_url: string | null }

interface GameResult { rank: number; userId: string; bestScore: number; plays: number; lastPlayed: string; user: UserInfo | null }
interface SimpleResult { rank: number; userId: string; score: number; user: UserInfo | null }
interface OverallResult extends SimpleResult { components?: { game_norm: number; applicant_norm: number; engagement_norm: number } }

export default function LeaderboardsPage() {
	const router = useRouter()
	const [category, setCategory] = useState<Category>('overall')
	const [period, setPeriod] = useState<Period>('weekly')
	const [gameId, setGameId] = useState<string>('bpoc-cultural')
	const [page, setPage] = useState<number>(1)
	const [pageSize, setPageSize] = useState<number>(10)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')
	const [total, setTotal] = useState<number>(0)
	const [results, setResults] = useState<Array<GameResult | SimpleResult | OverallResult>>([])
	const [openUserId, setOpenUserId] = useState<string | null>(null)
	const [userBreakdown, setUserBreakdown] = useState<any | null>(null)
	const [userResumeSlug, setUserResumeSlug] = useState<string | null>(null)
	const [loadingBreakdown, setLoadingBreakdown] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [refreshNonce, setRefreshNonce] = useState(0)

	const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize])
	const totalPages = Math.max(1, Math.ceil(total / pageSize))

	const pageItems = useMemo(() => {
		const items: (number | 'ellipsis')[] = []
		const maxToShow = 7
		if (totalPages <= maxToShow) {
			for (let i = 1; i <= totalPages; i++) items.push(i)
			return items
		}
		const add = (n: number) => { if (!items.includes(n)) items.push(n) }
		add(1)
		if (page > 3) items.push('ellipsis')
		for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i)
		if (page < totalPages - 2) items.push('ellipsis')
		add(totalPages)
		return items
	}, [page, totalPages])


	useEffect(() => {

		const fetchData = async () => {
			try {
				setLoading(true)
				setError('')
				const params = new URLSearchParams()
				params.set('category', category)
				params.set('limit', String(pageSize))
				params.set('offset', String(offset))
				if (category === 'game') {
					params.set('period', period)
					params.set('gameId', gameId)
				}
				params.set('source', 'live')
				const res = await fetch(`/api/leaderboards?${params.toString()}`, { cache: 'no-store' })
				if (!res.ok) throw new Error(`Failed: ${res.status}`)
				const data = await res.json()
				setTotal(data.total || 0)
				setResults(data.results || [])
			} catch (e: any) {
				setError(e?.message || 'Failed to load leaderboards')
				setTotal(0)
				setResults([])
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [category, period, gameId, page, pageSize, offset, refreshNonce])

	useEffect(() => { setPage(1) }, [category, period, gameId])

	useEffect(() => {
		const load = async () => {
			if (!openUserId) return
			try {
				setLoadingBreakdown(true)
				const [bRes, rRes] = await Promise.all([
					fetch(`/api/leaderboards/user/${openUserId}?source=live`, { cache: 'no-store' }),
					fetch(`/api/users/${openUserId}/resume`, { cache: 'no-store' })
				])
				const b = bRes.ok ? await bRes.json() : null
				const r = rRes.ok ? await rRes.json() : null
				setUserBreakdown(b)
				setUserResumeSlug(r?.slug || null)
			} finally {
				setLoadingBreakdown(false)
			}
		}
		load()
	}, [openUserId, refreshNonce])

	const openUserModal = (userId: string) => setOpenUserId(userId)
	const closeUserModal = () => { setOpenUserId(null); setUserBreakdown(null); setUserResumeSlug(null) }

	const goToResume = async (e: React.MouseEvent, userId: string) => {
		e.stopPropagation()
		try {
			const res = await fetch(`/api/users/${userId}/resume`, { cache: 'no-store' })
			if (!res.ok) return
			const data = await res.json()
			if (data?.slug) router.push(`/${data.slug}`)
		} catch {}
	}

	const refreshLeaderboards = async () => {
		try {
			setRefreshing(true)
			// Recompute cached tables so other views (like breakdown norms) can be fresh
			await fetch('/api/leaderboards/recompute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ periods: ['weekly','monthly','all'], games: ['typing-hero','disc-personality','ultimate','bpoc-cultural'] })
			})
			// Trigger main list and modal re-fetch
			setRefreshNonce(n => n + 1)
			if (openUserId) {
				try {
					const bRes = await fetch(`/api/leaderboards/user/${openUserId}?source=live`, { cache: 'no-store' })
					if (bRes.ok) setUserBreakdown(await bRes.json())
				} catch {}
			}
		} finally {
			setRefreshing(false)
		}
	}

	const RankBadge = ({ rank }: { rank: number }) => {
		if (rank === 1) return (
			<div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
				<Crown className="w-6 h-6 text-white" />
			</div>
		)
		if (rank === 2) return (
			<div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/20">
				<Medal className="w-6 h-6 text-white" />
			</div>
		)
		if (rank === 3) return (
			<div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
				<Medal className="w-6 h-6 text-white" />
			</div>
		)
		return (
			<div className="w-12 h-12 rounded-full bg-white/5 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-sm font-bold">
				#{rank}
			</div>
		)
	}

	const Bar = ({ value, color }: { value: number; color: string }) => (
		<div className="h-2 w-full bg-white/10 rounded overflow-hidden">
			<div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, Math.round(value)))}%` }} />
		</div>
	)

	// Hide zero-value rows per category
	const filteredResults = useMemo(() => {
		if (!results || results.length === 0) return []
		if (category === 'game') {
			return (results as GameResult[]).filter(r => (r?.bestScore ?? 0) > 0)
		}
		if (category === 'overall' || category === 'applicants' || category === 'engagement') {
			return (results as SimpleResult[]).filter(r => (r?.score ?? 0) > 0)
		}
		return results
	}, [results, category])

	// Selected user for modal header
	const selectedUser = useMemo(() => {
		return (filteredResults as any[]).find((r: any) => r.userId === openUserId) || null
	}, [filteredResults, openUserId])

	const renderRankCell = (rank: number) => (
		<div className="flex items-center justify-center">
			<RankBadge rank={rank} />
		</div>
	)

	const renderUserCell = (row: any) => (
		<div className="flex items-center gap-3 min-w-0">
			<div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center ring-2 ring-cyan-500/20">
				{row.user?.avatar_url ? (
					<img src={row.user.avatar_url} alt={row.user?.full_name || row.userId} className="w-full h-full object-cover" />
				) : (
					<span className="text-gray-400 text-xs">N/A</span>
				)}
			</div>
			<button onClick={(e) => goToResume(e, row.userId)} className="text-left truncate text-cyan-300 hover:underline">
				{row.user?.full_name || row.userId}
			</button>
			{row.rank <= 3 && <Badge className="bg-cyan-500/20 border-cyan-400/30 text-cyan-300">Top {row.rank}</Badge>}
		</div>
	)

	const renderRow = (row: any, index: number) => {
		const rank = row.rank
		const name = row.user?.full_name || row.userId
		const avatar = row.user?.avatar_url || ''
  return (
			<motion.div key={`${row.userId}-${rank}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * index }}>
				<Card className="glass-card border-white/10 hover:border-cyan-400/30 transition hover:translate-x-0.5 cursor-pointer" onClick={() => openUserModal(row.userId)}>
					<CardContent className="p-5">
						<div className="flex items-center gap-5">
							<RankBadge rank={rank} />
							<div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden flex items-center justify-center ring-2 ring-cyan-500/20">
								{avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-sm">N/A</span>}
      </div>
							<div className="flex-1 min-w-0">
								<div className="text-white font-semibold truncate flex items-center gap-2">
									<a
										href={userResumeSlug ? `/${userResumeSlug}` : '#'}
										onClick={(e) => { e.stopPropagation(); if (!userResumeSlug) { e.preventDefault() } }}
										className={`hover:underline ${userResumeSlug ? 'text-cyan-300' : 'text-white/80 cursor-not-allowed'}`}
									>
										{name}
									</a>
									{rank <= 3 && <Badge className="bg-cyan-500/20 border-cyan-400/30 text-cyan-300">Top {rank}</Badge>}
								</div>
								<div className="text-xs text-gray-400 truncate">
									{category === 'game' && `Best: ${row.bestScore} • Plays: ${row.plays}`}
									{category === 'applicants' && `Score: ${row.score}`}
									{category === 'engagement' && `Score: ${row.score}`}
									{category === 'overall' && `Overall: ${row.score}`}
								</div>
								{/* Breakdown */}
								{category === 'overall' && (
									<div className="mt-2 space-y-2">
										<div className="flex items-center gap-2 text-[11px] text-gray-300">
											<span className="w-20">Games</span>
											<Bar value={row.components?.game_norm ?? 0} color="bg-cyan-500" />
											<span className="w-10 text-right">{Math.round(row.components?.game_norm ?? 0)}</span>
										</div>
										<div className="flex items-center gap-2 text-[11px] text-gray-300">
											<span className="w-20">Applications</span>
											<Bar value={row.components?.applicant_norm ?? 0} color="bg-purple-500" />
											<span className="w-10 text-right">{Math.round(row.components?.applicant_norm ?? 0)}</span>
                </div>
										<div className="flex items-center gap-2 text-[11px] text-gray-300">
											<span className="w-20">Engagement</span>
											<Bar value={row.components?.engagement_norm ?? 0} color="bg-amber-500" />
											<span className="w-10 text-right">{Math.round(row.components?.engagement_norm ?? 0)}</span>
              </div>
            </div>
								)}
								{category === 'game' && (
									<div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
										<Badge variant="secondary" className="bg-white/10 border-white/20 text-white">Best {row.bestScore}</Badge>
										<Badge variant="secondary" className="bg-white/10 border-white/20 text-white">Plays {row.plays}</Badge>
										{row.lastPlayed && <span className="text-gray-400">Last played {new Date(row.lastPlayed).toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>
                  </div>
                </CardContent>
              </Card>
          </motion.div>
		)
	}

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
       <Header />
       <div className="pt-16 relative z-10">
         <div className="container max-w-7xl mx-auto px-4 py-8">
                       {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Leaderboards
                  </h1>
                  <p className="text-lg text-gray-300">
                    Compete, improve, and rise to the top of our rankings
                  </p>
                </div>

                                 </div>
             </div>

          {/* Simple intro sentence */}
          <div className="mb-4 text-sm text-gray-300">
            Here are our top candidates — users ahead toward getting hired.
            </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="w-40 bg-white/10 border border-white/20 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white border-gray-700">
                    <SelectItem value="overall">Overall</SelectItem>
                    <SelectItem value="game">Games</SelectItem>
                    <SelectItem value="applicants">Applications</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>

                {category === 'game' && (
                  <>
                    <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                      <SelectTrigger className="w-32 bg-white/10 border border-white/20 text-white">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white border-gray-700">
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="all">All-time</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={gameId} onValueChange={(v) => setGameId(v)}>
                      <SelectTrigger className="w-52 bg-white/10 border border-white/20 text-white">
                        <SelectValue placeholder="Game" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 text-white border-gray-700">
                        <SelectItem value="bpoc-cultural">BPOC Cultural</SelectItem>
                        <SelectItem value="typing-hero">Typing Hero</SelectItem>
                        <SelectItem value="ultimate">Ultimate</SelectItem>
                        <SelectItem value="disc-personality">DISC Personality</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Button onClick={refreshLeaderboards} disabled={refreshing} className="ml-auto bg-white/10 border border-white/20 hover:bg-white/20 text-white">
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing…' : 'Refresh'}
                </Button>
              </div>



              {/* Table container (table itself unchanged) */}
              <Card className="glass-card border-white/10 mb-4 flex-1 min-h-0">
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[80px] text-gray-300">Rank</TableHead>
                        <TableHead className="text-gray-300">User</TableHead>
                        {category === 'overall' && (<>
                          <TableHead className="text-right text-gray-300">Overall</TableHead>
                          <TableHead className="text-right text-gray-300">Games</TableHead>
                          <TableHead className="text-right text-gray-300">Applications</TableHead>
                          <TableHead className="text-right text-gray-300">Engagement</TableHead>
                        </>)}
                        {category === 'game' && (<>
                          <TableHead className="text-right text-gray-300">Best</TableHead>
                          <TableHead className="text-right text-gray-300">Plays</TableHead>
                          <TableHead className="text-right text-gray-300">Last Played</TableHead>
                        </>)}
                        {category === 'applicants' && (
                          <TableHead className="text-right text-gray-300">Applications</TableHead>
                        )}
                        {category === 'engagement' && (
                          <TableHead className="text-right text-gray-300">Engagement</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && (
                        <>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                              <TableCell colSpan={7}>
                                <div className="animate-pulse py-3">
                                  <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                                  <div className="h-3 bg-white/5 rounded w-2/3" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      )}
                      {!loading && error && (
                        <TableRow><TableCell colSpan={7} className="text-red-400">{error}</TableCell></TableRow>
                      )}
                      {!loading && !error && filteredResults.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-gray-400">No results</TableCell></TableRow>
                      )}
                      {!loading && !error && filteredResults.map((row: any) => (
                        <TableRow key={`${row.userId}-${row.rank}`} className="hover:bg-white/5 cursor-pointer border-b border-white/10" onClick={() => setOpenUserId(row.userId)}>
                          <TableCell>{renderRankCell(row.rank)}</TableCell>
                          <TableCell>{renderUserCell(row)}</TableCell>
                          {category === 'overall' && (<>
                            <TableCell className="text-right">{row.score}</TableCell>
                            <TableCell className="text-right">{Math.round(row.components?.game_norm ?? 0)}</TableCell>
                            <TableCell className="text-right">{Math.round(row.components?.applicant_norm ?? 0)}</TableCell>
                            <TableCell className="text-right">{Math.round(row.components?.engagement_norm ?? 0)}</TableCell>
                          </>)}
                          {category === 'game' && (<>
                            <TableCell className="text-right">{row.bestScore}</TableCell>
                            <TableCell className="text-right">{row.plays}</TableCell>
                            <TableCell className="text-right">{row.lastPlayed ? new Date(row.lastPlayed).toLocaleDateString() : '-'}</TableCell>
                          </>)}
                          {category === 'applicants' && (
                            <TableCell className="text-right">{row.score}</TableCell>
                          )}
                          {category === 'engagement' && (
                            <TableCell className="text-right">{row.score}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {total > 0 && (
                    <div className="flex items-center justify-end gap-3 p-3 border-t border-white/10">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        {pageItems.map((it, idx) => (
                          typeof it === 'number' ? (
                            <Button key={idx} variant={it === page ? 'secondary' : 'outline'} size="sm" onClick={() => setPage(it)} className={`h-8 px-3 ${it === page ? 'bg-white/10 text-white' : 'text-gray-300 border-white/20 hover:bg-white/10'}`}>{it}</Button>
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

                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card border-white/10 flex flex-col h-[420px] lg:h-[520px]">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-white flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </span>
                    <span>How Scoring Works</span>
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-1">Quick guide to how we compute ranks</p>
                </CardHeader>
                <CardContent className="space-y-6 text-xs text-gray-300 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400/30">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-white font-semibold"><span className="w-2 h-2 bg-cyan-400 rounded-full" /> Overall Weights</div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-y-2">
                        <thead className="text-gray-400 text-xs uppercase tracking-wider">
                          <tr>
                            <th className="text-left">Component</th>
                            <th className="text-left">How</th>
                            <th className="text-right">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors">
                            <td className="px-3 py-2">Games</td>
                            <td className="px-3 py-2">Avg of your best per game vs game max</td>
                            <td className="px-3 py-2 text-right">60%</td>
                          </tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors">
                            <td className="px-3 py-2">Applications</td>
                            <td className="px-3 py-2">Your total milestone points vs top</td>
                            <td className="px-3 py-2 text-right">30%</td>
                          </tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors">
                            <td className="px-3 py-2">Engagement</td>
                            <td className="px-3 py-2">Completions and profile bonuses vs top</td>
                            <td className="px-3 py-2 text-right">10%</td>
                          </tr>
                        </tbody>
                      </table>
                          </div>
                        </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-white font-semibold"><span className="w-2 h-2 bg-purple-400 rounded-full" /> Game Scores</div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-y-2">
                        <thead className="text-gray-400 text-xs uppercase tracking-wider">
                          <tr>
                            <th className="text-left">Game</th>
                            <th className="text-left">Score Formula</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">Typing Hero</td><td className="px-3 py-2">round(WPM × Accuracy/100)</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">BPOC Cultural</td><td className="px-3 py-2">Average of region scores</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">Ultimate</td><td className="px-3 py-2">Average of smart, motivated, integrity, business</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">DISC Personality</td><td className="px-3 py-2">Average of D, I, S, C</td></tr>
                        </tbody>
                      </table>
                          </div>
                        </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-white font-semibold"><span className="w-2 h-2 bg-green-400 rounded-full" /> Applications Points</div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-y-2">
                        <thead className="text-gray-400 text-xs uppercase tracking-wider">
                          <tr>
                            <th className="text-left">Status</th>
                            <th className="text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">submitted</td><td className="px-3 py-2 text-right">5</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">qualified</td><td className="px-3 py-2 text-right">15</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">for verification</td><td className="px-3 py-2 text-right">20</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">verified</td><td className="px-3 py-2 text-right">25</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">initial interview</td><td className="px-3 py-2 text-right">35</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">final interview</td><td className="px-3 py-2 text-right">50</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">passed</td><td className="px-3 py-2 text-right">60</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">hired</td><td className="px-3 py-2 text-right">100</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 px-3 py-2 rounded bg-white/10 border border-white/20 text-[11px] text-gray-400">Highest status per job only. No double counting.</p>
                  </div>

                    <div>
                    <div className="mb-3 flex items-center gap-2 text-white font-semibold"><span className="w-2 h-2 bg-pink-400 rounded-full" /> Engagement Points</div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-separate border-spacing-y-2">
                        <thead className="text-gray-400 text-xs uppercase tracking-wider">
                          <tr>
                            <th className="text-left">Action</th>
                            <th className="text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">Complete a game (first time)</td><td className="px-3 py-2 text-right">+5</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">Complete all 4 games</td><td className="px-3 py-2 text-right">+20</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">First avatar uploaded</td><td className="px-3 py-2 text-right">+5</td></tr>
                          <tr className="bg-white/5 hover:bg-white/10 transition-colors"><td className="px-3 py-2">First resume created</td><td className="px-3 py-2 text-right">+10</td></tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="mt-1 text-[10px] text-gray-400">Engagement points are one‑time bonuses.</p>
                      </div>
                    </CardContent>
                  </Card>

            </div>
            </div>

          {/* Breakdown Modal */}
          <Dialog open={!!openUserId} onOpenChange={(o) => { if (!o) { setOpenUserId(null); setUserBreakdown(null) } }}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white w-[98vw] max-w-none sm:max-w-[1600px] md:max-w-[1600px] lg:max-w-[1700px] xl:max-w-[1800px]">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-3">
                  <span>🎯 User Score Breakdown</span>
                  {selectedUser?.rank && (
                    <Badge className="bg-cyan-500/20 border-cyan-500/30 text-cyan-300">Rank #{selectedUser.rank}</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              {/* User quick info */}
              {selectedUser && (
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-2 ring-cyan-500/20">
                    {selectedUser.user?.avatar_url ? (
                      <img src={selectedUser.user.avatar_url} alt={selectedUser.user?.full_name || selectedUser.userId} className="w-full h-full object-cover" />
                    ) : null}
                </div>
                    <button
                    onClick={(e) => goToResume(e as any, selectedUser.userId)}
                    className="text-cyan-300 hover:underline truncate"
                    title="Open resume"
                    >
                    {selectedUser.user?.full_name || selectedUser.userId}
                    </button>
                  <Badge className="bg-amber-500/20 border-amber-500/30 text-amber-300">Hire‑ready</Badge>
                      </div>
                    )}
              {loadingBreakdown && (
                <div className="text-gray-400">Loading...</div>
              )}
              {!loadingBreakdown && userBreakdown && (
                <div className="space-y-6">
                  {/* Content */}
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
                            {(userBreakdown.games || []).map((g: any, idx: number) => (
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
                          <div className="mb-1 font-medium">Applications (total: {userBreakdown.applications?.total ?? 0})</div>
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
                                {(userBreakdown.applications?.items || []).map((i: any, idx: number) => (
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
                          <div className="mb-1 font-medium">Engagement (total: {userBreakdown.engagement?.total ?? 0})</div>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="text-gray-300">Action</TableHead>
                                  <TableHead className="text-right text-gray-300">Points</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(userBreakdown.engagement?.items || []).map((i: any, idx: number) => (
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
            </div>

                  {/* Totals row under tables */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="px-3 py-2 rounded bg-white/5 border border-white/10">
                      <span className="text-gray-400 mr-2">🎮 Games</span>
                      <span className="text-white font-semibold">{(userBreakdown.games || []).reduce((sum: number, g: any) => sum + (g.best_score || 0), 0)}</span>
                    </div>
                    <div className="px-3 py-2 rounded bg-white/5 border border-white/10">
                      <span className="text-gray-400 mr-2">🏆 Overall</span>
                      <span className="text-white font-semibold">{userBreakdown.overall?.overall_score ?? 0}</span>
                    </div>
                    <div className="px-3 py-2 rounded bg-white/5 border border-white/10">
                      <span className="text-gray-400 mr-2">📄 Applications</span>
                      <span className="text-white font-semibold">{userBreakdown.applications?.total ?? 0}</span>
                    </div>
                    <div className="px-3 py-2 rounded bg-white/5 border border-white/10">
                      <span className="text-gray-400 mr-2">✨ Engagement</span>
                      <span className="text-white font-semibold">{userBreakdown.engagement?.total ?? 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
	)
}