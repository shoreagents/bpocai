import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// CORS helper function for cross-origin requests
function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  return response;
}

// API Key validation (optional - for production use)
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization');
  // Add your API key validation logic here if needed
  // For now, we'll allow all requests (public API)
  return true;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

export async function GET(request: NextRequest) {
  try {
    // Optional API key validation
    if (!validateApiKey(request)) {
      return withCors(NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      ));
    }

    const { searchParams } = new URL(request.url);
    
    // Required parameters
    const userId = searchParams.get('userId');
    const slug = searchParams.get('slug');
    const email = searchParams.get('email');
    
    // Optional parameters
    const includePrivate = searchParams.get('includePrivate') === 'true';
    const fields = searchParams.get('fields')?.split(',').map(f => f.trim()).filter(f => f) || [];
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));
    const offset = Math.max(0, Number(searchParams.get('offset') || 0));
    const sortBy = searchParams.get('sortBy') || 'user_created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'ASC' : 'DESC';

    // If no identifiers provided, return all users (public access)
    // This makes the API purely public without requiring any parameters

    const client = await pool.connect();
    try {
      let whereClause = '';
      let params: any[] = [];
      let paramCount = 0;

      // Build WHERE clause based on provided identifiers
      const conditions: string[] = [];
      
      if (userId) {
        paramCount++;
        params.push(userId);
        conditions.push(`user_id = $${paramCount}`);
      }
      
      if (slug) {
        paramCount++;
        params.push(slug);
        conditions.push(`slug = $${paramCount}`);
      }
      
      if (email) {
        paramCount++;
        params.push(email);
        conditions.push(`email = $${paramCount}`);
      }

      // If no specific identifiers provided, return all users (public access)
      whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' OR ')}` : '';

      // Build SELECT clause based on requested fields
      let selectClause = '*';
      if (fields.length > 0) {
        // Filter out private fields if includePrivate is false
        const allowedFields = fields.filter(field => {
          if (!includePrivate) {
            // Remove private/sensitive fields (SIMPLIFIED - Only 3 tables)
            // Note: expected_salary is now PUBLIC, only email, phone, current_salary remain private
            const privateFields = [
              'email', 'phone', 'current_salary',
              'analysis_metadata', 'files_analyzed', 'original_resume_id',
              'admin_level', 'is_admin', 'work_status_user_id', 'analysis_user_id'
            ];
            return !privateFields.includes(field);
          }
          return true;
        });
        
        if (allowedFields.length > 0) {
          selectClause = allowedFields.join(', ');
        }
      } else if (!includePrivate) {
        // Default public fields if no specific fields requested (EXCLUDES sensitive data)
        // Note: expected_salary is now PUBLIC, only email, phone, current_salary remain private
        selectClause = `
          user_id, first_name, last_name, full_name, location, avatar_url, bio, position, 
          gender, gender_custom, slug, location_city, location_province, location_country, 
          location_region, location_barangay, user_created_at, user_updated_at,
          work_status_id, current_employer, current_position, work_status, preferred_shift, 
          work_setup, current_mood, notice_period_days, expected_salary, work_status_completed,
          work_status_created_at, work_status_updated_at,
          analysis_id, session_id, overall_score, ats_compatibility_score, content_quality_score, 
          professional_presentation_score, skills_alignment_score, key_strengths, 
          strengths_analysis, improvements, recommendations, improved_summary, 
          salary_analysis, career_path, section_analysis, candidate_profile, 
          skills_snapshot, experience_snapshot, education_snapshot, portfolio_links,
          analysis_created_at, analysis_updated_at
        `;
      }

      // Validate sortBy field to prevent SQL injection (SIMPLIFIED - Only 3 tables)
      const allowedSortFields = [
        'user_created_at', 'user_updated_at', 'full_name', 'overall_score',
        'ats_compatibility_score', 'content_quality_score', 'professional_presentation_score',
        'skills_alignment_score', 'work_status_created_at', 'analysis_created_at'
      ];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'user_created_at';

      // Add pagination
      paramCount++;
      params.push(limit);
      paramCount++;
      params.push(offset);

      // Get user data
      const userQuery = `
        SELECT ${selectClause}
        FROM public.v_user_complete_data
        ${whereClause}
        ORDER BY ${safeSortBy} ${sortOrder}
        LIMIT $${paramCount - 1} OFFSET $${paramCount}
      `;

      const userResult = await client.query(userQuery, params);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*)::int as total
        FROM public.v_user_complete_data
        ${whereClause}
      `;
      const countResult = await client.query(countQuery, params.slice(0, -2));
      const total = countResult.rows[0]?.total || 0;

      // Format response
      const response = {
        success: true,
        data: userResult.rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1
        },
        meta: {
          requestedFields: fields.length > 0 ? fields : 'all',
          includePrivate,
          sortBy: safeSortBy,
          sortOrder: sortOrder.toLowerCase(),
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      return withCors(NextResponse.json(response));

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error fetching user data:', error);
    return withCors(NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user data',
        message: 'An internal server error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    ));
  }
}