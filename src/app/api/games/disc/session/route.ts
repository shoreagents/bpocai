import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// Save DISC personality session data to new schema tables
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('💾 Saving DISC session for user:', userId)
    console.log('📊 Received data keys:', Object.keys(body))
    console.log('📋 Core responses count:', body.coreResponses?.length || 0)
    console.log('🤖 AI assessment length:', body.aiAssessment?.length || 0)
    console.log('💼 BPO roles count:', body.aiBpoRoles?.length || 0)

    const {
      sessionStartTime,
      sessionData,
      coreResponses,
      coreScores,
      personalizedResponses,
      personalizedQuestions,
      finalResults,
      aiAssessment,
      aiBpoRoles,
      userContext
    } = body || {}

    // Calculate session duration
    const startTime = sessionStartTime ? new Date(sessionStartTime) : new Date()
    const endTime = new Date()
    const durationSeconds = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000))
    
    console.log('⏱️ Session timing:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds
    })

    // Prepare session data for new schema
    const sessionInsert = {
      user_id: userId,
      started_at: startTime.toISOString(),
      finished_at: endTime.toISOString(),
      duration_seconds: durationSeconds,
      total_questions: (coreResponses?.length || 30) + (personalizedResponses?.length || 0),
      
      // Core DISC scores (convert to percentages)
      d_score: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.D || coreScores?.D || 0))),
      i_score: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.I || coreScores?.I || 0))),
      s_score: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.S || coreScores?.S || 0))),
      c_score: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.C || coreScores?.C || 0))),
      
      // Primary/Secondary types
      primary_type: finalResults?.primaryType || 'D',
      secondary_type: finalResults?.secondaryType || null,
      
      // Assessment quality
      confidence_score: Math.round(finalResults?.confidence || 85),
      cultural_alignment: Math.round(finalResults?.culturalAlignment || 95),
      authenticity: Math.round(finalResults?.authenticity || 90),
      
      // AI content (store as JSONB)
      ai_assessment: aiAssessment ? { text: aiAssessment, generated_at: new Date().toISOString() } : {},
      ai_bpo_roles: Array.isArray(aiBpoRoles) ? aiBpoRoles : [],
      
      // Response data
      core_responses: Array.isArray(coreResponses) ? coreResponses : [],
      personalized_responses: Array.isArray(personalizedResponses) ? personalizedResponses : [],
      response_patterns: {
        total_responses: (coreResponses?.length || 0) + (personalizedResponses?.length || 0),
        avg_response_time: coreResponses?.length > 0 ? 
          Math.round(coreResponses.reduce((sum: number, r: any) => sum + (r.responseTime || 0), 0) / coreResponses.length) : 0,
        consistency_score: finalResults?.confidence || 85
      },
      
      // User context at time of assessment
      user_position: userContext?.position || null,
      user_location: userContext?.location || null,
      user_experience: userContext?.bio || null,
      
      session_status: 'completed'
    }

    console.log('📝 Session data prepared:', {
      scores: {
        D: sessionInsert.d_score,
        I: sessionInsert.i_score,
        S: sessionInsert.s_score,
        C: sessionInsert.c_score
      },
      types: {
        primary: sessionInsert.primary_type,
        secondary: sessionInsert.secondary_type
      },
      responses: {
        core: sessionInsert.core_responses.length,
        personalized: sessionInsert.personalized_responses.length
      },
      ai: {
        hasAssessment: !!aiAssessment,
        rolesCount: sessionInsert.ai_bpo_roles.length
      }
    })

    // Check database connection
    if (!pool) {
      console.error('❌ Database pool not available')
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 })
    }

    const client = await pool.connect()
    try {
      console.log('✅ Database connection established')
      // Insert session record
      const sessionQuery = `
        INSERT INTO disc_personality_sessions (
          user_id, started_at, finished_at, duration_seconds, total_questions,
          d_score, i_score, s_score, c_score, primary_type, secondary_type,
          confidence_score, cultural_alignment, ai_assessment, ai_bpo_roles,
          core_responses, personalized_responses, response_patterns,
          user_position, user_location, user_experience, session_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING id
      `
      
      const sessionResult = await client.query(sessionQuery, [
        sessionInsert.user_id, sessionInsert.started_at, sessionInsert.finished_at,
        sessionInsert.duration_seconds, sessionInsert.total_questions,
        sessionInsert.d_score, sessionInsert.i_score, sessionInsert.s_score, sessionInsert.c_score,
        sessionInsert.primary_type, sessionInsert.secondary_type,
        sessionInsert.confidence_score, sessionInsert.cultural_alignment,
        JSON.stringify(sessionInsert.ai_assessment), JSON.stringify(sessionInsert.ai_bpo_roles),
        JSON.stringify(sessionInsert.core_responses), JSON.stringify(sessionInsert.personalized_responses),
        JSON.stringify(sessionInsert.response_patterns),
        sessionInsert.user_position, sessionInsert.user_location, sessionInsert.user_experience,
        sessionInsert.session_status
      ])

      const sessionId = sessionResult.rows[0].id
      console.log('✅ DISC session saved with ID:', sessionId)
      console.log('💾 Session record inserted successfully')

      // Prepare AI data for stats table - extract text from JSONB if needed
      let aiAssessmentText = null;
      if (aiAssessment) {
        if (typeof aiAssessment === 'string') {
          aiAssessmentText = aiAssessment;
        } else if (aiAssessment.text) {
          aiAssessmentText = aiAssessment.text;
        }
      }
      const bpoRolesArray = Array.isArray(aiBpoRoles) ? aiBpoRoles : [];
      
      console.log('📝 Preparing stats data:', {
        userId,
        aiAssessmentText: aiAssessmentText ? `${aiAssessmentText.length} chars` : 'null',
        bpoRolesArray: `${bpoRolesArray.length} roles`,
        bpoRolesPreview: bpoRolesArray.slice(0, 2).map(r => r?.title || 'untitled')
      });

      // First, check if user already has stats record
      const existingStatsQuery = `SELECT user_id, total_sessions, completed_sessions, best_confidence_score, average_completion_time, total_xp, badges_earned FROM disc_personality_stats WHERE user_id = $1`;
      const existingStats = await client.query(existingStatsQuery, [userId]);
      
      if (existingStats.rows.length > 0) {
        // Update existing record
        const existing = existingStats.rows[0];
        const newTotalSessions = existing.total_sessions + 1;
        const newCompletedSessions = existing.completed_sessions + 1;
        const newBestConfidence = Math.max(existing.best_confidence_score || 0, sessionInsert.confidence_score);
        const newAvgTime = Math.round(((existing.average_completion_time || 0) * existing.completed_sessions + sessionInsert.duration_seconds) / newCompletedSessions);
        
        // Calculate consistency trend (how stable results are across sessions)
        const consistencyTrend = newTotalSessions >= 3 ? 
          Math.max(75, Math.min(100, 85 + Math.random() * 15)) : null; // Placeholder logic for now
        
        // Calculate percentile (compared to other users) - placeholder logic
        const percentile = Math.max(10, Math.min(95, 50 + (sessionInsert.confidence_score - 75) * 1.2));
        
        // Calculate XP and badges for update
        const sessionXP = Math.round(
          (sessionInsert.confidence_score * 2) + 
          (sessionInsert.cultural_alignment * 1.5) + 
          (sessionInsert.total_questions * 5) +
          (sessionInsert.duration_seconds < 600 ? 50 : 0)
        );
        const newBadges = (existing.badges_earned || 0) + (sessionInsert.confidence_score >= 85 ? 1 : 0);
        const newTotalXP = (existing.total_xp || 0) + sessionXP;
        
        console.log('📊 Updating existing stats record with calculated metrics:', {
          consistencyTrend,
          percentile: Math.round(percentile)
        });
        
        const updateQuery = `
          UPDATE disc_personality_stats SET
            total_sessions = $2,
            completed_sessions = $3,
            last_taken_at = $4,
            latest_d_score = $5,
            latest_i_score = $6,
            latest_s_score = $7,
            latest_c_score = $8,
            latest_primary_type = $9,
            latest_secondary_type = $10,
            best_confidence_score = $11,
            average_completion_time = $12,
            consistency_trend = $13,
            latest_ai_assessment = $14,
            latest_bpo_roles = $15,
            percentile = $16,
            total_xp = $17,
            badges_earned = $18,
            cultural_alignment_score = $19,
            authenticity_score = $20,
            latest_session_xp = $21,
            updated_at = NOW()
          WHERE user_id = $1
        `;
        
        try {
          await client.query(updateQuery, [
            userId,
            newTotalSessions,
            newCompletedSessions,
            endTime.toISOString(),
            sessionInsert.d_score,
            sessionInsert.i_score,
            sessionInsert.s_score,
            sessionInsert.c_score,
            sessionInsert.primary_type,
            sessionInsert.secondary_type,
            newBestConfidence,
            newAvgTime,
            consistencyTrend,
            aiAssessmentText,
            JSON.stringify(bpoRolesArray),
            Math.round(percentile),
            newTotalXP, // total_xp
            newBadges, // badges_earned
            sessionInsert.cultural_alignment, // cultural_alignment_score
            sessionInsert.authenticity, // authenticity_score
            sessionXP // latest_session_xp
          ]);
          console.log('✅ Stats UPDATE successful with all fields including XP and badges');
        } catch (updateError) {
          console.error('❌ Stats UPDATE failed:', updateError);
          throw updateError;
        }
        
      } else {
        // Insert new record
        console.log('📊 Creating new stats record');
        
        // Calculate initial metrics for new user
        const initialConsistencyTrend = null; // Need multiple sessions for consistency
        const initialPercentile = Math.max(10, Math.min(95, 50 + (sessionInsert.confidence_score - 75) * 1.2));
        
        // Calculate XP and cultural scores
        const sessionXP = Math.round(
          (sessionInsert.confidence_score * 2) + 
          (sessionInsert.cultural_alignment * 1.5) + 
          (sessionInsert.total_questions * 5) +
          (sessionInsert.duration_seconds < 600 ? 50 : 0) // Bonus for completing under 10 mins
        );
        const badges = sessionInsert.confidence_score >= 85 ? 1 : 0; // Badge for high confidence
        
        const insertQuery = `
          INSERT INTO disc_personality_stats (
            user_id, total_sessions, completed_sessions, last_taken_at,
            latest_d_score, latest_i_score, latest_s_score, latest_c_score,
            latest_primary_type, latest_secondary_type, best_confidence_score,
            average_completion_time, consistency_trend, latest_ai_assessment, 
            latest_bpo_roles, percentile, total_xp, badges_earned, 
            cultural_alignment_score, authenticity_score, latest_session_xp
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        `;
        
        try {
          await client.query(insertQuery, [
            userId,
            1, // total_sessions
            1, // completed_sessions
            endTime.toISOString(),
            sessionInsert.d_score,
            sessionInsert.i_score,
            sessionInsert.s_score,
            sessionInsert.c_score,
            sessionInsert.primary_type,
            sessionInsert.secondary_type,
            sessionInsert.confidence_score,
            sessionInsert.duration_seconds,
            initialConsistencyTrend,
            aiAssessmentText,
            JSON.stringify(bpoRolesArray),
            Math.round(initialPercentile),
            sessionXP, // total_xp
            badges, // badges_earned
            sessionInsert.cultural_alignment, // cultural_alignment_score
            sessionInsert.authenticity, // authenticity_score
            sessionXP // latest_session_xp
          ]);
          console.log('✅ Stats INSERT successful with all fields including XP and badges');
        } catch (insertError) {
          console.error('❌ Stats INSERT failed:', insertError);
          throw insertError;
        }
      }

      console.log('✅ DISC stats updated for user:', userId)
      console.log('📊 Stats record upserted successfully')
      
      // Verify what was actually stored in stats table
      const verifyQuery = `
        SELECT 
          user_id,
          latest_ai_assessment,
          latest_bpo_roles,
          total_sessions,
          completed_sessions
        FROM disc_personality_stats 
        WHERE user_id = $1
      `;
      
      const verifyResult = await client.query(verifyQuery, [userId]);
      if (verifyResult.rows.length > 0) {
        const statsRow = verifyResult.rows[0];
        console.log('🔍 Verification - Stats data stored:', {
          userId: statsRow.user_id,
          hasAiAssessment: !!statsRow.latest_ai_assessment,
          aiAssessmentLength: statsRow.latest_ai_assessment?.length || 0,
          bpoRolesType: typeof statsRow.latest_bpo_roles,
          bpoRolesCount: Array.isArray(statsRow.latest_bpo_roles) ? statsRow.latest_bpo_roles.length : 'not array',
          totalSessions: statsRow.total_sessions,
          completedSessions: statsRow.completed_sessions
        });
      } else {
        console.warn('⚠️ No stats record found after insert for user:', userId);
      }

      return NextResponse.json({ 
        success: true, 
        sessionId,
        message: 'DISC session saved successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Failed to save DISC session:', error)
    return NextResponse.json({ 
      error: 'Failed to save session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


