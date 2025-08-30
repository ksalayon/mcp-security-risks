import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a raw attack test or Vercel AI request
    const isRawAttack = body.rawAttack === true;
    const useVercelAI = body.useVercelAI === true;
    
    let endpoint = '/api/chat';
    if (isRawAttack) {
      endpoint = '/api/chat/raw-attack';
    } else if (useVercelAI) {
      endpoint = '/api/chat/vercel-ai';
    }
    
    console.log(`Request details:`, { isRawAttack, useVercelAI, endpoint });
    console.log(`Forwarding to backend: ${BACKEND_URL}${endpoint}`);
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

