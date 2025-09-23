import { NextRequest, NextResponse } from 'next/server'

// Bridge endpoint to accommodate the new UI payload shape in
// src/app/career-tools/games/disc-personality/page.tsx.
// It stores the session by delegating to the existing disc-personality session API
// which expects a different schema.

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      sessionStartTime,
      coreScores,
      finalResults,
      aiAssessment
    } = body || {}

    // Map to legacy payload fields expected by /api/games/disc-personality/session
    const mapped = {
      startedAt: sessionStartTime || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: undefined,
      d: Number(coreScores?.D) || undefined,
      i: Number(coreScores?.I) || undefined,
      s: Number(coreScores?.S) || undefined,
      c: Number(coreScores?.C) || undefined,
      primary_style: finalResults?.primaryType || null,
      secondary_style: finalResults?.secondaryType || null,
      consistency_index: undefined,
      strengths: undefined,
      blind_spots: undefined,
      preferred_env: undefined,
      ai_interpretation: aiAssessment ? { text: aiAssessment } : undefined
    }

    // Forward to the existing handler to avoid duplicating DB code
    const url = new URL('/api/games/disc-personality/session', request.url)
    const forwarded = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Preserve auth header context so middleware continues to inject x-user-id
        'Authorization': request.headers.get('authorization') || '',
        'x-user-id': userId,
      },
      body: JSON.stringify(mapped)
    })

    const text = await forwarded.text()
    const contentType = forwarded.headers.get('content-type') || ''
    const payload = contentType.includes('application/json') ? JSON.parse(text || '{}') : { text }
    return NextResponse.json(payload, { status: forwarded.status })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}


