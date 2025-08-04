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
  improvedSummary: string;
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

    console.log('🔍 DEBUG: Received analysis request');
    console.log('  - resumeData type:', typeof resumeData);
    console.log('  - resumeData keys:', Object.keys(resumeData || {}));
    console.log('  - portfolioLinks count:', portfolioLinks.length);
    console.log('  - sessionId:', sessionId);

    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      console.error('❌ Claude API key not configured');
      return NextResponse.json(
        { success: false, error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Create analysis prompt for Claude
    console.log('🔍 DEBUG: Creating analysis prompt...');
    const analysisPrompt = createAnalysisPrompt(resumeData, portfolioLinks);
    console.log('🔍 DEBUG: Analysis prompt length:', analysisPrompt.length);

    // Call Claude API
    console.log('🔍 DEBUG: Calling Claude API...');
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

    console.log('🔍 DEBUG: Claude API response status:', claudeResponse.status);

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error('❌ Claude API error:', errorData);
      console.error('❌ Claude API status:', claudeResponse.status);
      return NextResponse.json(
        { success: false, error: `Failed to analyze resume with Claude: ${claudeResponse.status} - ${errorData}` },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    console.log('🔍 DEBUG: Claude API response received');
    
    if (!claudeData.content || !claudeData.content[0] || !claudeData.content[0].text) {
      console.error('❌ Invalid Claude API response structure:', claudeData);
      return NextResponse.json(
        { success: false, error: 'Invalid response structure from Claude API' },
        { status: 500 }
      );
    }

    const analysisText = claudeData.content[0].text;
    console.log('🔍 DEBUG: Analysis text length:', analysisText.length);

    // Parse Claude's response into structured data
    console.log('🔍 DEBUG: Parsing Claude response...');
    const analysisResult = parseClaudeResponse(analysisText, resumeData);
    console.log('🔍 DEBUG: Analysis parsing complete');

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      sessionId
    });

  } catch (error) {
    console.error('❌ Resume analysis error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: `Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

function createAnalysisPrompt(resumeData: any, portfolioLinks: any[]): string {
  console.log('🔍 DEBUG: createAnalysisPrompt called');
  console.log('  - resumeData type:', typeof resumeData);
  console.log('  - resumeData keys:', Object.keys(resumeData || {}));
  
  // Handle multiple files (resumes and certificates)
  const isMultipleFiles = resumeData?.files && Array.isArray(resumeData.files);
  console.log('  - isMultipleFiles:', isMultipleFiles);
  
  let candidateName = 'Candidate';
  let candidateSkills: string[] = [];
  let candidateExperience: any[] = [];
  let candidateEducation: any[] = [];
  let candidateSummary = '';
  let candidateLocation = 'Philippines';
  let certificates: any[] = [];
  let totalFiles = 1;
  let fileTypes: string[] = [];
  let fileNames: string[] = [];

  if (isMultipleFiles) {
    // Multiple files structure
    totalFiles = resumeData.totalFiles || resumeData.files.length;
    fileTypes = resumeData.fileTypes || [];
    fileNames = resumeData.fileNames || [];
    
    console.log('  - totalFiles:', totalFiles);
    console.log('  - fileTypes:', fileTypes);
    console.log('  - fileNames:', fileNames);
    
    // Extract data from all files
    resumeData.files.forEach((file: any, index: number) => {
      const fileData = file.data;
      const fileName = file.fileName;
      const fileType = file.fileType;
      
      console.log(`  - Processing file ${index + 1}: ${fileName} (${fileType})`);
      
      // Extract skills from all files
      if (fileData?.skills && Array.isArray(fileData.skills)) {
        candidateSkills = [...candidateSkills, ...fileData.skills];
      }
      
      // Extract experience from resume files
      if (fileData?.experience && Array.isArray(fileData.experience)) {
        candidateExperience = [...candidateExperience, ...fileData.experience];
      }
      
      // Extract education from all files
      if (fileData?.education && Array.isArray(fileData.education)) {
        candidateEducation = [...candidateEducation, ...fileData.education];
      }
      
      // Get summary from first resume file
      if (!candidateSummary && fileData?.summary) {
        candidateSummary = fileData.summary;
      }
      
      // Get name from first file with name
      if (candidateName === 'Candidate' && fileData?.name) {
        candidateName = fileData.name;
      }
      
      // Get location from first file with location
      if (candidateLocation === 'Philippines' && fileData?.location) {
        candidateLocation = fileData.location;
      }
      
      // Identify certificates
      if (fileType.includes('certificate') || fileName.toLowerCase().includes('certificate') || 
          fileType.includes('certification') || fileName.toLowerCase().includes('certification')) {
        certificates.push({
          fileName: fileName,
          data: fileData
        });
      }
    });
    
    // Remove duplicates from skills
    candidateSkills = [...new Set(candidateSkills)];
  } else {
    // Single file structure (backward compatibility)
    candidateName = resumeData?.name || resumeData?.personalInfo?.name || 'Candidate';
    candidateSkills = resumeData?.skills || [];
    candidateExperience = resumeData?.experience || [];
    candidateEducation = resumeData?.education || [];
    candidateSummary = resumeData?.summary || resumeData?.objective || '';
    candidateLocation = resumeData?.location || resumeData?.personalInfo?.location || 'Philippines';
    totalFiles = 1;
    fileTypes = ['resume'];
    fileNames = ['Resume'];
  }
  
  console.log('  - Extracted data:');
  console.log('    - candidateName:', candidateName);
  console.log('    - candidateSkills count:', candidateSkills.length);
  console.log('    - candidateExperience count:', candidateExperience.length);
  console.log('    - candidateEducation count:', candidateEducation.length);
  console.log('    - certificates count:', certificates.length);
  
  // Calculate experience level based on actual data
  const totalExperience = candidateExperience.length;
  const experienceLevel = totalExperience === 0 ? 'entry' : 
                         totalExperience <= 2 ? 'junior' : 
                         totalExperience <= 5 ? 'mid' : 'senior';
  
  // Get current position from actual experience
  const currentPosition = candidateExperience.length > 0 ? 
    candidateExperience[0]?.position || candidateExperience[0]?.title || 'Professional' : 
    'Entry Level Professional';

  const prompt = `You are an expert resume analyst specializing in BPO (Business Process Outsourcing) industry analysis for the Philippine market.

IMPORTANT: Analyze the ACTUAL resume data provided and generate insights based on the real content. Do NOT use generic examples.

CANDIDATE CONTEXT:
- Name: ${candidateName}
- Location: ${candidateLocation}
- Current Position: ${currentPosition}
- Experience Level: ${experienceLevel} (based on ${totalExperience} positions)
- Total Files Uploaded: ${totalFiles}
- File Types: ${fileTypes.join(', ')}
- File Names: ${fileNames.join(', ')}
- Skills Found: ${candidateSkills.length} skills
- Education: ${candidateEducation.length} items
- Certificates: ${certificates.length} certificates
- Summary: ${candidateSummary ? 'Present' : 'Missing'}

RESUME DATA TO ANALYZE:
${JSON.stringify(resumeData, null, 2)}

PORTFOLIO LINKS:
${JSON.stringify(portfolioLinks, null, 2)}

ANALYSIS REQUIREMENTS:
1. Base ALL analysis on the actual resume content provided across ALL files
2. Consider certificates as additional qualifications and achievements
3. Calculate scores based on real data quality and completeness
4. Identify strengths from actual skills, experience, achievements, and certifications
5. Suggest improvements based on what's missing or could be enhanced
6. Provide salary recommendations based on actual experience level, location, and certifications
7. Create career path based on current position, skills, and qualifications

Please provide a detailed analysis in the following JSON structure, using ONLY information from the provided resume data:

{
  "overallScore": [Calculate based on actual content quality across all files],
  "atsCompatibility": [Score based on keyword optimization and format],
  "contentQuality": [Score based on completeness and impact],
  "professionalPresentation": [Score based on formatting and structure],
  "skillsAlignment": [Score based on BPO industry relevance],
  "keyStrengths": [
    [List 3-5 actual strengths from the resume data with detailed explanations, including certifications]
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
      [List 2-3 notable achievements from the resume with impact, including certifications]
    ],
    "marketAdvantage": [
      [List 2-3 specific advantages for BPO industry based on resume and certifications]
    ]
  },
  "improvements": [
    [List 3-5 specific improvements based on what's missing or weak]
  ],
  "recommendations": [
    [List 3-5 actionable recommendations based on actual content]
  ],
  "improvedSummary": "[Create a compelling 3-4 sentence professional summary that highlights key strengths, career objectives, and certifications, optimized for BPO industry]",
  "salaryAnalysis": {
    "currentLevel": "${experienceLevel}",
    "recommendedSalaryRange": "[Calculate based on experience level, location, and certifications]",
    "factorsAffectingSalary": [
      [List 3-4 factors based on actual resume content and certifications]
    ],
    "negotiationTips": [
      [List 3-4 tips based on actual achievements, skills, and certifications]
    ]
  },
  "careerPath": {
    "currentPosition": "${currentPosition}",
    "nextCareerSteps": [
      {
        "step": "1",
        "title": "[Next logical position based on current role and certifications]",
        "description": "[Specific description based on actual skills and qualifications]"
      },
      {
        "step": "2",
        "title": "[Advanced position based on certifications and experience]",
        "description": "[Specific description based on actual skills and qualifications]"
      }
    ],
    "skillGaps": [
      [List 2-3 skill gaps based on actual resume content and target positions]
    ],
    "timeline": "[Realistic timeline based on current level and certifications]",
    "timelineDetails": "[Detailed timeline explanation based on actual skills and qualifications]"
  },
  "sectionAnalysis": {
    "contact": {
      "score": [Score based on actual contact information completeness],
      "reasons": [List reasons for the score based on actual data],
      "issues": [List issues found in actual contact section],
      "improvements": [List improvements based on actual gaps]
    },
    "summary": {
      "score": [Score based on actual summary quality],
      "reasons": [List reasons for the score based on actual data],
      "issues": [List issues found in actual summary],
      "improvements": [List improvements based on actual gaps]
    },
    "experience": {
      "score": [Score based on actual experience presentation],
      "reasons": [List reasons for the score based on actual data],
      "issues": [List issues found in actual experience section],
      "improvements": [List improvements based on actual gaps]
    },
    "education": {
      "score": [Score based on actual education presentation],
      "reasons": [List reasons for the score based on actual data],
      "issues": [List issues found in actual education section],
      "improvements": [List improvements based on actual gaps]
    },
    "skills": {
      "score": [Score based on actual skills presentation],
      "reasons": [List reasons for the score based on actual data],
      "issues": [List issues found in actual skills section],
      "improvements": [List improvements based on actual gaps]
    }
  }
}`;

  console.log('🔍 DEBUG: Prompt created successfully, length:', prompt.length);
  return prompt;
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
      improvedSummary: parsed.improvedSummary || 'This is the improved summary based on the analysis.',
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
        timeline: '  for promotion',
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
      improvedSummary: 'This is the improved summary based on the analysis.',
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