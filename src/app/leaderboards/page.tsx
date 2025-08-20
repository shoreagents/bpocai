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
  RefreshCw,
  Award,
  Zap,
  Star
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
					// Use live computations for game leaderboards
					params.set('source', 'live')
				} else {
					// Use precomputed tables for applicants/engagement/overall to avoid heavy/unsupported live queries
					params.set('source', 'tables')
				}
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
			<motion.div 
				initial={{ scale: 0.8, rotate: -10 }}
				animate={{ scale: 1, rotate: 0 }}
				whileHover={{ scale: 1.1, rotate: 5 }}
				className="relative w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-xl shadow-yellow-500/40 ring-3 ring-yellow-400/30"
			>
				<div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200/30 to-transparent" />
				<Crown className="w-6 h-6 text-yellow-900 drop-shadow-sm" />
				<div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full flex items-center justify-center">
					<Sparkles className="w-2 h-2 text-yellow-800" />
				</div>
			</motion.div>
		)
		if (rank === 2) return (
			<motion.div 
				initial={{ scale: 0.8, rotate: 10 }}
				animate={{ scale: 1, rotate: 0 }}
				whileHover={{ scale: 1.1, rotate: -3 }}
				className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center shadow-xl shadow-gray-400/30 ring-3 ring-gray-300/40"
			>
				<div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100/40 to-transparent" />
				<Medal className="w-6 h-6 text-gray-700 drop-shadow-sm" />
				<div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-200 rounded-full flex items-center justify-center">
					<Star className="w-2 h-2 text-gray-600" />
				</div>
			</motion.div>
		)
		if (rank === 3) return (
			<motion.div 
				initial={{ scale: 0.8, rotate: -5 }}
				animate={{ scale: 1, rotate: 0 }}
				whileHover={{ scale: 1.1, rotate: 2 }}
				className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 via-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30 ring-3 ring-orange-400/30"
			>
				<div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300/30 to-transparent" />
				<Award className="w-6 h-6 text-orange-100 drop-shadow-sm" />
				<div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full flex items-center justify-center">
					<Zap className="w-2 h-2 text-orange-800" />
				</div>
			</motion.div>
		)
		return (
			<motion.div 
				initial={{ scale: 0.9 }}
				animate={{ scale: 1 }}
				whileHover={{ scale: 1.05 }}
				className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 text-cyan-300 border-2 border-cyan-400/40 flex items-center justify-center text-sm font-bold shadow-lg shadow-cyan-500/20 hover:border-cyan-400/60 transition-all duration-200"
			>
				#{rank}
			</motion.div>
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
		<div className="flex items-center justify-center w-full h-full min-h-[60px]">
			<RankBadge rank={rank} />
		</div>
	)

	const renderUserCell = (row: any) => {
		const getSpecialBadge = (rank: number) => {
			if (rank === 1) return <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 border-yellow-400/50 font-bold">🥇 Champion</Badge>
			if (rank === 2) return <Badge className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-gray-300/50 font-semibold">🥈 Runner-up</Badge>
			if (rank === 3) return <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900 border-orange-400/50 font-semibold">🥉 3rd Place</Badge>
			return null
		}

		return (
			<div className="flex items-center gap-3 min-w-0">
				<div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${
					row.rank === 1 ? 'ring-3 ring-yellow-400/50 bg-yellow-50/10' :
					row.rank === 2 ? 'ring-2 ring-gray-300/50 bg-gray-50/10' :
					row.rank === 3 ? 'ring-2 ring-orange-400/50 bg-orange-50/10' :
					'ring-2 ring-cyan-500/20 bg-white/10'
				}`}>
					{row.user?.avatar_url ? (
						<img src={row.user.avatar_url} alt={row.user?.full_name || row.userId} className="w-full h-full object-cover" />
					) : (
						<span className="text-gray-400 text-xs">N/A</span>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<button onClick={(e) => goToResume(e, row.userId)} className={`text-left truncate hover:underline font-semibold ${
						row.rank === 1 ? 'text-yellow-300' :
						row.rank === 2 ? 'text-gray-200' :
						row.rank === 3 ? 'text-orange-300' :
						'text-cyan-300'
					}`}>
						{row.user?.full_name || row.userId}
					</button>
					{getSpecialBadge(row.rank)}
				</div>
			</div>
		)
	}

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
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-xl shadow-yellow-500/30"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-200/40 to-transparent" />
                  <Trophy className="w-8 h-8 text-yellow-900 drop-shadow-lg" />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-800" />
                  </motion.div>
                </motion.div>
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
                  >
                    🏆 Leaderboards
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-300"
                  >
                    Compete, improve, and rise to the top of our rankings 🚀
                  </motion.p>
                </div>

                                 </div>
             </motion.div>

          {/* Top 3 Podium */}
          {!loading && !error && filteredResults.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🏆 Hall of Fame</h2>
                <p className="text-gray-400">Our top 3 champions leading the way!</p>
              </div>
              
              <div className="flex items-end justify-center gap-4 max-w-3xl mx-auto">
                {/* 2nd Place */}
                <motion.div
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="relative flex-1 max-w-xs"
                >
                  <div className="bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-t-lg p-4 h-32 flex flex-col items-center justify-center shadow-xl">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 ring-4 ring-gray-300/50 mb-2">
                      {filteredResults[1]?.user?.avatar_url ? (
                        <img src={filteredResults[1].user.avatar_url} alt={filteredResults[1].user?.full_name || filteredResults[1].userId} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-400 flex items-center justify-center text-gray-700 font-bold">2</div>
                      )}
                    </div>
                    <div className="text-gray-800 font-bold text-sm text-center truncate w-full">{filteredResults[1]?.user?.full_name || filteredResults[1]?.userId}</div>
                  </div>
                  <div className="bg-gray-500 text-white text-center py-2 rounded-b-lg font-bold">
                    🥈 2nd Place
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="relative flex-1 max-w-xs"
                >
                  <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-t-lg p-4 h-40 flex flex-col items-center justify-center shadow-2xl shadow-yellow-500/30 ring-4 ring-yellow-400/50">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                    >
                      <Crown className="w-8 h-8 text-yellow-800" />
                    </motion.div>
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-yellow-200/30 ring-4 ring-yellow-300/70 mb-2 mt-4">
                      {filteredResults[0]?.user?.avatar_url ? (
                        <img src={filteredResults[0].user.avatar_url} alt={filteredResults[0].user?.full_name || filteredResults[0].userId} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-yellow-300 flex items-center justify-center text-yellow-900 font-bold text-xl">👑</div>
                      )}
                    </div>
                    <div className="text-yellow-900 font-bold text-sm text-center truncate w-full">{filteredResults[0]?.user?.full_name || filteredResults[0]?.userId}</div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-yellow-900 text-center py-2 rounded-b-lg font-bold">
                    🥇 Champion
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="relative flex-1 max-w-xs"
                >
                  <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-t-lg p-4 h-28 flex flex-col items-center justify-center shadow-xl">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-orange-200/30 ring-4 ring-orange-300/50 mb-2">
                      {filteredResults[2]?.user?.avatar_url ? (
                        <img src={filteredResults[2].user.avatar_url} alt={filteredResults[2].user?.full_name || filteredResults[2].userId} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-orange-400 flex items-center justify-center text-orange-900 font-bold">3</div>
                      )}
                    </div>
                    <div className="text-orange-900 font-bold text-sm text-center truncate w-full">{filteredResults[2]?.user?.full_name || filteredResults[2]?.userId}</div>
                  </div>
                  <div className="bg-orange-600 text-orange-100 text-center py-2 rounded-b-lg font-bold">
                    🥉 3rd Place
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

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
                        <TableHead className="w-[80px] text-gray-300 text-center">Rank</TableHead>
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
                      {!loading && !error && filteredResults.map((row: any) => {
                        const getRowStyling = (rank: number) => {
                          if (rank === 1) return "hover:bg-yellow-500/10 cursor-pointer border-b border-yellow-400/20 bg-gradient-to-r from-yellow-500/5 to-transparent"
                          if (rank === 2) return "hover:bg-gray-300/10 cursor-pointer border-b border-gray-300/20 bg-gradient-to-r from-gray-400/5 to-transparent"
                          if (rank === 3) return "hover:bg-orange-500/10 cursor-pointer border-b border-orange-400/20 bg-gradient-to-r from-orange-500/5 to-transparent"
                          return "hover:bg-white/5 cursor-pointer border-b border-white/10"
                        }
                        
                        return (
                          <motion.tr 
                            key={`${row.userId}-${row.rank}`} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * (row.rank - 1) }}
                            className={getRowStyling(row.rank)}
                            onClick={() => setOpenUserId(row.userId)}
                          >
                            <TableCell className="text-center">{renderRankCell(row.rank)}</TableCell>
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
                          </motion.tr>
                        )
                      })}
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