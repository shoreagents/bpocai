import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

type Period = 'weekly' | 'monthly' | 'all'
type Category = 'game' | 'applicants' | 'engagement' | 'overall'

function getPeriodStart(period: Period): string | null {
	if (period === 'weekly') return `date_trunc('week', now())`
	if (period === 'monthly') return `date_trunc('month', now())`
	return null
}

function toInt(value: any, fallback: number): number {
	const n = Number(value)
	return Number.isFinite(n) ? n : fallback
}

async function fetchGameSessionRows(
	period: Period,
	gameId: string
): Promise<Array<{ user_id: string; score: number; updated_at: Date }>> {
	const periodStartSql = getPeriodStart(period)
	const timeClause = periodStartSql ? `AND started_at >= ${periodStartSql}` : ''
	const gid = String(gameId || '').toLowerCase()

	if (gid === 'typing-hero') {
		// score = round(wpm * accuracy/100)
		const q = `SELECT user_id, ROUND(COALESCE(wpm,0) * COALESCE(accuracy,0) / 100.0)::int AS score, updated_at
					 FROM typing_hero_sessions
					 WHERE true ${timeClause}`
		const res = await pool.query(q)
		return res.rows.filter((r: any) => Number.isFinite(Number(r.score)) && Number(r.score) > 0)
	}

	if (gid === 'bpoc-cultural') {
		// Use AI results instead of sessions
		// Score = average of per-region recommendations mapped to numbers (hire=100, maybe=70, do_not_hire=40)
		// Case-insensitive region keys; fallback to overall hire_recommendation if regions missing
		const timeFilter = getPeriodStart(period) ? `AND COALESCE(created_at, now()) >= ${getPeriodStart(period)}` : ''
		const q = `WITH latest AS (
			SELECT DISTINCT ON (user_id)
			  user_id,
			  result_json,
			  created_at,
			  id
			FROM bpoc_cultural_results
			WHERE true ${timeFilter}
			ORDER BY user_id, id DESC
		  ), vals AS (
			SELECT 
			  user_id,
			  result_json,
			  /* Region values with case-insensitive keys */
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'US', result_json->'per_region_recommendation'->>'us'))
				 WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS us,
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'UK', result_json->'per_region_recommendation'->>'uk'))
				 WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS uk,
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'AU', result_json->'per_region_recommendation'->>'au'))
				 WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS au,
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'CA', result_json->'per_region_recommendation'->>'ca'))
				 WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS ca,
			  /* Fallback overall */
			  (CASE LOWER(result_json->>'hire_recommendation')
				 WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS overall,
			  COALESCE(created_at, now()) AS updated_at
			FROM latest
		  )
		  SELECT 
			user_id,
			COALESCE(
			  ROUND(((COALESCE(us,0) + COALESCE(uk,0) + COALESCE(au,0) + COALESCE(ca,0))::numeric
					 / NULLIF(((us IS NOT NULL)::int + (uk IS NOT NULL)::int + (au IS NOT NULL)::int + (ca IS NOT NULL)::int), 0)
					)::int),
			  COALESCE(overall, 0)
			) AS score,
			updated_at
		  FROM vals`
		const res = await pool.query(q)
		return res.rows.filter((r: any) => Number.isFinite(Number(r.score)))
	}

	if (gid === 'ultimate') {
		// score = avg of available competencies (smart, motivated, integrity, business)
		const q = `SELECT user_id,
					CASE 
					  WHEN ((smart IS NOT NULL)::int + (motivated IS NOT NULL)::int + ("integrity" IS NOT NULL)::int + (business IS NOT NULL)::int) > 0
					  THEN ROUND(((COALESCE(smart,0) + COALESCE(motivated,0) + COALESCE("integrity",0) + COALESCE(business,0))::numeric)
					       / NULLIF(((smart IS NOT NULL)::int + (motivated IS NOT NULL)::int + ("integrity" IS NOT NULL)::int + (business IS NOT NULL)::int),0))::int
					  ELSE NULL
					END AS score,
					updated_at
			 FROM ultimate_sessions
			 WHERE true ${timeClause}`
		const res = await pool.query(q)
		return res.rows.filter((r: any) => Number.isFinite(Number(r.score)))
	}

	if (gid === 'disc-personality') {
		// score = avg of D/I/S/C
		const q = `SELECT user_id,
					CASE 
					  WHEN ((d IS NOT NULL)::int + (i IS NOT NULL)::int + (s IS NOT NULL)::int + (c IS NOT NULL)::int) > 0
					  THEN ROUND(((COALESCE(d,0) + COALESCE(i,0) + COALESCE(s,0) + COALESCE(c,0))::numeric)
					       / NULLIF(((d IS NOT NULL)::int + (i IS NOT NULL)::int + (s IS NOT NULL)::int + (c IS NOT NULL)::int),0))::int
					  ELSE NULL
					END AS score,
					updated_at
			 FROM disc_personality_sessions
			 WHERE true ${timeClause}`
		const res = await pool.query(q)
		return res.rows.filter((r: any) => Number.isFinite(Number(r.score)))
	}

	return []
}

