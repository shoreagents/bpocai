import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

type Period = 'weekly' | 'monthly' | 'all'

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
		const q = `SELECT user_id, ROUND(COALESCE(wpm,0) * COALESCE(accuracy,0) / 100.0)::int AS score, updated_at FROM typing_hero_sessions WHERE true ${timeClause}`
		const res = await pool.query(q)
		return res.rows.filter((r: any) => Number.isFinite(Number(r.score)) && Number(r.score) > 0)
	}
	if (gid === 'bpoc-cultural') {
		// Use AI results instead of sessions; score = average of per-region recommendations
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
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'US', result_json->'per_region_recommendation'->>'us')) WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS us,
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'UK', result_json->'per_region_recommendation'->>'uk')) WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS uk,
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'AU', result_json->'per_region_recommendation'->>'au')) WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS au,
			  (CASE LOWER(COALESCE(result_json->'per_region_recommendation'->>'CA', result_json->'per_region_recommendation'->>'ca')) WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS ca,
			  (CASE LOWER(result_json->>'hire_recommendation') WHEN 'hire' THEN 100 WHEN 'maybe' THEN 70 WHEN 'do_not_hire' THEN 40 ELSE NULL END) AS overall,
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

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}))
		const periods: Period[] = (body.periods || ['weekly','monthly','all'])
		const games: string[] = (body.games || ['typing-hero', 'disc-personality', 'ultimate', 'bpoc-cultural'])

		// Recompute game leaderboards from per-game tables
		for (const period of periods) {
			for (const gameId of games) {
				const rows = await fetchGameSessionRows(period, gameId)
				const userBest = new Map<string, { score: number; last: Date; plays: number }>()
				for (const row of rows) {
					const uid: string = row.user_id
					const computed = Number(row.score)
					if (!Number.isFinite(computed)) continue
					const last = new Date(row.updated_at)
					const prev = userBest.get(uid)
					if (!prev || computed > prev.score || (computed === prev.score && last < prev.last)) {
						userBest.set(uid, { score: computed, last, plays: (prev?.plays ?? 0) + 1 })
					} else {
						prev.plays += 1
					}
				}
				// Upsert rows
				for (const [uid, v] of userBest.entries()) {
					await pool.query(
						`INSERT INTO leaderboard_game_scores (period, game_id, user_id, best_score, plays, last_played, updated_at)
						 VALUES ($1,$2,$3,$4,$5,$6, now())
						 ON CONFLICT (period, game_id, user_id)
						 DO UPDATE SET best_score = EXCLUDED.best_score, plays = EXCLUDED.plays, last_played = EXCLUDED.last_played, updated_at = now()`,
						[period, gameId, uid, v.score, v.plays, v.last]
					)
				}
			}
		}

		// Applicants (all-time only)
		const appRes = await pool.query(
			`SELECT user_id, job_id, status FROM applications`
		)
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
		const byUserJob = new Map<string, Map<string, number>>()
		for (const row of appRes.rows) {
			const uid: string = row.user_id
			const jid: string = String(row.job_id)
			const pts = STATUS_POINTS[row.status] ?? 0
			if (!byUserJob.has(uid)) byUserJob.set(uid, new Map())
			const jm = byUserJob.get(uid)!
			jm.set(jid, Math.max(jm.get(jid) ?? 0, pts))
		}
		for (const [uid, jm] of byUserJob) {
			const score = Array.from(jm.values()).reduce((a, b) => a + b, 0)
			await pool.query(
				`INSERT INTO leaderboard_applicant_scores (period, user_id, score, updated_at)
				 VALUES ('all', $1, $2, now())
				 ON CONFLICT (period, user_id)
				 DO UPDATE SET score = EXCLUDED.score, updated_at = now()`,
				[uid, score]
			)
		}

		// Engagement (all-time only) without game_sessions: derive completion flags from per-game tables
		const gameList = ['typing-hero', 'disc-personality', 'ultimate', 'bpoc-cultural']
		const [users, resumes, typingUsers, discUsers, ultimateUsers, bpocUsers] = await Promise.all([
			pool.query(`SELECT id, avatar_url FROM users`),
			pool.query(`SELECT user_id, COUNT(*) AS cnt FROM saved_resumes GROUP BY user_id`),
			pool.query(`SELECT DISTINCT user_id FROM typing_hero_sessions`),
			pool.query(`SELECT DISTINCT user_id FROM disc_personality_sessions`),
			pool.query(`SELECT DISTINCT user_id FROM ultimate_sessions`),
			pool.query(`SELECT DISTINCT user_id FROM bpoc_cultural_sessions`),
		])
		const avatarMap = new Map<string, string | null>(users.rows.map((r: any) => [r.id, r.avatar_url]))
		const resumeMap = new Map<string, number>(resumes.rows.map((r: any) => [r.user_id, Number(r.cnt)]))
		const comp = new Map<string, Record<string, boolean>>()
		for (const u of users.rows) comp.set(u.id, Object.fromEntries(gameList.map(g => [g, false])))
		for (const r of typingUsers.rows) { if (comp.has(r.user_id)) comp.get(r.user_id)!["typing-hero"] = true }
		for (const r of discUsers.rows) { if (comp.has(r.user_id)) comp.get(r.user_id)!["disc-personality"] = true }
		for (const r of ultimateUsers.rows) { if (comp.has(r.user_id)) comp.get(r.user_id)!["ultimate"] = true }
		for (const r of bpocUsers.rows) { if (comp.has(r.user_id)) comp.get(r.user_id)!["bpoc-cultural"] = true }
		for (const [uid, flags] of comp) {
			let score = 0
			for (const g of gameList) if (flags[g]) score += 5
			if (gameList.every(g => flags[g])) score += 20
			const hasAvatar = !!(avatarMap.get(uid) && String(avatarMap.get(uid)).trim())
			if (hasAvatar) score += 5
			const hasResume = (resumeMap.get(uid) ?? 0) > 0
			if (hasResume) score += 10
			await pool.query(
				`INSERT INTO leaderboard_engagement_scores (period, user_id, score, updated_at)
				 VALUES ('all', $1, $2, now())
				 ON CONFLICT (period, user_id)
				 DO UPDATE SET score = EXCLUDED.score, updated_at = now()`,
				[uid, score]
			)
		}

		// Overall (all-time): compute normalized components from leaderboard_* tables
		// game_norm: per-user avg across games of (user best / game max) * 100
		// applicant_norm: (user_applicant / max_applicant) * 100
		// engagement_norm: (user_engagement / max_engagement) * 100
		// overall_score = round(0.6*game_norm + 0.3*applicant_norm + 0.1*engagement_norm)
		const overallRes = await pool.query(
			`WITH per_game_max AS (
			   SELECT game_id, MAX(best_score) AS max_score
			   FROM leaderboard_game_scores
			   WHERE period = 'all'
			   GROUP BY game_id
			), per_user_game_norm AS (
			   SELECT l.user_id,
			          AVG(100.0 * l.best_score / NULLIF(m.max_score,0)) AS game_norm
			   FROM leaderboard_game_scores l
			   JOIN per_game_max m ON m.game_id = l.game_id
			   WHERE l.period = 'all'
			   GROUP BY l.user_id
			), app_max AS (
			   SELECT MAX(score) AS max_app FROM leaderboard_applicant_scores WHERE period = 'all'
			), eng_max AS (
			   SELECT MAX(score) AS max_eng FROM leaderboard_engagement_scores WHERE period = 'all'
			), per_user_app_norm AS (
			   SELECT a.user_id, 100.0 * a.score / NULLIF((SELECT max_app FROM app_max),0) AS applicant_norm
			   FROM leaderboard_applicant_scores a
			   WHERE a.period = 'all'
			), per_user_eng_norm AS (
			   SELECT e.user_id, 100.0 * e.score / NULLIF((SELECT max_eng FROM eng_max),0) AS engagement_norm
			   FROM leaderboard_engagement_scores e
			   WHERE e.period = 'all'
			), user_union AS (
			   SELECT user_id FROM per_user_game_norm
			   UNION
			   SELECT user_id FROM per_user_app_norm
			   UNION
			   SELECT user_id FROM per_user_eng_norm
			)
			SELECT u.user_id,
			       COALESCE(g.game_norm, 0) AS game_norm,
			       COALESCE(a.applicant_norm, 0) AS applicant_norm,
			       COALESCE(en.engagement_norm, 0) AS engagement_norm,
			       ROUND(
			         0.6 * COALESCE(g.game_norm, 0) +
			         0.3 * COALESCE(a.applicant_norm, 0) +
			         0.1 * COALESCE(en.engagement_norm, 0)
			       )::int AS overall_score
			FROM user_union u
			LEFT JOIN per_user_game_norm g ON g.user_id = u.user_id
			LEFT JOIN per_user_app_norm a ON a.user_id = u.user_id
			LEFT JOIN per_user_eng_norm en ON en.user_id = u.user_id`
		)
		for (const row of overallRes.rows) {
			await pool.query(
				`INSERT INTO leaderboard_overall_scores (user_id, game_norm, applicant_norm, engagement_norm, overall_score, updated_at)
				 VALUES ($1,$2,$3,$4,$5, now())
				 ON CONFLICT (user_id)
				 DO UPDATE SET game_norm = EXCLUDED.game_norm,
				               applicant_norm = EXCLUDED.applicant_norm,
				               engagement_norm = EXCLUDED.engagement_norm,
				               overall_score = EXCLUDED.overall_score,
				               updated_at = now()`,
				[row.user_id, row.game_norm ?? 0, row.applicant_norm ?? 0, row.engagement_norm ?? 0, row.overall_score]
			)
		}

		return NextResponse.json({ ok: true })
	} catch (error) {
		console.error('Recompute leaderboards error:', error)
		return NextResponse.json({ error: 'Failed to recompute leaderboards' }, { status: 500 })
	}
}


