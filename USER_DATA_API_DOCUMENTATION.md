# BPOC.IO User Data API Documentation

## Overview
The User Data API provides comprehensive access to user-related information and their job application data through a single endpoint. This API combines data from user profiles, work status, AI analysis results, resumes, applications, and job information from `processed_job_requests`.

## Base URL
```
https://your-domain.com/api/public/user-data
```

## Authentication
This is a public API with CORS enabled. No authentication required for basic data access.

## Endpoint

### GET /api/public/user-data

Retrieves comprehensive user data and optionally their job application data.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string (UUID) | No* | User's unique identifier |
| `slug` | string | No* | User's public slug (e.g., "john-doe-1234") |
| `email` | string | No* | User's email address |
| `includeJobs` | boolean | No | Include job data for applied jobs (default: false) |
| `includePrivate` | boolean | No | Include private/sensitive fields (default: false) |
| `fields` | string (comma-separated) | No | Specific fields to return (default: all public fields) |
| `limit` | number | No | Number of records to return (max: 100, default: 1) |
| `offset` | number | No | Number of records to skip (default: 0) |

*At least one identifier (`userId`, `slug`, or `email`) is required.

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john@example.com",
      "location": "Manila, Philippines",
      "avatar_url": "https://...",
      "bio": "Software Developer...",
      "position": "Senior Developer",
      "gender": "male",
      "slug": "john-doe-1234",
      "location_city": "Manila",
      "location_province": "Metro Manila",
      "location_country": "Philippines",
      "location_region": "NCR",
      "user_created_at": "2024-01-01T00:00:00Z",
      "user_updated_at": "2024-01-01T00:00:00Z",
      
      // Work Status
      "current_employer": "Tech Corp",
      "current_position": "Senior Developer",
      "current_salary": 50000,
      "work_status": "employed",
      "preferred_shift": "day",
      "work_setup": "Hybrid",
      "work_status_completed": true,
      
      // AI Analysis Results
      "overall_score": 85,
      "ats_compatibility_score": 90,
      "content_quality_score": 80,
      "professional_presentation_score": 85,
      "skills_alignment_score": 88,
      "key_strengths": ["JavaScript", "React", "Node.js"],
      "strengths_analysis": {...},
      "improvements": ["Add more metrics", "Include certifications"],
      "recommendations": ["Consider leadership roles", "Expand backend skills"],
      "improved_summary": "Experienced software developer...",
      "salary_analysis": {...},
      "career_path": {...},
      "section_analysis": {...},
      "candidate_profile": {...},
      "skills_snapshot": {...},
      "experience_snapshot": {...},
      "education_snapshot": {...},
      
      // Resume Information
      "resume_slug": "john-doe-resume",
      "resume_title": "John Doe's Resume",
      "resume_data": {...},
      "template_used": "modern",
      "resume_is_public": true,
      "resume_view_count": 25,
      
      // Application Statistics
      "total_applications": 5,
      "active_applications": 2,
      "hired_applications": 1,
      "rejected_applications": 1,
      "latest_application_date": "2024-01-15T00:00:00Z",
      "latest_application_status": "initial interview"
    }
  ],
  "jobs": [
    {
      "user_id": "uuid",
      "full_name": "John Doe",
      "slug": "john-doe-1234",
      
      // Application Information
      "application_id": "uuid",
      "application_status": "initial interview",
      "application_created_at": "2024-01-15T00:00:00Z",
      "application_position": 1,
      
      // Job Information
      "job_id": 123,
      "job_title": "Senior Software Developer",
      "job_description": "We are looking for...",
      "requirements": ["5+ years experience", "React knowledge"],
      "responsibilities": ["Develop applications", "Code review"],
      "benefits": ["Health insurance", "Remote work"],
      "job_skills": ["JavaScript", "React", "Node.js"],
      "job_experience_level": "senior-level",
      "application_deadline": "2024-02-15",
      "job_industry": "Technology",
      "job_department": "Engineering",
      "job_work_arrangement": "hybrid",
      "job_salary_min": 80000,
      "job_salary_max": 120000,
      "job_currency": "PHP",
      "job_salary_type": "monthly",
      "job_work_type": "full-time",
      "job_status": "active",
      "job_views": 150,
      "job_applicants": 25,
      "job_priority": "high",
      "job_shift": "day",
      "job_created_at": "2024-01-01T00:00:00Z",
      "job_updated_at": "2024-01-01T00:00:00Z",
      
      // Company Information
      "company_name": "Tech Corp",
      "company_id": "uuid",
      "company_created_at": "2023-01-01T00:00:00Z",
      "company_updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 1,
    "offset": 0,
    "hasMore": false
  },
  "meta": {
    "requestedFields": "all",
    "includePrivate": false,
    "includeJobs": true,
    "timestamp": "2024-01-20T12:00:00Z"
  }
}
```

## Usage Examples

### 1. Get User by ID
```bash
curl "https://your-domain.com/api/public/user-data?userId=123e4567-e89b-12d3-a456-426614174000"
```

### 2. Get User by Slug (Public Profile)
```bash
curl "https://your-domain.com/api/public/user-data?slug=john-doe-1234"
```

### 3. Get User by Email
```bash
curl "https://your-domain.com/api/public/user-data?email=john@example.com"
```

### 4. Get User with Job Data
```bash
curl "https://your-domain.com/api/public/user-data?userId=123e4567-e89b-12d3-a456-426614174000&includeJobs=true"
```

### 5. Get Specific Fields Only
```bash
curl "https://your-domain.com/api/public/user-data?userId=123e4567-e89b-12d3-a456-426614174000&fields=full_name,position,overall_score,key_strengths"
```

### 6. Include Private Data (for internal use)
```bash
curl "https://your-domain.com/api/public/user-data?userId=123e4567-e89b-12d3-a456-426614174000&includePrivate=true"
```

### 7. Get Multiple Users with Job Data
```bash
curl "https://your-domain.com/api/public/user-data?limit=10&offset=0&includeJobs=true&fields=user_id,full_name,total_applications"
```

### 8. Get User's Job Applications Only
```bash
curl "https://your-domain.com/api/public/user-data?userId=123e4567-e89b-12d3-a456-426614174000&includeJobs=true&fields=user_id,full_name"
```

## Available Fields

### User Data Fields (Default)
- **User Profile**: `user_id`, `first_name`, `last_name`, `full_name`, `location`, `avatar_url`, `bio`, `position`, `gender`, `slug`, `location_city`, `location_province`, `location_country`, `location_region`, `user_created_at`
- **Work Status**: `current_employer`, `current_position`, `work_status`, `preferred_shift`, `work_setup`
- **AI Analysis**: `overall_score`, `ats_compatibility_score`, `content_quality_score`, `professional_presentation_score`, `skills_alignment_score`, `key_strengths`, `strengths_analysis`, `improvements`, `recommendations`, `improved_summary`, `salary_analysis`, `career_path`, `section_analysis`, `candidate_profile`, `skills_snapshot`, `experience_snapshot`, `education_snapshot`
- **Resume**: `resume_slug`, `resume_title`, `template_used`, `resume_is_public`, `resume_view_count`
- **Applications**: `total_applications`, `active_applications`, `hired_applications`, `rejected_applications`, `latest_application_date`, `latest_application_status`

### Job Data Fields (when `includeJobs=true`)
- **Application Info**: `application_id`, `application_status`, `application_created_at`, `application_position`
- **Job Details**: `job_id`, `job_title`, `job_description`, `requirements`, `responsibilities`, `benefits`, `job_skills`, `job_experience_level`, `application_deadline`, `job_industry`, `job_department`, `job_work_arrangement`, `job_salary_min`, `job_salary_max`, `job_currency`, `job_salary_type`, `job_work_type`, `job_status`, `job_views`, `job_applicants`, `job_priority`, `job_shift`, `job_created_at`, `job_updated_at`
- **Company Info**: `company_name`, `company_id`, `company_created_at`, `company_updated_at`

### Private Fields (require `includePrivate=true`)
- `email`, `phone`, `current_salary`, `expected_salary`, `analysis_metadata`, `files_analyzed`

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "At least one identifier (userId, slug, or email) is required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch user data",
  "details": "Detailed error message (development only)"
}
```