async function getGameLeaderboard(
	period: Period,
	gameId: string,
	limit: number,
	offset: number,
	userIdForMe: string | null
) {
	// Fetch candidate sessions from per-game tables
	const rows = await fetchGameSessionRows(period, gameId)

	// Aggregate best score per user
	const userBest = new Map<string, { score: number; last: Date; plays: number }>()
	for (const row of rows) {
		const uid: string = row.user_id
		const computed = Number(row.score)
		const last = new Date(row.updated_at)
		const prev = userBest.get(uid)
		if (!prev || computed > prev.score || (computed === prev.score && last < prev.last)) {
			userBest.set(uid, { score: computed, last, plays: (prev?.plays ?? 0) + 1 })
		} else {
			prev.plays += 1
		}
	}

	// Rank
	const ranked = Array.from(userBest.entries())
		.map(([userId, v]) => ({ userId, bestScore: v.score, plays: v.plays, lastPlayed: v.last }))
		.sort((a, b) => b.bestScore - a.bestScore || a.plays - b.plays || a.lastPlayed.getTime() - b.lastPlayed.getTime())

	const total = ranked.length
	const page = ranked.slice(offset, offset + limit)

	// Fetch user display info
	const ids = page.map(r => r.userId)
	let users: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
	if (ids.length > 0) {
		const ures = await pool.query(
			`SELECT id, full_name, avatar_url FROM users WHERE id = ANY($1)`,
			[ids]
		)
		users = Object.fromEntries(ures.rows.map((u: any) => [u.id, { full_name: u.full_name, avatar_url: u.avatar_url }]))
	}

	let me: any = null
	if (userIdForMe) {
		const idx = ranked.findIndex(r => r.userId === userIdForMe)
		if (idx >= 0) {
			me = { rank: idx + 1, ...ranked[idx] }
		}
	}

	return {
		total,
		results: page.map((r, i) => ({
			rank: offset + i + 1,
			userId: r.userId,
			bestScore: r.bestScore,
			plays: r.plays,
			lastPlayed: r.lastPlayed,
			user: users[r.userId] || null,
		})),
		me,
	}
}

const STATUS_POINTS: Record<string, number> = {
	'submitted': 5,
	'qualified': 15,
	'for verification': 20,
	'verified': 25,
	'initial interview': 35,
	'final interview': 50,
	'passed': 60,
	'hired': 100,
}

async function getApplicantLeaderboard(limit: number, offset: number, userIdForMe: string | null) {
	// Pull per-user, per-job latest status and map to points, then sum
	const res = await pool.query(
		`SELECT user_id, job_id, status, MAX(created_at) AS last
		 FROM applications
		 GROUP BY user_id, job_id, status`
	)
	// Compute best per job and sum
	const byUserJob = new Map<string, Map<string, number>>()
	for (const row of res.rows) {
		const uid: string = row.user_id
		const jid: string = String(row.job_id)
		const status: string = row.status
		const pts = STATUS_POINTS[status] ?? 0
		if (!byUserJob.has(uid)) byUserJob.set(uid, new Map())
		const jobMap = byUserJob.get(uid)!
		jobMap.set(jid, Math.max(jobMap.get(jid) ?? 0, pts))
	}
	const totals = Array.from(byUserJob.entries()).map(([uid, jobs]) => ({
		userId: uid,
		score: Array.from(jobs.values()).reduce((a, b) => a + b, 0),
	}))
	.sort((a, b) => b.score - a.score)

	const total = totals.length
	const page = totals.slice(offset, offset + limit)

	// Fetch user info
	const ids = page.map(r => r.userId)
	let users: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
	if (ids.length > 0) {
		const ures = await pool.query(`SELECT id, full_name, avatar_url FROM users WHERE id = ANY($1)`, [ids])
		users = Object.fromEntries(ures.rows.map((u: any) => [u.id, { full_name: u.full_name, avatar_url: u.avatar_url }]))
	}

	let me: any = null
	if (userIdForMe) {
		const idx = totals.findIndex(r => r.userId === userIdForMe)
		if (idx >= 0) me = { rank: idx + 1, ...totals[idx] }
	}

	return {
		total,
		results: page.map((r, i) => ({
			rank: offset + i + 1,
			userId: r.userId,
			score: r.score,
			user: users[r.userId] || null,
		})),
		me,
	}
}

