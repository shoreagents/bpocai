import { NextRequest, NextResponse } from 'next/server';

interface ImproveResumeRequest {
  resumeData: any;
  sessionId: string;
}

interface ImprovedResumeContent {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    highlights: string[];
  }>;
  certifications: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    impact: string[];
  }>;
  achievements: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { resumeData, sessionId }: ImproveResumeRequest = await request.json();

    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return NextResponse.json(
        { success: false, error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Create improvement prompt for Claude
    const improvementPrompt = createImprovementPrompt(resumeData);

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: improvementPrompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to improve resume with Claude' },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const improvementText = claudeData.content[0].text;

    // Parse Claude's response into structured data
    const improvedContent = parseClaudeImprovementResponse(improvementText, resumeData);

    return NextResponse.json({
      success: true,
      improvedResume: improvedContent,
      sessionId
    });

  } catch (error) {
    console.error('Resume improvement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to improve resume' },
      { status: 500 }
    );
  }
}

function createImprovementPrompt(resumeData: any): string {
  const candidateName = resumeData?.name || resumeData?.personalInfo?.name || 'Candidate';
  const candidateSkills = resumeData?.skills || [];
  const candidateExperience = resumeData?.experience || [];
  const candidateEducation = resumeData?.education || [];
  const candidateSummary = resumeData?.summary || resumeData?.objective || '';

  return `You are an expert resume writer specializing in creating compelling, professional resumes for the BPO industry in the Philippines.

IMPORTANT: Create an improved version of the resume based on the provided data. Enhance the content to be more impactful, professional, and optimized for BPO roles.

ORIGINAL RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

IMPROVEMENT REQUIREMENTS:
1. Create a compelling professional summary that highlights key strengths
2. Enhance work experience descriptions with quantifiable achievements
3. Organize skills into technical, soft skills, and languages
4. Improve education section with relevant highlights
5. Add certifications if mentioned or suggest relevant ones
6. Create impactful project descriptions if applicable
7. Generate notable achievements section
8. Use action verbs and quantifiable metrics
9. Optimize for ATS (Applicant Tracking Systems)
10. Focus on BPO industry relevance

Please provide an improved resume in the following JSON structure:

{
  "summary": "[Create a compelling 3-4 sentence professional summary that highlights key strengths and career objectives]",
  "experience": [
    {
      "title": "[Enhanced job title]",
      "company": "[Company name]",
      "duration": "[Duration]",
      "achievements": [
        "[Quantified achievement 1]",
        "[Quantified achievement 2]",
        "[Quantified achievement 3]"
      ]
    }
  ],
  "skills": {
    "technical": [
      "[List 5-8 technical skills relevant to BPO]"
    ],
    "soft": [
      "[List 4-6 soft skills]"
    ],
    "languages": [
      "[List languages with proficiency levels]"
    ]
  },
  "education": [
    {
      "degree": "[Degree name]",
      "institution": "[Institution name]",
      "year": "[Year]",
      "highlights": [
        "[Relevant coursework or achievement 1]",
        "[Relevant coursework or achievement 2]"
      ]
    }
  ],
  "certifications": [
    "[List relevant certifications]"
  ],
  "projects": [
    {
      "title": "[Project title]",
      "description": "[Brief project description]",
      "technologies": [
        "[Technologies used]"
      ],
      "impact": [
        "[Quantified impact or results]"
      ]
    }
  ],
  "achievements": [
    "[List 3-5 notable achievements with quantifiable results]"
  ]
}

CRITICAL: 
- Base all improvements on the actual resume data provided
- Use quantifiable metrics and specific achievements
- Make content more impactful and professional
- Focus on BPO industry relevance
- Use action verbs and strong language
- Ensure all content is factual and based on provided data`;
}

function parseClaudeImprovementResponse(responseText: string, resumeData: any): ImprovedResumeContent {
  try {
    // Extract JSON from Claude's response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and provide defaults if needed
    return {
      summary: parsed.summary || 'Professional summary will be generated based on your experience.',
      experience: parsed.experience || [],
      skills: parsed.skills || {
        technical: ['Microsoft Office', 'Customer Service Software'],
        soft: ['Communication', 'Problem Solving'],
        languages: ['English (Fluent)', 'Filipino (Native)']
      },
      education: parsed.education || [],
      certifications: parsed.certifications || [],
      projects: parsed.projects || [],
      achievements: parsed.achievements || []
    };
  } catch (error) {
    console.error('Error parsing Claude improvement response:', error);
    
    // Return default improved content if parsing fails
    return {
      summary: 'Professional summary will be generated based on your experience.',
      experience: [],
      skills: {
        technical: ['Microsoft Office', 'Customer Service Software'],
        soft: ['Communication', 'Problem Solving'],
        languages: ['English (Fluent)', 'Filipino (Native)']
      },
      education: [],
      certifications: [],
      projects: [],
      achievements: []
    };
  }
}