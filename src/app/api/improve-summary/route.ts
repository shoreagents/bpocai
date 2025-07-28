import { NextRequest, NextResponse } from 'next/server';

interface ImproveSummaryRequest {
  originalSummary: string;
  resumeData: any;
}

interface ImproveSummaryResponse {
  success: boolean;
  improvedSummary?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { originalSummary, resumeData }: ImproveSummaryRequest = await request.json();

    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return NextResponse.json(
        { success: false, error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    // Create improvement prompt for Claude
    const improvementPrompt = createImprovementPrompt(originalSummary, resumeData);

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
        max_tokens: 2000,
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
        { success: false, error: 'Failed to improve summary with Claude' },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const improvedSummary = claudeData.content[0].text.trim();

    return NextResponse.json({
      success: true,
      improvedSummary
    });

  } catch (error) {
    console.error('Error improving summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function createImprovementPrompt(originalSummary: string, resumeData: any): string {
  const candidateName = resumeData?.name || resumeData?.personalInfo?.name || 'Candidate';
  const candidateSkills = resumeData?.skills || [];
  const candidateExperience = resumeData?.experience || [];
  const candidateEducation = resumeData?.education || [];
  const candidateLocation = resumeData?.location || resumeData?.personalInfo?.location || 'Philippines';
  
  // Calculate experience level based on actual data
  const totalExperience = candidateExperience.length;
  const experienceLevel = totalExperience === 0 ? 'entry' : 
                         totalExperience <= 2 ? 'junior' : 
                         totalExperience <= 5 ? 'mid' : 'senior';

  return `You are an expert resume writer specializing in creating compelling professional summaries for the BPO (Business Process Outsourcing) industry in the Philippines.

TASK: Improve the following professional summary to make it more compelling, professional, and impactful for job applications.

ORIGINAL SUMMARY:
"${originalSummary}"

CANDIDATE CONTEXT:
- Name: ${candidateName}
- Location: ${candidateLocation}
- Experience Level: ${experienceLevel} (${totalExperience} positions)
- Skills: ${candidateSkills.join(', ')}
- Experience: ${candidateExperience.length} positions
- Education: ${candidateEducation.length} items

RESUME DATA FOR CONTEXT:
${JSON.stringify(resumeData, null, 2)}

IMPROVEMENT REQUIREMENTS:
1. Make the summary more compelling and professional
2. Include specific achievements and quantifiable results if available
3. Highlight key skills and expertise relevant to BPO industry
4. Use strong action verbs and professional language
5. Keep it concise (2-3 sentences maximum)
6. Focus on value proposition and career objectives
7. Ensure it's tailored to the candidate's actual experience level
8. Make it ATS-friendly with relevant keywords
9. Maintain authenticity while enhancing impact

IMPORTANT GUIDELINES:
- Base improvements ONLY on the actual resume data provided
- Do NOT add fictional information
- If the original summary is very basic, enhance it with available skills and experience
- If the original summary is already good, make minor improvements for clarity and impact
- Focus on making it more professional and compelling
- Ensure it flows naturally and reads well

Please provide ONLY the improved professional summary text, without any additional formatting or explanations.`;
} 