async function getEngagementLeaderboard(limit: number, offset: number, userIdForMe: string | null) {
	// Candidate users: those who have any activity
	const candidates = await pool.query(
		`SELECT id FROM users WHERE id IN (
			SELECT DISTINCT user_id FROM game_sessions
			UNION
			SELECT DISTINCT user_id FROM applications
			UNION
			SELECT DISTINCT user_id FROM saved_resumes
		)`
	)
	const userIds: string[] = candidates.rows.map((r: any) => r.id)

	const gameList = ['typing-hero', 'disc-personality', 'ultimate', 'bpoc-cultural']

	// Fetch in parallel
	const [gameAgg, avatars, resumes] = await Promise.all([
		pool.query(`SELECT user_id, game_id, COUNT(*) AS plays, MAX(score) AS max_score FROM game_sessions GROUP BY user_id, game_id`),
		pool.query(`SELECT id, avatar_url FROM users WHERE id = ANY($1)`, [userIds]),
		pool.query(`SELECT user_id, COUNT(*) AS cnt FROM saved_resumes WHERE user_id = ANY($1) GROUP BY user_id`, [userIds]),
	])

	const avatarMap = new Map<string, string | null>(avatars.rows.map((r: any) => [r.id, r.avatar_url]))
	const resumeMap = new Map<string, number>(resumes.rows.map((r: any) => [r.user_id, Number(r.cnt)]))

	// Build completion flags per user
	const compMap = new Map<string, Record<string, boolean>>()
	for (const uid of userIds) compMap.set(uid, Object.fromEntries(gameList.map(g => [g, false])))
	for (const row of gameAgg.rows) {
		const uid: string = row.user_id
		const gid: string = row.game_id
		if (!compMap.has(uid)) compMap.set(uid, Object.fromEntries(gameList.map(g => [g, false])))
		if (gameList.includes(gid)) {
			// Any play counts as completion for engagement purposes
			compMap.get(uid)![gid] = true
		}
	}

	// Compute points per user
	const totals = userIds.map(uid => {
		const flags = compMap.get(uid) || Object.fromEntries(gameList.map(g => [g, false]))
		let score = 0
		for (const g of gameList) if (flags[g]) score += 5
		if (gameList.every(g => flags[g])) score += 20
		const hasAvatar = !!(avatarMap.get(uid) && String(avatarMap.get(uid)).trim())
		if (hasAvatar) score += 5
		const hasResume = (resumeMap.get(uid) ?? 0) > 0
		if (hasResume) score += 10
		return { userId: uid, score }
	})
	.sort((a, b) => b.score - a.score)

	const total = totals.length
	const page = totals.slice(offset, offset + limit)

	// User info
	let users: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
	if (page.length > 0) {
		const ids = page.map(r => r.userId)
		const ures = await pool.query(`SELECT id, full_name, avatar_url FROM users WHERE id = ANY($1)`, [ids])
		users = Object.fromEntries(ures.rows.map((u: any) => [u.id, { full_name: u.full_name, avatar_url: u.avatar_url }]))
	}

	let me: any = null
	if (userIdForMe) {
		const idx = totals.findIndex(r => r.userId === userIdForMe)
		if (idx >= 0) me = { rank: idx + 1, ...totals[idx] }
	}

	return {
		total,
		results: page.map((r, i) => ({
			rank: offset + i + 1,
			userId: r.userId,
			score: r.score,
			user: users[r.userId] || null,
		})),
		me,
	}
}

