import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

interface SessionData {
  wpm: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  missedWords: number;
  fires: number;
  poos: number;
  elapsedTime: number;
  charactersTyped: number;
  errorPatterns: Array<{
    word: string;
    userInput: string;
    errorType: 'typo' | 'spelling' | 'speed' | 'missed';
    timestamp: number;
  }>;
  difficultyLevel: string;
  streakData: {
    bestStreak: number;
    currentStreak: number;
  };
}

export async function POST(request: NextRequest) {
  let sessionData: SessionData;
  
  try {
    sessionData = await request.json();
    
    console.log('🧠 AI Assessment received data:', {
      wpm: sessionData.wpm,
      accuracy: sessionData.accuracy,
      totalWords: sessionData.totalWords,
      errorPatterns: sessionData.errorPatterns?.length || 0
    });
    
    // Check if Claude API key is available
    if (!process.env.CLAUDE_API_KEY) {
      console.log('⚠️ No Claude API key found, using fallback assessment');
      throw new Error('No Claude API key configured');
    }
    
    // Analyze the session data with Claude
    const prompt = `
You are an expert typing coach analyzing a typing game session. Provide personalized, encouraging feedback and actionable tips.

SESSION DATA:
- WPM: ${sessionData.wpm}
- Accuracy: ${sessionData.accuracy}%
- Time Played: ${Math.floor(sessionData.elapsedTime / 60)}m ${sessionData.elapsedTime % 60}s
- Words Attempted: ${sessionData.totalWords}
- Correct Words: ${sessionData.correctWords}
- Missed Words: ${sessionData.missedWords}
- Fires (Perfect): ${sessionData.fires}
- Poos (Mistakes): ${sessionData.poos}
- Characters Typed: ${sessionData.charactersTyped}
- Difficulty Level: ${sessionData.difficultyLevel}
- Best Streak: ${sessionData.streakData?.bestStreak || 0}
- Current Streak: ${sessionData.streakData?.currentStreak || 0}

ERROR PATTERNS:
${sessionData.errorPatterns?.map(error => 
  `- Word: "${error.word}" → Typed: "${error.userInput}" (${error.errorType})`
).join('\n') || 'No detailed error data available'}

ANALYSIS GUIDELINES:
1. **Performance Level Assessment**: 
   - Below 20 WPM: Beginner (focus on accuracy over speed)
   - 20-40 WPM: Developing (work on common patterns)
   - 40-60 WPM: Intermediate (improve consistency)
   - 60-80 WPM: Advanced (fine-tune technique)
   - 80+ WPM: Expert (maintain accuracy at high speed)

2. **Error Analysis**:
   - Typos: Usually adjacent keys or finger coordination issues
   - Spelling: Knowledge gaps or common word confusion
   - Speed errors: Rushing causing inaccuracy
   - Missed words: Reaction time or visual tracking issues

3. **Provide 3-4 specific, actionable tips**
4. **Keep tone encouraging and fun**
5. **Include keyboard technique advice if relevant**
6. **Mention specific improvement areas based on their data**

Format your response as JSON with these fields:
{
  "overallAssessment": "Brief overall performance summary",
  "performanceLevel": "Beginner/Developing/Intermediate/Advanced/Expert",
  "strengths": ["strength1", "strength2"],
  "improvementAreas": ["area1", "area2"],
  "personalizedTips": [
    {
      "category": "Speed/Accuracy/Technique/Focus",
      "tip": "Specific actionable advice",
      "explanation": "Why this helps"
    }
  ],
  "encouragement": "Motivational closing message",
  "nextSessionGoal": "Specific goal for next session"
}
`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Parse the JSON response
    let assessment;
    try {
      assessment = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      assessment = {
        overallAssessment: "Good session! Keep practicing to improve your typing skills.",
        performanceLevel: sessionData.wpm >= 60 ? "Advanced" : sessionData.wpm >= 40 ? "Intermediate" : "Developing",
        strengths: ["Completed the session", "Showed persistence"],
        improvementAreas: ["Consistency", "Accuracy"],
        personalizedTips: [
          {
            category: "General",
            tip: "Focus on accuracy first, then speed will follow naturally",
            explanation: "Building muscle memory with correct patterns is more effective than rushing"
          }
        ],
        encouragement: "Keep up the great work! Every session makes you better.",
        nextSessionGoal: `Try to ${sessionData.wpm < 40 ? 'maintain accuracy above 90%' : 'increase WPM by 2-3 points'}`
      };
    }

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('AI Assessment error:', error);
    
    // If sessionData wasn't parsed, provide default values
    if (!sessionData) {
      sessionData = {
        wpm: 0, accuracy: 0, totalWords: 0, correctWords: 0, missedWords: 0,
        fires: 0, poos: 0, elapsedTime: 0, charactersTyped: 0, errorPatterns: [],
        difficultyLevel: 'rookie', streakData: { bestStreak: 0, currentStreak: 0 }
      };
    }
    
    // Use the sessionData that was already parsed (fallback assessment)
    const fallbackAssessment = {
      overallAssessment: `Nice work! You achieved ${sessionData.wpm} WPM with ${sessionData.accuracy.toFixed(1)}% accuracy in ${Math.floor(sessionData.elapsedTime / 60)}:${(sessionData.elapsedTime % 60).toString().padStart(2, '0')}.`,
      performanceLevel: sessionData.wpm >= 60 ? "Advanced" : sessionData.wpm >= 40 ? "Intermediate" : sessionData.wpm >= 20 ? "Developing" : "Beginner",
      strengths: [
        "Session completion",
        sessionData.accuracy >= 80 ? "Good accuracy" : "Persistence",
        sessionData.fires > sessionData.poos ? "More successes than mistakes" : "Determination"
      ],
      improvementAreas: [
        sessionData.accuracy < 80 ? "Accuracy" : "Speed consistency", 
        sessionData.wpm < 40 ? "Typing speed" : "Advanced techniques"
      ],
      personalizedTips: [
        {
          category: sessionData.wpm < 30 ? "Fundamentals" : "Technique",
          tip: sessionData.wpm < 30 
            ? "Focus on proper finger placement and accuracy over speed"
            : "Practice typing common word patterns to improve muscle memory",
          explanation: sessionData.wpm < 30
            ? "Building correct habits early prevents bad patterns that are hard to break"
            : "Common letter combinations become automatic with practice"
        },
        {
          category: "Practice",
          tip: sessionData.accuracy < 85
            ? "Slow down and focus on accuracy - speed will follow naturally"
            : "Try typing burst exercises to increase your peak speed",
          explanation: sessionData.accuracy < 85
            ? "Accurate typing creates better muscle memory than fast, error-prone typing"
            : "Short bursts of fast typing help push your speed limits safely"
        }
      ],
      encouragement: sessionData.wpm >= 50 
        ? "Excellent typing speed! You're well above average. Keep refining your technique!"
        : sessionData.wpm >= 30
        ? "Good progress! You're developing solid typing skills. Keep practicing!"
        : "Great start! Every session makes you better. Focus on accuracy and speed will come!",
      nextSessionGoal: sessionData.wpm < 30
        ? "Aim for 30+ WPM while maintaining 85%+ accuracy"
        : sessionData.wpm < 50
        ? "Try to reach 50 WPM with consistent accuracy"
        : "Work on maintaining your speed while improving precision"
    };

    return NextResponse.json({
      success: true,
      assessment: fallbackAssessment
    });
  }
}
