import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get OpenAI API key from server environment
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured on server' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apiKey: apiKey
    });

  } catch (error) {
    console.error('API key fetch error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch API key'
      },
      { status: 500 }
    );
  }
} 