async function getGameLeaderboardFromTables(
	period: Period,
	gameId: string,
	limit: number,
	offset: number,
	userIdForMe: string | null
) {
	const res = await pool.query(
		`SELECT user_id, best_score, plays, last_played
		 FROM leaderboard_game_scores
		 WHERE period = $1 AND game_id = $2
		 ORDER BY best_score DESC, plays ASC, COALESCE(last_played, 'epoch') ASC
		 LIMIT $3 OFFSET $4`,
		[period, gameId, limit, offset]
	)

	const countRes = await pool.query(
		`SELECT COUNT(*) AS c FROM leaderboard_game_scores WHERE period = $1 AND game_id = $2`,
		[period, gameId]
	)

	const ids = res.rows.map((r: any) => r.user_id)
	let users: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
	if (ids.length > 0) {
		const ures = await pool.query(`SELECT id, full_name, avatar_url FROM users WHERE id = ANY($1)`, [ids])
		users = Object.fromEntries(ures.rows.map((u: any) => [u.id, { full_name: u.full_name, avatar_url: u.avatar_url }]))
	}

	let me: any = null
	if (userIdForMe) {
		const rankRes = await pool.query(
			`SELECT 1
			 FROM leaderboard_game_scores a
			 WHERE a.period = $1 AND a.game_id = $2 AND a.best_score > (
			   SELECT best_score FROM leaderboard_game_scores WHERE period = $1 AND game_id = $2 AND user_id = $3
			 )`,
			[period, gameId, userIdForMe]
		)
		// This approximates rank as (count with higher score) + 1; ignores tie-breakers for brevity
		const higher = rankRes.rowCount
		const meRow = await pool.query(
			`SELECT user_id, best_score, plays, last_played FROM leaderboard_game_scores WHERE period = $1 AND game_id = $2 AND user_id = $3`,
			[period, gameId, userIdForMe]
		)
		if (meRow.rows[0]) me = { rank: higher + 1, userId: meRow.rows[0].user_id, bestScore: meRow.rows[0].best_score, plays: meRow.rows[0].plays, lastPlayed: meRow.rows[0].last_played }
	}

	const total = Number(countRes.rows[0]?.c || 0)
	return {
		total,
		results: res.rows.map((r: any, i: number) => ({
			rank: offset + i + 1,
			userId: r.user_id,
			bestScore: r.best_score,
			plays: r.plays,
			lastPlayed: r.last_played,
			user: users[r.user_id] || null,
		})),
		me,
	}
}

async function getApplicantLeaderboardFromTables(limit: number, offset: number, userIdForMe: string | null) {
	const res = await pool.query(
		`SELECT user_id, score FROM leaderboard_applicant_scores WHERE period = 'all' ORDER BY score DESC LIMIT $1 OFFSET $2`,
		[limit, offset]
	)
	const countRes = await pool.query(`SELECT COUNT(*) AS c FROM leaderboard_applicant_scores WHERE period = 'all'`)
	const ids = res.rows.map((r: any) => r.user_id)
	let users: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
	if (ids.length > 0) {
		const ures = await pool.query(`SELECT id, full_name, avatar_url FROM users WHERE id = ANY($1)`, [ids])
		users = Object.fromEntries(ures.rows.map((u: any) => [u.id, { full_name: u.full_name, avatar_url: u.avatar_url }]))
	}
	let me: any = null
	if (userIdForMe) {
		const rankRes = await pool.query(
			`SELECT 1 FROM leaderboard_applicant_scores WHERE period = 'all' AND score > (SELECT score FROM leaderboard_applicant_scores WHERE period = 'all' AND user_id = $1)`,
			[userIdForMe]
		)
		const higher = rankRes.rowCount
		const meRow = await pool.query(`SELECT user_id, score FROM leaderboard_applicant_scores WHERE period = 'all' AND user_id = $1`, [userIdForMe])
		if (meRow.rows[0]) me = { rank: higher + 1, userId: meRow.rows[0].user_id, score: meRow.rows[0].score }
	}
	return {
		total: Number(countRes.rows[0]?.c || 0),
		results: res.rows.map((r: any, i: number) => ({ rank: offset + i + 1, userId: r.user_id, score: r.score, user: users[r.user_id] || null })),
		me,
	}
}

