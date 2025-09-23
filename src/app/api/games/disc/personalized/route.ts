import { NextRequest, NextResponse } from 'next/server'

// Simple placeholder to satisfy the UI contract expected by
// src/app/career-tools/games/disc-personality/page.tsx
// - When isAssessment=true: returns { aiAssessment, generatedBy }
// - Otherwise: returns { personalizedQuestions: [...] }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isAssessment, prompt, discScores, responses } = body || {}

    if (isAssessment) {
      // Return a deterministic placeholder AI assessment
      const primary = discScores ? Object.entries(discScores).sort(([,a],[,b]) => (b as number) - (a as number))[0]?.[0] : 'D'
      const text = prompt || `Your profile suggests a primary ${primary} type with strong potential in Filipino BPO roles.`
      return NextResponse.json({ aiAssessment: text, generatedBy: 'placeholder' })
    }

    // Generate five lightweight personalized questions using provided responses/scores
    const baseId = 1000
    const makeOption = (id: string, disc: 'D'|'I'|'S'|'C', text: string, reaction: string) => ({ id, disc, animal: disc === 'D' ? '🦅' : disc === 'I' ? '🦚' : disc === 'S' ? '🐢' : '🦉', text, reaction })

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
  } catch (error) {
    return NextResponse.json({ personalizedQuestions: [] })
  }
}


