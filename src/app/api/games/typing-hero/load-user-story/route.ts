import { NextRequest, NextResponse } from 'next/server';
import { loadUserActiveStory } from '@/lib/story-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    console.log('📖 Loading active story for user:', userId);

    const story = loadUserActiveStory(userId);

    if (!story) {
      console.log('📖 No active story found for user:', userId);
      return NextResponse.json(
        { story: null, hasStory: false },
        { status: 200 }
      );
    }

    console.log('✅ Active story loaded:', {
      storyId: story.id,
      title: story.title,
      chapters: story.chapters.length,
      createdAt: story.createdAt
    });

    return NextResponse.json({
      story,
      hasStory: true
    });

  } catch (error) {
    console.error('❌ Error loading user story:', error);
    return NextResponse.json(
      { error: `Failed to load story: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    console.log('📖 Loading active story for user (POST):', userId);

    const story = loadUserActiveStory(userId);

    if (!story) {
      console.log('📖 No active story found for user:', userId);
      return NextResponse.json(
        { story: null, hasStory: false },
        { status: 200 }
      );
    }

    console.log('✅ Active story loaded:', {
      storyId: story.id,
      title: story.title,
      chapters: story.chapters.length,
      createdAt: story.createdAt
    });

    return NextResponse.json({
      story,
      hasStory: true
    });

  } catch (error) {
    console.error('❌ Error loading user story:', error);
    return NextResponse.json(
      { error: `Failed to load story: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