async function getEngagementLeaderboardFromTables(limit: number, offset: number, userIdForMe: string | null) {
	const res = await pool.query(
		`SELECT user_id, score FROM leaderboard_engagement_scores WHERE period = 'all' ORDER BY score DESC LIMIT $1 OFFSET $2`,
		[limit, offset]
	)
	const countRes = await pool.query(`SELECT COUNT(*) AS c FROM leaderboard_engagement_scores WHERE period = 'all'`)
	const ids = res.rows.map((r: any) => r.user_id)
	let users: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
	if (ids.length > 0) {
		const ures = await pool.query(`SELECT id, full_name, avatar_url FROM users WHERE id = ANY($1)`, [ids])
		users = Object.fromEntries(ures.rows.map((u: any) => [u.id, { full_name: u.full_name, avatar_url: u.avatar_url }]))
	}
	let me: any = null
	if (userIdForMe) {
		const rankRes = await pool.query(
			`SELECT 1 FROM leaderboard_engagement_scores WHERE period = 'all' AND score > (SELECT score FROM leaderboard_engagement_scores WHERE period = 'all' AND user_id = $1)`,
			[userIdForMe]
		)
		const higher = rankRes.rowCount
		const meRow = await pool.query(`SELECT user_id, score FROM leaderboard_engagement_scores WHERE period = 'all' AND user_id = $1`, [userIdForMe])
		if (meRow.rows[0]) me = { rank: higher + 1, userId: meRow.rows[0].user_id, score: meRow.rows[0].score }
	}
	return {
		total: Number(countRes.rows[0]?.c || 0),
		results: res.rows.map((r: any, i: number) => ({ rank: offset + i + 1, userId: r.user_id, score: r.score, user: users[r.user_id] || null })),
		me,
	}
}

async function getOverallLeaderboardFromTables(limit: number, offset: number, userIdForMe: string | null) {
	const res = await pool.query(
		`SELECT user_id, overall_score, game_norm, applicant_norm, engagement_norm
		 FROM leaderboard_overall_scores
		 ORDER BY overall_score DESC
		 LIMIT $1 OFFSET $2`,
		[limit, offset]
	)
	const countRes = await pool.query(`SELECT COUNT(*) AS c FROM leaderboard_overall_scores`)
	const ids = res.rows.map((r: any) => r.user_id)
	let users: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
	if (ids.length > 0) {
		const ures = await pool.query(`SELECT id, full_name, avatar_url FROM users WHERE id = ANY($1)`, [ids])
		users = Object.fromEntries(ures.rows.map((u: any) => [u.id, { full_name: u.full_name, avatar_url: u.avatar_url }]))
	}
	let me: any = null
	if (userIdForMe) {
		const rankRes = await pool.query(
			`SELECT 1 FROM leaderboard_overall_scores WHERE overall_score > (SELECT overall_score FROM leaderboard_overall_scores WHERE user_id = $1)`,
			[userIdForMe]
		)
		const higher = rankRes.rowCount
		const meRow = await pool.query(`SELECT user_id, overall_score FROM leaderboard_overall_scores WHERE user_id = $1`, [userIdForMe])
		if (meRow.rows[0]) me = { rank: higher + 1, userId: meRow.rows[0].user_id, score: meRow.rows[0].overall_score }
	}
	return {
		total: Number(countRes.rows[0]?.c || 0),
		results: res.rows.map((r: any, i: number) => ({
			rank: offset + i + 1,
			userId: r.user_id,
			score: r.overall_score,
			components: { game_norm: r.game_norm, applicant_norm: r.applicant_norm, engagement_norm: r.engagement_norm },
			user: users[r.user_id] || null,
		})),
		me,
	}
}

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url)
		const category = (url.searchParams.get('category') || 'game') as Category
		const period = (url.searchParams.get('period') || 'weekly') as Period
		const gameId = url.searchParams.get('gameId') || 'typing-hero'
		const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100)
		const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0)
		const me = url.searchParams.get('me') || null

		const source = (url.searchParams.get('source') || 'tables') as 'tables' | 'live'

		if (category === 'game') {
			const data = source === 'tables'
				? await getGameLeaderboardFromTables(period, gameId, limit, offset, me)
				: await getGameLeaderboard(period, gameId, limit, offset, me)
			return NextResponse.json({ category, period, gameId, ...data })
		}

		if (category === 'applicants') {
			const data = source === 'tables'
				? await getApplicantLeaderboardFromTables(limit, offset, me)
				: await getApplicantLeaderboard(limit, offset, me)
			return NextResponse.json({ category, ...data })
		}

		if (category === 'engagement') {
			const data = source === 'tables'
				? await getEngagementLeaderboardFromTables(limit, offset, me)
				: await getEngagementLeaderboard(limit, offset, me)
			return NextResponse.json({ category, ...data })
		}

		if (category === 'overall') {
			const data = await getOverallLeaderboardFromTables(limit, offset, me)
			return NextResponse.json({ category, ...data })
		}

		return NextResponse.json({ error: 'Unknown category' }, { status: 400 })
	} catch (error) {
		console.error('Leaderboards error:', error)
		return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
	}
}


