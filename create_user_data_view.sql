-- =====================================================
-- BPOC.IO User Data View
-- Comprehensive view combining user-related data
-- For public API endpoint: /api/public/user-data/[userId]
-- =====================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.v_user_complete_data;

-- Create user data view
CREATE VIEW public.v_user_complete_data AS
SELECT 
    -- User Basic Information
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.full_name,
    u.location,
    u.avatar_url,
    u.phone,
    u.bio,
    u.position,
    u.gender,
    u.gender_custom,
    u.admin_level,
    u.is_admin,
    u.completed_data,
    u.birthday,
    u.slug,
    u.location_place_id,
    u.location_lat,
    u.location_lng,
    u.location_city,
    u.location_province,
    u.location_country,
    u.location_barangay,
    u.location_region,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at,

    -- User Work Status
    uws.current_employer,
    uws.current_position,
    uws.current_salary,
    uws.notice_period_days,
    uws.current_mood,
    uws.work_status,
    uws.preferred_shift,
    uws.expected_salary,
    uws.work_setup,
    uws.completed_data as work_status_completed,
    uws.created_at as work_status_created_at,
    uws.updated_at as work_status_updated_at,

    -- AI Analysis Results
    aar.session_id,
    aar.original_resume_id,
    aar.overall_score,
    aar.ats_compatibility_score,
    aar.content_quality_score,
    aar.professional_presentation_score,
    aar.skills_alignment_score,
    aar.key_strengths,
    aar.strengths_analysis,
    aar.improvements,
    aar.recommendations,
    aar.improved_summary,
    aar.salary_analysis,
    aar.career_path,
    aar.section_analysis,
    aar.analysis_metadata,
    aar.portfolio_links,
    aar.files_analyzed,
    aar.candidate_profile,
    aar.skills_snapshot,
    aar.experience_snapshot,
    aar.education_snapshot,
    aar.created_at as analysis_created_at,
    aar.updated_at as analysis_updated_at,

    -- Saved Resume Information
    sr.resume_slug,
    sr.resume_title,
    sr.resume_data,
    sr.template_used,
    sr.is_public as resume_is_public,
    sr.view_count as resume_view_count,
    sr.original_resume_id as saved_resume_original_id,
    sr.created_at as resume_created_at,
    sr.updated_at as resume_updated_at,

    -- Application Statistics
    COALESCE(app_stats.total_applications, 0) as total_applications,
    COALESCE(app_stats.active_applications, 0) as active_applications,
    COALESCE(app_stats.hired_applications, 0) as hired_applications,
    COALESCE(app_stats.rejected_applications, 0) as rejected_applications,
    app_stats.latest_application_date,
    app_stats.latest_application_status

FROM public.users u
    -- User Work Status (LEFT JOIN - user might not have work status)
    LEFT JOIN public.user_work_status uws ON u.id = uws.user_id
    
    -- AI Analysis Results (LEFT JOIN - user might not have analysis)
    LEFT JOIN public.ai_analysis_results aar ON u.id = aar.user_id
    
    -- Saved Resume (LEFT JOIN - user might not have saved resume)
    LEFT JOIN public.saved_resumes sr ON u.id = sr.user_id
    
    -- Application Statistics Subquery
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as total_applications,
            COUNT(CASE WHEN status IN ('submitted', 'qualified', 'for verification', 'verified', 'initial interview', 'final interview') THEN 1 END) as active_applications,
            COUNT(CASE WHEN status = 'hired' THEN 1 END) as hired_applications,
            COUNT(CASE WHEN status IN ('rejected', 'not qualified', 'failed') THEN 1 END) as rejected_applications,
            MAX(created_at) as latest_application_date,
            (SELECT status FROM applications a2 WHERE a2.user_id = applications.user_id ORDER BY created_at DESC LIMIT 1) as latest_application_status
        FROM public.applications
        GROUP BY user_id
    ) app_stats ON u.id = app_stats.user_id;




-- Add comment to document the view
COMMENT ON VIEW public.v_user_complete_data IS 'User data view combining profile, work status, AI analysis, resume, and application statistics for public API consumption';

-- =====================================================
-- Sample Query Examples for API Usage
-- =====================================================

-- Example 1: Get complete user data by user ID
-- SELECT * FROM public.v_user_complete_data WHERE user_id = 'user-uuid-here';

-- Example 2: Get user data by slug (for public profiles)
-- SELECT * FROM public.v_user_complete_data WHERE slug = 'john-doe-1234';

-- Example 3: Get users with high AI scores
-- SELECT user_id, full_name, overall_score, total_applications 
-- FROM public.v_user_complete_data 
-- WHERE overall_score > 70 
-- ORDER BY overall_score DESC 
-- LIMIT 50;

-- Example 4: Get users with active applications
-- SELECT user_id, full_name, active_applications, latest_application_status, latest_application_date
-- FROM public.v_user_complete_data 
-- WHERE active_applications > 0 
-- ORDER BY latest_application_date DESC;
