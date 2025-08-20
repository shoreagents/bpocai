import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    if (!userId || !jobId) {
      return NextResponse.json({ error: 'userId and jobId are required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Get user profile and resume data
      const userResult = await client.query(`
        SELECT 
          u.id, u.full_name, u.location, u.position, u.bio,
          sr.resume_data,
          aar.skills_snapshot, aar.experience_snapshot, aar.education_snapshot
        FROM users u
        LEFT JOIN saved_resumes sr ON u.id = sr.user_id
        LEFT JOIN ai_analysis_results aar ON u.id = aar.user_id
        WHERE u.id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const user = userResult.rows[0];

      // Get job details
      const jobResult = await client.query(`
        SELECT 
          pjr.id, pjr.job_title, pjr.job_description, pjr.requirements, 
          pjr.responsibilities, pjr.benefits, pjr.skills, pjr.experience_level,
          pjr.industry, pjr.department, pjr.work_arrangement, pjr.salary_min, pjr.salary_max,
          m.company as company_name
        FROM processed_job_requests pjr
        LEFT JOIN members m ON pjr.company_id = m.company_id
        WHERE pjr.id = $1
      `, [jobId]);

      if (jobResult.rows.length === 0) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const job = jobResult.rows[0];

      // Check if we already have a recent analysis for this user-job combination
      try {
        const existingResult = await client.query(`
          SELECT score, reasoning, breakdown, analyzed_at
          FROM job_match_results 
          WHERE user_id = $1 AND job_id = $2
          AND analyzed_at > NOW() - INTERVAL '24 hours'
        `, [userId, jobId]);

        if (existingResult.rows.length > 0) {
          const cached = existingResult.rows[0];
          console.log(`Using cached match result for user ${userId}, job ${jobId}`);
          return NextResponse.json({
            matchScore: cached.score,
            reasoning: cached.reasoning,
            breakdown: typeof cached.breakdown === 'string' ? JSON.parse(cached.breakdown) : cached.breakdown,
            message: 'Using cached analysis result',
            cached: true
          });
        }
      } catch (cacheErr) {
        console.warn('Failed to check cached results (table may not exist):', cacheErr);
      }

      // Prepare data for Anthropic analysis
    const analysisData = {
      user: {
        name: user.full_name,
        location: user.location,
        currentPosition: user.position,
        bio: user.bio,
        resumeData: user.resume_data,
        skills: user.skills_snapshot || [],
        experience: user.experience_snapshot || [],
        education: user.education_snapshot || []
      },
      job: {
        title: job.job_title,
        company: job.company_name,
        description: job.job_description,
        requirements: job.requirements || [],
        responsibilities: job.responsibilities || [],
        benefits: job.benefits || [],
        skills: job.skills || [],
        experienceLevel: job.experience_level,
        industry: job.industry,
        department: job.department,
        workArrangement: job.work_arrangement,
        salaryRange: job.salary_min && job.salary_max ? `${job.salary_min}-${job.salary_max}` : 'Not specified'
      }
    };

    // Debug: Log the data types we're getting
    console.log('Data types from database:', {
      userSkills: Array.isArray(user.skills_snapshot) ? user.skills_snapshot.map((s: any) => ({ value: s, type: typeof s })) : 'Not array',
      userExperience: Array.isArray(user.experience_snapshot) ? user.experience_snapshot.map((e: any) => ({ value: e, type: typeof e })) : 'Not array',
      userEducation: Array.isArray(user.education_snapshot) ? user.education_snapshot.map((ed: any) => ({ value: ed, type: typeof ed })) : 'Not array',
      jobRequirements: Array.isArray(job.requirements) ? job.requirements.map((r: any) => ({ value: r, type: typeof r })) : 'Not array',
      jobResponsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.map((r: any) => ({ value: r, type: typeof r })) : 'Not array',
      jobSkills: Array.isArray(job.skills) ? job.skills.map((s: any) => ({ value: s, type: typeof s })) : 'Not array'
    });

      // Call Anthropic API for intelligent matching
      console.log(`Performing new AI analysis for user ${userId}, job ${jobId}`);
      const matchScore = await analyzeJobMatchWithAI(analysisData);

      // Persist the latest analysis as the basis for future counts
      try {
        await client.query(
          `INSERT INTO job_match_results (user_id, job_id, score, reasoning, breakdown, analyzed_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (user_id, job_id)
           DO UPDATE SET score = EXCLUDED.score, reasoning = EXCLUDED.reasoning, breakdown = EXCLUDED.breakdown, analyzed_at = NOW()`,
          [userId, jobId, matchScore.score ?? 0, matchScore.reasoning ?? '', JSON.stringify(matchScore.breakdown ?? {})]
        )
      } catch (persistErr) {
        console.warn('job_match_results upsert failed (table may not exist yet):', persistErr)
      }

      return NextResponse.json({
        matchScore: matchScore.score,
        reasoning: matchScore.reasoning,
        breakdown: matchScore.breakdown,
        message: 'New AI-powered match analysis completed',
        cached: false
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error analyzing job match:', error);
    return NextResponse.json({ error: 'Failed to analyze job match' }, { status: 500 });
  }
}

async function analyzeJobMatchWithAI(data: any) {
  try {
    // Check if API key is available
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.error('CLAUDE_API_KEY not found in environment variables');
      throw new Error('API key not configured');
    }

    // Clean and prepare data for analysis - handle different data types safely
    const cleanUserSkills = Array.isArray(data.user.skills) ? data.user.skills.filter((s: any) => s && typeof s === 'string' && s.trim()) : [];
    const cleanUserExperience = Array.isArray(data.user.experience) ? data.user.experience.filter((e: any) => e && typeof e === 'string' && e.trim()) : [];
    const cleanUserEducation = Array.isArray(data.user.education) ? data.user.education.filter((ed: any) => ed && typeof ed === 'string' && ed.trim()) : [];
    
    const cleanJobRequirements = Array.isArray(data.job.requirements) ? data.job.requirements.filter((r: any) => r && typeof r === 'string' && r.trim()) : [];
    const cleanJobResponsibilities = Array.isArray(data.job.responsibilities) ? data.job.responsibilities.filter((r: any) => r && typeof r === 'string' && r.trim()) : [];
    const cleanJobSkills = Array.isArray(data.job.skills) ? data.job.skills.filter((s: any) => s && typeof s === 'string' && s.trim()) : [];

    const prompt = `You are an expert HR professional and career counselor. Analyze the match between a job candidate and a job posting.

CANDIDATE PROFILE:
- Name: ${data.user.name || 'Not specified'}
- Current Position: ${data.user.currentPosition || 'Not specified'}
- Location: ${data.user.location || 'Not specified'}
- Bio: ${data.user.bio || 'Not specified'}
- Skills: ${cleanUserSkills.length > 0 ? cleanUserSkills.join(', ') : 'Not specified'}
- Experience: ${cleanUserExperience.length > 0 ? cleanUserExperience.join(', ') : 'Not specified'}
- Education: ${cleanUserEducation.length > 0 ? cleanUserEducation.join(', ') : 'Not specified'}
- Resume Data: ${data.user.resumeData ? JSON.stringify(data.user.resumeData, null, 2) : 'Not available'}

JOB POSTING:
- Title: ${data.job.title || 'Not specified'}
- Company: ${data.job.company || 'Not specified'}
- Description: ${data.job.description || 'Not specified'}
- Requirements: ${cleanJobRequirements.length > 0 ? cleanJobRequirements.join(', ') : 'Not specified'}
- Responsibilities: ${cleanJobResponsibilities.length > 0 ? cleanJobResponsibilities.join(', ') : 'Not specified'}
- Benefits: ${Array.isArray(data.job.benefits) ? data.job.benefits.join(', ') : 'Not specified'}
- Required Skills: ${cleanJobSkills.length > 0 ? cleanJobSkills.join(', ') : 'Not specified'}
- Experience Level: ${data.job.experienceLevel || 'Not specified'}
- Industry: ${data.job.industry || 'Not specified'}
- Department: ${data.job.department || 'Not specified'}
- Work Arrangement: ${data.job.workArrangement || 'Not specified'}
- Salary Range: ${data.job.salaryRange || 'Not specified'}

TASK:
Analyze the match between the candidate and job posting. Consider:
1. Skills alignment (technical skills, soft skills)
2. Experience level compatibility
3. Industry/domain knowledge
4. Location preferences
5. Career progression fit
6. Overall suitability

Provide your analysis in this exact JSON format:
{
  "score": 85,
  "reasoning": "Strong technical skills match with React and Node.js. Good experience level alignment. Location works well. Some industry experience gaps but transferable skills present.",
  "breakdown": {
    "skillsMatch": 90,
    "experienceMatch": 85,
    "locationMatch": 80,
    "industryMatch": 70,
    "overallFit": 85
  }
}

The score should be 0-100 where:
- 90-100: Excellent match, highly recommended
- 80-89: Very good match, strongly recommended
- 70-79: Good match, recommended
- 60-69: Not recommended
- Below 60: Not recommended

Be realistic and thorough in your analysis. If there's insufficient data, provide a conservative estimate.`;

    console.log('Calling Anthropic API with data:', {
      user: { name: data.user.name, skills: cleanUserSkills.length, experience: cleanUserExperience.length },
      job: { title: data.job.title, requirements: cleanJobRequirements.length, skills: cleanJobSkills.length }
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Anthropic API response:', result);
    
    const content = result.content[0].text;
    console.log('AI response content:', content);
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Parsed AI response:', parsed);
      
      // Validate the response
      if (typeof parsed.score === 'number' && parsed.score >= 0 && parsed.score <= 100) {
        return {
          score: parsed.score,
          reasoning: parsed.reasoning || 'Analysis completed',
          breakdown: parsed.breakdown || {}
        };
      } else {
        throw new Error('Invalid score in AI response');
      }
    }

    throw new Error('No valid JSON found in AI response');

  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);
    
    // Return error response instead of fallback
    return {
      score: 0,
      reasoning: `AI analysis failed: ${error.message}`,
      breakdown: {},
      error: true
    };
  }
}