## Rate Limiting
- No rate limiting currently implemented
- Consider implementing rate limiting for production use

## CORS
- CORS is enabled for all origins (`*`)
- Allowed methods: `GET`, `OPTIONS`
- Allowed headers: `Content-Type`, `Authorization`

## Data Freshness
- Data is real-time from the database
- No caching implemented
- Consider implementing caching for frequently accessed data

## Use Cases

### 1. Public Profile Pages
```javascript
// Get user profile for public display
const response = await fetch('/api/public/user-data?slug=john-doe-1234');
const userData = await response.json();
```

### 2. User Job Application History
```javascript
// Get user with their job application history
const response = await fetch('/api/public/user-data?userId=USER_ID&includeJobs=true');
const userWithJobs = await response.json();
// Access job data via userWithJobs.jobs array
```

### 3. Application Analytics
```javascript
// Get users with active applications
const response = await fetch('/api/public/user-data?limit=100&fields=user_id,full_name,active_applications,latest_application_status');
const activeApplicants = await response.json();
```

### 4. Resume Analytics
```javascript
// Get users with public resumes
const response = await fetch('/api/public/user-data?limit=50&fields=user_id,full_name,resume_slug,resume_view_count,overall_score');
const resumeUsers = await response.json();
```

### 5. Job Application Tracking
```javascript
// Get specific user's job applications
const response = await fetch('/api/public/user-data?userId=USER_ID&includeJobs=true&fields=user_id,full_name');
const userJobs = await response.json();
// Process userJobs.jobs to show application history
```

### 6. Company Job Analytics
```javascript
// Get all users who applied to jobs from a specific company
const response = await fetch('/api/public/user-data?includeJobs=true&limit=100');
const allUserJobs = await response.json();
const companyJobs = allUserJobs.jobs.filter(job => job.company_name === 'Tech Corp');
```

## Database Views
This API uses two views:

### `v_user_complete_data` - User Data
Combines data from:
- `users` (profile information)
- `user_work_status` (work preferences)
- `ai_analysis_results` (AI analysis)
- `saved_resumes` (resume data)
- `applications` (application statistics)

### `v_user_job_data` - Job Data (when `includeJobs=true`)
Combines data from:
- `users` (user information)
- `applications` (application details)
- `processed_job_requests` (job information)
- `members` (company information)

## Performance Considerations
- The view includes LEFT JOINs, so it will return users even if they don't have all related data
- Use specific field selection to reduce payload size
- Consider implementing caching for frequently accessed data
- Indexes are created on commonly queried fields
