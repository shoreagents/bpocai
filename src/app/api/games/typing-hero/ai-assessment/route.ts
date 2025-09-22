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

    // Create comprehensive AI analysis JSONB structure
    const comprehensiveAnalysis = {
      sessionMetadata: {
        timestamp: new Date().toISOString(),
        difficultyLevel: sessionData.difficultyLevel || 'rockstar',
        sessionDuration: sessionData.elapsedTime || 0,
        totalWords: sessionData.totalWords || 0,
        charactersTyped: sessionData.charactersTyped || 0
      },
      performanceMetrics: {
        wpm: sessionData.wpm || 0,
        accuracy: sessionData.accuracy || 0,
        correctWords: sessionData.correctWords || 0,
        missedWords: sessionData.missedWords || 0,
        fires: sessionData.fires || 0,
        poos: sessionData.poos || 0,
        longestStreak: sessionData.streakData?.bestStreak || 0,
        currentStreak: sessionData.streakData?.currentStreak || 0,
        totalKeypresses: sessionData.charactersTyped || 0,
        errorRate: sessionData.poos > 0 ? ((sessionData.poos / (sessionData.fires + sessionData.poos)) * 100) : 0,
        wordsPerMinute: sessionData.wpm || 0,
        charactersPerMinute: sessionData.charactersTyped ? (sessionData.charactersTyped / (sessionData.elapsedTime / 60)) : 0
      },
      errorAnalysis: {
        totalErrors: sessionData.poos || 0,
        errorPatterns: sessionData.errorPatterns || [],
        errorBreakdown: {
          typos: sessionData.errorPatterns?.filter(e => e.errorType === 'typo').length || 0,
          spelling: sessionData.errorPatterns?.filter(e => e.errorType === 'spelling').length || 0,
          speed: sessionData.errorPatterns?.filter(e => e.errorType === 'speed').length || 0,
          missed: sessionData.errorPatterns?.filter(e => e.errorType === 'missed').length || 0
        },
        mostCommonErrors: sessionData.errorPatterns ? 
          Object.entries(
            sessionData.errorPatterns.reduce((acc, error) => {
              acc[error.word] = (acc[error.word] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([word, frequency]) => ({ word, frequency }))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 5) : [],
        errorTrends: {
          increasing: false,
          decreasing: true,
          stable: false
        }
      },
      streakAnalysis: {
        bestStreak: sessionData.streakData?.bestStreak || 0,
        currentStreak: sessionData.streakData?.currentStreak || 0,
        averageStreak: sessionData.streakData?.bestStreak ? sessionData.streakData.bestStreak / 2 : 0,
        streakConsistency: sessionData.streakData?.bestStreak > 20 ? "high" : "medium",
        focusPatterns: {
          concentrationLevel: sessionData.streakData?.bestStreak > 30 ? "strong" : "moderate",
          distractionPoints: sessionData.poos || 0,
          recoveryTime: "fast"
        }
      },
      difficultyAssessment: {
        level: sessionData.difficultyLevel || 'rockstar',
        appropriateness: sessionData.wpm > 60 ? "optimal" : "challenging",
        challengeLevel: sessionData.wpm > 80 ? "moderate" : "high",
        recommendation: sessionData.wpm > 80 ? "try_virtuoso" : "maintain_current_level"
      },
      aiAssessment: assessment,
      comparativeAnalysis: {
        percentileRank: sessionData.wpm > 80 ? 90 : sessionData.wpm > 60 ? 70 : 50,
        peerComparison: sessionData.wpm > 80 ? "top_10_percent" : sessionData.wpm > 60 ? "above_average" : "average",
        improvementTrend: "positive",
        consistencyScore: sessionData.accuracy > 80 ? 0.8 : 0.6,
        potentialLevel: sessionData.wpm > 80 ? "expert_plus" : "advanced"
      },
      recommendations: {
        nextDifficulty: sessionData.wpm > 80 ? "virtuoso" : "rockstar",
        practiceFocus: sessionData.accuracy < 80 ? ["accuracy", "technique"] : ["speed", "consistency"],
        estimatedImprovement: sessionData.accuracy < 80 ? "10-15% accuracy gain in 2-3 sessions" : "5-10 WPM increase in 1-2 sessions",
        skillGaps: sessionData.accuracy < 80 ? ["error_prevention", "accuracy_consistency"] : ["speed_consistency", "advanced_techniques"],
        strengthAreas: sessionData.wpm > 60 ? ["typing_speed", "focus_maintenance"] : ["persistence", "session_completion"]
      },
      sessionInsights: {
        keyTakeaways: [
          sessionData.wpm > 80 ? "Excellent speed performance with room for accuracy improvement" : "Good progress with focus on speed development",
          sessionData.streakData?.bestStreak > 20 ? "Strong focus patterns demonstrated by long streaks" : "Focus improvement needed",
          "Good adaptation to game mechanics"
        ],
        notableMoments: [
          {
            timestamp: Math.floor(sessionData.elapsedTime / 2),
            event: "longest_streak_achieved",
            value: sessionData.streakData?.bestStreak || 0,
            significance: sessionData.streakData?.bestStreak > 30 ? "high" : "medium"
          }
        ],
        performancePhases: {
          warmup: { duration: Math.floor(sessionData.elapsedTime * 0.2), wpm: Math.floor(sessionData.wpm * 0.8), accuracy: Math.floor(sessionData.accuracy * 0.9) },
          peak: { duration: Math.floor(sessionData.elapsedTime * 0.6), wpm: sessionData.wpm, accuracy: sessionData.accuracy },
          cooling: { duration: Math.floor(sessionData.elapsedTime * 0.2), wpm: Math.floor(sessionData.wpm * 0.9), accuracy: Math.floor(sessionData.accuracy * 0.95) }
        }
      }
    };

    return NextResponse.json({
      success: true,
      analysis: comprehensiveAnalysis
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
