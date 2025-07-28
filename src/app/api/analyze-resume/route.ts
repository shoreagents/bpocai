import { NextRequest, NextResponse } from 'next/server';

interface AnalysisRequest {
  resumeData: any;
  portfolioLinks?: any[];
  sessionId: string;
}

interface AnalysisResult {
  overallScore: number;
  atsCompatibility: number;
  contentQuality: number;
  professionalPresentation: number;
  skillsAlignment: number;
  keyStrengths: string[];
  strengthsAnalysis: {
    coreStrengths: string[];
    technicalStrengths: string[];
    softSkills: string[];
    achievements: string[];
    marketAdvantage: string[];
  };
  improvements: string[];
  recommendations: string[];
  salaryAnalysis: {
    currentLevel: string;
    recommendedSalaryRange: string;
    factorsAffectingSalary: string[];
    negotiationTips: string[];
  };
  careerPath: {
    currentPosition: string;
    nextCareerSteps: Array<{
      step: string;
      title: string;
      description: string;
    }>;
    skillGaps: string[];
    timeline: string;
    timelineDetails: string;
  };
  sectionAnalysis: {
    contact: { score: number; reasons: string[]; issues: string[]; improvements: string[] };
    summary: { score: number; reasons: string[]; issues: string[]; improvements: string[] };
    experience: { score: number; reasons: string[]; issues: string[]; improvements: string[] };
    education: { score: number; reasons: string[]; issues: string[]; improvements: string[] };
    skills: { score: number; reasons: string[]; issues: string[]; improvements: string[] };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { resumeData, portfolioLinks = [], sessionId }: AnalysisRequest = await request.json();

    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return NextResponse.json(
        { success: false, error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Create analysis prompt for Claude
    const analysisPrompt = createAnalysisPrompt(resumeData, portfolioLinks);

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
            content: analysisPrompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to analyze resume with Claude' },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const analysisText = claudeData.content[0].text;

    // Parse Claude's response into structured data
    const analysisResult = parseClaudeResponse(analysisText, resumeData);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      sessionId
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}

function createAnalysisPrompt(resumeData: any, portfolioLinks: any[]): string {
  // Extract key information from resume data for context
  const candidateName = resumeData?.name || resumeData?.personalInfo?.name || 'Candidate';
  const candidateSkills = resumeData?.skills || [];
  const candidateExperience = resumeData?.experience || [];
  const candidateEducation = resumeData?.education || [];
  const candidateSummary = resumeData?.summary || resumeData?.objective || '';
  const candidateLocation = resumeData?.location || resumeData?.personalInfo?.location || 'Philippines';
  
  // Calculate experience level based on actual data
  const totalExperience = candidateExperience.length;
  const experienceLevel = totalExperience === 0 ? 'entry' : 
                         totalExperience <= 2 ? 'junior' : 
                         totalExperience <= 5 ? 'mid' : 'senior';
  
  // Get current position from actual experience
  const currentPosition = candidateExperience.length > 0 ? 
    candidateExperience[0]?.position || candidateExperience[0]?.title || 'Professional' : 
    'Entry Level Professional';

  return `You are an expert resume analyst specializing in BPO (Business Process Outsourcing) industry analysis for the Philippine market.

IMPORTANT: Analyze the ACTUAL resume data provided and generate insights based on the real content. Do NOT use generic examples.

CANDIDATE CONTEXT:
- Name: ${candidateName}
- Location: ${candidateLocation}
- Current Position: ${currentPosition}
- Experience Level: ${experienceLevel} (based on ${totalExperience} positions)
- Skills Found: ${candidateSkills.length} skills
- Education: ${candidateEducation.length} items
- Summary: ${candidateSummary ? 'Present' : 'Missing'}

RESUME DATA TO ANALYZE:
${JSON.stringify(resumeData, null, 2)}

PORTFOLIO LINKS:
${JSON.stringify(portfolioLinks, null, 2)}

ANALYSIS REQUIREMENTS:
1. Base ALL analysis on the actual resume content provided
2. Calculate scores based on real data quality and completeness
3. Identify strengths from actual skills, experience, and achievements
4. Suggest improvements based on what's missing or could be enhanced
5. Provide salary recommendations based on actual experience level and location
6. Create career path based on current position and skills

Please provide a detailed analysis in the following JSON structure, using ONLY information from the provided resume data:

{
  "overallScore": [Calculate based on actual content quality],
  "atsCompatibility": [Score based on keyword optimization and format],
  "contentQuality": [Score based on completeness and impact],
  "professionalPresentation": [Score based on formatting and structure],
  "skillsAlignment": [Score based on BPO industry relevance],
  "keyStrengths": [
    [List 3-5 actual strengths from the resume data with detailed explanations]
  ],
  "strengthsAnalysis": {
    "coreStrengths": [
      [List 3-4 core professional strengths with detailed explanations]
    ],
    "technicalStrengths": [
      [List 2-3 technical skills that are valuable for BPO roles]
    ],
    "softSkills": [
      [List 2-3 soft skills that make the candidate valuable]
    ],
    "achievements": [
      [List 2-3 notable achievements from the resume with impact]
    ],
    "marketAdvantage": [
      [List 2-3 specific advantages for BPO industry based on resume]
    ]
  },
  "improvements": [
    [List 3-5 specific improvements based on what's missing or weak]
  ],
  "recommendations": [
    [List 3-5 actionable recommendations based on actual content]
  ],
  "salaryAnalysis": {
    "currentLevel": "${experienceLevel}",
    "recommendedSalaryRange": "[Calculate based on experience level and location]",
    "factorsAffectingSalary": [
      [List 3-4 factors based on actual resume content]
    ],
    "negotiationTips": [
      [List 3-4 tips based on actual achievements and skills]
    ]
  },
  "careerPath": {
    "currentPosition": "${currentPosition}",
    "nextCareerSteps": [
      {
        "step": "1",
        "title": "[Next logical position based on current role]",
        "description": "[Specific description based on actual skills]"
      },
      {
        "step": "2",
        "title": "[Mid-level position]",
        "description": "[Description based on skill development needs]"
      },
      {
        "step": "3",
        "title": "[Senior position]",
        "description": "[Description based on career progression]"
      },
      {
        "step": "4",
        "title": "[Management position]",
        "description": "[Description based on leadership potential]"
      }
    ],
    "skillGaps": [
      [List 3-4 skills missing for career advancement based on actual content]
    ],
    "timeline": "[Realistic timeline based on current experience level]",
    "timelineDetails": "[Detailed explanation of the timeline and what needs to be done to achieve promotion]"
  },
  "sectionAnalysis": {
    "contact": {
      "score": [Score based on actual contact info completeness],
      "reasons": [List reasons for score based on actual data],
      "issues": [List issues found in actual contact section],
      "improvements": [List improvements for actual contact section]
    },
    "summary": {
      "score": [Score based on actual summary quality],
      "reasons": [List reasons for score based on actual summary],
      "issues": [List issues found in actual summary],
      "improvements": [List improvements for actual summary]
    },
    "experience": {
      "score": [Score based on actual experience quality],
      "reasons": [List reasons for score based on actual experience],
      "issues": [List issues found in actual experience],
      "improvements": [List improvements for actual experience]
    },
    "education": {
      "score": [Score based on actual education quality],
      "reasons": [List reasons for score based on actual education],
      "issues": [List issues found in actual education],
      "improvements": [List improvements for actual education]
    },
    "skills": {
      "score": [Score based on actual skills relevance],
      "reasons": [List reasons for score based on actual skills],
      "issues": [List issues found in actual skills],
      "improvements": [List improvements for actual skills]
    }
  }
}

CRITICAL: Every score, strength, improvement, and recommendation must be based on the actual resume content provided. Do not use generic examples or predetermined responses.`;
}

function parseClaudeResponse(responseText: string, resumeData: any): AnalysisResult {
  try {
    // Extract JSON from Claude's response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and provide defaults if needed
    return {
      overallScore: parsed.overallScore || 70,
      atsCompatibility: parsed.atsCompatibility || 75,
      contentQuality: parsed.contentQuality || 70,
      professionalPresentation: parsed.professionalPresentation || 75,
      skillsAlignment: parsed.skillsAlignment || 70,
      keyStrengths: parsed.keyStrengths || ['Good communication skills', 'Relevant experience'],
      strengthsAnalysis: parsed.strengthsAnalysis || {
        coreStrengths: ['Strong communication skills', 'Customer service experience'],
        technicalStrengths: ['Basic computer skills', 'Microsoft Office proficiency'],
        softSkills: ['Teamwork', 'Problem-solving'],
        achievements: ['Consistent performance', 'Reliable attendance'],
        marketAdvantage: ['Philippine market knowledge', 'English proficiency']
      },
      improvements: parsed.improvements || ['Add more specific achievements', 'Improve keyword optimization'],
      recommendations: parsed.recommendations || ['Focus on quantifiable results', 'Include industry keywords'],
      salaryAnalysis: parsed.salaryAnalysis || {
        currentLevel: 'mid',
        recommendedSalaryRange: 'PHP 20,000 - 30,000',
        factorsAffectingSalary: ['Experience level', 'Technical skills', 'Location'],
        negotiationTips: ['Highlight achievements', 'Research market rates']
      },
      careerPath: parsed.careerPath || {
        currentPosition: 'Customer Service Representative',
        nextCareerSteps: [
          { step: '1', title: 'Team Lead', description: 'Lead small teams' },
          { step: '2', title: 'Quality Analyst', description: 'Monitor service quality' }
        ],
        skillGaps: ['Leadership skills', 'Advanced analytics'],
        timeline: '2-3 years for promotion',
        timelineDetails: 'Focus on developing leadership skills and taking on additional responsibilities'
      },
      sectionAnalysis: parsed.sectionAnalysis || {
        contact: { score: 80, reasons: ['Contact info present'], issues: [], improvements: [] },
        summary: { score: 70, reasons: ['Summary included'], issues: ['Could be stronger'], improvements: ['Add achievements'] },
        experience: { score: 75, reasons: ['Experience shown'], issues: ['Missing metrics'], improvements: ['Add numbers'] },
        education: { score: 80, reasons: ['Education listed'], issues: [], improvements: [] },
        skills: { score: 70, reasons: ['Skills included'], issues: ['Missing technical skills'], improvements: ['Add industry keywords'] }
      }
    };
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    
    // Return default analysis if parsing fails
    return {
      overallScore: 70,
      atsCompatibility: 75,
      contentQuality: 70,
      professionalPresentation: 75,
      skillsAlignment: 70,
      keyStrengths: ['Good communication skills', 'Relevant experience'],
      strengthsAnalysis: {
        coreStrengths: ['Strong communication skills', 'Customer service experience'],
        technicalStrengths: ['Basic computer skills', 'Microsoft Office proficiency'],
        softSkills: ['Teamwork', 'Problem-solving'],
        achievements: ['Consistent performance', 'Reliable attendance'],
        marketAdvantage: ['Philippine market knowledge', 'English proficiency']
      },
      improvements: ['Add more specific achievements', 'Improve keyword optimization'],
      recommendations: ['Focus on quantifiable results', 'Include industry keywords'],
      salaryAnalysis: {
        currentLevel: 'mid',
        recommendedSalaryRange: 'PHP 20,000 - 30,000',
        factorsAffectingSalary: ['Experience level', 'Technical skills', 'Location'],
        negotiationTips: ['Highlight achievements', 'Research market rates']
      },
      careerPath: {
        currentPosition: 'Customer Service Representative',
        nextCareerSteps: [
          { step: '1', title: 'Team Lead', description: 'Lead small teams' },
          { step: '2', title: 'Quality Analyst', description: 'Monitor service quality' }
        ],
        skillGaps: ['Leadership skills', 'Advanced analytics'],
        timeline: '2-3 years for promotion',
        timelineDetails: 'Focus on developing leadership skills and taking on additional responsibilities'
      },
      sectionAnalysis: {
        contact: { score: 80, reasons: ['Contact info present'], issues: [], improvements: [] },
        summary: { score: 70, reasons: ['Summary included'], issues: ['Could be stronger'], improvements: ['Add achievements'] },
        experience: { score: 75, reasons: ['Experience shown'], issues: ['Missing metrics'], improvements: ['Add numbers'] },
        education: { score: 80, reasons: ['Education listed'], issues: [], improvements: [] },
        skills: { score: 70, reasons: ['Skills included'], issues: ['Missing technical skills'], improvements: ['Add industry keywords'] }
      }
    };
  }
} 