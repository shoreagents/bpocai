import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isAssessment, prompt, discScores, responses, userId } = body || {}

    // Check for API key
    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      console.warn('⚠️ CLAUDE_API_KEY not found, returning fallback responses')
      return getFallbackResponse(isAssessment, discScores, prompt)
    }

    if (isAssessment) {
      // Generate AI assessment using Claude
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [{
              role: 'user',
              content: prompt
            }]
          })
        })

        if (response.ok) {
          const data = await response.json()
          const aiAssessment = data.content[0].text
          return NextResponse.json({ aiAssessment, generatedBy: 'claude-3.5-sonnet' })
        } else {
          console.error('Claude API error for assessment:', response.status)
          return getFallbackResponse(true, discScores, prompt)
        }
      } catch (error) {
        console.error('Error calling Claude for assessment:', error)
        return getFallbackResponse(true, discScores, prompt)
      }
    }

    // Generate personalized questions using Claude
    try {
      const personalizedPrompt = `You are an expert Filipino DISC personality assessor. Based on these 30 responses from a Filipino BPO candidate, generate 5 highly personalized follow-up scenarios to clarify their personality profile.

CANDIDATE'S RESPONSES:
${responses ? responses.map((r: any, i: number) => `Q${i+1}: Selected "${r.selectedChoice}" (${r.discType}) - Response time: ${r.responseTime}ms`).join('\n') : 'No detailed responses available'}

CURRENT DISC SCORES:
D (Dominance): ${discScores?.D || 0}%
I (Influence): ${discScores?.I || 0}%  
S (Steadiness): ${discScores?.S || 0}%
C (Conscientiousness): ${discScores?.C || 0}%

TASK: Create 5 personalized Filipino workplace scenarios that:
1. Target areas where scores are close (within 10% of each other)
2. Test edge cases based on their specific response patterns
3. Use realistic BPO/office situations relevant to their profile
4. Include culturally relevant Filipino contexts

FORMAT: Return a JSON array with this exact structure:
[
  {
    "id": 1001,
    "context": "WORK" | "FAMILY" | "SOCIAL" | "CRISIS",
    "title": "Specific scenario title",
    "scenario": "Detailed situation description tailored to their responses",
    "options": [
      {"id": "A", "disc": "D", "animal": "🦅 ROLE_NAME", "text": "Action text", "reaction": "Outcome description"},
      {"id": "B", "disc": "I", "animal": "🦚 ROLE_NAME", "text": "Action text", "reaction": "Outcome description"},
      {"id": "C", "disc": "S", "animal": "🐢 ROLE_NAME", "text": "Action text", "reaction": "Outcome description"},
      {"id": "D", "disc": "C", "animal": "🦉 ROLE_NAME", "text": "Action text", "reaction": "Outcome description"}
    ]
  }
]

Make each scenario unique and specifically designed to clarify this person's personality based on their actual response patterns.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: personalizedPrompt
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.content[0].text
        
        // Extract JSON from Claude's response
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const personalizedQuestions = JSON.parse(jsonMatch[0])
            console.log(`✅ Generated ${personalizedQuestions.length} personalized questions via Claude`)
            return NextResponse.json({ personalizedQuestions })
          } catch (parseError) {
            console.error('Error parsing Claude JSON:', parseError)
            return getFallbackResponse(false, discScores)
          }
        } else {
          console.error('No JSON found in Claude response')
          return getFallbackResponse(false, discScores)
        }
      } else {
        console.error('Claude API error for personalized questions:', response.status)
        return getFallbackResponse(false, discScores)
      }
    } catch (error) {
      console.error('Error calling Claude for personalized questions:', error)
      return getFallbackResponse(false, discScores)
    }

  } catch (error) {
    console.error('Error in personalized API:', error)
    return NextResponse.json({ personalizedQuestions: [] })
  }
}

// Fallback function for when Claude API is unavailable
function getFallbackResponse(isAssessment: boolean, discScores?: any, prompt?: string) {
  if (isAssessment) {
    const primary = discScores ? Object.entries(discScores).sort(([,a],[,b]) => (b as number) - (a as number))[0]?.[0] : 'D'
    const text = prompt || `Your profile suggests a primary ${primary} type with strong potential in Filipino BPO roles. This assessment was generated without AI due to API limitations.`
    return NextResponse.json({ aiAssessment: text, generatedBy: 'fallback' })
  }

  // Fallback personalized questions
  const baseId = 1000
  const makeOption = (id: string, disc: 'D'|'I'|'S'|'C', text: string, reaction: string) => ({ 
    id, disc, animal: disc === 'D' ? '🦅' : disc === 'I' ? '🦚' : disc === 'S' ? '🐢' : '🦉', text, reaction 
  })

  const questions = Array.from({ length: 5 }).map((_, idx) => ({
    id: baseId + idx + 1,
    context: 'PERSONAL',
    title: `Personal Challenge ${idx + 1}`,
    scenario: 'Based on your earlier choices, how would you respond in this situation?',
    options: [
      makeOption('A', 'D', 'Take charge and set the direction for everyone', 'You lead decisively and inspire confidence'),
      makeOption('B', 'I', 'Bring people together and energize the team', 'Your positivity creates momentum'),
      makeOption('C', 'S', 'Support steadily and keep things calm', 'Your consistency grounds the group'),
      makeOption('D', 'C', 'Analyze carefully and design a solid plan', 'Your clarity improves quality for all'),
    ],
  }))

  return NextResponse.json({ personalizedQuestions: questions })
}


